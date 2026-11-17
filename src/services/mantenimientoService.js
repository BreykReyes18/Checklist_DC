import { supabase } from "./supabaseClient.js"

export const getPlanes = async () => {
  const { data, error } = await supabase
    .from("planes_mantenimiento")
    .select("*")
    .eq("activo", true)
    .order("proxima_fecha", { ascending: true, nullsFirst: false })

  return { data, error }
}

export const crearPlan = async (plan) => {
  const { data, error } = await supabase
    .from("planes_mantenimiento")
    .insert([plan])
    .select()

  if (error?.code === "23505") {
    return { data: null, error: { message: "Ya existe un plan con ese nombre" } }
  }
  return { data: data?.[0] ?? null, error }
}

export const actualizarPlan = async (id, cambios) => {
  const { data, error } = await supabase
    .from("planes_mantenimiento")
    .update(cambios)
    .eq("id", id)
    .select()

  if (!error && (!data || data.length === 0)) {
    return { data: null, error: { message: "No tienes permiso para modificar el plan" } }
  }
  return { data: data?.[0] ?? null, error }
}

export const getMantenimientos = async () => {
  const { data, error } = await supabase
    .from("mantenimiento")
    .select("*")
    .order("fecha", { ascending: false })
    .order("id", { ascending: false })

  return { data, error }
}

export const registrarMantenimiento = async (registro) => {
  const { data, error } = await supabase
    .from("mantenimiento")
    .insert([registro])
    .select()

  return { data: data?.[0] ?? null, error }
}

export const enviarAvisoPrueba = async (planId) => {
  const { data, error } = await supabase.functions.invoke(
    "avisos-mantenimiento",
    { body: { prueba: true, plan_id: planId } }
  )

  if (error) {
    let mensaje = error.message
    try {
      const detalle = await error.context.json()
      if (detalle?.error) mensaje = detalle.error
    } catch {
      // se conserva el mensaje original
    }
    throw new Error(mensaje)
  }
  return data
}

// Dias que faltan para la fecha (negativo si ya paso)
export const diasPara = (fechaIso) => {
  if (!fechaIso) return null
  const [y, m, d] = fechaIso.split("-").map(Number)
  const objetivo = new Date(y, m - 1, d)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.round((objetivo - hoy) / 86400000)
}

export const planEnAviso = (plan) => {
  const dias = diasPara(plan.proxima_fecha)
  return dias !== null && dias <= plan.dias_aviso
}
