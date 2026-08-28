'use client';

import { LANGUAGE_LABELS, type Language } from './i18n';

const LANGUAGES: Language[] = ['pt', 'en', 'es'];

function Flag({ language }: { language: Language }) {
  if (language === 'pt') {
    return (
      <svg viewBox="0 0 30 20" role="img" aria-hidden="true">
        <rect width="30" height="20" rx="2.6" fill="#16794b" />
        <path d="M15 3.1 26.1 10 15 16.9 3.9 10Z" fill="#f5c845" />
        <circle cx="15" cy="10" r="4.15" fill="#244d83" />
        <path d="M11.2 8.95c2.75-.45 5.35.2 7.65 1.75" fill="none" stroke="#f7f0d8" strokeWidth=".75" strokeLinecap="round" />
      </svg>
    );
  }

  if (language === 'en') {
    return (
      <svg viewBox="0 0 30 20" role="img" aria-hidden="true">
        <rect width="30" height="20" rx="2.6" fill="#f6f0dc" />
        {[0, 4, 8, 12, 16].map((y) => <rect key={y} y={y} width="30" height="2" fill="#b84339" />)}
        <path d="M0 0h13.2v10.5H0Z" fill="#26466d" />
        <g fill="#fff8df">
          <circle cx="2.4" cy="2.2" r=".7" /><circle cx="5.2" cy="2.2" r=".7" /><circle cx="8" cy="2.2" r=".7" /><circle cx="10.8" cy="2.2" r=".7" />
          <circle cx="3.8" cy="5.2" r=".7" /><circle cx="6.6" cy="5.2" r=".7" /><circle cx="9.4" cy="5.2" r=".7" />
          <circle cx="2.4" cy="8.2" r=".7" /><circle cx="5.2" cy="8.2" r=".7" /><circle cx="8" cy="8.2" r=".7" /><circle cx="10.8" cy="8.2" r=".7" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 30 20" role="img" aria-hidden="true">
      <rect width="30" height="20" rx="2.6" fill="#b63f35" />
      <path d="M0 5h30v10H0Z" fill="#f2c64d" />
      <path d="M8.3 8.1h2.8v4.7H8.3Z" fill="#b63f35" />
      <path d="M7.7 7.3h4v1.05h-4Z" fill="#f7edd2" />
      <path d="M9.15 9.1h1.1v2.7h-1.1Z" fill="#f7edd2" />
    </svg>
  );
}

export function LanguageSwitcher({ language, label, onChange }: { language: Language; label: string; onChange: (language: Language) => void }) {
  return (
    <div className="language-control" role="group" aria-label={label}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className={language === code ? 'is-active' : ''}
          aria-label={LANGUAGE_LABELS[code]}
          aria-pressed={language === code}
          title={LANGUAGE_LABELS[code]}
          onClick={() => onChange(code)}
        >
          <Flag language={code} />
        </button>
      ))}
    </div>
  );
}
