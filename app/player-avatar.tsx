import { DEFAULT_COSMETICS, type EquippedCosmetics } from './rewards';

type PlayerAvatarProps = {
  name: string;
  className?: string;
  cosmetics?: Partial<EquippedCosmetics>;
};

function sealVariant(name: string) {
  let hash = 2166136261;
  for (const character of name.normalize('NFC')) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 5;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? 'L'}${parts.length > 1 ? parts.at(-1)?.[0] ?? '' : parts[0]?.[1] ?? ''}`.toUpperCase();
}

export function PlayerAvatar({ name, className = '', cosmetics }: PlayerAvatarProps) {
  const equipped = { ...DEFAULT_COSMETICS, ...cosmetics };
  const variant = sealVariant(name);
  return (
    <span className={`player-avatar player-avatar--${variant} player-avatar--avatar-${equipped.avatar} player-avatar--frame-${equipped.frame} player-avatar--effect-${equipped.effect} ${className}`.trim()} aria-hidden="true">
      <i className="player-avatar__terrain" />
      <b className="player-avatar__initials">{initials(name)}</b>
      <i className="player-avatar__marker" />
      <i className="player-avatar__effect" />
    </span>
  );
}
