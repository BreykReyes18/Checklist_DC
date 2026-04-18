import { supabase } from "../supabaseClient"

// GUARDAR
export const guardarBitacora = async (data) => {
  const { error } = await supabase
    .from("bitacora") 
    .insert([data])

  if (error) {
    console.error(error)
    alert("Error guardando bitácora")
  }
}

// LISTAR
export const getBitacora = async () => {
  return await supabase
    .from("bitacora") 
    .select("*")
    .order("created_at", { ascending: false })
}