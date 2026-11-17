# crear-usuario

Edge Function que crea usuarios de la app. Solo la puede ejecutar un Administrador.

## Despliegue (una sola vez)

Desde la carpeta del proyecto, con la CLI de Supabase:

    npx supabase login
    npx supabase link --project-ref <ID_DEL_PROYECTO>
    npx supabase functions deploy crear-usuario

El ID del proyecto es la parte inicial de la URL de Supabase (`https://<ID>.supabase.co`).
No hace falta configurar claves: Supabase le entrega `SUPABASE_URL`, `SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` automaticamente.

Despues se puede cerrar el registro publico en Authentication, Sign In / Providers,
desactivando "Allow new users to sign up".
