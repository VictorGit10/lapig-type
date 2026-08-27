'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { passages } from './content';
import { LANGUAGE_LABELS, passwordRemaining, rankMark, secondsRemaining, type Language, UI_COPY } from './i18n';
import { PlayerAvatar } from './player-avatar';
import {
  arenaBackendConfigured,
  arenaRequest,
  authFailureMessage,
  githubAuthEnabled,
  googleAuthEnabled,
  normalizeDisplayName,
  signInWithPassword,
  signInWithProvider,
  signUpWithPassword,
  supabase,
  turnstileSiteKey,
  userDisplayName,
} from './lib/supabase-browser';
import { TurnstileWidget } from './turnstile-widget';

type Status = 'ready' | 'running' | 'finished';
type Submission = 'idle' | 'local' | 'verifying' | 'accepted' | 'review' | 'rejected' | 'error';
type AttemptEvent = { delta: number; correct: boolean; key: string; repeat: boolean };
type LeaderboardRow = { rank: number; name: string; wpm: number; accuracy: number; score?: number };
type VerifiedResult = { grossWpm: number; accuracy: number; score: number; trustStatus: 'accepted' | 'review' | 'rejected'; ranked: boolean };
type RankedAttempt = { attemptId: string; attemptToken: string };
type ArenaUser = { id: string; name: string };
type AuthMode = 'signin' | 'signup';
type AuthFeedback = { tone: 'error' | 'success'; text: string };

const CHALLENGE_DURATION_MS = 60_000;

const getRandomPassageIndex = (currentIndex?: number) => {
  if (passages.length <= 1) return 0;
  if (currentIndex === undefined) return Math.floor(Math.random() * passages.length);

  const candidate = Math.floor(Math.random() * (passages.length - 1));
  return candidate >= currentIndex ? candidate + 1 : candidate;
};

