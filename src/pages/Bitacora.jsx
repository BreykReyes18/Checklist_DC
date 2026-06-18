import React, { useEffect, useState } from "react"
import {
  Card,
  Input,
  Button,
  Divider,
  Select,
  message,
  Modal,
  Tooltip
} from "antd"

import { WarningOutlined } from "@ant-design/icons"

import { useBitacoraStore } from "../store/bitacoraStore"
import {
  guardarBitacora,
  actualizarBitacora
} from "../services/bitacoraService"
import { getInventario } from "../services/inventarioService"
import { ESTADOS_REVISION } from "../utils/constants"

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
  const [modalAlertaOpen, setModalAlertaOpen] = useState(false)
  const [equipoAlerta, setEquipoAlerta] = useState(null)
  const [observacionAlerta, setObservacionAlerta] = useState("")

  const responsables = [
    "Brandon Isaac Cruz Reyes",
    "Erik Alexander Davila Flores"
  ]

  // =========================
  // FECHA AUTOMÁTICA
  // =========================
  useEffect(() => {
    if (bitacora.fecha) return

    const now = new Date()
    const fecha = now.toISOString().split("T")[0]
    const hora = now.toLocaleTimeString()

    actualizarCampo("fecha", `${fecha} ${hora}`)
  }, [bitacora.fecha, actualizarCampo])

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
  // AGRUPAR POR CATEGORÍA
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
  // CHECK DINÁMICO
  // =========================
  const toggleEquipo = (id) => {
    const actual = bitacora.equipos_extra || []
    const existe = actual.find((e) => e.id === id)

    let nuevos

    if (existe) {
      nuevos = actual.map((e) =>
        e.id === id
          ? {
              ...e,
              revisado: !e.revisado,
              ...(e.revisado ? { alerta: false, observacion: "" } : {})
            }
          : e
      )
    } else {
      nuevos = [...actual, { id, revisado: true, alerta: false, observacion: "" }]
    }

    actualizarCampo("equipos_extra", nuevos)
  }

  const getChecked = (id) => {
    return bitacora.equipos_extra?.find((e) => e.id === id)?.revisado || false
  }

  const getTieneAlerta = (id) => {
    return bitacora.equipos_extra?.find((e) => e.id === id)?.alerta || false
  }

  // =========================
  // ALERTA
  // =========================
  const abrirAlerta = (equipo) => {
    const actual = bitacora.equipos_extra?.find((e) => e.id === equipo.id)

    setEquipoAlerta(equipo)
    setObservacionAlerta(actual?.observacion || "")
    setModalAlertaOpen(true)
  }

  const guardarAlerta = () => {
    if (!equipoAlerta) return

    const actual = bitacora.equipos_extra || []
    const obs = observacionAlerta.trim()

    const nuevos = actual.some((e) => e.id === equipoAlerta.id)
      ? actual.map((e) =>
          e.id === equipoAlerta.id
            ? {
                ...e,
                revisado: true,
                alerta: true,
                observacion: obs
              }
            : e
        )
      : [
          ...actual,
          {
            id: equipoAlerta.id,
            revisado: true,
            alerta: true,
            observacion: obs
          }
        ]

    actualizarCampo("equipos_extra", nuevos)
    setModalAlertaOpen(false)
    setEquipoAlerta(null)
    setObservacionAlerta("")
  }

  const limpiarAlerta = () => {
    if (!equipoAlerta) return

    const actual = bitacora.equipos_extra || []

    const nuevos = actual.map((e) =>
      e.id === equipoAlerta.id
        ? {
            ...e,
            alerta: false,
            observacion: ""
          }
        : e
    )

    actualizarCampo("equipos_extra", nuevos)
    setModalAlertaOpen(false)
    setEquipoAlerta(null)
    setObservacionAlerta("")
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
      const checklist_completo = Object.entries(bitacora)
        .filter(([_, v]) => typeof v === "boolean")
        .every(([_, v]) => v === true)

      const data = {
        ...bitacora,
        checklist_completo,
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

    try {
      const img = new Image()
      img.src = "/logo03.png"

      await new Promise((resolve) => {
        img.onload = resolve
      })

      doc.addImage(img, "PNG", 130, 8, 70, 20)
    } catch (e) {
      console.warn("Error cargando logo", e)
    }

    const getEstado = (id) => {
      const eq = bitacora.equipos_extra?.find((e) => e.id === id)

      if (!eq) return ESTADOS_REVISION.PENDIENTE
      if (eq.alerta) return ESTADOS_REVISION.ALERTA
      if (eq.revisado) return ESTADOS_REVISION.VERIFICADO

      return ESTADOS_REVISION.PENDIENTE
    }

    const getColor = (value) => {
      if (value === ESTADOS_REVISION.VERIFICADO) return [0, 150, 0]
      if (value === ESTADOS_REVISION.ALERTA) return [200, 0, 0]
      return [120, 120, 120]
    }

    const agrupados = agrupar(equipos)

    doc.setFontSize(16)
    doc.text("CASA PELLAS", 14, 15)

    doc.setFontSize(12)
    doc.text("BITÁCORA DATA CENTER", 14, 22)

    doc.setFontSize(10)
    doc.text(`Fecha: ${bitacora.fecha || "-"}`, 14, 28)
    doc.text(`Responsable: ${bitacora.responsable || "-"}`, 14, 34)
    doc.text(
      `Temperatura: ${bitacora.temperatura ? `${bitacora.temperatura}°C` : "-"}`,
      14,
      40
    )

    let startY = 46

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
          1: { cellWidth: 50, halign: "center" }
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
        items.map((e) => {
          const extra = bitacora.equipos_extra?.find((x) => x.id === e.id)
          const estado = getEstado(e.id)

          const nombre =
            extra?.alerta && extra?.observacion
              ? `${e.nombre_equipo}\nObs: ${extra.observacion}`
              : e.nombre_equipo

          return [nombre, estado]
        })
      )
    })

    doc.setFontSize(12)
    doc.text("OBSERVACIONES:", 14, startY + 6)

    doc.setFontSize(10)
    doc.text(bitacora.observacion || "-", 14, startY + 12)

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
          <Select
            placeholder="Responsable"
            allowClear
            value={bitacora.responsable ?? undefined}
            onChange={(v) => actualizarCampo("responsable", v)}
            options={responsables.map((r) => ({
              label: r,
              value: r
            }))}
          />

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

          <input type="hidden" value={bitacora.fecha || ""} readOnly />
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
          <Card
            key={cat}
            size="small"
            className="mb-4 shadow-sm border border-gray-200"
          >
            <h3 className="font-bold text-lg mb-4">
              {cat}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-3">

              {items.map((e) => {
                const tieneAlerta = getTieneAlerta(e.id)
                const estaRevisado = getChecked(e.id)

                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={estaRevisado}
                        onChange={() => toggleEquipo(e.id)}
                      />

                      <span className="truncate">
                        {e.nombre_equipo}
                      </span>
                    </label>

                    {estaRevisado && (
                      <Tooltip
                        title={
                          tieneAlerta
                            ? "Alerta registrada"
                            : "Registrar incidencia"
                        }
                      >
                        <Button
                          size="small"
                          danger={tieneAlerta}
                          type={tieneAlerta ? "primary" : "default"}
                          ghost={!tieneAlerta}
                          onClick={() => abrirAlerta(e)}
                        >
                          ⚠
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                )
              })}

            </div>
          </Card>
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

      <Modal
        open={modalAlertaOpen}
        title={
          equipoAlerta
            ? `Registrar alerta - ${equipoAlerta.nombre_equipo}`
            : "Registrar alerta"
        }
        onCancel={() => {
          setModalAlertaOpen(false)
          setEquipoAlerta(null)
          setObservacionAlerta("")
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalAlertaOpen(false)
              setEquipoAlerta(null)
              setObservacionAlerta("")
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="clear"
            danger
            onClick={limpiarAlerta}
            disabled={!equipoAlerta || !getTieneAlerta(equipoAlerta.id)}
          >
            Limpiar alerta
          </Button>,
          <Button key="save" type="primary" onClick={guardarAlerta}>
            Guardar alerta
          </Button>
        ]}
      >
        <p style={{ marginBottom: 12 }}>
          Si detectaste un problema en este equipo, escribe la observación aquí.
        </p>

        <Input.TextArea
          rows={4}
          placeholder="Describe la incidencia..."
          value={observacionAlerta}
          onChange={(e) => setObservacionAlerta(e.target.value)}
        />
      </Modal>
    </div>
  )
}