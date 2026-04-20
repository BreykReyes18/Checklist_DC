// store/inventarioStore.js

import { create } from "zustand"

export const useInventarioStore = create((set) => ({
  equipos: [],

  setEquipos: (data) =>
    set({
      equipos: data
    }),

  agregarEquipo: (nuevo) =>
    set((state) => ({
      equipos: [...state.equipos, nuevo]
    })),

  eliminarEquipoLocal: (id) =>
    set((state) => ({
      equipos: state.equipos.filter(
        (item) => item.id !== id
      )
    }))
}))