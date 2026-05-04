import React, { useEffect, useState } from "react"
import {
  Card,
  Input,
  Button,
  Divider,
  Select,
  message
} from "antd"

import { useBitacoraStore } from "../store/bitacoraStore"
import {
  guardarBitacora,
  actualizarBitacora
} from "../services/bitacoraService"

import { getInventario } from "../services/inventarioService"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function Bitacora() {
  const {
    bitacora,
    actualizarCampo,
    resetBitacora,
    editandoId
  } = useBitacoraStore()

  const [equipos, setEquipos] = useState([])

  // =========================
  // RESPONSABLES
  // =========================
  const responsables = [
    "Brandon Isaac Cruz Reyes",
    "Erik Alexander Davila Flores"
  ]

  // =========================
  // FECHA AUTOMÁTICA
  // =========================
  useEffect(() => {
    const now = new Date()
    const fecha = now.toISOString().split("T")[0]
    const hora = now.toLocaleTimeString()

    actualizarCampo("fecha", `${fecha} ${hora}`)
  }, [])

  // =========================
  // CARGAR INVENTARIO
  // =========================
  useEffect(() => {
    const cargar = async () => {
      const { data } = await getInventario()
      setEquipos(data || [])
    }
    cargar()
  }, [])

  // =========================
  // CHECK DINÁMICO
  // =========================
  const toggleEquipo = (id) => {
    const actual = bitacora.equipos_extra || []

    const existe = actual.find(e => e.id === id)

    let nuevos

    if (existe) {
      nuevos = actual.map(e =>
        e.id === id ? { ...e, revisado: !e.revisado } : e
      )
    } else {
      nuevos = [...actual, { id, revisado: true }]
    }

    actualizarCampo("equipos_extra", nuevos)
  }

  const getChecked = (id) => {
    return bitacora.equipos_extra?.find(e => e.id === id)?.revisado || false
  }

  // =========================
  // AGRUPAR
  // =========================
  const agrupar = (lista) => {
    return lista.reduce((acc, eq) => {
      const cat = eq.categoria || "Otros"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(eq)
      return acc
    }, {})
  }

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {
    if (!bitacora.responsable) {
      message.warning("Selecciona responsable")
      return
    }

    try {
      const data = {
        ...bitacora,
        equipos_extra: bitacora.equipos_extra || []
      }

      if (editandoId) {
        await actualizarBitacora(editandoId, data)
      } else {
        await guardarBitacora(data)
      }

      message.success("Bitácora guardada")
      resetBitacora()

    } catch (error) {
      console.error(error)
      message.error("Error al guardar")
    }
  }

  // =========================
  // PDF
  // =========================
  const generarPDF = async () => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height

    // =========================
// LOGO
// =========================
try {
  const img = new Image()
  img.src = "/logo03.png" // asegúrate que está en /public

  await new Promise((resolve) => {
    img.onload = resolve
  })

  doc.addImage(img, "PNG", 130, 8, 70, 20)
} catch (e) {
  console.warn("Error cargando logo", e)
}

    const getEstado = (id) => {
      const eq = bitacora.equipos_extra?.find(e => e.id === id)
      if (!eq) return "NO REVISADO"
      return eq.revisado ? "REVISADO" : "ALERTA"
    }

    const getColor = (value) => {
      if (value === "REVISADO") return [0, 150, 0]
      return [200, 0, 0]
    }

    const agrupados = agrupar(equipos)

    // HEADER
    doc.setFontSize(16)
    doc.text("CASA PELLAS", 14, 15)

    doc.setFontSize(12)
    doc.text("BITÁCORA DATA CENTER", 14, 22)

    doc.setFontSize(10)
    doc.text(`Fecha: ${bitacora.fecha}`, 14, 28)
    doc.text(`Responsable: ${bitacora.responsable}`, 14, 34)

    let startY = 40

    const makeTable = (title, rows) => {
      autoTable(doc, {
        startY,
        head: [[title, "Estado"]],
        body: rows,

        styles: {
          valign: "middle",
          halign: "left",
          cellPadding: 1
        },

        columnStyles: {
          0: { cellWidth: 130 },
          1: { cellWidth: 50, halign: "center" } // 🔥 ALINEADO
        },

        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const color = getColor(data.cell.raw)
            data.cell.styles.textColor = color
            data.cell.styles.fontStyle = "bold"
          }
        }
      })

      startY = doc.lastAutoTable.finalY + 4
    }

    Object.entries(agrupados).forEach(([cat, items]) => {
      makeTable(
        cat,
        items.map(e => [
          e.nombre_equipo,
          getEstado(e.id)
        ])
      )
    })

    // OBSERVACIONES
    doc.text("OBSERVACIONES:", 14, startY + 6)
    doc.text(bitacora.observacion || "-", 14, startY + 12)

    // FIRMAS
    const footerY = pageHeight - 25

    doc.text("_________________________", 40, footerY)
    doc.text("Firma Operador", 55, footerY + 6)

    doc.text("_________________________", 120, footerY)
    doc.text("Firma Supervisor", 135, footerY + 6)

    doc.save("Bitacora_DataCenter.pdf")
  }

  // =========================
  // UI
  // =========================
  const agrupadosUI = agrupar(equipos)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Bitácora Data Center
      </h1>

      <Card>

        <div className="grid md:grid-cols-3 gap-4">

          {/* RESPONSABLE */}
          <Select
  placeholder="Responsable"
  allowClear
  value={bitacora.responsable ?? undefined}
  onChange={(v) => actualizarCampo("responsable", v)}
  options={responsables.map(r => ({
    label: r,
    value: r
  }))}
/>

          {/* TEMPERATURA */}
          <Select
  placeholder="Temperatura"
  allowClear
  value={bitacora.temperatura ?? undefined}
  onChange={(v) => actualizarCampo("temperatura", v)}
  options={Array.from({ length: 16 }, (_, i) => {
    const val = 15 + i
    return { label: `${val}°C`, value: val }
  })}
/>

          {/* FECHA AUTOMÁTICA */}
          <input type="hidden" value={bitacora.fecha || ""} readOnly/>

        </div>

        <Input.TextArea
          rows={3}
          placeholder="Observación"
          value={bitacora.observacion}
          onChange={(e) =>
            actualizarCampo("observacion", e.target.value)
          }
        />

        <Divider>Checklist por Equipos</Divider>

        {Object.entries(agrupadosUI).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="font-bold mt-3">{cat}</h3>

            {items.map(e => (
              <label key={e.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={getChecked(e.id)}
                  onChange={() => toggleEquipo(e.id)}
                />
                {" "}{e.nombre_equipo}
              </label>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Button type="primary" onClick={guardar}>
            Guardar
          </Button>

          <Button onClick={resetBitacora}>
            Limpiar
          </Button>

          <Button onClick={generarPDF}>
            Generar PDF
          </Button>
        </div>

      </Card>
    </div>
  )
}