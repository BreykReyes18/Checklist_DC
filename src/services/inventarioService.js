import { supabase } from "./supabaseClient.js"

const CAMPOS = (equipo) => ({
  nombre_equipo: equipo.nombre_equipo,
  categoria_id: equipo.categoria_id ?? null,
  marca: equipo.marca,
  modelo: equipo.modelo,
  ubicacion_rack: equipo.ubicacion_rack,
  estado: equipo.estado,
  observaciones: equipo.observaciones
})

// Por defecto solo equipos vigentes; los dados de baja se usan para el historial
export const getInventario = async ({ incluirBajas = false } = {}) => {
  let consulta = supabase
    .from("inventario_dc")
    .select("*")
    .order("id", { ascending: false })

  if (!incluirBajas) consulta = consulta.eq("activo", true)

  const { data, error } = await consulta
  return { data, error }
}

export const addInventario = async (equipo) => {
  const { data, error } = await supabase
    .from("inventario_dc")
    .insert([{ ...CAMPOS(equipo), fecha_registro: new Date() }])
    .select()

  return { data, error }
}

export const updateInventario = async (id, equipo) => {
  const { data, error } = await supabase
    .from("inventario_dc")
    .update(CAMPOS(equipo))
    .eq("id", id)
    .select()

  return { data, error }
}

// Baja logica: el equipo deja de aparecer pero conserva su historial de alarmas y bitacoras
export const deleteInventario = async (id) => {
  const { data, error } = await supabase
    .from("inventario_dc")
    .update({ activo: false })
    .eq("id", id)
    .select()

  if (!error && (!data || data.length === 0)) {
    return { data, error: { message: "No tienes permiso para dar de baja este equipo" } }
  }
  return { data, error }
}
