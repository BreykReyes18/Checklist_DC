import { supabase } from "./supabaseClient.js"

export const getCategorias = async () => {
  const { data, error } = await supabase
    .from("categorias_equipo")
    .select("id, nombre, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true })

  return { data, error }
}

export const crearCategoria = async (nombre) => {
  const { data, error } = await supabase
    .from("categorias_equipo")
    .insert([{ nombre: nombre.trim() }])
    .select()

  if (error?.code === "23505") {
    return { data: null, error: { message: "Ya existe una categoría con ese nombre" } }
  }
  return { data: data?.[0] ?? null, error }
}

export const renombrarCategoria = async (id, nombre) => {
  const { data, error } = await supabase
    .from("categorias_equipo")
    .update({ nombre: nombre.trim() })
    .eq("id", id)
    .select()

  if (error?.code === "23505") {
    return { data: null, error: { message: "Ya existe una categoría con ese nombre" } }
  }
  if (!error && (!data || data.length === 0)) {
    return { data: null, error: { message: "No tienes permiso para editar categorías" } }
  }
  return { data: data?.[0] ?? null, error }
}
