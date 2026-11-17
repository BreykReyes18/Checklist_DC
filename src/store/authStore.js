// src/store/authStore.js
// LOGIN REAL PROFESIONAL CON SUPABASE AUTH + ZUSTAND

import { create } from "zustand"
import { supabase } from "../services/supabaseClient.js"

const cargarPerfil = async (user) => {
  if (!user) return { perfil: null, esAdmin: false }

  const { data } = await supabase
    .from("usuarios")
    .select("id, auth_id, nombre, usuario, correo, rol, area, activo")
    .eq("auth_id", user.id)
    .maybeSingle()

  return {
    perfil: data || null,
    esAdmin: data?.rol === "Administrador"
  }
}

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  perfil: null,
  esAdmin: false,
  loading: true,

  // =========================
  // LOGIN
  // =========================

  login: async (email, password) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    if (error) {
      alert(error.message)
      return false
    }

    const extra = await cargarPerfil(data.user)

    set({
      user: data.user,
      session: data.session,
      ...extra
    })

    return true
  },

  // =========================
  // LOGOUT
  // =========================

  logout: async () => {
    await supabase.auth.signOut()

    set({
      user: null,
      session: null,
      perfil: null,
      esAdmin: false
    })
  },

  // =========================
  // RECUPERAR SESIÓN
  // =========================

  obtenerSesion: async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    const extra = await cargarPerfil(session?.user)

    set({
      session,
      user: session?.user || null,
      ...extra,
      loading: false
    })
  },

  // =========================
  // RESET PASSWORD
  // =========================

  resetPassword: async (email) => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      alert(error.message)
      return
    }

    alert("Correo de recuperación enviado")
  }
}))