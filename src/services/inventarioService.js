import { supabase } from "./supabaseClient.js"

// ======================
// READ
// ======================
export const getInventario = async () => {
  const { data, error } = await supabase
    .from("inventario_dc")
    .select("*")
    .order("id", { ascending: false })

  return { data, error }
}

// ======================
// CREATE
// ======================
export const addInventario = async (equipo) => {
  const { data, error } = await supabase
    .from("inventario_dc")
    .insert([
      {
        nombre_equipo: equipo.nombre_equipo,
        categoria: equipo.categoria,
        marca: equipo.marca,
        modelo: equipo.modelo,
        ubicacion_rack: equipo.ubicacion_rack,
        estado: equipo.estado,
        observaciones: equipo.observaciones,
        fecha_registro: new Date()
      }
    ])
    .select()

  return { data, error }
}

// ======================
// UPDATE
// ======================
export const updateInventario = async (id, equipo) => {
  const { data, error } = await supabase
    .from("inventario_dc")
    .update({
      nombre_equipo: equipo.nombre_equipo,
      categoria: equipo.categoria,
      marca: equipo.marca,
      modelo: equipo.modelo,
      ubicacion_rack: equipo.ubicacion_rack,
      estado: equipo.estado,
      observaciones: equipo.observaciones
    })
    .eq("id", id)
    .select()

  return { data, error }
}

// ======================
// DELETE
// ======================
export const deleteInventario = async (id) => {
  const { data, error } = await supabase
    .from("inventario_dc")
    .delete()
    .eq("id", id)

  return { data, error }
}