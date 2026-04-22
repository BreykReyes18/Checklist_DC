import { supabase } from "./supabaseClient"

export const crearUsuario = async ({
  email,
  password,
  nombre,
  usuario,
  rol,
  area
}) => {
  // Crear en Auth
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password
    })

  if (error) {
    alert(error.message)
    return null
  }

  // Guardar en tabla usuarios
  const authId = data.user.id

  const { error: profileError } =
    await supabase
      .from("usuarios")
      .insert([
        {
          auth_id: authId,
          nombre,
          usuario,
          correo: email,
          rol,
          area,
          activo: true
        }
      ])

  if (profileError) {
    alert(profileError.message)
    return null
  }

  alert("Usuario creado correctamente")
  return true
}