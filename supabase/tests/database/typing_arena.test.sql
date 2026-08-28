begin;

select plan(10);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'attempts', 'attempts table exists');
select has_table('public', 'results', 'results table exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.results'::regclass),
  'results has row-level security enabled'
);

select ok(
  not has_table_privilege('anon', 'public.results', 'select'),
  'anonymous clients cannot read raw results'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.finalize_typing_attempt(uuid,uuid,uuid,integer,integer,integer,integer,integer,integer,integer,text,jsonb)',
    'execute'
  ),
  'authenticated clients cannot call the finalization RPC'
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'database-test@example.test',
  '',
  now(),
  now(),
  now()
);

insert into public.profiles (user_id, display_name)
values ('10000000-0000-0000-0000-000000000001', 'Teste de banco');

insert into public.attempts (
  id,
  user_id,
  passage_id,
  expected_chars,
  expires_at,
  client_hash,
  nonce_hash
) values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'cerrado-fronteira',
  300,
  now() + interval '10 minutes',
  'test-client',
  'test-nonce'
);

select is(
  public.finalize_typing_attempt(
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    72,
    98,
    69,
    50000,
    2,
    260,
    6,
    'accepted',
    '[]'::jsonb
  ),
  true,
  'the first finalization claims the attempt'
);

select is(
  public.finalize_typing_attempt(
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    72,
    98,
    69,
    50000,
    2,
    260,
    6,
    'accepted',
    '[]'::jsonb
  ),
  false,
  'a replay cannot finalize the same attempt'
);

select is(
  (select count(*)::integer from public.results where attempt_id = '20000000-0000-0000-0000-000000000001'),
  1,
  'only one result exists for the attempt'
);

select is(
  (select status from public.attempts where id = '20000000-0000-0000-0000-000000000001'),
  'finished',
  'the claimed attempt is marked as finished'
);

select * from finish();
rollback;

