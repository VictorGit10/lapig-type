import { cosmeticRequirement, isValidAvatarPixels, normalizedAvatarPixels } from '../_shared/rewards.ts';
import { adminClient, authenticatedUser, json, preflight, publicDisplayName } from '../_shared/http.ts';

type Loadout = { pixels?: unknown; effect?: unknown };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'POST') return json(request, { error: 'method_not_allowed' }, 405);

  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: 'authentication_required' }, 401);
  const body = await request.json().catch(() => null) as { loadout?: Loadout } | null;
  const pixels = body?.loadout?.pixels;
  const effect = body?.loadout?.effect;
  if (!isValidAvatarPixels(pixels) || typeof effect !== 'string') {
    return json(request, { error: 'invalid_cosmetic' }, 400);
  }
  const requirement = cosmeticRequirement('effect', effect);
  if (requirement === undefined) return json(request, { error: 'invalid_cosmetic' }, 400);
  const admin = adminClient();
  if (requirement) {
    const { data, error } = await admin.from('user_achievements')
      .select('achievement_key').eq('user_id', user.id).eq('achievement_key', requirement).maybeSingle();
    if (error) return json(request, { error: 'database_error' }, 500);
    if (!data) return json(request, { error: 'cosmetic_locked' }, 403);
  }

  const now = new Date().toISOString();
  const { error: profileError } = await admin.from('profiles').upsert({
    user_id: user.id, display_name: publicDisplayName(user), updated_at: now,
  }, { onConflict: 'user_id' });
  if (profileError) return json(request, { error: 'database_error' }, 500);

  const { data: saved, error: saveError } = await admin.from('profile_cosmetics').upsert({
    user_id: user.id,
    avatar_pixels: pixels,
    effect_key: effect,
    updated_at: now,
  }, { onConflict: 'user_id' }).select('avatar_pixels,effect_key').single();
  if (saveError || !saved) return json(request, { error: 'database_error' }, 500);

  return json(request, { equipped: {
    pixels: normalizedAvatarPixels(saved.avatar_pixels), effect: saved.effect_key,
  } });
});
