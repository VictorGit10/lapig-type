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
  const displayName = normalizeDisplayName(username);
  const normalizedUsername = normalizeUsername(displayName);
  const { data, error } = await supabase.auth.signUp({
    email: accountEmail(normalizedUsername),
    password,
    options: {
      captchaToken,
      data: { name: displayName, username: normalizedUsername },
    },
  });
  if (error) throw error;
  if (data.user?.identities?.length === 0) throw new Error('user_already_exists');
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

export function normalizeDisplayName(username: string) {
  const normalized = username.trim().replace(/\s+/g, ' ');
  if (normalized.length < 3 || normalized.length > 32) throw new Error('invalid_username');
  if (!/^[\p{L}\p{N}](?:[\p{L}\p{N} ._-]*[\p{L}\p{N}])?$/u.test(normalized)) {
    throw new Error('invalid_username');
  }
  return normalized;
}

export function normalizeUsername(username: string) {
  const normalized = normalizeDisplayName(username)
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/[._-]{2,}/g, '.');
  if (!/^[a-z0-9][a-z0-9._-]{1,46}[a-z0-9]$/.test(normalized)) throw new Error('invalid_username');
  return normalized;
}

export function accountEmail(username: string) {
  return `${username}@users.victorgit10.github.io`;
}

export function authFailureMessage(error: unknown, mode: 'signin' | 'signup') {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (code === 'captcha_failed' || message.includes('captcha')) return 'A verificação anti-bot expirou. Aguarde a renovação e tente novamente.';
  if (code === 'weak_password' || message.includes('password')) return 'A senha não foi aceita. Use pelo menos 10 caracteres.';
  if (code === 'user_already_exists' || message.includes('already registered') || message.includes('already_exists')) return 'Esse nome de usuário já está em uso. Tente entrar ou escolha outro nome.';
  if (code === 'over_request_rate_limit' || message.includes('rate limit')) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
  if (code === 'email_address_invalid' || message.includes('invalid email')) return 'O identificador interno da conta não foi aceito. Tente outro nome.';
  if (message.includes('signup_requires_confirmation')) return 'A conta foi recebida, mas o acesso automático não foi liberado. Tente entrar; se não funcionar, escolha outro nome.';
  return mode === 'signup'
    ? 'Não foi possível criar a conta agora. A verificação foi renovada; tente novamente.'
    : 'Usuário ou senha incorretos. A verificação foi renovada para uma nova tentativa.';
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
