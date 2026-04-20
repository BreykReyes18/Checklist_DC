import { supabase } from "./supabaseClient.js";

 

export const getInventario = async () => {

  return await supabase

    .from('inventario_dc')

    .select('*')

    .order('id', { ascending: false })

}

 

export const addInventario = async (data) => {

  return await supabase

    .from('inventario_dc')

    .insert([data])

}

 

export const deleteInventario = async (id) => {

  return await supabase

    .from('inventario_dc')

    .delete()

    .eq('id', id)

}