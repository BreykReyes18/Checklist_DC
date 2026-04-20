// services/bitacoraService.js

import { supabase } from "./supabaseClient"

export const guardarBitacora = async (data) => {
  return await supabase
    .from("bitacoras")
    .insert([data])
}

export const getBitacoras = async () => {
  return await supabase
    .from("bitacoras")
    .select("*")
    .order("id", { ascending: false })
}