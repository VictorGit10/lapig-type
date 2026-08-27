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

export function authFailureMessage(error: unknown, mode: 'signin' | 'signup', language: 'pt' | 'en' | 'es' = 'pt') {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  const messages = {
    pt: {
      captcha: 'A verificação anti-bot expirou. Aguarde a renovação e tente novamente.',
      password: 'A senha não foi aceita. Use pelo menos 10 caracteres.',
      exists: 'Esse nome de usuário já está em uso. Tente entrar ou escolha outro nome.',
      rate: 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.',
      identifier: 'O identificador interno da conta não foi aceito. Tente outro nome.',
      confirmation: 'A conta foi recebida, mas o acesso automático não foi liberado. Tente entrar; se não funcionar, escolha outro nome.',
      signup: 'Não foi possível criar a conta agora. A verificação foi renovada; tente novamente.',
      signin: 'Usuário ou senha incorretos. A verificação foi renovada para uma nova tentativa.',
    },
    en: {
      captcha: 'The anti-bot check expired. Wait for it to refresh and try again.',
      password: 'The password was not accepted. Use at least 10 characters.',
      exists: 'That username is already in use. Sign in or choose another name.',
      rate: 'Too many attempts in a short time. Wait a few minutes.',
      identifier: 'The internal account identifier was not accepted. Try another name.',
      confirmation: 'The account was received, but automatic access was not enabled. Try signing in or choose another name.',
      signup: 'The account could not be created right now. The check was refreshed; try again.',
      signin: 'Incorrect username or password. The check was refreshed for another attempt.',
    },
    es: {
      captcha: 'La verificación anti-bot caducó. Espera a que se renueve e inténtalo de nuevo.',
      password: 'La contraseña no fue aceptada. Usa al menos 10 caracteres.',
      exists: 'Ese nombre de usuario ya está en uso. Entra o elige otro nombre.',
      rate: 'Demasiados intentos en poco tiempo. Espera unos minutos.',
      identifier: 'El identificador interno de la cuenta no fue aceptado. Prueba con otro nombre.',
      confirmation: 'La cuenta fue recibida, pero el acceso automático no se habilitó. Intenta entrar o elige otro nombre.',
      signup: 'No fue posible crear la cuenta ahora. La verificación se renovó; inténtalo de nuevo.',
      signin: 'Usuario o contraseña incorrectos. La verificación se renovó para otro intento.',
    },
  }[language];
  if (code === 'captcha_failed' || message.includes('captcha')) return messages.captcha;
  if (code === 'weak_password' || message.includes('password')) return messages.password;
  if (code === 'user_already_exists' || message.includes('already registered') || message.includes('already_exists')) return messages.exists;
  if (code === 'over_request_rate_limit' || message.includes('rate limit')) return messages.rate;
  if (code === 'email_address_invalid' || message.includes('invalid email')) return messages.identifier;
  if (message.includes('signup_requires_confirmation')) return messages.confirmation;
  return mode === 'signup' ? messages.signup : messages.signin;
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
