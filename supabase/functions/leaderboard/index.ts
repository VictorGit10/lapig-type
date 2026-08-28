import { DEFAULT_COSMETICS, normalizedAvatarPixels } from '../_shared/rewards.ts';
import { adminClient, authenticatedUser, json, preflight } from '../_shared/http.ts';

const RANKING_TOP_SIZE = 20;

type ResultRow = {
  user_id: string;
  gross_wpm: number;
  accuracy: number;
  score: number;
  placement: number;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'GET') return json(request, { error: 'method_not_allowed' }, 405);

  const admin = adminClient();
  const user = await authenticatedUser(request);
  const { data, error } = await admin.rpc('get_typing_leaderboard', {
    p_user_id: user?.id ?? null,
    p_limit: RANKING_TOP_SIZE,
  });
  if (error) return json(request, { error: 'database_error' }, 500);

  const best = (data ?? []) as ResultRow[];

  const ids = best.map((row) => row.user_id);
  const [profileResult, cosmeticResult] = ids.length ? await Promise.all([
    admin.from('profiles').select('user_id,display_name').in('user_id', ids),
    admin.from('profile_cosmetics').select('user_id,avatar_pixels,effect_key').in('user_id', ids),
  ]) : [{ data: [], error: null }, { data: [], error: null }];
  if (profileResult.error || cosmeticResult.error) return json(request, { error: 'database_error' }, 500);
  const profiles = profileResult.data ?? [];
  const names = new Map((profiles ?? []).map((profile) => [profile.user_id, profile.display_name]));
  const cosmetics = new Map((cosmeticResult.data ?? []).map((item) => [item.user_id, {
    pixels: normalizedAvatarPixels(item.avatar_pixels),
    effect: item.effect_key,
  }]));

  return json(request, {
    leaderboard: best.map((row) => ({
      rank: Number(row.placement),
      name: names.get(row.user_id) ?? 'Participante',
      wpm: row.gross_wpm,
      accuracy: row.accuracy,
      score: row.score,
      cosmetics: cosmetics.get(row.user_id) ?? DEFAULT_COSMETICS,
      isCurrentUser: row.user_id === user?.id,
    })),
  }, 200);
});
