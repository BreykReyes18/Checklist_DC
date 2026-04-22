import { create } from "zustand"

export const useBitacoraStore = create((set) => ({

  bitacora: {
    // DATOS GENERALES
    responsable: "",
    temperatura: "",
    energia: "",
    observacion: "",

    // INFRAESTRUCTURA ELÉCTRICA
    ups_revisada: false,
    apc_revisado: false,
    energia_comercial: false,
    planta_electrica: false,
    generador: false,

    // INFRAESTRUCTURA TI
    switch_core: false,
    ibm_revisado: false,
    red_wan_lan: false,

    // CLIMATIZACIÓN
    aire_acondicionado: false,
    humedad_ok: false,

    // SEGURIDAD
    alarmas: false,
    control_acceso: false,
    sensores_humo: false,
    extintores: false,
    puertas_seguridad: false,
    panel_incendios: false
  },

  // ==============================
  // ACTUALIZAR CAMPO
  // ==============================
  actualizarCampo: (campo, valor) =>
    set((state) => ({
      bitacora: {
        ...state.bitacora,
        [campo]: valor
      }
    })),

  // ==============================
  // RESET
  // ==============================
  resetBitacora: () =>
    set({
      bitacora: {
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
        panel_incendios: false
      }
    })

}))