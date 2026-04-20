// src/pages/Mantenimiento.jsx

import React, { useState } from "react"
import { Card, Input, Button, DatePicker, Table, Select } from "antd"
import dayjs from "dayjs"

const { Option } = Select

export default function Mantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([])

  const [form, setForm] = useState({
    equipo: "",
    tipo: "",
    responsable: "",
    fecha: null,
    observacion: ""
  })

  const guardarMantenimiento = () => {
    if (
      !form.equipo ||
      !form.tipo ||
      !form.responsable ||
      !form.fecha
    ) {
      alert("Completa todos los campos obligatorios")
      return
    }

    const nuevo = {
      id: Date.now(),
      equipo: form.equipo,
      tipo: form.tipo,
      responsable: form.responsable,
      fecha: dayjs(form.fecha).format("DD/MM/YYYY"),
      observacion: form.observacion
    }

    setMantenimientos([nuevo, ...mantenimientos])

    setForm({
      equipo: "",
      tipo: "",
      responsable: "",
      fecha: null,
      observacion: ""
    })

    alert("Mantenimiento registrado correctamente")
  }

  const columnas = [
    {
      title: "Equipo",
      dataIndex: "equipo",
      key: "equipo"
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo"
    },
    {
      title: "Responsable",
      dataIndex: "responsable",
      key: "responsable"
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha"
    },
    {
      title: "Observación",
      dataIndex: "observacion",
      key: "observacion"
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Gestión de Mantenimiento
      </h1>

      <Card className="rounded-2xl shadow-lg mb-6">

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            placeholder="Equipo"
            value={form.equipo}
            onChange={(e) =>
              setForm({
                ...form,
                equipo: e.target.value
              })
            }
          />

          <Select
            placeholder="Tipo de mantenimiento"
            value={form.tipo || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                tipo: value
              })
            }
          >
            <Option value="Preventivo">
              Preventivo
            </Option>

            <Option value="Correctivo">
              Correctivo
            </Option>

            <Option value="Emergencia">
              Emergencia
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

          <DatePicker
            className="w-full"
            value={form.fecha}
            onChange={(date) =>
              setForm({
                ...form,
                fecha: date
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
          onClick={guardarMantenimiento}
        >
          Registrar Mantenimiento
        </Button>

      </Card>

      <Card className="rounded-2xl shadow-lg">

        <Table
          columns={columnas}
          dataSource={mantenimientos}
          rowKey="id"
          pagination={{
            pageSize: 6
          }}
        />

      </Card>
    </div>
  )
}