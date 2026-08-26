import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { profiles, results } from '@/db/schema';
import { ensureSchema } from '@/db/ensure';
import { getDb } from '@/db';

export async function GET() {
  await ensureSchema();
  const db = getDb();
  const rows = await db.select({
    userId: results.userId,
    name: profiles.displayName,
    wpm: results.grossWpm,
    accuracy: results.accuracy,
    score: results.score,
  }).from(results)
    .innerJoin(profiles, eq(results.userId, profiles.userId))
    .where(eq(results.trustStatus, 'accepted'))
    .orderBy(desc(results.score), desc(results.accuracy), desc(results.grossWpm))
    .limit(200);

  const seen = new Set<string>();
  const leaderboard = rows.filter((row) => {
    if (seen.has(row.userId)) return false;
    seen.add(row.userId);
    return true;
  }).slice(0, 20).map((row, index) => ({
    rank: index + 1,
    name: row.name,
    wpm: row.wpm,
    accuracy: row.accuracy,
    score: row.score,
  }));

  return NextResponse.json({ leaderboard }, {
    headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=30' },
  });
}
