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
    energia_comercial: false,
    planta_electrica: false,
    generador: false,
    switch_core: false,
    ibm_revisado: false,
    red_wan_lan: false,
    aire_acondicionado: false,
    humedad_ok: false,
    alarmas: false,
    control_acceso: false,
    sensores_humo: false,
    extintores: false,
    puertas_seguridad: false,
    panel_incendios: false,

    // 🔥 NUEVO CAMPO DINÁMICO
    equipos_extra: []
  },

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
      bitacora: {
        fecha: "",
        responsable: "",
        temperatura: "",
        energia: "",
        observacion: "",

        ups_revisada: false,
        apc_revisado: false,
        energia_comercial: false,
        planta_electrica: false,
        generador: false,
        switch_core: false,
        ibm_revisado: false,
        red_wan_lan: false,
        aire_acondicionado: false,
        humedad_ok: false,
        alarmas: false,
        control_acceso: false,
        sensores_humo: false,
        extintores: false,
        puertas_seguridad: false,
        panel_incendios: false,

        equipos_extra: []
      },
      editandoId: null
    }),

  setEditando: (id, data) =>
    set({
      editandoId: id,
      bitacora: data
    })
}))