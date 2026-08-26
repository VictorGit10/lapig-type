import { and, count, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { attempts, profiles } from '@/db/schema';
import { ensureSchema } from '@/db/ensure';
import { getDb } from '@/db';
import { passages } from '@/app/content';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { clientFingerprint, publicDisplayName } from '@/app/lib/identity';

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });

  const body = await request.json().catch(() => null) as { passageId?: string } | null;
  const passage = passages.find((item) => item.id === body?.passageId);
  if (!passage) return NextResponse.json({ error: 'invalid_passage' }, { status: 400 });

  await ensureSchema();
  const db = getDb();
  const now = Date.now();
  const [{ value: recentAttempts }] = await db.select({ value: count() }).from(attempts).where(and(
    eq(attempts.userId, user.userId),
    gt(attempts.startedAt, now - 60_000),
  ));
  if (recentAttempts >= 6) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  await db.insert(profiles).values({
    userId: user.userId,
    displayName: publicDisplayName(user),
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: profiles.userId,
    set: { displayName: publicDisplayName(user), updatedAt: now },
  });

  const attemptId = crypto.randomUUID();
  await db.insert(attempts).values({
    id: attemptId,
    userId: user.userId,
    passageId: passage.id,
    passageVersion: 1,
    expectedChars: passage.text.length,
    startedAt: now,
    expiresAt: now + 10 * 60_000,
    status: 'started',
    clientHash: await clientFingerprint(request),
  });

  return NextResponse.json({ attemptId, issuedAt: now, expiresAt: now + 10 * 60_000 });
}
