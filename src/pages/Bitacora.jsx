import React from "react"
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

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function Bitacora() {
  const {
    bitacora,
    actualizarCampo,
    resetBitacora,
    editandoId
  } = useBitacoraStore()

  // =========================
  // RESPONSABLES
  // =========================
  const responsables = [
    "Brandon Isaac Cruz Reyes",
    "Erik Alexander Davila Flores"
  ]

  // =========================
  // CHECKBOX
  // =========================
  const Check = ({ campo, label }) => (
    <label style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <input
        type="checkbox"
        checked={!!bitacora[campo]}
        onChange={(e) =>
          actualizarCampo(campo, e.target.checked)
        }
      />
      {label}
    </label>
  )

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {
    if (!bitacora.fecha || !bitacora.responsable) {
      message.warning("Completa los campos obligatorios")
      return
    }

    const checklist_completo = Object.entries(bitacora)
      .filter(([_, v]) => typeof v === "boolean")
      .every(([_, v]) => v === true)

    const data = {
      ...bitacora,
      checklist_completo
    }

    const res = editandoId
      ? await actualizarBitacora(editandoId, data)
      : await guardarBitacora(data)

    const { error } = res

    if (error) {
      console.error(error)
      message.error("Error al guardar")
      return
    }

    message.success("Bitácora guardada correctamente")
    resetBitacora()
  }

  // =========================
  // ESTADO
  // =========================
  const estado = (v) => (v ? "BUENO" : "ALERTA")

  const getColor = (value) => {
    if (value === "BUENO") return [0, 150, 0]
    if (value === "ALERTA") return [200, 0, 0]
    return [0, 0, 0]
  }

  // =========================
  // PDF
  // =========================
  const generarPDF = async () => {
    const doc = new jsPDF()

    const pageHeight = doc.internal.pageSize.height

    // LOGO
    try {
      const img = new Image()
      img.src = "/logo03.png"

      await new Promise((resolve) => {
        img.onload = resolve
      })

      doc.addImage(img, "WEBP", 130, 8, 70, 20)
    } catch (e) {}

    // ENCABEZADO
    doc.setFontSize(16)
    doc.text("CASA PELLAS", 14, 15)

    doc.setFontSize(12)
    doc.text("BITÁCORA DATA CENTER", 14, 22)

    doc.setFontSize(10)
    doc.text(`Fecha: ${bitacora.fecha}`, 14, 28)
    doc.text(`Responsable: ${bitacora.responsable}`, 14, 34)

    let startY = 40

    // =========================
    // TABLA REUTILIZABLE
    // =========================
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
          1: { cellWidth: 50 }
        },

        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const color = getColor(data.cell.raw)
            data.cell.styles.textColor = color
            data.cell.styles.fontStyle = "bold"
          }
        }
      })

      //MENOS ESPACIO ENTRE TABLAS
      startY = doc.lastAutoTable.finalY + 4
    }

    // =========================
    // TABLAS
    // =========================
    makeTable("Energía", [
      ["Energía Comercial", estado(bitacora.energia_comercial)],
      ["Planta Eléctrica", estado(bitacora.planta_electrica)],
      ["Generador", estado(bitacora.generador)],
      ["Energía", bitacora.energia || ""]
    ])

    makeTable("Infraestructura IT", [
      ["UPS", estado(bitacora.ups_revisada)],
      ["APC", estado(bitacora.apc_revisado)],
      ["IBM", estado(bitacora.ibm_revisado)],
      ["Switch Core", estado(bitacora.switch_core)]
    ])

    makeTable("Red", [
      ["Red WAN/LAN", estado(bitacora.red_wan_lan)]
    ])

    makeTable("Ambiente", [
      ["Aire Acondicionado", estado(bitacora.aire_acondicionado)],
      ["Humedad OK", estado(bitacora.humedad_ok)],
      ["Temperatura", bitacora.temperatura ? `${bitacora.temperatura}°C` : ""]
    ])

    makeTable("Seguridad", [
      ["Alarmas", estado(bitacora.alarmas)],
      ["Control Acceso", estado(bitacora.control_acceso)],
      ["Sensores Humo", estado(bitacora.sensores_humo)],
      ["Extintores", estado(bitacora.extintores)],
      ["Puertas Seguridad", estado(bitacora.puertas_seguridad)],
      ["Panel Incendios", estado(bitacora.panel_incendios)]
    ])

    // =========================
    // OBSERVACIONES
    // =========================
    doc.setFontSize(12)
    doc.text("OBSERVACIONES:", 14, startY + 6)

    doc.setFontSize(10)
    doc.text(
      bitacora.observacion || "Sin observaciones",
      14,
      startY + 12
    )

    // =========================
    // FIRMAS (FIJAS ABAJO)
    // =========================
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
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Bitácora Data Center
      </h1>

      <Card>

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            type="date"
            value={bitacora.fecha}
            onChange={(e) =>
              actualizarCampo("fecha", e.target.value)
            }
          />

          <Select
            value={bitacora.responsable}
            onChange={(v) =>
              actualizarCampo("responsable", v)
            }
            options={responsables.map(r => ({
              label: r,
              value: r
            }))}
          />

          <Select
            value={bitacora.temperatura}
            onChange={(v) =>
              actualizarCampo("temperatura", v)
            }
            options={Array.from({ length: 16 }, (_, i) => {
              const val = 15 + i
              return { label: `${val}°C`, value: val }
            })}
          />

          <Input
            placeholder="Energía"
            value={bitacora.energia}
            onChange={(e) =>
              actualizarCampo("energia", e.target.value)
            }
          />
        </div>

        <Input.TextArea
          rows={3}
          placeholder="Observación"
          value={bitacora.observacion}
          onChange={(e) =>
            actualizarCampo("observacion", e.target.value)
          }
        />

        <Divider>Infraestructura</Divider>

        <div className="grid md:grid-cols-2 gap-2">
          <Check campo="ups_revisada" label="UPS" />
          <Check campo="apc_revisado" label="APC" />
          <Check campo="switch_core" label="Switch Core" />
          <Check campo="alarmas" label="Alarmas" />
          <Check campo="ibm_revisado" label="IBM" />
          <Check campo="energia_comercial" label="Energía Comercial" />
          <Check campo="planta_electrica" label="Planta Eléctrica" />
          <Check campo="generador" label="Generador" />
          <Check campo="red_wan_lan" label="Red WAN/LAN" />
          <Check campo="aire_acondicionado" label="Aire A/C" />
          <Check campo="humedad_ok" label="Humedad OK" />
          <Check campo="control_acceso" label="Control Acceso" />
          <Check campo="sensores_humo" label="Sensores Humo" />
          <Check campo="extintores" label="Extintores" />
          <Check campo="puertas_seguridad" label="Puertas Seguridad" />
          <Check campo="panel_incendios" label="Panel Incendios" />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Button type="primary" onClick={guardar}>
            {editandoId ? "Actualizar" : "Guardar"}
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