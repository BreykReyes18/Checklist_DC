import { create } from "zustand"

export const useCentroAlarmasStore = create((set) => ({
  alarmas: [],

  filtro: "Todas",

  setAlarmas: (alarmas) =>
    set({
      alarmas
    }),

  setFiltro: (filtro) =>
    set({
      filtro
    })
}))