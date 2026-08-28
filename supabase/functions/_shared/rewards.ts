export type CosmeticSlot = 'effect';

export const PIXEL_GRID_SIZE = 16;
export const PALETTE_SIZE = 32;
export const TRANSPARENT_PIXEL = -1;
export const EMPTY_PIXELS = () => Array<number>(PIXEL_GRID_SIZE * PIXEL_GRID_SIZE).fill(TRANSPARENT_PIXEL);
export const DEFAULT_COSMETICS = { pixels: EMPTY_PIXELS(), effect: 'none' };

export const COSMETIC_REQUIREMENTS: Record<CosmeticSlot, Record<string, string | null>> = {
  effect: {
    none: null,
    orbit: 'first_verified',
    signal: 'speed_50',
    scan: 'speed_75',
    resolution: 'speed_100',
    precision: 'precision_100',
    reference: 'top_3',
    'solar-pulse': 'top_1',
    catalog: 'all_passages_attempted',
    atlas: 'all_passages_completed',
  },
};

export function isAvatarCell(index: number) {
  const row = Math.floor(index / PIXEL_GRID_SIZE);
  const column = index % PIXEL_GRID_SIZE;
  return ((row - 7.5) ** 2) + ((column - 7.5) ** 2) <= 64;
}

export function isValidAvatarPixels(input: unknown): input is number[] {
  return Array.isArray(input)
    && input.length === PIXEL_GRID_SIZE * PIXEL_GRID_SIZE
    && input.every((value, index) => Number.isInteger(value)
      && value >= TRANSPARENT_PIXEL
      && value < PALETTE_SIZE
      && (isAvatarCell(index) || value === TRANSPARENT_PIXEL));
}

export function normalizedAvatarPixels(input: unknown) {
  return isValidAvatarPixels(input) ? input : EMPTY_PIXELS();
}

export function cosmeticRequirement(slot: string, key: string) {
  if (slot !== 'effect') return undefined;
  return COSMETIC_REQUIREMENTS.effect[key];
}
