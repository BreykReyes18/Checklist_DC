-- Fija el search_path de la funcion de fecha de actualizacion (aviso de seguridad de Supabase)
alter function public.update_updated_at_column() set search_path = public;
