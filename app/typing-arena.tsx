'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { passages, previewLeaderboard } from './content';
import {
  arenaBackendConfigured,
  arenaRequest,
  signIn,
  supabase,
  userDisplayName,
} from './lib/supabase-browser';

type Status = 'ready' | 'running' | 'finished';
type Submission = 'idle' | 'local' | 'verifying' | 'accepted' | 'review' | 'rejected' | 'error';
type AttemptEvent = { delta: number; correct: boolean; key: string; repeat: boolean };
type LeaderboardRow = { rank: number; name: string; wpm: number; accuracy: number; score?: number };
type VerifiedResult = { grossWpm: number; accuracy: number; score: number; trustStatus: 'accepted' | 'review' | 'rejected'; ranked: boolean };
type RankedAttempt = { attemptId: string; attemptToken: string };
type ArenaUser = { id: string; name: string };

const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
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
  const inputRef = useRef<HTMLInputElement>(null);
  const attemptRef = useRef<Promise<RankedAttempt | null> | null>(null);
  const eventsRef = useRef<AttemptEvent[]>([]);
  const lastKeyAtRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const visibilityChangesRef = useRef(0);
  const passage = passages[passageIndex];

  const accuracy = cursor + mistakes === 0 ? 100 : Math.round((cursor / (cursor + mistakes)) * 100);
  const minutes = Math.max(elapsed / 60000, 1 / 60000);
  const wpm = status === 'ready' ? 0 : Math.round(cursor / 5 / minutes);
  const progress = Math.round((cursor / passage.text.length) * 100);

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

  useEffect(() => {
    if (status !== 'running' || startedAt === null) return;
    const tick = window.setInterval(() => setElapsed(performance.now() - startedAt), 100);
    return () => window.clearInterval(tick);
  }, [status, startedAt]);

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

  const beginSignIn = useCallback(async (provider: 'google' | 'github') => {
    setAuthBusy(true);
    try {
      await signIn(provider);
    } catch {
      setSubmission('error');
      setAuthBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setAuthBusy(true);
    await supabase.auth.signOut();
    setAuthBusy(false);
    setAuthMenuOpen(false);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || status === 'finished') return;
    if (event.key === 'Tab') return;
    event.preventDefault();
    if (event.key.length !== 1) return;

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
      setMistakes((value) => value + 1);
      setErrorPulse(false);
      window.requestAnimationFrame(() => setErrorPulse(true));
      return;
    }

    const nextCursor = cursor + 1;
    setErrorPulse(false);
    setCursor(nextCursor);
    if (nextCursor === passage.text.length) {
      const finalElapsed = startedAtRef.current === null ? 0 : now - startedAtRef.current;
      setElapsed(finalElapsed);
      setStatus('finished');
      void finishRankedAttempt(finalElapsed, mistakes);
    }
  };

  const renderedText = useMemo(() => passage.text.split('').map((character, index) => {
    const state = index < cursor ? 'typed' : index === cursor ? 'current' : 'pending';
    return <span className={`character character--${state}`} key={`${index}-${character}`}>{character === ' ' ? '\u00a0' : character}</span>;
  }), [cursor, passage.text]);
  const rankingRows = leaderboard ?? previewLeaderboard;

  return (
    <main className="site-shell" onClick={focusInput}>
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
              <button type="button" disabled={authBusy || !arenaBackendConfigured} onClick={() => void beginSignIn('google')}>Continuar com Google</button>
              <button type="button" disabled={authBusy || !arenaBackendConfigured} onClick={() => void beginSignIn('github')}>Continuar com GitHub</button>
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
            <article><span>Tempo</span><strong>{formatTime(elapsed)}</strong></article>
            <article><span>Erros</span><strong>{mistakes}</strong></article>
          </div>

          <article className={`typing-card ${errorPulse ? 'has-error' : ''}`}>
            <header className="passage-head">
              <div><span className="passage-number">TEXTO 0{passageIndex + 1}</span><span className="passage-topic">{passage.eyebrow}</span></div>
              <button type="button" onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="Recomeçar texto">↻ <span>Recomeçar</span></button>
            </header>
            <div className="progress-track" aria-label={`${progress}% concluído`}><i style={{ width: `${progress}%` }} /></div>
            <div className="typing-copy" aria-label={passage.text}>{renderedText}</div>
            <input
              ref={inputRef}
              className="typing-input"
              aria-label="Campo de digitação. Comece a digitar o texto exibido."
              autoCapitalize="off" autoComplete="off" autoCorrect="off"
              onBlur={() => status !== 'finished' && window.setTimeout(focusInput, 80)}
              onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()}
              onKeyDown={handleKeyDown} onPaste={(event) => event.preventDefault()}
              spellCheck={false} value="" onChange={() => undefined}
            />
            <footer className="passage-foot">
              <p><span className="status-dot" />{status === 'ready' ? 'Comece a digitar para iniciar' : status === 'running' ? 'Sessão em andamento' : 'Texto concluído'}</p>
              <p>Errou? O cursor espera a tecla correta.</p>
            </footer>
          </article>

          <article className="source-card">
            <div><span>FONTE DA PESQUISA</span><h2>{passage.title}</h2><p>{passage.authors} · {passage.year}</p></div>
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
            <span className="result-kicker">TEXTO CONCLUÍDO</span>
            <h2 id="result-title">Belo ritmo.<br />Agora vale o ranking.</h2>
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
