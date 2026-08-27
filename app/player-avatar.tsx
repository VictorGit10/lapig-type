type PlayerAvatarProps = {
  name: string;
  className?: string;
};

function avatarVariant(name: string) {
  let hash = 2166136261;
  for (const character of name.normalize('NFC')) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 8;
}

export function PlayerAvatar({ name, className = '' }: PlayerAvatarProps) {
  const variant = avatarVariant(name);
  return (
    <span className={`player-avatar player-avatar--${variant} ${className}`.trim()} aria-hidden="true">
      <i className="player-avatar__hair" />
      <i className="player-avatar__eyes" />
      <i className="player-avatar__mouth" />
    </span>
  );
}
