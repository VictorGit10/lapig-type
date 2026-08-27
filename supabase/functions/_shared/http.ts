import { createClient, type User } from 'npm:@supabase/supabase-js@2';

const DEFAULT_ORIGINS = [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'https://victorgit10.github.io',
];

export function corsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_ORIGINS, ...configured]);
  const acceptedOrigin = origin && allowed.has(origin) ? origin : null;

  return {
    ...(acceptedOrigin ? { 'Access-Control-Allow-Origin': acceptedOrigin } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin',
  };
}

export function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) });
}

export function preflight(request: Request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(request);
  if (origin && !headers['Access-Control-Allow-Origin']) {
    return json(request, { error: 'origin_not_allowed' }, 403);
  }
  return new Response(null, { status: 204, headers });
}

export function adminClient() {
  return createClient(
    requiredEnv('SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function authenticatedUser(request: Request): Promise<User | null> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const client = createClient(
    requiredEnv('SUPABASE_URL'),
    requiredEnv('SUPABASE_ANON_KEY'),
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    },
  );
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

export function publicDisplayName(user: User) {
  const metadataName = [user.user_metadata?.full_name, user.user_metadata?.name]
    .find((value) => typeof value === 'string' && value.trim()) as string | undefined;
  if (metadataName) {
    const safeName = metadataName
      .normalize('NFC')
      .replace(/[\p{Cc}\p{Cf}]/gu, '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 48);
    if (/^[\p{L}\p{N}](?:[\p{L}\p{N} .'’_-]*[\p{L}\p{N}])?$/u.test(safeName)) return safeName;
  }
  return `Participante ${user.id.slice(0, 4).toUpperCase()}`;
}

export async function sha256(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function clientFingerprint(request: Request) {
  return (await sha256([
    request.headers.get('user-agent') ?? '',
    request.headers.get('accept-language') ?? '',
  ].join('|'))).slice(0, 24);
}

export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment value: ${name}`);
  return value;
}
