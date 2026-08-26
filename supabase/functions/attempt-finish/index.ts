import type { KeystrokeEvent } from '../_shared/scoring.ts';
import { scoreAttempt } from '../_shared/scoring.ts';
import { findPassage } from '../_shared/passages.ts';
import {
  adminClient,
  authenticatedUser,
  clientFingerprint,
  json,
  preflight,
  sha256,
} from '../_shared/http.ts';

type FinishBody = {
  attemptId?: string;
  attemptToken?: string;
  clientElapsedMs?: number;
  mistakes?: number;
  visibilityChanges?: number;
  events?: KeystrokeEvent[];
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'POST') return json(request, { error: 'method_not_allowed' }, 405);

  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: 'authentication_required' }, 401);

  const body = await request.json().catch(() => null) as FinishBody | null;
  if (
    !body?.attemptId ||
    !body.attemptToken ||
    !Array.isArray(body.events) ||
    body.events.length > 2400
  ) return json(request, { error: 'invalid_payload' }, 400);

  const admin = adminClient();
  const { data: attempt, error: attemptError } = await admin
    .from('attempts')
    .select('id,user_id,passage_id,expected_chars,started_at,expires_at,status,client_hash,nonce_hash')
    .eq('id', body.attemptId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (attemptError) return json(request, { error: 'database_error' }, 500);
  if (!attempt) return json(request, { error: 'attempt_not_found' }, 404);
  if (attempt.status !== 'started') return json(request, { error: 'attempt_already_used' }, 409);

  const now = Date.now();
  const expiresAt = Date.parse(attempt.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt < now) {
    await admin.from('attempts').update({ status: 'expired', finished_at: new Date(now).toISOString() }).eq('id', attempt.id).eq('status', 'started');
    return json(request, { error: 'attempt_expired' }, 410);
  }
  if (await sha256(body.attemptToken) !== attempt.nonce_hash) {
    return json(request, { error: 'attempt_token_invalid' }, 403);
  }

  const passage = findPassage(attempt.passage_id);
  if (!passage || passage.text.length !== attempt.expected_chars) {
    return json(request, { error: 'passage_version_unavailable' }, 409);
  }

  const verdict = scoreAttempt({
    expectedText: passage.text,
    clientElapsedMs: Number(body.clientElapsedMs),
    serverElapsedMs: now - Date.parse(attempt.started_at),
    reportedMistakes: Number(body.mistakes),
    visibilityChanges: Number(body.visibilityChanges) || 0,
    events: body.events,
  });

  if (await clientFingerprint(request) !== attempt.client_hash) {
    verdict.flags.push('client_changed');
    verdict.trustStatus = 'rejected';
  }

  const resultId = crypto.randomUUID();
  const { data: finalized, error: finalizeError } = await admin.rpc('finalize_typing_attempt', {
    p_attempt_id: attempt.id,
    p_user_id: user.id,
    p_result_id: resultId,
    p_gross_wpm: verdict.grossWpm,
    p_accuracy: verdict.accuracy,
    p_score: verdict.score,
    p_duration_ms: verdict.durationMs,
    p_mistake_count: Number(body.mistakes),
    p_trust_status: verdict.trustStatus,
    p_flags: verdict.flags,
  });
  if (finalizeError) return json(request, { error: 'database_error' }, 500);
  if (!finalized) return json(request, { error: 'attempt_already_used' }, 409);

  return json(request, {
    resultId,
    grossWpm: verdict.grossWpm,
    accuracy: verdict.accuracy,
    score: verdict.score,
    trustStatus: verdict.trustStatus,
    ranked: verdict.trustStatus === 'accepted',
  });
});
