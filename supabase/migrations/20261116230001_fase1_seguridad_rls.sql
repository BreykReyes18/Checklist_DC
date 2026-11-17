-- Fase 1: seguridad. Activa RLS en todas las tablas y define quien puede leer y escribir.
-- Los dos operadores comparten las bitacoras; solo el administrador elimina y gestiona usuarios.

begin;

-- Funciones auxiliares (security definer para evitar recursion al leer usuarios)
create or replace function public.es_usuario_activo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.auth_id = auth.uid()
      and coalesce(u.activo, true)
  )
$$;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.auth_id = auth.uid()
      and coalesce(u.activo, true)
      and u.rol = 'Administrador'
  )
$$;

revoke all on function public.es_usuario_activo() from public, anon;
revoke all on function public.es_admin() from public, anon;
grant execute on function public.es_usuario_activo() to authenticated;
grant execute on function public.es_admin() to authenticated;

-- Activar RLS en todas las tablas
alter table public.auditoria      enable row level security;
alter table public.bitacora       enable row level security;
alter table public.bitacoras      enable row level security;
alter table public.centro_alarmas enable row level security;
alter table public.configuracion  enable row level security;
alter table public.entrega_turno  enable row level security;
alter table public.escalamiento   enable row level security;
alter table public.estado_equipos enable row level security;
alter table public.inventario     enable row level security;
alter table public.inventario_dc  enable row level security;
alter table public.mantenimiento  enable row level security;
alter table public.usuarios       enable row level security;

-- El rol anonimo no debe tocar ninguna tabla
revoke all on public.auditoria, public.bitacora, public.bitacoras, public.centro_alarmas,
  public.configuracion, public.entrega_turno, public.escalamiento, public.estado_equipos,
  public.inventario, public.inventario_dc, public.mantenimiento, public.usuarios
from anon;

-- Politicas anteriores
drop policy if exists "Usuarios actualizan su bitacora" on public.bitacora;
drop policy if exists "Usuarios eliminan su bitacora"   on public.bitacora;
drop policy if exists "Usuarios insertan su bitacora"   on public.bitacora;
drop policy if exists "Usuarios ven sus bitacoras"      on public.bitacora;
drop policy if exists "bitacoras_delete_policy"         on public.bitacoras;

-- bitacora: todos los usuarios activos la ven; edita o elimina el autor o el administrador
create policy bitacora_select on public.bitacora
  for select to authenticated
  using (public.es_usuario_activo());

create policy bitacora_insert on public.bitacora
  for insert to authenticated
  with check (public.es_usuario_activo() and user_id = auth.uid());

create policy bitacora_update on public.bitacora
  for update to authenticated
  using (public.es_usuario_activo() and (user_id = auth.uid() or public.es_admin()))
  with check (public.es_usuario_activo() and (user_id = auth.uid() or public.es_admin()));

create policy bitacora_delete on public.bitacora
  for delete to authenticated
  using (public.es_usuario_activo() and (user_id = auth.uid() or public.es_admin()));

-- centro_alarmas
create policy centro_alarmas_select on public.centro_alarmas
  for select to authenticated using (public.es_usuario_activo());

create policy centro_alarmas_insert on public.centro_alarmas
  for insert to authenticated with check (public.es_usuario_activo());

create policy centro_alarmas_update on public.centro_alarmas
  for update to authenticated
  using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy centro_alarmas_delete on public.centro_alarmas
  for delete to authenticated using (public.es_admin());

-- entrega_turno
create policy entrega_turno_select on public.entrega_turno
  for select to authenticated using (public.es_usuario_activo());

create policy entrega_turno_insert on public.entrega_turno
  for insert to authenticated with check (public.es_usuario_activo());

create policy entrega_turno_update on public.entrega_turno
  for update to authenticated
  using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy entrega_turno_delete on public.entrega_turno
  for delete to authenticated using (public.es_admin());

-- inventario_dc: los usuarios activos agregan y editan equipos desde la app; elimina el administrador
create policy inventario_dc_select on public.inventario_dc
  for select to authenticated using (public.es_usuario_activo());

create policy inventario_dc_insert on public.inventario_dc
  for insert to authenticated with check (public.es_usuario_activo());

create policy inventario_dc_update on public.inventario_dc
  for update to authenticated
  using (public.es_usuario_activo()) with check (public.es_usuario_activo());

create policy inventario_dc_delete on public.inventario_dc
  for delete to authenticated using (public.es_admin());

-- usuarios: cada quien ve su fila; el administrador ve y gestiona todas
create policy usuarios_select on public.usuarios
  for select to authenticated
  using (auth_id = auth.uid() or public.es_admin());

create policy usuarios_insert on public.usuarios
  for insert to authenticated with check (public.es_admin());

create policy usuarios_update on public.usuarios
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy usuarios_delete on public.usuarios
  for delete to authenticated using (public.es_admin());

-- Tablas sin uso actual (auditoria, bitacoras, configuracion, escalamiento, estado_equipos,
-- inventario, mantenimiento): quedan con RLS activo y sin politicas, es decir, cerradas.

commit;
