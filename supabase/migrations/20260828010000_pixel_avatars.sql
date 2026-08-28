alter table public.profile_cosmetics
  add column if not exists avatar_pixels jsonb not null default '[]'::jsonb
    check (
      jsonb_typeof(avatar_pixels) = 'array'
      and jsonb_array_length(avatar_pixels) in (0, 256)
    );

comment on column public.profile_cosmetics.avatar_pixels is
  '16x16 pixel-art palette indexes. Empty arrays are legacy fallbacks; saved avatars contain exactly 256 validated values.';
