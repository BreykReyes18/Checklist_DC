// store/bitacoraStore.js

import { create } from "zustand"

export const useBitacoraStore = create((set) => ({
  bitacora: {
    fecha: "",
    responsable: "",
    temperatura: "",
    energia: "",
    observacion: "",

    ups_revisada: false,
    apc_revisado: false,
    switch_core: false,
    alarmas: false,
    ibm_revisado: false,
    energia_comercial: false,
    planta_electrica: false
  },

  actualizarCampo: (campo, valor) =>
    set((state) => ({
      bitacora: {
        ...state.bitacora,
        [campo]: valor
      }
    })),

  resetBitacora: () =>
    set({
      bitacora: {
        fecha: "",
        responsable: "",
        temperatura: "",
        energia: "",
        observacion: "",

        ups_revisada: false,
        apc_revisado: false,
        switch_core: false,
        alarmas: false,
        ibm_revisado: false,
        energia_comercial: false,
        planta_electrica: false
      }
    })
}))