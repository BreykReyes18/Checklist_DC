// src/utils/auditoria.js

export const registrarAuditoria = ({
  usuario,
  accion,
  modulo,
  estado = "OK"
}) => {
  const historial =
    JSON.parse(localStorage.getItem("auditoria")) || []

  const nuevoRegistro = {
    fecha: new Date().toLocaleString(),
    usuario,
    accion,
    modulo,
    estado
  }

  historial.unshift(nuevoRegistro)

  localStorage.setItem(
    "auditoria",
    JSON.stringify(historial)
  )
}