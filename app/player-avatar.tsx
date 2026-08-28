import { DEFAULT_COSMETICS, type EquippedCosmetics } from './rewards';

type PlayerAvatarProps = { name: string; className?: string; cosmetics?: Partial<EquippedCosmetics> };

function AvatarMark({ mark }: { mark: string }) {
  if (mark === 'leaf') return <svg viewBox="0 0 32 32"><path d="M7 24C8 13 15 7 25 6c-1 10-6 18-18 18Zm2-2 11-11M14 17l-1-5m5 1 5 1" /></svg>;
  if (mark === 'pin') return <svg viewBox="0 0 32 32"><path d="M16 27s8-8 8-15a8 8 0 1 0-16 0c0 7 8 15 8 15Z" /><circle cx="16" cy="12" r="3" /></svg>;
  if (mark === 'orbit') return <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="4" /><ellipse cx="16" cy="16" rx="13" ry="6" transform="rotate(-28 16 16)" /><circle className="is-fill" cx="27" cy="10" r="2" /></svg>;
  if (mark === 'keys') return <svg viewBox="0 0 32 32"><rect x="5" y="8" width="9" height="9" rx="2" /><rect x="18" y="8" width="9" height="9" rx="2" /><rect x="9" y="20" width="14" height="5" rx="2" /></svg>;
  if (mark === 'globe') return <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" /><path d="M5 16h22M16 5c4 4 5 8 5 11s-1 7-5 11c-4-4-5-8-5-11s1-7 5-11Z" /></svg>;
  return <svg viewBox="0 0 32 32"><path d="M4 22c4-7 8-9 13-8s7-1 11-7M5 27c4-6 8-8 12-7s7-1 10-5M5 15c4-5 7-6 11-5s6 0 9-4" /></svg>;
}

export function PlayerAvatar({ name, className = '', cosmetics }: PlayerAvatarProps) {
  const equipped = { ...DEFAULT_COSMETICS, ...cosmetics };
  return (
    <span className={`player-avatar player-avatar--avatar-${equipped.avatar} player-avatar--palette-${equipped.palette} player-avatar--frame-${equipped.frame} player-avatar--effect-${equipped.effect} ${className}`.trim()} title={name} aria-hidden="true">
      <i className="player-avatar__surface" />
      <i className="player-avatar__mark"><AvatarMark mark={equipped.mark} /></i>
      <i className="player-avatar__effect" />
    </span>
  );
}
