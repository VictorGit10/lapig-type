export type CosmeticSlot = 'avatar' | 'mark' | 'palette' | 'frame' | 'effect';

export const DEFAULT_COSMETICS = {
  avatar: 'topographic', mark: 'contours', palette: 'field', frame: 'none', effect: 'none',
} as const;

export const COSMETIC_REQUIREMENTS: Record<CosmeticSlot, Record<string, string | null>> = {
  avatar: { topographic: null, cerrado: 'all_passages_attempted', atlas: 'all_passages_completed' },
  mark: { contours: null, leaf: 'first_verified', pin: 'speed_50', orbit: 'speed_75', keys: 'precision_100', globe: 'top_1' },
  palette: { field: null, clay: 'first_verified', sun: 'speed_50', night: 'top_3' },
  frame: { none: null, baseline: 'speed_50', vector: 'speed_75', 'high-resolution': 'speed_100', 'control-point': 'precision_100', reference: 'top_3', 'zero-mark': 'top_1' },
  effect: { none: null, contours: 'first_verified', scan: 'speed_100', 'solar-pulse': 'top_1' },
};

export function cosmeticRequirement(slot: string, key: string) {
  if (slot !== 'avatar' && slot !== 'mark' && slot !== 'palette' && slot !== 'frame' && slot !== 'effect') return undefined;
  return COSMETIC_REQUIREMENTS[slot][key];
}
