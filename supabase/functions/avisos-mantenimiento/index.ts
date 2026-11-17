// Edge Function: avisos-mantenimiento
// Envia un correo cuando un plan de mantenimiento esta dentro de sus dias de aviso.
// La ejecuta pg_cron una vez al dia (cabecera x-cron-secret) o un usuario con
// permiso mantenimiento.gestionar para enviar una prueba ({ prueba: true, plan_id }).
// El correo se envia con Resend; requiere el secreto RESEND_API_KEY.

import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  })

type Plan = {
  id: number
  nombre: string
  proveedor: string | null
  ultima_fecha: string | null
  proxima_fecha: string | null
  dias_aviso: number
  correos_aviso: string[]
  ultimo_aviso_para: string | null
}

const fechaLarga = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-NI", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  })
}

const hoyNicaragua = () => {
  const ahora = new Date(Date.now() - 6 * 3600 * 1000)
  return ahora.toISOString().slice(0, 10)
}

const diasEntre = (desde: string, hasta: string) =>
  Math.round((Date.parse(hasta) - Date.parse(desde)) / 86400000)

const armarCorreo = (plan: Plan, dias: number) => {
  const cuando =
    dias > 1 ? `en ${dias} días` : dias === 1 ? "mañana" : dias === 0 ? "hoy" : `hace ${-dias} días (vencido)`
  const asunto = `Mantenimiento ${plan.nombre} ${dias >= 0 ? "próximo" : "vencido"}: ${fechaLarga(plan.proxima_fecha!)}`
  const html = `
  <div style="font-family:Arial,sans-serif;color:#111827;max-width:560px">
    <h2 style="color:#1E3A8A;margin:0 0 4px">Data Center · Casa Pellas</h2>
    <div style="height:3px;width:56px;background:#D62B2B;margin-bottom:16px"></div>
    <p>El mantenimiento de <b>${plan.nombre}</b> está programado <b>${cuando}</b>.</p>
    <table style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0;color:#4B5563">Fecha programada</td><td><b>${fechaLarga(plan.proxima_fecha!)}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#4B5563">Proveedor</td><td>${plan.proveedor ?? "-"}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#4B5563">Último mantenimiento</td><td>${plan.ultima_fecha ? fechaLarga(plan.ultima_fecha) : "-"}</td></tr>
    </table>
    <p style="margin-top:16px">Coordina la visita con el proveedor y registra el mantenimiento en el sistema cuando se realice.</p>
  </div>`
  return { asunto, html }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return responder({ error: "Metodo no permitido" }, 405)

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  let body: { prueba?: boolean; plan_id?: number } = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  // Autorizacion: cron con secreto, o usuario con permiso de gestion
  const secreto = req.headers.get("x-cron-secret")
  let esCron = false
  if (secreto) {
    const { data: ok } = await admin.rpc("validar_secreto_avisos", { p_secreto: secreto })
    if (ok !== true) return responder({ error: "Secreto invalido" }, 401)
    esCron = true
  } else {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "")
    const { data: quien } = await admin.auth.getUser(token)
    if (!quien?.user) return responder({ error: "Sin sesion" }, 401)
    const { data: puede } = await admin.rpc("usuario_tiene_permiso", {
      p_auth_id: quien.user.id,
      p_permiso: "mantenimiento.gestionar"
    })
    if (puede !== true) return responder({ error: "Sin permiso" }, 403)
  }

  const apiKey = Deno.env.get("RESEND_API_KEY")
  if (!apiKey) {
    return responder({ error: "Falta configurar el servicio de correo (RESEND_API_KEY)" }, 500)
  }
  const remitente = Deno.env.get("AVISOS_REMITENTE") ?? "Data Center <onboarding@resend.dev>"

  let consulta = admin
    .from("planes_mantenimiento")
    .select("id, nombre, proveedor, ultima_fecha, proxima_fecha, dias_aviso, correos_aviso, ultimo_aviso_para")
    .eq("activo", true)
  if (!esCron && body.plan_id) consulta = consulta.eq("id", body.plan_id)

  const { data: planes, error } = await consulta
  if (error) return responder({ error: error.message }, 500)

  const hoy = hoyNicaragua()
  const resultados: unknown[] = []

  for (const plan of (planes ?? []) as Plan[]) {
    if (!plan.proxima_fecha || plan.correos_aviso.length === 0) continue

    const dias = diasEntre(hoy, plan.proxima_fecha)
    const enVentana = dias <= plan.dias_aviso
    const yaAvisado = plan.ultimo_aviso_para === plan.proxima_fecha
    const enviar = body.prueba ? true : enVentana && !yaAvisado
    if (!enviar) continue

    const { asunto, html } = armarCorreo(plan, dias)
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: remitente,
        to: plan.correos_aviso,
        subject: body.prueba ? `[Prueba] ${asunto}` : asunto,
        html
      })
    })
    const detalle = await r.json().catch(() => ({}))

    if (r.ok && !body.prueba) {
      await admin
        .from("planes_mantenimiento")
        .update({ ultimo_aviso_para: plan.proxima_fecha })
        .eq("id", plan.id)
    }
    resultados.push({ plan: plan.nombre, enviado: r.ok, detalle })
  }

  return responder({ ok: true, hoy, resultados })
})
