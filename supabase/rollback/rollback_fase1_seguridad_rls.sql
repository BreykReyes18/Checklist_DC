-- Revierte la fase 1 y deja las tablas como estaban antes (RLS apagado salvo en bitacora).

begin;

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
drop policy if exists "Usuarios ven sus bitacoras" on public.bitacora;
drop policy if exists "Usuarios insertan su bitacora" on public.bitacora;
drop policy if exists "Usuarios actualizan su bitacora" on public.bitacora;
drop policy if exists "Usuarios eliminan su bitacora" on public.bitacora;
drop policy if exists bitacoras_delete_policy on public.bitacoras;

create policy "Usuarios ven sus bitacoras" on public.bitacora
  for select to authenticated using (auth.uid() = user_id);
create policy "Usuarios insertan su bitacora" on public.bitacora
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Usuarios actualizan su bitacora" on public.bitacora
  for update to authenticated using (auth.uid() = user_id);
create policy "Usuarios eliminan su bitacora" on public.bitacora
  for delete to authenticated using (auth.uid() = user_id);
create policy bitacoras_delete_policy on public.bitacoras
  for delete to authenticated using (true);

alter table public.usuarios drop constraint if exists usuarios_rol_fkey;

drop table if exists public.permisos_rol;
drop table if exists public.permisos_catalogo;
drop table if exists public.roles;

drop function if exists public.mis_permisos();
drop function if exists public.tiene_permiso(text);
drop function if exists public.es_admin();
drop function if exists public.es_usuario_activo();

alter table public.auditoria      disable row level security;
alter table public.bitacoras      disable row level security;
alter table public.centro_alarmas disable row level security;
alter table public.configuracion  disable row level security;
alter table public.entrega_turno  disable row level security;
alter table public.escalamiento   disable row level security;
alter table public.estado_equipos disable row level security;
alter table public.inventario     disable row level security;
alter table public.inventario_dc  disable row level security;
alter table public.mantenimiento  disable row level security;
alter table public.usuarios       disable row level security;

grant all on public.auditoria, public.bitacora, public.bitacoras, public.centro_alarmas,
  public.configuracion, public.entrega_turno, public.escalamiento, public.estado_equipos,
  public.inventario, public.inventario_dc, public.mantenimiento, public.usuarios
to anon;

commit;
