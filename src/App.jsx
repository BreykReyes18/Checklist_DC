import React, { useEffect, useState } from "react"
import { Input, Button, Card, Select } from "antd"
import { motion } from "framer-motion"
import jsPDF from "jspdf"

import {
  getInventario,
  addInventario,
  deleteInventario
} from "./services/inventarioService"

import {
  guardarBitacora
} from "./services/bitacoraService"

const { Option } = Select

function App() {

  // ==============================
  // STATES
  // ==============================

  const [equipos, setEquipos] = useState([])

  const [form, setForm] = useState({
    nombre_equipo: "",
    categoria: "",
    marca: "",
    modelo: "",
    ubicacion_rack: "",
    estado: "",
    observaciones: ""
  })

  const [bitacora, setBitacora] = useState({
    fecha: "",
    responsable: "",
    temperatura: "",
    energia: "",
    observacion: "",
    ups_revisada: false,
    apc_revisado: false,
    switch_core: false,
    alarmas: false,
    ibm_revisado: false,
    energia_comercial: false,
    planta_electrica: false
  })

  // ==============================
  // INVENTARIO
  // ==============================

  const cargarInventario = async () => {
    const { data, error } = await getInventario()
    if (!error) setEquipos(data)
  }

  const guardarEquipo = async () => {
    if (!form.nombre_equipo || !form.categoria) {
      alert("Nombre y categoría son obligatorios")
      return
    }

    await addInventario({
      ...form,
      fecha_registro: new Date()
    })

    setForm({
      nombre_equipo: "",
      categoria: "",
      marca: "",
      modelo: "",
      ubicacion_rack: "",
      estado: "",
      observaciones: ""
    })

    cargarInventario()
  }

  const eliminarEquipo = async (id) => {
    await deleteInventario(id)
    cargarInventario()
  }

  // ==============================
  // BITÁCORA (CORREGIDO)
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
        switch: bitacora.switch_core,
        alarmas: bitacora.alarmas,
        ibm: bitacora.ibm_revisado,
        energia: bitacora.energia_comercial,
        planta: bitacora.planta_electrica
      }
    }

    await guardarBitacora(data)

    alert("Bitácora guardada correctamente 🚀")
  }

  // ==============================
  // PDF REAL
  // ==============================

  const generarPDF = () => {
    if (!bitacora.fecha || !bitacora.responsable) {
      alert("Completa la bitácora antes de generar PDF")
      return
    }

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("REPORTE BITÁCORA DATA CENTER", 10, 10)

    doc.setFontSize(12)
    doc.text(`Fecha: ${bitacora.fecha}`, 10, 20)
    doc.text(`Responsable: ${bitacora.responsable}`, 10, 30)
    doc.text(`Temperatura: ${bitacora.temperatura}`, 10, 40)
    doc.text(`Energía: ${bitacora.energia}`, 10, 50)

    let y = 60

    const checklist = [
      ["UPS", bitacora.ups_revisada],
      ["APC InRow", bitacora.apc_revisado],
      ["Switch Core", bitacora.switch_core],
      ["Alarmas", bitacora.alarmas],
      ["IBM", bitacora.ibm_revisado],
      ["Energía Comercial", bitacora.energia_comercial],
      ["Planta Eléctrica", bitacora.planta_electrica]
    ]

    doc.text("CHECKLIST:", 10, y)
    y += 10

    checklist.forEach(([label, value]) => {
      doc.text(`${label}: ${value ? "✔ OK" : "✘ Falla"}`, 10, y)
      y += 8
    })

    y += 10
    doc.text("Observaciones:", 10, y)
    y += 8

    doc.text(bitacora.observacion || "-", 10, y, {
      maxWidth: 180
    })

    doc.save(`bitacora-${bitacora.fecha}.pdf`)
  }

  // ==============================
  // USE EFFECT
  // ==============================

  useEffect(() => {
    cargarInventario()
  }, [])

  // ==============================
  // UI
  // ==============================

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          Data Center Management 🚀
        </h1>

        <p className="text-gray-600 mb-6">
          Inventario + Dashboard + Bitácora
        </p>

        {/* INVENTARIO */}

        <Card className="mb-6 rounded-2xl shadow-lg">
          <div className="grid md:grid-cols-2 gap-4">

            <Input
              placeholder="Nombre del equipo"
              value={form.nombre_equipo}
              onChange={(e) =>
                setForm({ ...form, nombre_equipo: e.target.value })
              }
            />

            <Select
              placeholder="Categoría"
              value={form.categoria || undefined}
              onChange={(value) =>
                setForm({ ...form, categoria: value })
              }
            >
              <Option value="Rack">Rack</Option>
              <Option value="Switch">Switch</Option>
              <Option value="IBM">IBM</Option>
              <Option value="ODS">ODS</Option>
              <Option value="SW">SW</Option>
              <Option value="UPS">UPS</Option>
              <Option value="Perimetral">Perimetral</Option>
              <Option value="Aire APC InRow">Aire APC InRow</Option>
            </Select>

            <Input placeholder="Marca" value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })} />

            <Input placeholder="Modelo" value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })} />

            <Input placeholder="Ubicación Rack" value={form.ubicacion_rack}
              onChange={(e) => setForm({ ...form, ubicacion_rack: e.target.value })} />

            <Input placeholder="Estado" value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })} />

            <Input.TextArea rows={3} placeholder="Observaciones"
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />

          </div>

          <Button type="primary" className="mt-4" onClick={guardarEquipo}>
            Agregar Equipo
          </Button>
        </Card>

        {/* DASHBOARD */}

        <Card className="mb-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">
            Equipos registrados: {equipos.length}
          </h2>
        </Card>

        {/* BITÁCORA */}

        <Card className="mb-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            Bitácora Diaria Data Center
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <Input type="date"
              value={bitacora.fecha}
              onChange={(e) =>
                setBitacora({ ...bitacora, fecha: e.target.value })
              }
            />

            <Input placeholder="Responsable"
              value={bitacora.responsable}
              onChange={(e) =>
                setBitacora({ ...bitacora, responsable: e.target.value })
              }
            />

            <Input placeholder="Temperatura"
              value={bitacora.temperatura}
              onChange={(e) =>
                setBitacora({ ...bitacora, temperatura: e.target.value })
              }
            />

            <Input placeholder="Estado de Energía"
              value={bitacora.energia}
              onChange={(e) =>
                setBitacora({ ...bitacora, energia: e.target.value })
              }
            />

            <Input.TextArea rows={3} placeholder="Observaciones"
              value={bitacora.observacion}
              onChange={(e) =>
                setBitacora({ ...bitacora, observacion: e.target.value })
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
              <label key={key} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={bitacora[key]}
                  onChange={(e) =>
                    setBitacora({
                      ...bitacora,
                      [key]: e.target.checked
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="primary" onClick={guardarRevision}>
              Guardar Bitácora
            </Button>

            <Button onClick={generarPDF}>
              Generar PDF
            </Button>
          </div>

        </Card>

        {/* INVENTARIO CARDS */}

        <div className="grid md:grid-cols-3 gap-4">
          {equipos.map((equipo) => (
            <motion.div
              key={equipo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl shadow-md">
                <h2 className="text-xl font-bold">
                  {equipo.nombre_equipo}
                </h2>

                <p><strong>Categoría:</strong> {equipo.categoria}</p>
                <p><strong>Marca:</strong> {equipo.marca}</p>
                <p><strong>Modelo:</strong> {equipo.modelo}</p>
                <p><strong>Rack:</strong> {equipo.ubicacion_rack}</p>
                <p><strong>Estado:</strong> {equipo.estado}</p>

                <Button
                  danger
                  className="mt-4"
                  onClick={() => eliminarEquipo(equipo.id)}
                >
                  Eliminar
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App