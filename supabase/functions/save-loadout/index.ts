import { cosmeticRequirement, DEFAULT_COSMETICS, type CosmeticSlot } from '../_shared/rewards.ts';
import { adminClient, authenticatedUser, json, preflight, publicDisplayName } from '../_shared/http.ts';

type Loadout = Record<CosmeticSlot, string>;
const SLOTS: CosmeticSlot[] = ['avatar', 'border', 'letter', 'effect'];

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'POST') return json(request, { error: 'method_not_allowed' }, 405);

  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: 'authentication_required' }, 401);
  const body = await request.json().catch(() => null) as { loadout?: Partial<Loadout> } | null;
  const loadout = { ...DEFAULT_COSMETICS, ...body?.loadout } as Loadout;

  const requirements = SLOTS.map((slot) => ({ slot, requirement: cosmeticRequirement(slot, loadout[slot]) }));
  if (requirements.some((item) => item.requirement === undefined)) {
    return json(request, { error: 'invalid_cosmetic' }, 400);
  }

  const requiredAchievements = [...new Set(requirements.flatMap((item) => item.requirement ? [item.requirement] : []))];
  const admin = adminClient();
  if (requiredAchievements.length) {
    const { data, error } = await admin.from('user_achievements')
      .select('achievement_key').eq('user_id', user.id).in('achievement_key', requiredAchievements);
    if (error) return json(request, { error: 'database_error' }, 500);
    const owned = new Set((data ?? []).map((item) => item.achievement_key));
    if (requiredAchievements.some((key) => !owned.has(key))) {
      return json(request, { error: 'cosmetic_locked' }, 403);
    }
  }

  const now = new Date().toISOString();
  const { error: profileError } = await admin.from('profiles').upsert({
    user_id: user.id, display_name: publicDisplayName(user), updated_at: now,
  }, { onConflict: 'user_id' });
  if (profileError) return json(request, { error: 'database_error' }, 500);

  const { data: saved, error: saveError } = await admin.from('profile_cosmetics').upsert({
    user_id: user.id,
    avatar_key: loadout.avatar,
    border_key: loadout.border,
    letter_key: loadout.letter,
    effect_key: loadout.effect,
    updated_at: now,
  }, { onConflict: 'user_id' }).select('avatar_key,border_key,letter_key,effect_key').single();
  if (saveError || !saved) return json(request, { error: 'database_error' }, 500);

  return json(request, { equipped: {
    avatar: saved.avatar_key, border: saved.border_key, letter: saved.letter_key, effect: saved.effect_key,
  } });
});
