// Edge Function: crear-usuario
// Crea la cuenta en Supabase Auth y su fila en public.usuarios.
// Solo puede ejecutarla un Administrador. La clave service_role vive aqui,
// en el servidor de Supabase, y nunca llega al navegador.

import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return responder({ error: "Metodo no permitido" }, 405)

  const url = Deno.env.get("SUPABASE_URL")!
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

  // 1. Verificar que quien llama es administrador (con su propio token)
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return responder({ error: "Sin sesion" }, 401)

  const comoUsuario = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } }
  })

  const { data: esAdmin, error: errAdmin } = await comoUsuario.rpc("es_admin")
  if (errAdmin || esAdmin !== true) {
    return responder({ error: "Solo el administrador puede crear usuarios" }, 403)
  }

  // 2. Validar datos
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return responder({ error: "Cuerpo invalido" }, 400)
  }

  const { email, password, nombre, usuario, rol, area } = body
  if (!email || !password || !nombre || !usuario || !rol) {
    return responder({ error: "Faltan campos obligatorios" }, 400)
  }
  if (password.length < 8) {
    return responder({ error: "La contrasena debe tener al menos 8 caracteres" }, 400)
  }

  // 3. Crear con privilegios de servicio
  const admin = createClient(url, serviceKey)

  const { data: creado, error: errCrear } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  if (errCrear || !creado.user) {
    return responder({ error: errCrear?.message ?? "No se pudo crear la cuenta" }, 400)
  }

  const { error: errPerfil } = await admin.from("usuarios").insert({
    auth_id: creado.user.id,
    nombre,
    usuario,
    correo: email,
    rol,
    area: area ?? null,
    activo: true
  })

  if (errPerfil) {
    // Evita dejar una cuenta de Auth sin perfil
    await admin.auth.admin.deleteUser(creado.user.id)
    return responder({ error: errPerfil.message }, 400)
  }

  return responder({ ok: true, auth_id: creado.user.id })
})
