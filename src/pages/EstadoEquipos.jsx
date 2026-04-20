// src/pages/EstadoEquipos.jsx

import React, { useState } from "react"
import {
  Card,
  Input,
  Button,
  Table,
  Select,
  Tag
} from "antd"

const { Option } = Select

export default function EstadoEquipos() {
  const [equipos, setEquipos] = useState([])

  const [form, setForm] = useState({
    nombreEquipo: "",
    categoria: "",
    ubicacion: "",
    estado: "",
    responsable: "",
    observacion: ""
  })

  const guardarEstado = () => {
    if (
      !form.nombreEquipo ||
      !form.categoria ||
      !form.estado
    ) {
      alert("Completa los campos obligatorios")
      return
    }

    const nuevoEquipo = {
      id: Date.now(),
      ...form
    }

    setEquipos([nuevoEquipo, ...equipos])

    setForm({
      nombreEquipo: "",
      categoria: "",
      ubicacion: "",
      estado: "",
      responsable: "",
      observacion: ""
    })

    alert("Estado del equipo registrado correctamente")
  }

  const renderEstado = (estado) => {
    let color = "blue"

    if (estado === "Operativo") color = "green"
    if (estado === "Degradado") color = "orange"
    if (estado === "En Falla") color = "red"
    if (estado === "Mantenimiento") color = "purple"
    if (estado === "Fuera de Servicio") color = "volcano"

    return <Tag color={color}>{estado}</Tag>
  }

  const columnas = [
    {
      title: "Equipo",
      dataIndex: "nombreEquipo",
      key: "nombreEquipo"
    },
    {
      title: "Categoría",
      dataIndex: "categoria",
      key: "categoria"
    },
    {
      title: "Ubicación",
      dataIndex: "ubicacion",
      key: "ubicacion"
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
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Estado General de Equipos
      </h1>

      <Card className="rounded-2xl shadow-lg mb-6">

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            placeholder="Nombre del equipo"
            value={form.nombreEquipo}
            onChange={(e) =>
              setForm({
                ...form,
                nombreEquipo: e.target.value
              })
            }
          />

          <Select
            placeholder="Categoría"
            value={form.categoria || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                categoria: value
              })
            }
          >
            <Option value="Rack">Rack</Option>
            <Option value="Switch">Switch</Option>
            <Option value="IBM">IBM</Option>
            <Option value="ODS">ODS</Option>
            <Option value="UPS">UPS</Option>
            <Option value="APC InRow">APC InRow</Option>
            <Option value="Perimetral">Perimetral</Option>
          </Select>

          <Input
            placeholder="Ubicación"
            value={form.ubicacion}
            onChange={(e) =>
              setForm({
                ...form,
                ubicacion: e.target.value
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
            <Option value="Operativo">Operativo</Option>
            <Option value="Degradado">Degradado</Option>
            <Option value="En Falla">En Falla</Option>
            <Option value="Mantenimiento">Mantenimiento</Option>
            <Option value="Fuera de Servicio">
              Fuera de Servicio
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

          <Input.TextArea
            rows={4}
            placeholder="Observación"
            value={form.observacion}
            onChange={(e) =>
              setForm({
                ...form,
                observacion: e.target.value
              })
            }
          />

        </div>

        <Button
          type="primary"
          className="mt-4"
          onClick={guardarEstado}
        >
          Registrar Estado
        </Button>

      </Card>

      <Card className="rounded-2xl shadow-lg">

        <Table
          columns={columnas}
          dataSource={equipos}
          rowKey="id"
          pagination={{
            pageSize: 8
          }}
        />

      </Card>
    </div>
  )
}