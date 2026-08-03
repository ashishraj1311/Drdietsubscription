-- Normalise the auth provider written into profiles so email (and phone) logins
-- don't violate the profiles.auth_provider CHECK ('otp','google','guest').
--
-- Supabase tags email logins with provider = 'email' and phone with 'phone';
-- we store both as 'otp' (a verified one-time-password login), Google as
-- 'google', and anonymous as 'guest'. Re-running is safe (create or replace).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, auth_provider, email_verified, phone_verified)
  values (
    new.id,
    new.email,
    new.phone,
    case
      when new.is_anonymous then 'guest'
      when new.raw_app_meta_data->>'provider' = 'google' then 'google'
      else 'otp'
    end,
    (new.email_confirmed_at is not null),
    (new.phone_confirmed_at is not null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
