-- Fase 1b: permisos de lectura por modulo.
-- Permite que un rol vea unos modulos y no otros. Redes ve inventario, categorias y alarmas, no bitacoras.

begin;

insert into public.permisos_catalogo (permiso, modulo, descripcion) values
  ('bitacoras.ver',  'Bitácora',         'Ver bitácoras'),
  ('alarmas.ver',    'Centro de Alarmas','Ver alarmas'),
  ('entregas.ver',   'Entrega de Turno', 'Ver entregas de turno'),
  ('inventario.ver', 'Inventario',       'Ver el inventario'),
  ('categorias.ver', 'Inventario',       'Ver categorías de equipo')
on conflict (permiso) do nothing;

insert into public.permisos_rol (rol, permiso) values
  ('Operador',   'bitacoras.ver'),
  ('Operador',   'alarmas.ver'),
  ('Operador',   'entregas.ver'),
  ('Operador',   'inventario.ver'),
  ('Operador',   'categorias.ver'),
  ('Supervisor', 'bitacoras.ver'),
  ('Supervisor', 'alarmas.ver'),
  ('Supervisor', 'entregas.ver'),
  ('Supervisor', 'inventario.ver'),
  ('Supervisor', 'categorias.ver'),
  ('Redes',      'alarmas.ver'),
  ('Redes',      'inventario.ver'),
  ('Redes',      'categorias.ver')
on conflict do nothing;

drop policy if exists bitacora_select on public.bitacora;
create policy bitacora_select on public.bitacora
  for select to authenticated using (public.tiene_permiso('bitacoras.ver'));

drop policy if exists centro_alarmas_select on public.centro_alarmas;
create policy centro_alarmas_select on public.centro_alarmas
  for select to authenticated using (public.tiene_permiso('alarmas.ver'));

drop policy if exists entrega_turno_select on public.entrega_turno;
create policy entrega_turno_select on public.entrega_turno
  for select to authenticated using (public.tiene_permiso('entregas.ver'));

drop policy if exists inventario_dc_select on public.inventario_dc;
create policy inventario_dc_select on public.inventario_dc
  for select to authenticated using (public.tiene_permiso('inventario.ver'));

commit;
