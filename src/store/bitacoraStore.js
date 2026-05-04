import { create } from "zustand"

const initialState = {
  fecha: "",
  responsable: null,
  temperatura: null,
  energia: "",
  observacion: "",

  ups_revisada: false,
  apc_revisado: false,
  switch_core: false,
  alarmas: false,
  ibm_revisado: false,
  energia_comercial: false,
  planta_electrica: false,
  generador: false,

  red_wan_lan: false,
  aire_acondicionado: false,
  humedad_ok: false,
  control_acceso: false,
  sensores_humo: false,
  extintores: false,
  puertas_seguridad: false,
  panel_incendios: false,

  checklist_completo: false
}

export const useBitacoraStore = create((set) => ({
  bitacora: initialState,
  editandoId: null,

  actualizarCampo: (campo, valor) =>
    set((state) => ({
      bitacora: {
        ...state.bitacora,
        [campo]: valor
      }
    })),

  resetBitacora: () =>
    set({
      bitacora: initialState,
      editandoId: null
    }),

  setEditando: (id, data) =>
    set({
      editandoId: id,
      bitacora: {
        ...initialState,
        ...data
      }
    })
}))