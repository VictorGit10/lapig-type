alter table public.profile_cosmetics
  add column if not exists mark_key text not null default 'contours'
    check (mark_key in ('contours', 'leaf', 'pin', 'orbit', 'keys', 'globe')),
  add column if not exists palette_key text not null default 'field'
    check (palette_key in ('field', 'clay', 'sun', 'night'));