const formatTime = (milliseconds: number, roundUp = false) => {
  const seconds = Math.max(0, roundUp ? Math.ceil(milliseconds / 1000) : Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

export function TypingArena() {
  const [language, setLanguage] = useState<Language>('pt');
  const [passageIndex, setPassageIndex] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<Status>('ready');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [errorPulse, setErrorPulse] = useState(false);
  const [submission, setSubmission] = useState<Submission>('idle');
  const [verifiedResult, setVerifiedResult] = useState<VerifiedResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null);
  const [user, setUser] = useState<ArenaUser | null>(null);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const [authFeedback, setAuthFeedback] = useState<AuthFeedback | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const authControlRef = useRef<HTMLDivElement>(null);
  const authUsernameRef = useRef<HTMLInputElement>(null);
  const attemptRef = useRef<Promise<RankedAttempt | null> | null>(null);
  const eventsRef = useRef<AttemptEvent[]>([]);
  const lastKeyAtRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const visibilityChangesRef = useRef(0);
  const mistakesRef = useRef(0);
  const finishedRef = useRef(false);
  const keyRepeatRef = useRef(false);
  const initialPassagePickedRef = useRef(false);
  const languageLoadedRef = useRef(false);
  const typingCopyRef = useRef<HTMLDivElement>(null);
  const currentCharacterRef = useRef<HTMLSpanElement>(null);
  const passage = passages[passageIndex];
  const copy = UI_COPY[language];

  const accuracy = cursor + mistakes === 0 ? 100 : Math.round((cursor / (cursor + mistakes)) * 100);
  const minutes = Math.max(elapsed / 60000, 1 / 60000);
  const wpm = status === 'ready' ? 0 : Math.round(cursor / 5 / minutes);
  const remaining = Math.max(0, CHALLENGE_DURATION_MS - elapsed);
  const progress = Math.round((elapsed / CHALLENGE_DURATION_MS) * 100);

  const focusInput = useCallback(() => inputRef.current?.focus({ preventScroll: true }), []);

  useEffect(() => {
    const saved = window.localStorage.getItem('lapig-type:language');
    if (saved !== 'pt' && saved !== 'en' && saved !== 'es') {
      languageLoadedRef.current = true;
      return;
    }
    if (saved === 'pt') {
      languageLoadedRef.current = true;
      return;
    }
    const request = window.setTimeout(() => {
      languageLoadedRef.current = true;
      setLanguage(saved);
    }, 0);
    return () => window.clearTimeout(request);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : language;
    if (languageLoadedRef.current) window.localStorage.setItem('lapig-type:language', language);
  }, [language]);

  useEffect(() => {
    if (initialPassagePickedRef.current) return;
    initialPassagePickedRef.current = true;
    setPassageIndex(getRandomPassageIndex());
  }, []);

  const closeAuthMenu = useCallback(() => {
    setAuthMenuOpen(false);
    setAuthFeedback(null);
    window.setTimeout(focusInput, 0);
  }, [focusInput]);

  const openAuthMenu = useCallback((mode: AuthMode = 'signin') => {
    setAuthMode(mode);
    setAuthFeedback(null);
    setAuthMenuOpen(true);
    window.setTimeout(() => {
      authControlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      authUsernameRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) focusInput();
  }, [focusInput, passageIndex]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user ? { id: data.user.id, name: userDisplayName(data.user) } : null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? { id: session.user.id, name: userDisplayName(session.user) } : null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadLeaderboard = useCallback(async () => {
    if (!arenaBackendConfigured) return;
    try {
      const response = await arenaRequest('leaderboard', { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('leaderboard_failed');
      const data = await response.json() as { leaderboard: LeaderboardRow[] };
      setLeaderboard(data.leaderboard);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => { void loadLeaderboard(); }, 0);
    return () => window.clearTimeout(request);
  }, [loadLeaderboard]);

  useEffect(() => {
    const trackVisibility = () => {
      if (status === 'running') visibilityChangesRef.current += 1;
    };
    document.addEventListener('visibilitychange', trackVisibility);
    return () => document.removeEventListener('visibilitychange', trackVisibility);
  }, [status]);

  const reset = useCallback((nextIndex = passageIndex, focusAfterReset = true) => {
    setPassageIndex(nextIndex);
    setCursor(0);
    setMistakes(0);
    setStatus('ready');
    setStartedAt(null);
    setElapsed(0);
    setErrorPulse(false);
    setSubmission('idle');
    setVerifiedResult(null);
    attemptRef.current = null;
    eventsRef.current = [];
    lastKeyAtRef.current = null;
    startedAtRef.current = null;
    visibilityChangesRef.current = 0;
    mistakesRef.current = 0;
    finishedRef.current = false;
    if (typingCopyRef.current) typingCopyRef.current.scrollTop = 0;
    if (focusAfterReset) window.setTimeout(focusInput, 0);
  }, [focusInput, passageIndex]);

  const startNextChallenge = useCallback((focusAfterReset = true) => {
    reset(getRandomPassageIndex(passageIndex), focusAfterReset);
  }, [passageIndex, reset]);

  useEffect(() => {
    if (!authMenuOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (authControlRef.current?.contains(event.target as Node)) return;
      setAuthMenuOpen(false);
      setAuthFeedback(null);
      if ((event.target as Element | null)?.closest?.('.typing-card')) window.setTimeout(focusInput, 0);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer, true);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer, true);
  }, [authMenuOpen, focusInput]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (authMenuOpen) {
        event.preventDefault();
        closeAuthMenu();
      } else if (status === 'finished') {
        event.preventDefault();
        startNextChallenge();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [authMenuOpen, closeAuthMenu, startNextChallenge, status]);

  const startRankedAttempt = useCallback(async () => {
    if (!user || !arenaBackendConfigured) return null;
    try {
      const response = await arenaRequest('attempt-start', {
        method: 'POST',
        body: JSON.stringify({ passageId: passage.id }),
      }, true);
      if (!response.ok) return null;
      return await response.json() as RankedAttempt;
    } catch {
      return null;
    }
  }, [passage.id, user]);

  const finishRankedAttempt = useCallback(async (clientElapsedMs: number, mistakeCount: number) => {
    if (!user || !arenaBackendConfigured) {
      setSubmission('local');
      return;
    }
    setSubmission('verifying');
    const attempt = await attemptRef.current;
    if (!attempt) {
      setSubmission('error');
      return;
    }
    try {
      const response = await arenaRequest('attempt-finish', {
        method: 'POST',
        body: JSON.stringify({
          attemptId: attempt.attemptId,
          attemptToken: attempt.attemptToken,
          clientElapsedMs: Math.round(clientElapsedMs),
          mistakes: mistakeCount,
          visibilityChanges: visibilityChangesRef.current,
          events: eventsRef.current,
        }),
      }, true);
      if (!response.ok) throw new Error('submission_failed');
      const result = await response.json() as VerifiedResult;
      setVerifiedResult(result);
      setSubmission(result.trustStatus);
      if (result.ranked) void loadLeaderboard();
    } catch {
      setSubmission('error');
    }
  }, [loadLeaderboard, user]);

  const finishTimedAttempt = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setElapsed(CHALLENGE_DURATION_MS);
    setStatus('finished');
    void finishRankedAttempt(CHALLENGE_DURATION_MS, mistakesRef.current);
  }, [finishRankedAttempt]);

  useEffect(() => {
    if (status !== 'running' || startedAt === null) return;
    const tick = () => {
      const nextElapsed = Math.min(CHALLENGE_DURATION_MS, performance.now() - startedAt);
      setElapsed(nextElapsed);
      if (nextElapsed >= CHALLENGE_DURATION_MS) finishTimedAttempt();
    };
    tick();
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [finishTimedAttempt, startedAt, status]);

  useEffect(() => {
    const container = typingCopyRef.current;
    const current = currentCharacterRef.current;
    if (!container || !current) return;
    const currentTop = current.offsetTop;
    const currentBottom = currentTop + current.offsetHeight;
    const visibleTop = container.scrollTop;
    const visibleBottom = visibleTop + container.clientHeight;
    if (currentBottom > visibleBottom - 52 || currentTop < visibleTop + 16) {
      container.scrollTo({ top: Math.max(0, currentTop - container.clientHeight * 0.36), behavior: 'smooth' });
    }
  }, [cursor]);

  const beginSignIn = useCallback(async (provider: 'google' | 'github') => {
    setAuthBusy(true);
    setAuthFeedback(null);
    try {
      await signInWithProvider(provider);
    } catch {
      setAuthFeedback({ tone: 'error', text: copy.providerUnavailable });
      setAuthBusy(false);
    }
  }, [copy.providerUnavailable]);

  const handleCaptchaToken = useCallback((token: string | null) => setCaptchaToken(token), []);

  const beginPasswordAuth = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      normalizeDisplayName(authUsername);
    } catch {
      setAuthFeedback({ tone: 'error', text: copy.invalidUsername });
      return;
    }
    if (authPassword.length < 10) {
      setAuthFeedback({ tone: 'error', text: passwordRemaining(language, 10 - authPassword.length) });
      return;
    }
    if (!turnstileSiteKey) {
      setAuthFeedback({ tone: 'error', text: copy.captchaNotConfigured });
      return;
    }
    if (!captchaToken) {
      setAuthFeedback({ tone: 'error', text: copy.captchaMissing });
      setCaptchaResetSignal((value) => value + 1);
      return;
    }
    setAuthBusy(true);
    setAuthFeedback(null);
    try {
      if (authMode === 'signup') {
        await signUpWithPassword(authUsername, authPassword, captchaToken);
        setAuthFeedback({ tone: 'success', text: copy.accountCreated });
      } else {
        await signInWithPassword(authUsername, authPassword, captchaToken);
        setAuthFeedback({ tone: 'success', text: copy.signedIn });
      }
      setAuthPassword('');
    } catch (error) {
      setAuthFeedback({ tone: 'error', text: authFailureMessage(error, authMode, language) });
    } finally {
      setAuthBusy(false);
      setCaptchaToken(null);
      setCaptchaResetSignal((value) => value + 1);
    }
  }, [authMode, authPassword, authUsername, captchaToken, copy.accountCreated, copy.captchaMissing, copy.captchaNotConfigured, copy.invalidUsername, copy.signedIn, language]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setAuthBusy(true);
    await supabase.auth.signOut();
    setAuthBusy(false);
    setAuthMenuOpen(false);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || status === 'finished' || authMenuOpen) return;
    if (event.key === 'Tab' || event.key === 'Dead' || event.key.length === 1) {
      keyRepeatRef.current = event.repeat;
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Enter') event.preventDefault();
  };

  const handleTextInput = (text: string) => {
    if (status === 'finished' || authMenuOpen) return;
    const characters = [...text.normalize('NFC')];
    if (characters.length !== 1) return;
    if (cursor >= passage.text.length) return;

    const now = performance.now();
    if (status === 'ready') {
      setStatus('running');
      setStartedAt(now);
      startedAtRef.current = now;
      attemptRef.current = startRankedAttempt();
    }

    const enteredCharacter = characters[0];
    const correct = enteredCharacter === passage.text[cursor].normalize('NFC');
    eventsRef.current.push({
      delta: lastKeyAtRef.current === null ? 0 : Math.max(0, Math.round(now - lastKeyAtRef.current)),
      correct,
      key: enteredCharacter,
      repeat: keyRepeatRef.current,
    });
    keyRepeatRef.current = false;
    lastKeyAtRef.current = now;

    if (!correct) {
      mistakesRef.current += 1;
      setMistakes((value) => value + 1);
      setErrorPulse(false);
      window.requestAnimationFrame(() => setErrorPulse(true));
      return;
    }

    const nextCursor = cursor + 1;
    setErrorPulse(false);
    setCursor(nextCursor);
  };

  const passwordCharactersRemaining = Math.max(0, 10 - authPassword.length);

  const renderedText = useMemo(() => passage.text.split('').map((character, index) => {
    const state = index < cursor ? 'typed' : index === cursor ? 'current' : 'pending';
    return <span ref={index === cursor ? currentCharacterRef : undefined} className={`character character--${state}`} key={`${index}-${character}`}>{character}</span>;
  }), [cursor, passage.text]);
  const rankingRows = leaderboard ?? [];
  const podiumRows = rankingRows.slice(0, 3);
  const orderedPodiumRows = [podiumRows[1], podiumRows[0], podiumRows[2]].filter(
    (player): player is LeaderboardRow => Boolean(player),
  );
  const remainingRankingRows = rankingRows.slice(3);
  const previewStatus = !arenaBackendConfigured ? copy.unavailable : leaderboard === null ? copy.loading : copy.updated;

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label={copy.brandHome}>
          <span className="brand-keys" aria-hidden="true">
            {'LAPIG'.split('').map((letter) => <i key={letter}>{letter}</i>)}
          </span>
          <span className="brand-type" aria-hidden="true">TYPE<b /></span>
        </a>
        <nav className="nav-links" aria-label={copy.navLabel}>
          <a className="active" href="#treino">{copy.training}</a><a href="#ranking">{copy.ranking}</a><a href="https://github.com/VictorGit10/lapig-type" target="_blank" rel="noreferrer">{copy.code}</a>
        </nav>
        <div className="top-actions">
          <label className="language-control">
            <span className="sr-only">{copy.language}</span>
            <select aria-label={copy.language} value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              {(Object.keys(LANGUAGE_LABELS) as Language[]).map((code) => <option key={code} value={code}>{code.toUpperCase()} · {LANGUAGE_LABELS[code]}</option>)}
            </select>
          </label>
          <div ref={authControlRef} className="auth-control" onClick={(event) => event.stopPropagation()}>
            <button className="login-button" type="button" onClick={() => { setAuthMenuOpen((value) => !value); setAuthFeedback(null); }} aria-expanded={authMenuOpen}>
              {user ? user.name : copy.enter} <span>{user ? '•' : '↗'}</span>
            </button>
            {authMenuOpen && <div className="auth-menu">
            {user ? <>
              <div className="auth-menu-head"><small>{copy.linkedResults}</small><button type="button" aria-label={copy.closeMenu} onClick={closeAuthMenu}>×</button></div>
              <strong>{user.name}</strong>
              {authFeedback && <p className={`auth-feedback auth-feedback--${authFeedback.tone}`} role={authFeedback.tone === 'error' ? 'alert' : 'status'}>{authFeedback.text}</p>}
              <button type="button" disabled={authBusy} onClick={() => void signOut()}>{copy.signOut}</button>
            </> : <>
              <div className="auth-menu-head"><small>{copy.enterRanking}</small><button type="button" aria-label={copy.closeMenu} onClick={closeAuthMenu}>×</button></div>
              <div className="auth-tabs" role="tablist" aria-label={copy.rankingAccess}>
                <button type="button" role="tab" aria-selected={authMode === 'signin'} className={authMode === 'signin' ? 'is-active' : ''} onClick={() => { setAuthMode('signin'); setAuthFeedback(null); setCaptchaToken(null); }}>{copy.signIn}</button>
                <button type="button" role="tab" aria-selected={authMode === 'signup'} className={authMode === 'signup' ? 'is-active' : ''} onClick={() => { setAuthMode('signup'); setAuthFeedback(null); setCaptchaToken(null); }}>{copy.createAccount}</button>
              </div>
              {authFeedback && <p className={`auth-feedback auth-feedback--${authFeedback.tone}`} role={authFeedback.tone === 'error' ? 'alert' : 'status'}>{authFeedback.text}</p>}
              <form noValidate onSubmit={(event) => void beginPasswordAuth(event)}>
                <label htmlFor="ranking-username">{copy.username}</label>
                <input ref={authUsernameRef} id="ranking-username" type="text" autoComplete="username" minLength={3} maxLength={32} required value={authUsername} onChange={(event) => { setAuthUsername(event.target.value); setAuthFeedback(null); }} placeholder={copy.usernamePlaceholder} disabled={authBusy || !arenaBackendConfigured} />
                <span className="field-hint">{copy.usernameHint}</span>
                <label htmlFor="ranking-password">{copy.password}</label>
                <input id="ranking-password" type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={10} required value={authPassword} onChange={(event) => { setAuthPassword(event.target.value); setAuthFeedback(null); }} placeholder={copy.passwordPlaceholder} disabled={authBusy || !arenaBackendConfigured} />
                <span className={`field-hint ${authPassword.length > 0 && passwordCharactersRemaining === 0 ? 'is-valid' : ''}`}>{authPassword.length === 0 ? copy.passwordEmpty : passwordCharactersRemaining > 0 ? passwordRemaining(language, passwordCharactersRemaining) : copy.passwordReady}</span>
                <TurnstileWidget action={authMode} resetSignal={captchaResetSignal} siteKey={turnstileSiteKey} onToken={handleCaptchaToken} />
                <span className={`captcha-status ${captchaToken ? 'is-ready' : ''}`} aria-live="polite">{captchaToken ? copy.captchaReady : copy.captchaPending}</span>
                <button type="submit" disabled={authBusy || !arenaBackendConfigured}>{authBusy ? (authMode === 'signup' ? copy.creatingAccount : copy.signingIn) : (authMode === 'signup' ? copy.createAccount : copy.signIn)}</button>
              </form>
              <p>{copy.noEmail}</p>
              {(googleAuthEnabled || githubAuthEnabled) && <span className="auth-divider">{copy.continueWith}</span>}
              {googleAuthEnabled && <button type="button" disabled={authBusy || !arenaBackendConfigured} onClick={() => void beginSignIn('google')}>{copy.continueGoogle}</button>}
              {githubAuthEnabled && <button type="button" disabled={authBusy || !arenaBackendConfigured} onClick={() => void beginSignIn('github')}>{copy.continueGithub}</button>}
              {!arenaBackendConfigured && <p>{copy.backendInactive}</p>}
            </>}
            </div>}
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><i /> {copy.heroEyebrow}</span>
          <h1>{copy.heroTitleLead}<br /><em>{copy.heroTitleAccent}</em></h1>
          <p>{copy.heroDescription}</p>
          <a className="hero-start" href="#treino">{copy.startNow} <span>↓</span></a>
        </div>
        <aside className="podium-preview" aria-labelledby="podium-preview-title">
          <header>
            <div><span>{copy.ranking.toUpperCase()}</span><h2 id="podium-preview-title">{copy.podium}</h2></div>
            <b>{previewStatus}</b>
          </header>
          {leaderboard === null && arenaBackendConfigured ? <p className="podium-empty podium-empty--loading">{copy.loadingRanking}</p> : podiumRows.length > 0 ? (
            <div className="mini-podium">
              {orderedPodiumRows.map((player) => (
                <article key={player.rank} className={`mini-podium-place mini-podium-place--${player.rank}`}>
                  <span className="mini-medal">{rankMark(language, player.rank)}</span>
                  <PlayerAvatar name={player.name} className="mini-avatar" />
                  <strong>{player.name}</strong>
                  <small>{player.wpm} {copy.wpm}</small>
                </article>
              ))}
            </div>
          ) : <p className="podium-empty">{arenaBackendConfigured ? copy.firstResult : copy.unavailableRanking}</p>}
          <a href="#ranking">{copy.viewFullRanking} <span>→</span></a>
        </aside>
      </section>

      <section className="workspace" id="treino" aria-label={copy.trainingArea}>
        <div className="arena-column">
          <div className="metrics" aria-live="polite">
            <article><span>{copy.speed}</span><strong>{wpm}</strong><small>{copy.wpm}</small></article>
            <article><span>{copy.accuracy}</span><strong>{accuracy}</strong><small>%</small></article>
            <article><span>{copy.timeRemaining}</span><strong>{formatTime(remaining, true)}</strong></article>
            <article><span>{copy.mistakes}</span><strong>{mistakes}</strong></article>
          </div>

          <article className={`typing-card ${errorPulse ? 'has-error' : ''}`} onClick={() => { if (!authMenuOpen && status !== 'finished') focusInput(); }}>
            <header className="passage-head">
              <div><span className="passage-number">{copy.selectedText}</span><span className="passage-topic">{passage.eyebrow}</span></div>
              <button type="button" onClick={(event) => { event.stopPropagation(); reset(); }} aria-label={copy.restartText}>↻ <span>{copy.restart}</span></button>
            </header>
            <div className="progress-track" aria-label={copy.elapsedProgress.replace('{progress}', String(progress))}><i style={{ width: `${progress}%` }} /></div>
            <div ref={typingCopyRef} className="typing-copy" aria-label={passage.text}>{renderedText}</div>
            <input
              ref={inputRef}
              className="typing-input"
              aria-label={copy.inputLabel}
              autoCapitalize="off" autoComplete="off" autoCorrect="off"
              onBlur={(event) => {
                if (status === 'finished' || authMenuOpen) return;
                const next = event.relatedTarget as HTMLElement | null;
                if (next && !next.closest('.typing-card')) return;
                window.setTimeout(focusInput, 80);
              }}
              onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()}
              onDrop={(event) => event.preventDefault()} onKeyDown={handleKeyDown}
              onInput={(event) => { const text = event.currentTarget.value; event.currentTarget.value = ''; handleTextInput(text); }}
              onPaste={(event) => event.preventDefault()} spellCheck={false}
            />
            <footer className="passage-foot">
              <p><span className="status-dot" />{status === 'ready' ? copy.startTimer : status === 'running' ? secondsRemaining(language, Math.ceil(remaining / 1000)) : copy.timeEnded}</p>
              <p>{passage.text[cursor] === '~' ? copy.tildeTip : copy.mistakeTip}</p>
            </footer>
          </article>

          <article className="source-card">
            <div><span>{copy.aboutText}</span><h2>{passage.title}</h2><p>{passage.authors} · {passage.year}</p><p className="source-reference">{passage.referenceAbnt}</p></div>
            <a href={passage.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{copy.viewPublication}</a>
          </article>
        </div>
      </section>

      <section className="ranking-section" id="ranking" aria-labelledby="ranking-title">
        <header className="ranking-heading">
          <div><span>{copy.generalScore}</span><h2 id="ranking-title">{copy.fullRanking}</h2><p>{copy.rankingDescription}</p></div>
          {!user && <button type="button" onClick={(event) => { event.stopPropagation(); openAuthMenu('signup'); }}>{copy.compete}</button>}
        </header>

        {leaderboard === null && arenaBackendConfigured ? <p className="ranking-empty ranking-empty--loading">{copy.loadingRanking}</p> : rankingRows.length > 0 ? <>
          <div className="full-podium" aria-label={copy.topThree}>
            {orderedPodiumRows.map((player) => (
              <article key={player.rank} className={`full-podium-place full-podium-place--${player.rank}`}>
                <span className="podium-position">{rankMark(language, player.rank)} {copy.place}</span>
                <PlayerAvatar name={player.name} className="podium-avatar" />
                <strong>{player.name}</strong>
                <span>{player.wpm} <small>{copy.wpm}</small></span>
                <small>{player.accuracy}% {copy.precision}</small>
              </article>
            ))}
          </div>
          {remainingRankingRows.length > 0 && (
            <ol className="ranking-list">
              {remainingRankingRows.map((player) => (
                <li key={player.rank}>
                  <span className="rank">{String(player.rank).padStart(2, '0')}</span>
                  <PlayerAvatar name={player.name} className="avatar" />
                  <span className="player"><strong>{player.name}</strong><small>{player.accuracy}% {copy.precision}</small></span>
                  <strong className="score">{player.wpm}<small>{copy.wpm}</small></strong>
                </li>
              ))}
            </ol>
          )}
        </> : <p className="ranking-empty">{arenaBackendConfigured ? copy.emptyRanking : copy.unavailableRanking}</p>}
      </section>

      {status === 'finished' && (
        <div className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title" onClick={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) startNextChallenge(); }}>
          <section className="result-card">
            <button className="result-close" type="button" aria-label={copy.closeResult} onClick={() => startNextChallenge()}>×</button>
            <span className="result-kicker">{copy.result}</span>
            <h2 id="result-title">{copy.resultTitle}</h2>
            <div className="result-score"><strong>{verifiedResult?.grossWpm ?? wpm}</strong><span>{copy.wordsPerMinute.split('\n')[0]}<br />{copy.wordsPerMinute.split('\n')[1]}</span></div>
            <div className="result-details"><span><b>{verifiedResult?.accuracy ?? accuracy}%</b> {copy.accuracy.toLowerCase()}</span><span><b>{mistakes}</b> {copy.errors}</span><span><b>{formatTime(elapsed)}</b> {copy.time}</span></div>
            <p className={`submission-note submission-note--${submission}`}>
              {submission === 'verifying' && copy.verifyingResult}
              {submission === 'accepted' && copy.acceptedResult.replace('{score}', String(verifiedResult?.score ?? 0))}
              {submission === 'review' && copy.reviewResult}
              {submission === 'rejected' && copy.rejectedResult}
              {submission === 'error' && copy.errorResult}
              {submission === 'local' && copy.localResult}
            </p>
            {submission === 'local' && <button className="result-login" type="button" onClick={() => { startNextChallenge(false); openAuthMenu(); }}>{copy.enterToCompete}</button>}
            <button type="button" onClick={() => startNextChallenge()}>{copy.nextText} <span>→</span></button>
          </section>
        </div>
      )}
      <footer className="site-footer">
        <p><strong>LAPIG Type</strong> · {copy.footer}</p>
        <a href="https://github.com/VictorGit10/lapig-type" target="_blank" rel="noreferrer">{copy.githubProject}</a>
      </footer>
    </main>
  );
}
