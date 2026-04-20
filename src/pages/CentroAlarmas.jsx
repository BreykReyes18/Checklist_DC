// src/pages/CentroAlarmas.jsx

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

export default function CentroAlarmas() {
  const [alarmas, setAlarmas] = useState([])

  const [form, setForm] = useState({
    equipo: "",
    tipoAlarma: "",
    severidad: "",
    estado: "",
    responsable: "",
    escaladoA: "",
    comentarioTecnico: "",
    fecha: ""
  })

  const guardarAlarma = () => {
    if (
      !form.equipo ||
      !form.tipoAlarma ||
      !form.severidad ||
      !form.estado
    ) {
      alert("Completa los campos obligatorios")
      return
    }

    const nuevaAlarma = {
      id: Date.now(),
      ...form
    }

    setAlarmas([nuevaAlarma, ...alarmas])

    setForm({
      equipo: "",
      tipoAlarma: "",
      severidad: "",
      estado: "",
      responsable: "",
      escaladoA: "",
      comentarioTecnico: "",
      fecha: ""
    })

    alert("Alarma registrada correctamente")
  }

  const renderEstado = (estado) => {
    let color = "blue"

    if (estado === "Activa") color = "red"
    if (estado === "Resuelta") color = "green"
    if (estado === "Pendiente") color = "orange"
    if (estado === "Monitoreo") color = "blue"

    return <Tag color={color}>{estado}</Tag>
  }

  const columnas = [
    {
      title: "Equipo",
      dataIndex: "equipo",
      key: "equipo"
    },
    {
      title: "Tipo",
      dataIndex: "tipoAlarma",
      key: "tipoAlarma"
    },
    {
      title: "Severidad",
      dataIndex: "severidad",
      key: "severidad"
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: renderEstado
    },
    {
      title: "Responsable",
      dataIndex: "responsable",
      key: "responsable"
    },
    {
      title: "Escalado a",
      dataIndex: "escaladoA",
      key: "escaladoA"
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Centro de Alarmas
      </h1>

      <Card className="rounded-2xl shadow-lg mb-6">

        <div className="grid md:grid-cols-2 gap-4">

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

          <Input
            placeholder="Tipo de alarma"
            value={form.tipoAlarma}
            onChange={(e) =>
              setForm({
                ...form,
                tipoAlarma: e.target.value
              })
            }
          />

          <Select
            placeholder="Severidad"
            value={form.severidad || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                severidad: value
              })
            }
          >
            <Option value="Crítica">
              Crítica
            </Option>

            <Option value="Media">
              Media
            </Option>

            <Option value="Baja">
              Baja
            </Option>
          </Select>

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
            <Option value="Activa">
              Activa
            </Option>

            <Option value="Resuelta">
              Resuelta
            </Option>

            <Option value="Pendiente">
              Reportada sin revisión
            </Option>

            <Option value="Monitoreo">
              En monitoreo
            </Option>
          </Select>

          <Input
            placeholder="Responsable"
            value={form.responsable}
            onChange={(e) =>
              setForm({
                ...form,
                responsable: e.target.value
              })
            }
          />

          <Input
            placeholder="Escalado a"
            value={form.escaladoA}
            onChange={(e) =>
              setForm({
                ...form,
                escaladoA: e.target.value
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

          <TextArea
            rows={4}
            placeholder="Comentario técnico"
            value={form.comentarioTecnico}
            onChange={(e) =>
              setForm({
                ...form,
                comentarioTecnico: e.target.value
              })
            }
          />

        </div>

        <Button
          type="primary"
          className="mt-4"
          onClick={guardarAlarma}
        >
          Registrar Alarma
        </Button>

      </Card>

      <Card className="rounded-2xl shadow-lg">

        <Table
          columns={columnas}
          dataSource={alarmas}
          rowKey="id"
          pagination={{
            pageSize: 8
          }}
        />

      </Card>
    </div>
  )
}