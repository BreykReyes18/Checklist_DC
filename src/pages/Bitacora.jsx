import React from "react"
import { Card, Input, Button } from "antd"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {
  guardarBitacora
} from "../services/bitacoraService"

import {
  useBitacoraStore
} from "../store/bitacoraStore"

export default function Bitacora() {
  const {
    bitacora,
    actualizarCampo,
    resetBitacora
  } = useBitacoraStore()

  // ==============================
  // GUARDAR BITÁCORA
  // ==============================

  const guardarRevision = async () => {
    if (!bitacora.fecha || !bitacora.responsable) {
      alert("Fecha y responsable son obligatorios")
      return
    }

    const data = {
      fecha: bitacora.fecha,
      responsable: bitacora.responsable,
      temperatura: bitacora.temperatura,
      energia: bitacora.energia,
      observacion: bitacora.observacion,

      checklist: {
        ups: bitacora.ups_revisada,
        apc: bitacora.apc_revisado,
        switch_core: bitacora.switch_core,
        alarmas: bitacora.alarmas,
        ibm: bitacora.ibm_revisado,
        energia_comercial: bitacora.energia_comercial,
        planta: bitacora.planta_electrica
      }
    }

    await guardarBitacora(data)

    alert("Bitácora guardada correctamente")
    resetBitacora() // limpia después de guardar
  }

  // ==============================
  // GENERAR PDF
  // ==============================

  const generarPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("REPORTE DIARIO DATA CENTER", 14, 20)

    doc.setFontSize(11)
    doc.text(`Fecha: ${bitacora.fecha || "N/A"}`, 14, 30)
    doc.text(`Responsable: ${bitacora.responsable || "N/A"}`, 14, 38)
    doc.text(`Temperatura: ${bitacora.temperatura || "N/A"}`, 14, 46)
    doc.text(`Energía: ${bitacora.energia || "N/A"}`, 14, 54)

    autoTable(doc, {
      startY: 65,
      head: [["Revisión", "Estado"]],
      body: [
        ["UPS", bitacora.ups_revisada ? "OK" : "Pendiente"],
        ["APC InRow", bitacora.apc_revisado ? "OK" : "Pendiente"],
        ["Switch Core", bitacora.switch_core ? "OK" : "Pendiente"],
        ["Alarmas", bitacora.alarmas ? "OK" : "Pendiente"],
        ["IBM", bitacora.ibm_revisado ? "OK" : "Pendiente"],
        ["Energía Comercial", bitacora.energia_comercial ? "OK" : "Pendiente"],
        ["Planta Eléctrica", bitacora.planta_electrica ? "OK" : "Pendiente"]
      ]
    })

    const finalY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 12
      : 80

    doc.text("Observaciones:", 14, finalY)
    doc.text(
      bitacora.observacion || "Sin observaciones",
      14,
      finalY + 8
    )

    doc.save("reporte_data_center.pdf")
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Bitácora Data Center
      </h1>

      <Card className="rounded-2xl shadow-lg">

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            type="date"
            value={bitacora.fecha}
            onChange={(e) =>
              actualizarCampo("fecha", e.target.value)
            }
          />

          <Input
            placeholder="Responsable"
            value={bitacora.responsable}
            onChange={(e) =>
              actualizarCampo("responsable", e.target.value)
            }
          />

          <Input
            placeholder="Temperatura"
            value={bitacora.temperatura}
            onChange={(e) =>
              actualizarCampo("temperatura", e.target.value)
            }
          />

          <Input
            placeholder="Estado de Energía"
            value={bitacora.energia}
            onChange={(e) =>
              actualizarCampo("energia", e.target.value)
            }
          />

          <Input.TextArea
            rows={4}
            placeholder="Observaciones"
            value={bitacora.observacion}
            onChange={(e) =>
              actualizarCampo("observacion", e.target.value)
            }
          />

        </div>

        {/* CHECKLIST */}

        <div className="mt-6 space-y-3">

          {[
            ["ups_revisada", "Revisar UPS"],
            ["apc_revisado", "Revisar APC InRow"],
            ["switch_core", "Revisar Switch Core"],
            ["alarmas", "Revisar Alarmas"],
            ["ibm_revisado", "Revisar IBM"],
            ["energia_comercial", "Revisar Energía Comercial"],
            ["planta_electrica", "Revisar Planta Eléctrica"]
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex gap-2"
            >
              <input
                type="checkbox"
                checked={!!bitacora[key]} // evita warnings
                onChange={(e) =>
                  actualizarCampo(key, e.target.checked)
                }
              />
              {label}
            </label>
          ))}

        </div>

        {/* BOTONES */}

        <div className="flex gap-4 mt-6">

          <Button
            type="primary"
            onClick={guardarRevision}
          >
            Guardar Bitácora
          </Button>

          <Button onClick={generarPDF}>
            Generar PDF
          </Button>

          <Button onClick={resetBitacora}>
            Limpiar
          </Button>

        </div>

      </Card>
    </div>
  )
}