import type { ChatGPTUser } from '../chatgpt-auth';

export function publicDisplayName(user: ChatGPTUser) {
  if (user.fullName?.trim()) return user.fullName.trim().slice(0, 48);
  const localPart = user.email.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  return (localPart || 'Participante').slice(0, 48);
}

export async function clientFingerprint(request: Request) {
  const raw = [request.headers.get('user-agent') ?? '', request.headers.get('accept-language') ?? ''].join('|');
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(bytes)).slice(0, 12).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
