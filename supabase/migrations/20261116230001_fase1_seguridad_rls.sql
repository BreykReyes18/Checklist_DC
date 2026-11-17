-- Fase 1: seguridad. Activa RLS en todas las tablas y crea roles y permisos administrables.
-- Solo el administrador puede ver y modificar roles y permisos. El script es repetible.

begin;

-- ---------------------------------------------------------------------------
-- Roles y permisos
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  nombre      text primary key,
  descripcion text,
  es_sistema  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.permisos_catalogo (
  permiso     text primary key,
  modulo      text not null,
  descripcion text not null
);

create table if not exists public.permisos_rol (
  rol     text not null references public.roles(nombre) on update cascade on delete cascade,
  permiso text not null references public.permisos_catalogo(permiso) on update cascade on delete cascade,
  primary key (rol, permiso)
);

insert into public.roles (nombre, descripcion, es_sistema) values
  ('Administrador', 'Acceso total. No se puede eliminar.', true),
  ('Operador',      'Operadores del Data Center.',         false),
  ('Supervisor',    'Supervisión de operaciones.',         false),
  ('Redes',         'Equipo de redes.',                    false)
on conflict (nombre) do nothing;

insert into public.permisos_catalogo (permiso, modulo, descripcion) values
  ('bitacoras.crear',         'Bitácora',        'Crear bitácoras y editar o eliminar las propias'),
  ('bitacoras.editar_ajenas', 'Bitácora',        'Editar bitácoras de otros usuarios'),
  ('bitacoras.eliminar_ajenas','Bitácora',       'Eliminar bitácoras de otros usuarios'),
  ('alarmas.gestionar',       'Centro de Alarmas','Crear, actualizar y resolver alarmas'),
  ('alarmas.eliminar',        'Centro de Alarmas','Eliminar alarmas'),
  ('entregas.gestionar',      'Entrega de Turno','Registrar y editar entregas de turno'),
  ('entregas.eliminar',       'Entrega de Turno','Eliminar entregas de turno'),
  ('inventario.crear',        'Inventario',      'Agregar equipos al inventario'),
  ('inventario.editar',       'Inventario',      'Editar equipos y darlos de baja'),
  ('inventario.eliminar',     'Inventario',      'Eliminar equipos definitivamente'),
  ('categorias.crear',        'Inventario',      'Crear categorías de equipo'),
  ('categorias.editar',       'Inventario',      'Editar categorías de equipo'),
  ('categorias.eliminar',     'Inventario',      'Eliminar categorías de equipo')
on conflict (permiso) do nothing;

insert into public.permisos_rol (rol, permiso) values
  ('Operador',   'bitacoras.crear'),
  ('Operador',   'alarmas.gestionar'),
  ('Operador',   'entregas.gestionar'),
  ('Operador',   'inventario.crear'),
  ('Operador',   'inventario.editar'),
  ('Operador',   'categorias.crear'),
  ('Supervisor', 'bitacoras.crear'),
  ('Supervisor', 'bitacoras.editar_ajenas'),
  ('Supervisor', 'alarmas.gestionar'),
  ('Supervisor', 'entregas.gestionar'),
  ('Supervisor', 'inventario.crear'),
  ('Supervisor', 'inventario.editar'),
  ('Supervisor', 'categorias.crear'),
  ('Supervisor', 'categorias.editar'),
  ('Redes',      'inventario.crear'),
  ('Redes',      'inventario.editar'),
  ('Redes',      'categorias.crear')
on conflict do nothing;

alter table public.usuarios drop constraint if exists usuarios_rol_fkey;
alter table public.usuarios
  add constraint usuarios_rol_fkey
  foreign key (rol) references public.roles(nombre) on update cascade;

-- ---------------------------------------------------------------------------
-- Funciones auxiliares (security definer para evitar recursion al leer usuarios)
-- ---------------------------------------------------------------------------
create or replace function public.es_usuario_activo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios u
    where u.auth_id = auth.uid() and coalesce(u.activo, true)
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
    select 1 from public.usuarios u
    where u.auth_id = auth.uid() and coalesce(u.activo, true) and u.rol = 'Administrador'
  )
