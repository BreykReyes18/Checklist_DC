-- Planes de mantenimiento periodico (ej. aires acondicionados con Microtek cada 4 meses)
-- con aviso anticipado configurable y correos de notificacion.

create table if not exists public.planes_mantenimiento (
  id                bigint generated always as identity primary key,
  nombre            text not null,
  proveedor         text,
  frecuencia_meses  integer not null default 4 check (frecuencia_meses between 1 and 60),
  ultima_fecha      date,
  proxima_fecha     date generated always as
                      ((ultima_fecha + make_interval(months => frecuencia_meses))::date) stored,
  dias_aviso        integer not null default 7 check (dias_aviso between 0 and 90),
  correos_aviso     text[] not null default '{}',
  activo            boolean not null default true,
  ultimo_aviso_para date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists planes_mantenimiento_nombre_uidx
  on public.planes_mantenimiento (lower(trim(nombre)));

drop trigger if exists planes_mantenimiento_updated_at on public.planes_mantenimiento;
create trigger planes_mantenimiento_updated_at
  before update on public.planes_mantenimiento
  for each row execute function public.update_updated_at_column();

-- Si cambia la proxima fecha se permite un nuevo aviso
create or replace function public.reiniciar_aviso_plan()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ultima_fecha is distinct from old.ultima_fecha
     or new.frecuencia_meses is distinct from old.frecuencia_meses
     or new.dias_aviso is distinct from old.dias_aviso then
    new.ultimo_aviso_para := null;
  end if;
  return new;
end;
$$;

drop trigger if exists planes_mantenimiento_reiniciar_aviso on public.planes_mantenimiento;
create trigger planes_mantenimiento_reiniciar_aviso
  before update on public.planes_mantenimiento
  for each row execute function public.reiniciar_aviso_plan();

-- Historial de mantenimientos realizados enlazado al plan
alter table public.mantenimiento add column if not exists plan_id bigint
  references public.planes_mantenimiento(id) on delete set null;
alter table public.mantenimiento add column if not exists proveedor text;
alter table public.mantenimiento add column if not exists user_id uuid default auth.uid();

create index if not exists mantenimiento_plan_fecha_idx
  on public.mantenimiento (plan_id, fecha desc);

-- Al registrar un mantenimiento preventivo de un plan, se mueve su ultima fecha
create or replace function public.actualizar_ultima_fecha_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.plan_id is not null and new.tipo = 'Preventivo' and new.fecha is not null then
    update public.planes_mantenimiento
    set ultima_fecha = greatest(coalesce(ultima_fecha, new.fecha), new.fecha)
    where id = new.plan_id;
  end if;
  return new;
end;
$$;

revoke all on function public.actualizar_ultima_fecha_plan() from public, anon, authenticated;

drop trigger if exists mantenimiento_actualiza_plan on public.mantenimiento;
create trigger mantenimiento_actualiza_plan
  after insert on public.mantenimiento
  for each row execute function public.actualizar_ultima_fecha_plan();

-- Permisos
insert into public.permisos_catalogo (permiso, modulo, descripcion) values
  ('mantenimiento.ver',       'Mantenimiento', 'Ver planes y mantenimientos'),
  ('mantenimiento.gestionar', 'Mantenimiento', 'Registrar mantenimientos y configurar planes')
on conflict (permiso) do nothing;

insert into public.permisos_rol (rol, permiso) values
  ('Operador',   'mantenimiento.ver'),
  ('Operador',   'mantenimiento.gestionar'),
  ('Supervisor', 'mantenimiento.ver'),
  ('Supervisor', 'mantenimiento.gestionar')
on conflict do nothing;

-- Seguridad
alter table public.planes_mantenimiento enable row level security;
alter table public.mantenimiento enable row level security;
revoke all on public.planes_mantenimiento from anon;
revoke all on public.mantenimiento from anon;

drop policy if exists planes_mantenimiento_select on public.planes_mantenimiento;
drop policy if exists planes_mantenimiento_insert on public.planes_mantenimiento;
drop policy if exists planes_mantenimiento_update on public.planes_mantenimiento;
drop policy if exists planes_mantenimiento_delete on public.planes_mantenimiento;
drop policy if exists mantenimiento_select on public.mantenimiento;
drop policy if exists mantenimiento_insert on public.mantenimiento;
drop policy if exists mantenimiento_update on public.mantenimiento;
drop policy if exists mantenimiento_delete on public.mantenimiento;

create policy planes_mantenimiento_select on public.planes_mantenimiento
  for select to authenticated using (public.tiene_permiso('mantenimiento.ver'));
create policy planes_mantenimiento_insert on public.planes_mantenimiento
  for insert to authenticated with check (public.tiene_permiso('mantenimiento.gestionar'));
create policy planes_mantenimiento_update on public.planes_mantenimiento
  for update to authenticated
  using (public.tiene_permiso('mantenimiento.gestionar'))
  with check (public.tiene_permiso('mantenimiento.gestionar'));
create policy planes_mantenimiento_delete on public.planes_mantenimiento
  for delete to authenticated using (public.es_admin());

create policy mantenimiento_select on public.mantenimiento
  for select to authenticated using (public.tiene_permiso('mantenimiento.ver'));
create policy mantenimiento_insert on public.mantenimiento
  for insert to authenticated with check (public.tiene_permiso('mantenimiento.gestionar'));
create policy mantenimiento_update on public.mantenimiento
  for update to authenticated
  using (public.tiene_permiso('mantenimiento.gestionar'))
  with check (public.tiene_permiso('mantenimiento.gestionar'));
create policy mantenimiento_delete on public.mantenimiento
  for delete to authenticated using (public.es_admin());

-- Plan inicial
insert into public.planes_mantenimiento (nombre, proveedor, frecuencia_meses, dias_aviso)
values ('Aires acondicionados', 'Microtek', 4, 7)
on conflict do nothing;
