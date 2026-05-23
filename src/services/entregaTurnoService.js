import { supabase } from "./supabaseClient"

// =========================
// CREAR ENTREGA
// =========================
export const guardarEntregaTurno = async (data) => {
  return await supabase
    .from("entrega_turno")
    .insert([data])
    .select()
}

// =========================
// OBTENER ENTREGAS
// =========================
export const getEntregasTurno = async () => {
  return await supabase
    .from("entrega_turno")
    .select("*")
    .order("id", { ascending: false })
}

// =========================
// OBTENER POR ID
// =========================
export const getEntregaTurnoById = async (id) => {
  return await supabase
    .from("entrega_turno")
    .select("*")
    .eq("id", id)
    .single()
}

// =========================
// ACTUALIZAR
// =========================
export const actualizarEntregaTurno = async (id, data) => {
  return await supabase
    .from("entrega_turno")
    .update(data)
    .eq("id", id)
    .select()
}

// =========================
// ELIMINAR
// =========================
export const eliminarEntregaTurno = async (id) => {
  return await supabase
    .from("entrega_turno")
    .delete()
    .eq("id", id)
}