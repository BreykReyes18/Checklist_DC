import { create } from "zustand"

const initialState = {
  operadorSaliente: "",
  operadorEntrante: "",

  estadoGeneral: "",

  incidentesActuales: "",
  problemasPendientes: "",
  escaladoA: "",
  personalInformado: "",
  observacionesCriticas: ""
}

export const useEntregaTurnoStore = create((set) => ({
  entrega: initialState,

  entregas: [],

  editandoId: null,

  // =========================
  // ACTUALIZAR CAMPO
  // =========================
  actualizarCampo: (campo, valor) =>
    set((state) => ({
      entrega: {
        ...state.entrega,
        [campo]: valor
      }
    })),

  // =========================
  // SET ENTREGAS
  // =========================
  setEntregas: (data) =>
    set({
      entregas: data
    }),

  // =========================
  // RESET
  // =========================
  resetEntrega: () =>
    set({
      entrega: initialState,
      editandoId: null
    }),

  // =========================
  // EDITAR
  // =========================
  setEditando: (id, data) =>
    set({
      editandoId: id,
      entrega: {
        ...initialState,
        ...data
      }
    })
}))