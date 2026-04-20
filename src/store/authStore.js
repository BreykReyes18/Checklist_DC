import { create } from "zustand"

export const useAuthStore = create((set) => ({
  usuario: JSON.parse(localStorage.getItem("usuario")) || null,

  login: (data) => {
    localStorage.setItem("usuario", JSON.stringify(data))

    set({
      usuario: data
    })
  },

  logout: () => {
    localStorage.removeItem("usuario")

    set({
      usuario: null
    })
  },

  // Helper opcional para validación de roles
  hasRole: (role) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"))
    return usuario?.rol === role
  }
}))