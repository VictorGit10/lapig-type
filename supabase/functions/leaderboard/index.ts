import { DEFAULT_COSMETICS } from '../_shared/rewards.ts';
import { adminClient, json, preflight } from '../_shared/http.ts';

type ResultRow = {
  user_id: string;
  gross_wpm: number;
  accuracy: number;
  score: number;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'GET') return json(request, { error: 'method_not_allowed' }, 405);

  const admin = adminClient();
  const { data, error } = await admin
    .from('results')
    .select('user_id,gross_wpm,accuracy,score')
    .eq('trust_status', 'accepted')
    .order('score', { ascending: false })
    .order('accuracy', { ascending: false })
    .order('gross_wpm', { ascending: false })
    .limit(200);
  if (error) return json(request, { error: 'database_error' }, 500);

  const seen = new Set<string>();
  const best = ((data ?? []) as ResultRow[]).filter((row) => {
    if (seen.has(row.user_id)) return false;
    seen.add(row.user_id);
    return true;
  }).slice(0, 20);

  const ids = best.map((row) => row.user_id);
  const [profileResult, cosmeticResult] = ids.length ? await Promise.all([
    admin.from('profiles').select('user_id,display_name').in('user_id', ids),
    admin.from('profile_cosmetics').select('user_id,avatar_key,mark_key,palette_key,frame_key,effect_key').in('user_id', ids),
  ]) : [{ data: [], error: null }, { data: [], error: null }];
  if (profileResult.error || cosmeticResult.error) return json(request, { error: 'database_error' }, 500);
  const profiles = profileResult.data ?? [];
  const names = new Map((profiles ?? []).map((profile) => [profile.user_id, profile.display_name]));
  const cosmetics = new Map((cosmeticResult.data ?? []).map((item) => [item.user_id, {
    avatar: item.avatar_key,
    mark: item.mark_key,
    palette: item.palette_key,
    frame: item.frame_key,
    effect: item.effect_key,
  }]));

  return json(request, {
    leaderboard: best.map((row, index) => ({
      rank: index + 1,
      name: names.get(row.user_id) ?? 'Participante',
      wpm: row.gross_wpm,
      accuracy: row.accuracy,
      score: row.score,
      cosmetics: cosmetics.get(row.user_id) ?? DEFAULT_COSMETICS,
    })),
  }, 200);
});
