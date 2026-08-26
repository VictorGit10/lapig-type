import { findPassage } from '../_shared/passages.ts';
import {
  adminClient,
  authenticatedUser,
  clientFingerprint,
  json,
  preflight,
  publicDisplayName,
  randomToken,
  sha256,
} from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return preflight(request);
  if (request.method !== 'POST') return json(request, { error: 'method_not_allowed' }, 405);

  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: 'authentication_required' }, 401);

  const body = await request.json().catch(() => null) as { passageId?: string } | null;
  const passage = findPassage(body?.passageId ?? '');
  if (!passage) return json(request, { error: 'invalid_passage' }, 400);

  const admin = adminClient();
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count, error: countError } = await admin
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('started_at', oneMinuteAgo);
  if (countError) return json(request, { error: 'database_error' }, 500);
  if ((count ?? 0) >= 6) return json(request, { error: 'rate_limited' }, 429);

  const now = new Date();
  const { error: profileError } = await admin.from('profiles').upsert({
    user_id: user.id,
    display_name: publicDisplayName(user),
    updated_at: now.toISOString(),
  }, { onConflict: 'user_id' });
  if (profileError) return json(request, { error: 'database_error' }, 500);

  const attemptToken = randomToken();
  const expiresAt = new Date(now.getTime() + 10 * 60_000);
  const { data: attempt, error: attemptError } = await admin.from('attempts').insert({
    user_id: user.id,
    passage_id: passage.id,
    passage_version: 1,
    expected_chars: passage.text.length,
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'started',
    client_hash: await clientFingerprint(request),
    nonce_hash: await sha256(attemptToken),
  }).select('id').single();
  if (attemptError || !attempt) return json(request, { error: 'database_error' }, 500);

  return json(request, {
    attemptId: attempt.id,
    attemptToken,
    issuedAt: now.getTime(),
    expiresAt: expiresAt.getTime(),
  });
});
