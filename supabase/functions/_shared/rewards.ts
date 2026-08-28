export type CosmeticSlot = 'avatar' | 'border' | 'letter' | 'effect';

export const DEFAULT_COSMETICS = {
  avatar: 'topographic', border: 'forest', letter: 'ink', effect: 'none',
} as const;

export const COSMETIC_REQUIREMENTS: Record<CosmeticSlot, Record<string, string | null>> = {
  avatar: { topographic: null, parcels: 'first_verified', cerrado: 'speed_50', radar: 'top_3', atlas: 'all_passages_completed' },
  border: { forest: null, lime: null, clay: null, sun: 'speed_75', ink: 'top_3' },
  letter: { ink: null, forest: null, paper: null, clay: 'precision_100', sun: 'top_1' },
  effect: { none: null, contours: 'first_verified', scan: 'speed_100', 'solar-pulse': 'top_1' },
};

export function cosmeticRequirement(slot: string, key: string) {
  if (slot !== 'avatar' && slot !== 'border' && slot !== 'letter' && slot !== 'effect') return undefined;
  return COSMETIC_REQUIREMENTS[slot][key];
}
