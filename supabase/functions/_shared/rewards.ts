export type CosmeticSlot = 'avatar' | 'frame' | 'effect';

export const DEFAULT_COSMETICS = {
  avatar: 'topographic',
  frame: 'none',
  effect: 'none',
} as const;

export const COSMETIC_REQUIREMENTS: Record<CosmeticSlot, Record<string, string | null>> = {
  avatar: { topographic: null, cerrado: 'all_passages_attempted', atlas: 'all_passages_completed' },
  frame: { none: null, baseline: 'speed_50', vector: 'speed_75', 'high-resolution': 'speed_100', 'control-point': 'precision_100', reference: 'top_3', 'zero-mark': 'top_1' },
  effect: { none: null, contours: 'first_verified', scan: 'speed_100', 'solar-pulse': 'top_1' },
};

export function cosmeticRequirement(slot: string, key: string) {
  if (slot !== 'avatar' && slot !== 'frame' && slot !== 'effect') return undefined;
  return COSMETIC_REQUIREMENTS[slot][key];
}
