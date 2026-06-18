export const TURNO_BASE = {
  fechaReferencia: "2026-06-15",
  semanaReferencia: 2,
  operadores: {
    1: "ERIK ALEXANDER DAVILA FLORES",
    2: "BRANDON ISAAC CRUZ REYES",
  },
}

export const ESTADOS_REVISION = {
  VERIFICADO: "VERIFICADO",
  PENDIENTE: "PENDIENTE",
  ALERTA: "ALERTA",
}

export const getSemanaTurno = (fecha = new Date()) => {
  const ref = new Date(`${TURNO_BASE.fechaReferencia}T00:00:00`)
  const actual = new Date(fecha)

  ref.setHours(0, 0, 0, 0)
  actual.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((actual - ref) / 86400000)
  const ciclo = Math.floor(diffDays / 7)
  const offset = ((ciclo % 2) + 2) % 2

  return offset === 0 ? TURNO_BASE.semanaReferencia : (TURNO_BASE.semanaReferencia === 1 ? 2 : 1)
}

export const getOperadorTurno = (fecha = new Date()) => {
  const semana = getSemanaTurno(fecha)
  return TURNO_BASE.operadores[semana]
}