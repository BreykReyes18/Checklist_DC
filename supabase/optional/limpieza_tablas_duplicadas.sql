-- Opcional: elimina dos tablas vacias que duplican a bitacora e inventario_dc y que ningun codigo usa.
-- Ejecutar solo si se confirma que siguen vacias.

begin;
drop table if exists public.bitacoras;
drop table if exists public.inventario;
commit;
