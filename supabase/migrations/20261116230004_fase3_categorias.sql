-- Fase 3: categorias de equipo administradas desde la app.
-- Se conserva inventario_dc.categoria (texto) sincronizada para no romper la Bitacora ni el PDF.

begin;

create table public.categorias_equipo (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  orden      integer not null default 0,
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index categorias_equipo_nombre_uidx
  on public.categorias_equipo (lower(trim(nombre)));

insert into public.categorias_equipo (nombre)
select distinct trim(categoria)
from public.inventario_dc
where nullif(trim(categoria), '') is not null
on conflict do nothing;

alter table public.inventario_dc
  add column if not exists categoria_id bigint
  references public.categorias_equipo(id) on update cascade on delete restrict;

update public.inventario_dc i
set categoria_id = c.id
from public.categorias_equipo c
where lower(trim(i.categoria)) = lower(trim(c.nombre));

create index inventario_dc_categoria_id_idx on public.inventario_dc (categoria_id);

-- Mantiene el texto de categoria alineado con la tabla de categorias
create or replace function public.sincronizar_categoria_texto()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.categoria_id is not null then
    select c.nombre into new.categoria
    from public.categorias_equipo c
    where c.id = new.categoria_id;
  end if;
  return new;
end;
$$;

create trigger inventario_dc_sincronizar_categoria
  before insert or update of categoria_id on public.inventario_dc
  for each row execute function public.sincronizar_categoria_texto();

-- Al renombrar una categoria se actualiza el texto en los equipos
create or replace function public.propagar_nombre_categoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.inventario_dc
  set categoria = new.nombre
  where categoria_id = new.id;
  return new;
end;
$$;

create trigger categorias_equipo_propagar_nombre
  after update of nombre on public.categorias_equipo
  for each row execute function public.propagar_nombre_categoria();

revoke all on function public.sincronizar_categoria_texto() from public, anon, authenticated;
revoke all on function public.propagar_nombre_categoria() from public, anon, authenticated;

-- Seguridad de la nueva tabla
alter table public.categorias_equipo enable row level security;
revoke all on public.categorias_equipo from anon;

drop policy if exists categorias_equipo_select on public.categorias_equipo;
drop policy if exists categorias_equipo_insert on public.categorias_equipo;
drop policy if exists categorias_equipo_update on public.categorias_equipo;
drop policy if exists categorias_equipo_delete on public.categorias_equipo;

create policy categorias_equipo_select on public.categorias_equipo
  for select to authenticated using (public.tiene_permiso('categorias.ver'));

create policy categorias_equipo_insert on public.categorias_equipo
  for insert to authenticated with check (public.tiene_permiso('categorias.crear'));

create policy categorias_equipo_update on public.categorias_equipo
  for update to authenticated
  using (public.tiene_permiso('categorias.editar'))
  with check (public.tiene_permiso('categorias.editar'));

create policy categorias_equipo_delete on public.categorias_equipo
  for delete to authenticated using (public.tiene_permiso('categorias.eliminar'));

commit;
