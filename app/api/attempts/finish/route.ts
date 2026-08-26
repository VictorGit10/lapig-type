import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { attempts, results } from '@/db/schema';
import { ensureSchema } from '@/db/ensure';
import { getDb } from '@/db';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { clientFingerprint } from '@/app/lib/identity';
import { scoreAttempt, type KeystrokeEvent } from '@/app/lib/scoring';

type FinishBody = {
  attemptId?: string;
  clientElapsedMs?: number;
  mistakes?: number;
  visibilityChanges?: number;
  events?: KeystrokeEvent[];
};

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });

  const body = await request.json().catch(() => null) as FinishBody | null;
  if (!body?.attemptId || !Array.isArray(body.events) || body.events.length > 2400) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  await ensureSchema();
  const db = getDb();
  const [attempt] = await db.select().from(attempts).where(and(
    eq(attempts.id, body.attemptId),
    eq(attempts.userId, user.userId),
  )).limit(1);

  if (!attempt) return NextResponse.json({ error: 'attempt_not_found' }, { status: 404 });
  if (attempt.status !== 'started') return NextResponse.json({ error: 'attempt_already_used' }, { status: 409 });

  const now = Date.now();
  if (attempt.expiresAt < now) {
    await db.update(attempts).set({ status: 'expired', finishedAt: now }).where(eq(attempts.id, attempt.id));
    return NextResponse.json({ error: 'attempt_expired' }, { status: 410 });
  }

  const verdict = scoreAttempt({
    expectedChars: attempt.expectedChars,
    clientElapsedMs: Number(body.clientElapsedMs),
    serverElapsedMs: now - attempt.startedAt,
    reportedMistakes: Number(body.mistakes),
    visibilityChanges: Number(body.visibilityChanges) || 0,
    events: body.events,
  });

  const currentFingerprint = await clientFingerprint(request);
  if (currentFingerprint !== attempt.clientHash) {
    verdict.flags.push('client_changed');
    verdict.trustStatus = 'rejected';
  }

  const resultId = crypto.randomUUID();
  await db.batch([
    db.update(attempts).set({ status: 'finished', finishedAt: now }).where(eq(attempts.id, attempt.id)),
    db.insert(results).values({
      id: resultId,
      attemptId: attempt.id,
      userId: user.userId,
      passageId: attempt.passageId,
      grossWpm: verdict.grossWpm,
      accuracy: verdict.accuracy,
      score: verdict.score,
      durationMs: verdict.durationMs,
      mistakeCount: Number(body.mistakes),
      trustStatus: verdict.trustStatus,
      flags: JSON.stringify(verdict.flags),
      createdAt: now,
    }),
  ]);

  return NextResponse.json({
    resultId,
    grossWpm: verdict.grossWpm,
    accuracy: verdict.accuracy,
    score: verdict.score,
    trustStatus: verdict.trustStatus,
    ranked: verdict.trustStatus === 'accepted',
  });
}
