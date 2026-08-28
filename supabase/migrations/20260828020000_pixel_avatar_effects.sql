alter table public.profile_cosmetics
  drop constraint if exists profile_cosmetics_effect_key_check;

update public.profile_cosmetics
set effect_key = 'orbit'
where effect_key = 'contours';

alter table public.profile_cosmetics
  add constraint profile_cosmetics_effect_key_check
    check (effect_key in (
      'none', 'orbit', 'signal', 'scan', 'resolution', 'precision',
      'reference', 'solar-pulse', 'catalog', 'atlas'
    ));
