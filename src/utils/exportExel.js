// utils/exportExcel.js

import * as XLSX from "xlsx"

export const exportarBitacorasExcel = (bitacoras) => {
  if (!bitacoras || bitacoras.length === 0) {
    alert("No hay datos para exportar")
    return
  }

  const data = bitacoras.map((item) => ({
    Fecha: item.fecha || "",
    Responsable: item.responsable || "",
    Temperatura: item.temperatura || "",
    Energia: item.energia || "",
    Observacion: item.observacion || ""
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Bitacoras"
  )

  XLSX.writeFile(
    workbook,
    "reporte_bitacoras.xlsx"
  )
}