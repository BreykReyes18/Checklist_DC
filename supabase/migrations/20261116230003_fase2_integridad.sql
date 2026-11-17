-- Fase 2: integridad de datos. Llaves foraneas, validaciones, indices y baja logica de equipos.
-- Si algun dato existente no cumple una regla, la transaccion completa se revierte sin cambios.

begin;

-- Baja logica y fecha de actualizacion en inventario
alter table public.inventario_dc add column if not exists activo boolean not null default true;
alter table public.inventario_dc add column if not exists updated_at timestamptz not null default now();

drop trigger if exists inventario_dc_updated_at on public.inventario_dc;
create trigger inventario_dc_updated_at
  before update on public.inventario_dc
  for each row execute function public.update_updated_at_column();

drop trigger if exists centro_alarmas_updated_at on public.centro_alarmas;
create trigger centro_alarmas_updated_at
  before update on public.centro_alarmas
  for each row execute function public.update_updated_at_column();

-- Alarmas que apuntan a equipos ya eliminados: se conserva la alarma y el nombre del equipo
update public.centro_alarmas a
set equipo_id = null
where a.equipo_id is not null
  and not exists (select 1 from public.inventario_dc i where i.id = a.equipo_id);

-- Llaves foraneas
alter table public.centro_alarmas
  add constraint centro_alarmas_equipo_id_fkey
  foreign key (equipo_id) references public.inventario_dc(id)
  on delete restrict;

alter table public.centro_alarmas
  add constraint centro_alarmas_bitacora_id_fkey
  foreign key (bitacora_id) references public.bitacora(id)
  on delete set null;

alter table public.usuarios
  add constraint usuarios_auth_id_fkey
  foreign key (auth_id) references auth.users(id)
  on delete cascade;

-- Validaciones de valores (el rol de usuarios ya lo valida la llave foranea a roles)
alter table public.centro_alarmas
  add constraint centro_alarmas_estado_chk
  check (estado in ('Activa', 'En monitoreo', 'Resuelta'));

alter table public.centro_alarmas
  add constraint centro_alarmas_severidad_chk
  check (severidad in ('Baja', 'Media', 'Crítica'));

alter table public.centro_alarmas
  add constraint centro_alarmas_estado_activa_chk
  check ((estado = 'Resuelta') = (activa is not true));

alter table public.inventario_dc
  add constraint inventario_dc_estado_chk
  check (estado in ('Activo', 'Mantenimiento', 'Inactivo')) not valid;

-- Una sola alarma abierta por equipo
create unique index centro_alarmas_una_abierta_por_equipo
  on public.centro_alarmas (equipo_id)
  where activa = true and equipo_id is not null;

-- Evita equipos activos duplicados por nombre
create unique index inventario_dc_nombre_activo_uidx
  on public.inventario_dc (lower(trim(nombre_equipo)))
  where activo;

-- Indices de consulta
create index centro_alarmas_estado_idx on public.centro_alarmas (estado);
create index centro_alarmas_fecha_inicio_idx on public.centro_alarmas (fecha_inicio desc);
create index inventario_dc_categoria_idx on public.inventario_dc (categoria);

commit;
