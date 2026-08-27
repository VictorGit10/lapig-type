'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { passages, previewLeaderboard } from './content';
import {
  arenaBackendConfigured,
  arenaRequest,
  githubAuthEnabled,
  googleAuthEnabled,
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

const CHALLENGE_DURATION_MS = 60_000;

const formatTime = (milliseconds: number, roundUp = false) => {
  const seconds = Math.max(0, roundUp ? Math.ceil(milliseconds / 1000) : Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

export function TypingArena() {
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
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attemptRef = useRef<Promise<RankedAttempt | null> | null>(null);
  const eventsRef = useRef<AttemptEvent[]>([]);
  const lastKeyAtRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const visibilityChangesRef = useRef(0);
  const mistakesRef = useRef(0);
  const finishedRef = useRef(false);
  const typingCopyRef = useRef<HTMLDivElement>(null);
  const currentCharacterRef = useRef<HTMLSpanElement>(null);
  const passage = passages[passageIndex];

  const accuracy = cursor + mistakes === 0 ? 100 : Math.round((cursor / (cursor + mistakes)) * 100);
  const minutes = Math.max(elapsed / 60000, 1 / 60000);
  const wpm = status === 'ready' ? 0 : Math.round(cursor / 5 / minutes);
  const remaining = Math.max(0, CHALLENGE_DURATION_MS - elapsed);
  const progress = Math.round((elapsed / CHALLENGE_DURATION_MS) * 100);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  useEffect(() => { focusInput(); }, [focusInput, passageIndex]);

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

  const reset = useCallback((nextIndex = passageIndex) => {
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
    window.setTimeout(focusInput, 0);
  }, [focusInput, passageIndex]);

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
    setAuthMessage(null);
    try {
      await signInWithProvider(provider);
    } catch {
      setAuthMessage('Este provedor ainda não está disponível. Use o link por e-mail.');
      setAuthBusy(false);
    }
  }, []);

  const handleCaptchaToken = useCallback((token: string | null) => setCaptchaToken(token), []);

  const beginPasswordAuth = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = authUsername.trim();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,23}$/.test(normalizedUsername)) {
      setAuthMessage('Use de 3 a 24 caracteres: letras, números, ponto, hífen ou sublinhado.');
      return;
    }
    if (authPassword.length < 10) {
      setAuthMessage('A senha precisa ter pelo menos 10 caracteres.');
      return;
    }
    if (!turnstileSiteKey) {
      setAuthMessage('A proteção anti-bot não está configurada.');
      return;
    }
    if (!captchaToken) {
      setAuthMessage('Aguarde a verificação anti-bot e tente novamente.');
      setCaptchaResetSignal((value) => value + 1);
      return;
    }
    setAuthBusy(true);
    setAuthMessage(null);
    try {
      if (authMode === 'signup') {
        await signUpWithPassword(authUsername, authPassword, captchaToken);
        setAuthMessage('Conta criada. Você já está participando do ranking.');
      } else {
        await signInWithPassword(authUsername, authPassword, captchaToken);
        setAuthMessage('Entrada realizada com sucesso.');
      }
      setAuthPassword('');
    } catch (error) {
      setAuthMessage(authFailureMessage(error, authMode));
    } finally {
      setAuthBusy(false);
      setCaptchaToken(null);
      setCaptchaResetSignal((value) => value + 1);
    }
  }, [authMode, authPassword, authUsername, captchaToken]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setAuthBusy(true);
    await supabase.auth.signOut();
    setAuthBusy(false);
    setAuthMenuOpen(false);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || status === 'finished' || authMenuOpen) return;
    if (event.key === 'Tab') return;
    event.preventDefault();
    if (event.key.length !== 1) return;
    if (cursor >= passage.text.length) return;

    const now = performance.now();
    if (status === 'ready') {
      setStatus('running');
      setStartedAt(now);
      startedAtRef.current = now;
      attemptRef.current = startRankedAttempt();
    }

    const correct = event.key.normalize('NFC') === passage.text[cursor].normalize('NFC');
    eventsRef.current.push({
      delta: lastKeyAtRef.current === null ? 0 : Math.max(0, Math.round(now - lastKeyAtRef.current)),
      correct,
      key: event.key.normalize('NFC'),
      repeat: event.repeat,
    });
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

  const renderedText = useMemo(() => passage.text.split('').map((character, index) => {
    const state = index < cursor ? 'typed' : index === cursor ? 'current' : 'pending';
    return <span ref={index === cursor ? currentCharacterRef : undefined} className={`character character--${state}`} key={`${index}-${character}`}>{character}</span>;
  }), [cursor, passage.text]);
  const rankingRows = leaderboard ?? previewLeaderboard;

  return (
    <main className="site-shell" onClick={() => { if (!authMenuOpen) focusInput(); }}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="LAPIG Type — início">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-copy"><strong>LAPIG</strong><small>TYPE</small></span>
        </a>
        <nav className="nav-links" aria-label="Navegação principal">
          <a className="active" href="#treino">Treino</a><a href="#ranking">Ranking</a><a href="#sobre">Sobre</a><a href="https://github.com/VictorGit10/lapig-type" target="_blank" rel="noreferrer">Código ↗</a>
        </nav>
        <div className="auth-control" onClick={(event) => event.stopPropagation()}>
          <button className="login-button" type="button" onClick={() => setAuthMenuOpen((value) => !value)} aria-expanded={authMenuOpen}>
            {user ? user.name : 'Entrar'} <span>{user ? '•' : '↗'}</span>
          </button>
          {authMenuOpen && <div className="auth-menu">
            {user ? <>
              <small>RESULTADOS VINCULADOS A</small><strong>{user.name}</strong>
              <button type="button" disabled={authBusy} onClick={() => void signOut()}>Sair</button>
            </> : <>
              <small>ENTRAR NO RANKING</small>
              <div className="auth-tabs" role="tablist" aria-label="Acesso ao ranking">
                <button type="button" role="tab" aria-selected={authMode === 'signin'} className={authMode === 'signin' ? 'is-active' : ''} onClick={() => { setAuthMode('signin'); setAuthMessage(null); setCaptchaToken(null); }}>Entrar</button>
                <button type="button" role="tab" aria-selected={authMode === 'signup'} className={authMode === 'signup' ? 'is-active' : ''} onClick={() => { setAuthMode('signup'); setAuthMessage(null); setCaptchaToken(null); }}>Criar conta</button>
              </div>
              <form noValidate onSubmit={(event) => void beginPasswordAuth(event)}>
                <label htmlFor="ranking-username">Nome de usuário</label>
                <input id="ranking-username" type="text" autoComplete="username" minLength={3} maxLength={24} pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,23}" required value={authUsername} onChange={(event) => setAuthUsername(event.target.value)} placeholder="ex.: ana.cerrado" disabled={authBusy || !arenaBackendConfigured} />
                <label htmlFor="ranking-password">Senha</label>
                <input id="ranking-password" type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={10} required value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Mínimo de 10 caracteres" disabled={authBusy || !arenaBackendConfigured} />
                <TurnstileWidget action={authMode} resetSignal={captchaResetSignal} siteKey={turnstileSiteKey} onToken={handleCaptchaToken} />
                <span className={`captcha-status ${captchaToken ? 'is-ready' : ''}`} aria-live="polite">{captchaToken ? '✓ Verificação anti-bot concluída' : 'Verificando se você é uma pessoa…'}</span>
                <button type="submit" disabled={authBusy || !arenaBackendConfigured}>{authBusy ? (authMode === 'signup' ? 'Criando conta…' : 'Entrando…') : (authMode === 'signup' ? 'Criar conta' : 'Entrar')}</button>
              </form>
              <p>Sem e-mail. Se perder a senha, crie outra conta.</p>
              {(googleAuthEnabled || githubAuthEnabled) && <span className="auth-divider">ou continue com</span>}
              {googleAuthEnabled && <button type="button" disabled={authBusy || !arenaBackendConfigured} onClick={() => void beginSignIn('google')}>Continuar com Google</button>}
              {githubAuthEnabled && <button type="button" disabled={authBusy || !arenaBackendConfigured} onClick={() => void beginSignIn('github')}>Continuar com GitHub</button>}
              {authMessage && <p role="status">{authMessage}</p>}
              {!arenaBackendConfigured && <p>O ambiente competitivo será ativado após a conexão com o Supabase.</p>}
            </>}
          </div>}
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <span className="eyebrow"><i /> Ciência na ponta dos dedos</span>
          <h1>Leia o território.<br /><em>Digite o futuro.</em></h1>
          <p>Treine velocidade e precisão com pesquisas que ajudam a compreender o Cerrado e as transformações do Brasil.</p>
        </div>
        <div className="hero-seal" aria-label="Desafio atual: Cerrado em foco">
          <span>DESAFIO ATUAL</span><strong>Cerrado<br />em foco</strong><small>03 textos selecionados</small>
        </div>
      </section>

      <section className="workspace" id="treino" aria-label="Área de treino de digitação">
        <div className="arena-column">
          <div className="metrics" aria-live="polite">
            <article><span>Velocidade</span><strong>{wpm}</strong><small>PPM</small></article>
            <article><span>Precisão</span><strong>{accuracy}</strong><small>%</small></article>
            <article><span>Tempo restante</span><strong>{formatTime(remaining, true)}</strong></article>
            <article><span>Erros</span><strong>{mistakes}</strong></article>
          </div>

          <article className={`typing-card ${errorPulse ? 'has-error' : ''}`}>
            <header className="passage-head">
              <div><span className="passage-number">TEXTO 0{passageIndex + 1}</span><span className="passage-topic">{passage.eyebrow}</span></div>
              <button type="button" onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="Recomeçar texto">↻ <span>Recomeçar</span></button>
            </header>
            <div className="progress-track" aria-label={`${progress}% do tempo decorrido`}><i style={{ width: `${progress}%` }} /></div>
            <div ref={typingCopyRef} className="typing-copy" aria-label={passage.text}>{renderedText}</div>
            <input
              ref={inputRef}
              className="typing-input"
              aria-label="Campo de digitação. Comece a digitar o texto exibido."
              autoCapitalize="off" autoComplete="off" autoCorrect="off"
              onBlur={(event) => {
                if (status === 'finished' || authMenuOpen) return;
                const next = event.relatedTarget as HTMLElement | null;
                if (next && next.closest('.auth-control')) return;
                window.setTimeout(focusInput, 80);
              }}
              onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()}
              onKeyDown={handleKeyDown} onPaste={(event) => event.preventDefault()}
              spellCheck={false} value="" onChange={() => undefined}
            />
            <footer className="passage-foot">
              <p><span className="status-dot" />{status === 'ready' ? 'A primeira tecla inicia os 60 segundos' : status === 'running' ? `${Math.ceil(remaining / 1000)} s restantes` : 'Tempo encerrado'}</p>
              <p>Errou? O cursor espera a tecla correta.</p>
            </footer>
          </article>

          <article className="source-card">
            <div><span>FONTE DA PESQUISA</span><h2>{passage.title}</h2><p>{passage.authors} · {passage.year}</p><p className="source-reference">{passage.referenceAbnt}</p></div>
            <a href={passage.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Ver publicação ↗</a>
          </article>
        </div>

        <aside className="ranking-card" id="ranking">
          <header><div><span>PLACAR GERAL</span><h2>Mais velozes</h2></div><b>{!arenaBackendConfigured ? 'DEMO' : leaderboard === null ? 'ABRINDO' : 'AO VIVO'}</b></header>
          <ol>{rankingRows.map((player) => (
            <li key={player.rank} className={player.rank <= 3 ? `podium podium-${player.rank}` : ''}>
              <span className="rank">{String(player.rank).padStart(2, '0')}</span>
              <span className="avatar">{player.name.slice(0, 2).toUpperCase()}</span>
              <span className="player"><strong>{player.name}</strong><small>{player.accuracy}% precisão</small></span>
              <strong className="score">{player.wpm}<small>PPM</small></strong>
            </li>
          ))}{leaderboard?.length === 0 && <li className="ranking-empty"><span>O placar está pronto para o primeiro resultado verificado.</span></li>}</ol>
          <a href="#ranking">Ver ranking completo <span>→</span></a>
          <p className="ranking-note">Entre para registrar resultados verificados no placar.</p>
        </aside>
      </section>

      <section className="about-strip" id="sobre"><span>01 · DIGITE</span><i /><span>02 · APRENDA</span><i /><span>03 · COMPARE</span></section>

      {status === 'finished' && (
        <div className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title" onClick={(event) => event.stopPropagation()}>
          <section className="result-card">
            <span className="result-kicker">DESAFIO DE 1 MINUTO</span>
            <h2 id="result-title">Tempo encerrado.<br />Agora vale o ranking.</h2>
            <div className="result-score"><strong>{verifiedResult?.grossWpm ?? wpm}</strong><span>PALAVRAS<br />POR MINUTO</span></div>
            <div className="result-details"><span><b>{verifiedResult?.accuracy ?? accuracy}%</b> precisão</span><span><b>{mistakes}</b> erros</span><span><b>{formatTime(elapsed)}</b> tempo</span></div>
            <p className={`submission-note submission-note--${submission}`}>
              {submission === 'verifying' && 'Validando ritmo, sequência e tempo no servidor…'}
              {submission === 'accepted' && `Resultado verificado: ${verifiedResult?.score ?? 0} pontos no ranking.`}
              {submission === 'review' && 'Resultado salvo para revisão; ele ainda não aparece no ranking.'}
              {submission === 'rejected' && 'A sessão não passou pela validação competitiva.'}
              {submission === 'error' && 'Não foi possível validar esta sessão. Seu treino local continua salvo na tela.'}
              {submission === 'local' && 'Treino concluído. Entre antes da próxima tentativa para disputar o ranking.'}
            </p>
            {submission === 'local' && <button className="result-login" type="button" onClick={() => setAuthMenuOpen(true)}>Entrar para competir ↗</button>}
            <button type="button" onClick={() => reset((passageIndex + 1) % passages.length)}>Próximo texto <span>→</span></button>
            <button className="result-secondary" type="button" onClick={() => reset()}>Tentar novamente</button>
          </section>
        </div>
      )}
      <footer className="site-footer">
        <p>Uma experiência aberta de ciência, território e digitação.</p>
        <a href="https://github.com/VictorGit10/lapig-type" target="_blank" rel="noreferrer">Ver o projeto no GitHub ↗</a>
      </footer>
    </main>
  );
}

function authFailureMessage(error: unknown, mode: AuthMode) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (code === 'captcha_failed' || message.includes('captcha')) return 'A verificação anti-bot expirou. Aguarde a renovação e tente novamente.';
  if (code === 'weak_password' || message.includes('password')) return 'A senha não foi aceita. Use pelo menos 10 caracteres.';
  if (code === 'user_already_exists' || message.includes('already registered')) return 'Esse nome de usuário já está em uso.';
  if (code === 'over_request_rate_limit' || message.includes('rate limit')) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
  if (code === 'email_address_invalid' || message.includes('invalid email')) return 'O identificador interno da conta não foi aceito. Tente outro nome.';
  return mode === 'signup'
    ? 'Não foi possível criar a conta agora. A verificação foi renovada; tente novamente.'
    : 'Usuário ou senha incorretos. A verificação foi renovada para uma nova tentativa.';
}
