import { DEFAULT_COSMETICS } from '../_shared/rewards.ts';
import { adminClient, authenticatedUser, json, preflight } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'GET') return json(request, { error: 'method_not_allowed' }, 405);

  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: 'authentication_required' }, 401);
  const admin = adminClient();

  const [achievementsResult, progressResult, cosmeticsResult] = await Promise.all([
    admin.from('user_achievements').select('achievement_key,unlocked_at').eq('user_id', user.id).order('unlocked_at'),
    admin.from('passage_progress').select('passage_id,passage_version,attempts,best_score,best_wpm,best_accuracy,best_correct_chars,completed,completed_at').eq('user_id', user.id).order('first_attempted_at'),
    admin.from('profile_cosmetics').select('avatar_key,frame_key,effect_key').eq('user_id', user.id).maybeSingle(),
  ]);

  if (achievementsResult.error || progressResult.error || cosmeticsResult.error) {
    return json(request, { error: 'database_error' }, 500);
  }

  const progress = progressResult.data ?? [];
  return json(request, {
    achievements: (achievementsResult.data ?? []).map((item) => ({ key: item.achievement_key, unlockedAt: item.unlocked_at })),
    passageProgress: progress.map((item) => ({
      passageId: item.passage_id,
      passageVersion: item.passage_version,
      attempts: item.attempts,
      bestScore: item.best_score,
      bestWpm: item.best_wpm,
      bestAccuracy: item.best_accuracy,
      bestCorrectChars: item.best_correct_chars,
      completed: item.completed,
      completedAt: item.completed_at,
    })),
    stats: {
      practicedPassages: progress.length,
      completedPassages: progress.filter((item) => item.completed).length,
      bestWpm: Math.max(0, ...progress.map((item) => item.best_wpm)),
      bestAccuracy: Math.max(0, ...progress.map((item) => item.best_accuracy)),
      acceptedAttempts: progress.reduce((sum, item) => sum + item.attempts, 0),
    },
    equipped: cosmeticsResult.data ? {
      avatar: cosmeticsResult.data.avatar_key,
      frame: cosmeticsResult.data.frame_key,
      effect: cosmeticsResult.data.effect_key,
    } : DEFAULT_COSMETICS,
  });
});
