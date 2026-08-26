import { createClient, type Provider, type User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
  ?? (supabaseUrl ? `${supabaseUrl}/functions/v1` : '');

export const arenaBackendConfigured = Boolean(supabaseUrl && publishableKey && functionsUrl);

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
  const localPart = user.email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  return (localPart || 'Participante').slice(0, 48);
}

export async function signIn(provider: Extract<Provider, 'google' | 'github'>) {
  if (!supabase) throw new Error('backend_not_configured');
  const redirectTo = new URL(window.location.href);
  redirectTo.search = '';
  redirectTo.hash = '';
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTo.toString() },
  });
  if (error) throw error;
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
