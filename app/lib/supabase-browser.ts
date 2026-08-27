import { createClient, type Provider, type User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
  ?? (supabaseUrl ? `${supabaseUrl}/functions/v1` : '');

export const arenaBackendConfigured = Boolean(supabaseUrl && publishableKey && functionsUrl);
export const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';
export const githubAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GITHUB_AUTH === 'true';
export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export const supabase = arenaBackendConfigured
  ? createClient(supabaseUrl, publishableKey, {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function userDisplayName(user: User) {
  const metadataName = [user.user_metadata?.full_name, user.user_metadata?.name]
    .find((value) => typeof value === 'string' && value.trim()) as string | undefined;
  if (metadataName) return metadataName.trim().slice(0, 48);
  return `Participante ${user.id.slice(0, 4).toUpperCase()}`;
}

export async function signInWithProvider(provider: Extract<Provider, 'google' | 'github'>) {
  if (!supabase) throw new Error('backend_not_configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: cleanRedirectUrl() },
  });
  if (error) throw error;
}

export async function signUpWithPassword(username: string, password: string, captchaToken: string) {
  if (!supabase) throw new Error('backend_not_configured');
  const normalizedUsername = normalizeUsername(username);
  const { data, error } = await supabase.auth.signUp({
    email: accountEmail(normalizedUsername),
    password,
    options: {
      captchaToken,
      data: { name: normalizedUsername, username: normalizedUsername },
    },
  });
  if (error) throw error;
  if (!data.session) throw new Error('signup_requires_confirmation');
}

export async function signInWithPassword(username: string, password: string, captchaToken: string) {
  if (!supabase) throw new Error('backend_not_configured');
  const { error } = await supabase.auth.signInWithPassword({
    email: accountEmail(normalizeUsername(username)),
    password,
    options: { captchaToken },
  });
  if (error) throw error;
}

function cleanRedirectUrl() {
  const redirectTo = new URL(window.location.href);
  redirectTo.search = '';
  redirectTo.hash = '';
  return redirectTo.toString();
}

export function normalizeUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(normalized)) throw new Error('invalid_username');
  return normalized;
}

export function accountEmail(username: string) {
  return `${username}@users.victorgit10.github.io`;
}

export async function arenaRequest(
  functionName: 'attempt-start' | 'attempt-finish' | 'leaderboard',
  init: RequestInit,
  requireAuthentication = false,
) {
  if (!supabase || !arenaBackendConfigured) throw new Error('backend_not_configured');
  const headers = new Headers(init.headers);
  headers.set('apikey', publishableKey);
  headers.set('Content-Type', 'application/json');

  if (requireAuthentication) {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) throw new Error('authentication_required');
    headers.set('Authorization', `Bearer ${data.session.access_token}`);
  }

  return fetch(`${functionsUrl}/${functionName}`, { ...init, headers });
}
