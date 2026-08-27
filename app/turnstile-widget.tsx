'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  action: 'signin' | 'signup';
  resetSignal: number;
  siteKey: string;
  onToken: (token: string | null) => void;
};

export function TurnstileWidget({ action, resetSignal, siteKey, onToken }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const previousResetSignalRef = useRef(resetSignal);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      appearance: 'interaction-only',
      size: 'flexible',
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(null),
      'error-callback': () => onToken(null),
    });
    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [action, onToken, scriptReady, siteKey]);

  useEffect(() => {
    if (previousResetSignalRef.current === resetSignal) return;
    previousResetSignalRef.current = resetSignal;
    if (!widgetIdRef.current || !window.turnstile) return;
    window.turnstile.reset(widgetIdRef.current);
    onToken(null);
  }, [onToken, resetSignal]);

  if (!siteKey) return <p className="captcha-pending">Proteção anti-bot aguardando configuração.</p>;

  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setScriptReady(true)} />
    <div className="turnstile-shell" ref={containerRef} aria-label="Verificação anti-bot" />
  </>;
}
