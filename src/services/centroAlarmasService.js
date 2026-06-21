import { supabase } from "./supabaseClient"

// ======================
// READ
// ======================

export const getAlarmas = async () => {
  const { data, error } = await supabase
    .from("centro_alarmas")
    .select("*")
    .order("id", { ascending: false })

  return { data, error }
}

// ======================
// BUSCAR ALARMA ACTIVA
// ======================

export const getAlarmaActivaByEquipo = async (equipoId) => {
  const { data, error } = await supabase
    .from("centro_alarmas")
    .select("*")
    .eq("equipo_id", equipoId)
    .eq("activa", true)
    .limit(1)

  return { data, error }
}

// ======================
// CREATE
// ======================

export const addAlarma = async (alarma) => {
  const { data, error } = await supabase
    .from("centro_alarmas")
    .insert([alarma])
    .select()

  return { data, error }
}

// ======================
// UPDATE
// ======================

export const updateAlarma = async (id, alarma) => {
  const { data, error } = await supabase
    .from("centro_alarmas")
    .update({
      ...alarma,
      updated_at: new Date()
    })
    .eq("id", id)
    .select()

  return { data, error }
}

// ======================
// RESOLVER
// ======================

export const resolverAlarma = async (id) => {

  const { data: alarma } = await supabase
    .from("centro_alarmas")
    .select("*")
    .eq("id", id)
    .single()

  if (!alarma) {
    return {
      data: null,
      error: "Alarma no encontrada"
    }
  }

  const inicio = new Date(alarma.fecha_inicio)
  const fin = new Date()

  const duracionMinutos = Math.floor(
    (fin - inicio) / 60000
  )

  const { data, error } = await supabase
    .from("centro_alarmas")
    .update({
      estado: "Resuelta",
      activa: false,
      fecha_resolucion: fin,
      duracion_minutos: duracionMinutos,
      updated_at: fin
    })
    .eq("id", id)
    .select()

  return { data, error }
}

// ======================
// DELETE
// ======================

export const deleteAlarma = async (id) => {
  const { data, error } = await supabase
    .from("centro_alarmas")
    .delete()
    .eq("id", id)

  return { data, error }
}