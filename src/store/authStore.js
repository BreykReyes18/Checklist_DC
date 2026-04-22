// src/store/authStore.js
// LOGIN REAL PROFESIONAL CON SUPABASE AUTH + ZUSTAND

import { create } from "zustand"
import { supabase } from "../services/supabaseClient.js"

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
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

    set({
      user: data.user,
      session: data.session
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
      session: null
    })
  },

  // =========================
  // RECUPERAR SESIÓN
  // =========================

  obtenerSesion: async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    set({
      session,
      user: session?.user || null,
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