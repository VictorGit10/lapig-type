alter table public.profile_cosmetics
  drop constraint if exists profile_cosmetics_avatar_key_check;

alter table public.profile_cosmetics
  add constraint profile_cosmetics_avatar_key_check
    check (avatar_key in ('topographic', 'parcels', 'cerrado', 'radar', 'atlas')),
  add column if not exists border_key text not null default 'forest'
    check (border_key in ('forest', 'lime', 'clay', 'sun', 'ink')),
  add column if not exists letter_key text not null default 'ink'
    check (letter_key in ('ink', 'forest', 'paper', 'clay', 'sun'));
