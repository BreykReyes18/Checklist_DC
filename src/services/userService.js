import { supabase } from "./supabaseClient"

export const getUsuarios = async () => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, auth_id, nombre, usuario, correo, rol, area, activo")
    .order("nombre", { ascending: true })

  if (error) throw error
  return data || []
}

export const getRoles = async () => {
  const { data, error } = await supabase
    .from("roles")
    .select("nombre, descripcion")
    .order("nombre", { ascending: true })

  if (error) throw error
  return data || []
}

export const actualizarUsuario = async (id, cambios) => {
  const { data, error } = await supabase
    .from("usuarios")
    .update(cambios)
    .eq("id", id)
    .select()

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error("No se pudo actualizar el usuario (sin permisos)")
  }
  return data[0]
}

// La creacion pasa por una Edge Function que valida que quien llama es admin
export const crearUsuario = async (datos) => {
  const { data, error } = await supabase.functions.invoke(
    "crear-usuario",
    { body: datos }
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

  if (data?.error) throw new Error(data.error)
  return true
}
