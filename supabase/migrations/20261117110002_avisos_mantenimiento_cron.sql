-- Aviso diario por correo de mantenimientos proximos (pg_cron + pg_net + Edge Function)

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Secreto compartido entre el cron y la Edge Function, guardado en Vault
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'avisos_cron_secret') then
    perform vault.create_secret(encode(gen_random_bytes(32), 'hex'), 'avisos_cron_secret');
  end if;
end;
$$;

create or replace function public.validar_secreto_avisos(p_secreto text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'avisos_cron_secret' and decrypted_secret = p_secreto
  )
$$;

create or replace function public.usuario_tiene_permiso(p_auth_id uuid, p_permiso text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios u
    where u.auth_id = p_auth_id
      and coalesce(u.activo, true)
      and (
        u.rol = 'Administrador'
        or exists (
          select 1 from public.permisos_rol pr
          where pr.rol = u.rol and pr.permiso = p_permiso
        )
      )
  )
$$;

revoke all on function public.validar_secreto_avisos(text) from public, anon, authenticated;
revoke all on function public.usuario_tiene_permiso(uuid, text) from public, anon, authenticated;
grant execute on function public.validar_secreto_avisos(text) to service_role;
grant execute on function public.usuario_tiene_permiso(uuid, text) to service_role;

-- Todos los dias a las 14:00 UTC (8:00 a.m. en Nicaragua)
select cron.unschedule('avisos-mantenimiento')
where exists (select 1 from cron.job where jobname = 'avisos-mantenimiento');

select cron.schedule(
  'avisos-mantenimiento',
  '0 14 * * *',
  $cron$
  select net.http_post(
    url := 'https://rcmlhujkytcacrwxgwko.supabase.co/functions/v1/avisos-mantenimiento',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'avisos_cron_secret')
    ),
    body := '{}'::jsonb
  )
  $cron$
);