$$;

create or replace function public.tiene_permiso(p_permiso text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.es_admin()
    or exists (
      select 1
      from public.usuarios u
      join public.permisos_rol pr on pr.rol = u.rol
      where u.auth_id = auth.uid()
        and coalesce(u.activo, true)
        and pr.permiso = p_permiso
    )
$$;

-- Permisos del usuario actual, para que la app muestre u oculte opciones
create or replace function public.mis_permisos()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.es_admin() then
      coalesce(array(select pc.permiso from public.permisos_catalogo pc), '{}')
    else
      coalesce(array(
        select pr.permiso
        from public.usuarios u
        join public.permisos_rol pr on pr.rol = u.rol
        where u.auth_id = auth.uid() and coalesce(u.activo, true)
      ), '{}')
  end
$$;

revoke all on function public.es_usuario_activo() from public, anon;
revoke all on function public.es_admin() from public, anon;
revoke all on function public.tiene_permiso(text) from public, anon;
revoke all on function public.mis_permisos() from public, anon;
grant execute on function public.es_usuario_activo() to authenticated;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.tiene_permiso(text) to authenticated;
grant execute on function public.mis_permisos() to authenticated;

-- ---------------------------------------------------------------------------
-- Activar RLS y cerrar el rol anonimo
-- ---------------------------------------------------------------------------
alter table public.auditoria         enable row level security;
alter table public.bitacora          enable row level security;
alter table public.bitacoras         enable row level security;
alter table public.centro_alarmas    enable row level security;
alter table public.configuracion     enable row level security;
alter table public.entrega_turno     enable row level security;
alter table public.escalamiento      enable row level security;
alter table public.estado_equipos    enable row level security;
alter table public.inventario        enable row level security;
alter table public.inventario_dc     enable row level security;
alter table public.mantenimiento     enable row level security;
alter table public.usuarios          enable row level security;
alter table public.roles             enable row level security;
alter table public.permisos_catalogo enable row level security;
alter table public.permisos_rol      enable row level security;

revoke all on public.auditoria, public.bitacora, public.bitacoras, public.centro_alarmas,
  public.configuracion, public.entrega_turno, public.escalamiento, public.estado_equipos,
  public.inventario, public.inventario_dc, public.mantenimiento, public.usuarios,
  public.roles, public.permisos_catalogo, public.permisos_rol
from anon;

-- ---------------------------------------------------------------------------
-- Politicas
-- ---------------------------------------------------------------------------
drop policy if exists "Usuarios actualizan su bitacora" on public.bitacora;
drop policy if exists "Usuarios eliminan su bitacora"   on public.bitacora;
drop policy if exists "Usuarios insertan su bitacora"   on public.bitacora;
drop policy if exists "Usuarios ven sus bitacoras"      on public.bitacora;
drop policy if exists bitacoras_delete_policy           on public.bitacoras;

drop policy if exists bitacora_select on public.bitacora;
drop policy if exists bitacora_insert on public.bitacora;
drop policy if exists bitacora_update on public.bitacora;
drop policy if exists bitacora_delete on public.bitacora;
drop policy if exists centro_alarmas_select on public.centro_alarmas;
drop policy if exists centro_alarmas_insert on public.centro_alarmas;
drop policy if exists centro_alarmas_update on public.centro_alarmas;
drop policy if exists centro_alarmas_delete on public.centro_alarmas;
drop policy if exists entrega_turno_select on public.entrega_turno;
drop policy if exists entrega_turno_insert on public.entrega_turno;
drop policy if exists entrega_turno_update on public.entrega_turno;
drop policy if exists entrega_turno_delete on public.entrega_turno;
drop policy if exists inventario_dc_select on public.inventario_dc;
drop policy if exists inventario_dc_insert on public.inventario_dc;
drop policy if exists inventario_dc_update on public.inventario_dc;
drop policy if exists inventario_dc_delete on public.inventario_dc;
drop policy if exists usuarios_select on public.usuarios;
drop policy if exists usuarios_insert on public.usuarios;
drop policy if exists usuarios_update on public.usuarios;
drop policy if exists usuarios_delete on public.usuarios;
drop policy if exists roles_select on public.roles;
drop policy if exists roles_insert on public.roles;
drop policy if exists roles_update on public.roles;
drop policy if exists roles_delete on public.roles;
drop policy if exists permisos_catalogo_admin on public.permisos_catalogo;
drop policy if exists permisos_rol_admin on public.permisos_rol;

-- bitacora: todos los usuarios activos la ven (los operadores trabajan juntos)
create policy bitacora_select on public.bitacora
  for select to authenticated
  using (public.es_usuario_activo());

create policy bitacora_insert on public.bitacora
  for insert to authenticated
  with check (public.tiene_permiso('bitacoras.crear') and user_id = auth.uid());

create policy bitacora_update on public.bitacora
  for update to authenticated
  using ((user_id = auth.uid() and public.tiene_permiso('bitacoras.crear'))
         or public.tiene_permiso('bitacoras.editar_ajenas'))
  with check ((user_id = auth.uid() and public.tiene_permiso('bitacoras.crear'))
         or public.tiene_permiso('bitacoras.editar_ajenas'));

create policy bitacora_delete on public.bitacora
  for delete to authenticated
  using ((user_id = auth.uid() and public.tiene_permiso('bitacoras.crear'))
         or public.tiene_permiso('bitacoras.eliminar_ajenas'));

-- centro_alarmas
create policy centro_alarmas_select on public.centro_alarmas
  for select to authenticated using (public.es_usuario_activo());

create policy centro_alarmas_insert on public.centro_alarmas
  for insert to authenticated with check (public.tiene_permiso('alarmas.gestionar'));

create policy centro_alarmas_update on public.centro_alarmas
  for update to authenticated
  using (public.tiene_permiso('alarmas.gestionar'))
  with check (public.tiene_permiso('alarmas.gestionar'));

create policy centro_alarmas_delete on public.centro_alarmas
  for delete to authenticated using (public.tiene_permiso('alarmas.eliminar'));

-- entrega_turno
create policy entrega_turno_select on public.entrega_turno
  for select to authenticated using (public.es_usuario_activo());

create policy entrega_turno_insert on public.entrega_turno
  for insert to authenticated with check (public.tiene_permiso('entregas.gestionar'));

create policy entrega_turno_update on public.entrega_turno
  for update to authenticated
  using (public.tiene_permiso('entregas.gestionar'))
  with check (public.tiene_permiso('entregas.gestionar'));

create policy entrega_turno_delete on public.entrega_turno
  for delete to authenticated using (public.tiene_permiso('entregas.eliminar'));

-- inventario_dc
create policy inventario_dc_select on public.inventario_dc
  for select to authenticated using (public.es_usuario_activo());

create policy inventario_dc_insert on public.inventario_dc
  for insert to authenticated with check (public.tiene_permiso('inventario.crear'));

create policy inventario_dc_update on public.inventario_dc
  for update to authenticated
  using (public.tiene_permiso('inventario.editar'))
  with check (public.tiene_permiso('inventario.editar'));

create policy inventario_dc_delete on public.inventario_dc
  for delete to authenticated using (public.tiene_permiso('inventario.eliminar'));

-- usuarios: cada quien ve su fila; solo el administrador gestiona usuarios
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

-- roles y permisos: solo el administrador los ve y modifica
create policy roles_select on public.roles
  for select to authenticated using (public.es_admin());

create policy roles_insert on public.roles
  for insert to authenticated with check (public.es_admin());

create policy roles_update on public.roles
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy roles_delete on public.roles
  for delete to authenticated using (public.es_admin() and not es_sistema);

create policy permisos_catalogo_admin on public.permisos_catalogo
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy permisos_rol_admin on public.permisos_rol
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Tablas sin uso actual (auditoria, bitacoras, configuracion, escalamiento, estado_equipos,
-- inventario, mantenimiento): quedan con RLS activo y sin politicas, es decir, cerradas.

commit;
