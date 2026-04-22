import { supabase } from "./supabaseClient"

// CREATE
export const guardarBitacora = async (data) => {
  return await supabase
    .from("bitacora")
    .insert([data])
    .select()
}

// READ
export const getBitacoras = async () => {
  return await supabase
    .from("bitacora")
    .select("*")
    .order("id", { ascending: false })
}

// READ BY ID
export const getBitacoraById = async (id) => {
  return await supabase
    .from("bitacora")
    .select("*")
    .eq("id", id)
    .single()
}

// UPDATE
export const actualizarBitacora = async (id, data) => {
  return await supabase
    .from("bitacora")
    .update(data)
    .eq("id", id)
    .select()
}

// DELETE
export const eliminarBitacora = async (id) => {
  return await supabase
    .from("bitacora")
    .delete()
    .eq("id", id)
}