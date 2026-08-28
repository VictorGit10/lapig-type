import { cosmeticRequirement, DEFAULT_COSMETICS, type CosmeticSlot } from '../_shared/rewards.ts';
import { adminClient, authenticatedUser, json, preflight, publicDisplayName } from '../_shared/http.ts';

const SLOT_COLUMN: Record<CosmeticSlot, 'avatar_key' | 'mark_key' | 'palette_key' | 'frame_key' | 'effect_key'> = {
  avatar: 'avatar_key',
  mark: 'mark_key',
  palette: 'palette_key',
  frame: 'frame_key',
  effect: 'effect_key',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'POST') return json(request, { error: 'method_not_allowed' }, 405);

  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: 'authentication_required' }, 401);
  const body = await request.json().catch(() => null) as { slot?: string; key?: string } | null;
  const slot = body?.slot;
  const key = body?.key;
  if ((slot !== 'avatar' && slot !== 'mark' && slot !== 'palette' && slot !== 'frame' && slot !== 'effect') || typeof key !== 'string') {
    return json(request, { error: 'invalid_cosmetic' }, 400);
  }

  const requirement = cosmeticRequirement(slot, key);
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
    user_id: user.id,
    display_name: publicDisplayName(user),
    updated_at: now,
  }, { onConflict: 'user_id' });
  if (profileError) return json(request, { error: 'database_error' }, 500);

  const { error: equipError } = await admin.from('profile_cosmetics').upsert({
    user_id: user.id,
    [SLOT_COLUMN[slot]]: key,
    updated_at: now,
  }, { onConflict: 'user_id' });
  if (equipError) return json(request, { error: 'database_error' }, 500);

  const { data: equipped, error: readError } = await admin.from('profile_cosmetics')
    .select('avatar_key,mark_key,palette_key,frame_key,effect_key').eq('user_id', user.id).single();
  if (readError || !equipped) return json(request, { error: 'database_error' }, 500);

  return json(request, {
    equipped: {
      avatar: equipped.avatar_key ?? DEFAULT_COSMETICS.avatar,
      mark: equipped.mark_key ?? DEFAULT_COSMETICS.mark,
      palette: equipped.palette_key ?? DEFAULT_COSMETICS.palette,
      frame: equipped.frame_key ?? DEFAULT_COSMETICS.frame,
      effect: equipped.effect_key ?? DEFAULT_COSMETICS.effect,
    },
  });
});
