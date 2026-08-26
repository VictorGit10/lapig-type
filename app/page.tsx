import { getChatGPTUser } from './chatgpt-auth';
import { publicDisplayName } from './lib/identity';
import { TypingArena } from './typing-arena';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getChatGPTUser();
  return <TypingArena initialUser={user ? { name: publicDisplayName(user) } : null} />;
}
