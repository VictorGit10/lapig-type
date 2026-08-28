import { DEFAULT_COSMETICS, type EquippedCosmetics } from './rewards';

type PlayerAvatarProps = { name: string; className?: string; cosmetics?: Partial<EquippedCosmetics> };

function firstInitial(name: string) {
  return Array.from(name.trim().normalize('NFC'))[0]?.toLocaleUpperCase('pt-BR') ?? 'L';
}

export function PlayerAvatar({ name, className = '', cosmetics }: PlayerAvatarProps) {
  const equipped = { ...DEFAULT_COSMETICS, ...cosmetics };
  return (
    <span className={`player-avatar player-avatar--pattern-${equipped.avatar} player-avatar--border-${equipped.border} player-avatar--letter-${equipped.letter} player-avatar--effect-${equipped.effect} ${className}`.trim()} title={name} aria-hidden="true">
      <i className="player-avatar__pattern" />
      <b className="player-avatar__initial">{firstInitial(name)}</b>
      <i className="player-avatar__effect" />
    </span>
  );
}
