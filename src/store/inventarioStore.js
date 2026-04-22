import { create } from "zustand"

export const useInventarioStore = create((set) => ({
  equipos: [],
  equipoSeleccionado: null,

  setEquipos: (data) => set({ equipos: data }),

  agregarEquipoLocal: (nuevo) =>
    set((state) => ({
      equipos: [nuevo, ...state.equipos]
    })),

  eliminarEquipoLocal: (id) =>
    set((state) => ({
      equipos: state.equipos.filter(e => e.id !== id)
    })),

  setEquipoSeleccionado: (equipo) =>
    set({ equipoSeleccionado: equipo }),

  actualizarEquipoLocal: (id, data) =>
    set((state) => ({
      equipos: state.equipos.map(e =>
        e.id === id ? { ...e, ...data } : e
      )
    }))
}))