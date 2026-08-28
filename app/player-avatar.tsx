import { DEFAULT_AVATAR, PIXEL_GRID_SIZE, PIXEL_PALETTE, type AvatarLoadout } from './rewards';

type PlayerAvatarProps = { name: string; className?: string; cosmetics?: Partial<AvatarLoadout> };

function firstInitial(name: string) {
  return Array.from(name.trim().normalize('NFC'))[0]?.toLocaleUpperCase('pt-BR') ?? 'L';
}

export function PlayerAvatar({ name, className = '', cosmetics }: PlayerAvatarProps) {
  const pixels = Array.isArray(cosmetics?.pixels) ? cosmetics.pixels : DEFAULT_AVATAR.pixels;
  const effect = cosmetics?.effect ?? DEFAULT_AVATAR.effect;
  const paintedPixels = pixels.flatMap((paletteIndex, index) => {
    const color = PIXEL_PALETTE[paletteIndex]?.color;
    if (!color) return [];
    return <rect key={index} x={index % PIXEL_GRID_SIZE} y={Math.floor(index / PIXEL_GRID_SIZE)} width="1" height="1" fill={color} />;
  });

  return (
    <span className={`player-avatar player-avatar--effect-${effect} ${className}`.trim()} title={name} aria-hidden="true">
      <span className="player-avatar__art">
        {paintedPixels.length ? (
          <svg viewBox={`0 0 ${PIXEL_GRID_SIZE} ${PIXEL_GRID_SIZE}`} shapeRendering="crispEdges">{paintedPixels}</svg>
        ) : <b className="player-avatar__fallback">{firstInitial(name)}</b>}
      </span>
      <i className="player-avatar__effect" />
    </span>
  );
}
