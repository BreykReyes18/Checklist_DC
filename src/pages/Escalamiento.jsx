// src/pages/Escalamiento.jsx

import React, { useState } from "react"
import {
  Card,
  Input,
  Button,
  Table,
  Select,
  Tag
} from "antd"

const { TextArea } = Input
const { Option } = Select

export default function Escalamiento() {
  const [escalamientos, setEscalamientos] = useState([])

  const [form, setForm] = useState({
    incidente: "",
    equipo: "",
    prioridad: "",
    notificadoA: "",
    fecha: "",
    hora: "",
    respuestaRecibida: "",
    sla: "",
    estado: "",
    seguimiento: ""
  })

  const guardarEscalamiento = () => {
    if (
      !form.incidente ||
      !form.equipo ||
      !form.prioridad ||
      !form.notificadoA
    ) {
      alert("Completa los campos obligatorios")
      return
    }

    const nuevoEscalamiento = {
      id: Date.now(),
      ...form
    }

    setEscalamientos([nuevoEscalamiento, ...escalamientos])

    setForm({
      incidente: "",
      equipo: "",
      prioridad: "",
      notificadoA: "",
      fecha: "",
      hora: "",
      respuestaRecibida: "",
      sla: "",
      estado: "",
      seguimiento: ""
    })

    alert("Escalamiento registrado correctamente")
  }

  const renderPrioridad = (prioridad) => {
    let color = "blue"

    if (prioridad === "Crítica") color = "red"
    if (prioridad === "Alta") color = "volcano"
    if (prioridad === "Media") color = "orange"
    if (prioridad === "Baja") color = "green"

    return <Tag color={color}>{prioridad}</Tag>
  }

  const renderEstado = (estado) => {
    let color = "blue"

    if (estado === "Abierto") color = "red"
    if (estado === "En Proceso") color = "orange"
    if (estado === "Resuelto") color = "green"
    if (estado === "Monitoreo") color = "blue"

    return <Tag color={color}>{estado}</Tag>
  }

  const columnas = [
    {
      title: "Incidente",
      dataIndex: "incidente",
      key: "incidente"
    },
    {
      title: "Equipo",
      dataIndex: "equipo",
      key: "equipo"
    },
    {
      title: "Prioridad",
      dataIndex: "prioridad",
      key: "prioridad",
      render: renderPrioridad
    },
    {
      title: "Notificado a",
      dataIndex: "notificadoA",
      key: "notificadoA"
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: renderEstado
    },
    {
      title: "SLA",
      dataIndex: "sla",
      key: "sla"
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Escalamiento Técnico
      </h1>

      <Card className="rounded-2xl shadow-lg mb-6">

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            placeholder="Incidente"
            value={form.incidente}
            onChange={(e) =>
              setForm({
                ...form,
                incidente: e.target.value
              })
            }
          />

          <Input
            placeholder="Equipo afectado"
            value={form.equipo}
            onChange={(e) =>
              setForm({
                ...form,
                equipo: e.target.value
              })
            }
          />

          <Select
            placeholder="Prioridad"
            value={form.prioridad || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                prioridad: value
              })
            }
          >
            <Option value="Crítica">Crítica</Option>
            <Option value="Alta">Alta</Option>
            <Option value="Media">Media</Option>
            <Option value="Baja">Baja</Option>
          </Select>

          <Input
            placeholder="Notificado a"
            value={form.notificadoA}
            onChange={(e) =>
              setForm({
                ...form,
                notificadoA: e.target.value
              })
            }
          />

          <Input
            type="date"
            value={form.fecha}
            onChange={(e) =>
              setForm({
                ...form,
                fecha: e.target.value
              })
            }
          />

          <Input
            type="time"
            value={form.hora}
            onChange={(e) =>
              setForm({
                ...form,
                hora: e.target.value
              })
            }
          />

          <Input
            placeholder="Respuesta recibida"
            value={form.respuestaRecibida}
            onChange={(e) =>
              setForm({
                ...form,
                respuestaRecibida: e.target.value
              })
            }
          />

          <Input
            placeholder="SLA"
            value={form.sla}
            onChange={(e) =>
              setForm({
                ...form,
                sla: e.target.value
              })
            }
          />

          <Select
            placeholder="Estado"
            value={form.estado || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                estado: value
              })
            }
          >
            <Option value="Abierto">Abierto</Option>
            <Option value="En Proceso">En Proceso</Option>
            <Option value="Resuelto">Resuelto</Option>
            <Option value="Monitoreo">Monitoreo</Option>
          </Select>

          <TextArea
            rows={4}
            placeholder="Seguimiento"
            value={form.seguimiento}
            onChange={(e) =>
              setForm({
                ...form,
                seguimiento: e.target.value
              })
            }
          />

        </div>

        <Button
          type="primary"
          className="mt-4"
          onClick={guardarEscalamiento}
        >
          Registrar Escalamiento
        </Button>

      </Card>

      <Card className="rounded-2xl shadow-lg">

        <Table
          columns={columnas}
          dataSource={escalamientos}
          rowKey="id"
          pagination={{
            pageSize: 8
          }}
        />

      </Card>
    </div>
  )
}