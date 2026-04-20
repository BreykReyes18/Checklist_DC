// src/pages/EntregaTurno.jsx

import React, { useState } from "react"
import {
  Card,
  Input,
  Button,
  Table,
  Select
} from "antd"

const { TextArea } = Input
const { Option } = Select

export default function EntregaTurno() {
  const [entregas, setEntregas] = useState([])

  const [form, setForm] = useState({
    operadorSaliente: "",
    operadorEntrante: "",
    fecha: "",
    hora: "",
    estadoGeneral: "",
    incidentesActuales: "",
    problemasPendientes: "",
    escaladoA: "",
    personalInformado: "",
    observacionesCriticas: ""
  })

  const guardarEntrega = () => {
    if (
      !form.operadorSaliente ||
      !form.operadorEntrante ||
      !form.fecha ||
      !form.hora
    ) {
      alert("Completa los campos obligatorios")
      return
    }

    const nuevaEntrega = {
      id: Date.now(),
      ...form
    }

    setEntregas([nuevaEntrega, ...entregas])

    setForm({
      operadorSaliente: "",
      operadorEntrante: "",
      fecha: "",
      hora: "",
      estadoGeneral: "",
      incidentesActuales: "",
      problemasPendientes: "",
      escaladoA: "",
      personalInformado: "",
      observacionesCriticas: ""
    })

    alert("Entrega de turno registrada correctamente")
  }

  const columnas = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha"
    },
    {
      title: "Hora",
      dataIndex: "hora",
      key: "hora"
    },
    {
      title: "Saliente",
      dataIndex: "operadorSaliente",
      key: "operadorSaliente"
    },
    {
      title: "Entrante",
      dataIndex: "operadorEntrante",
      key: "operadorEntrante"
    },
    {
      title: "Estado General",
      dataIndex: "estadoGeneral",
      key: "estadoGeneral"
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Entrega de Turno
      </h1>

      <Card className="rounded-2xl shadow-lg mb-6">

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            placeholder="Operador Saliente"
            value={form.operadorSaliente}
            onChange={(e) =>
              setForm({
                ...form,
                operadorSaliente: e.target.value
              })
            }
          />

          <Input
            placeholder="Operador Entrante"
            value={form.operadorEntrante}
            onChange={(e) =>
              setForm({
                ...form,
                operadorEntrante: e.target.value
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

          <Select
            placeholder="Estado General del DC"
            value={form.estadoGeneral || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                estadoGeneral: value
              })
            }
          >
            <Option value="Operativo">
              Operativo
            </Option>

            <Option value="Degradado">
              Degradado
            </Option>

            <Option value="En Falla">
              En Falla
            </Option>

            <Option value="En Mantenimiento">
              En Mantenimiento
            </Option>
          </Select>

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
            placeholder="Personal informado"
            value={form.personalInformado}
            onChange={(e) =>
              setForm({
                ...form,
                personalInformado: e.target.value
              })
            }
          />

          <TextArea
            rows={3}
            placeholder="Incidentes actuales"
            value={form.incidentesActuales}
            onChange={(e) =>
              setForm({
                ...form,
                incidentesActuales: e.target.value
              })
            }
          />

          <TextArea
            rows={3}
            placeholder="Problemas pendientes"
            value={form.problemasPendientes}
            onChange={(e) =>
              setForm({
                ...form,
                problemasPendientes: e.target.value
              })
            }
          />

          <TextArea
            rows={3}
            placeholder="Observaciones críticas"
            value={form.observacionesCriticas}
            onChange={(e) =>
              setForm({
                ...form,
                observacionesCriticas: e.target.value
              })
            }
          />

        </div>

        <Button
          type="primary"
          className="mt-4"
          onClick={guardarEntrega}
        >
          Registrar Entrega de Turno
        </Button>

      </Card>

      <Card className="rounded-2xl shadow-lg">

        <Table
          columns={columnas}
          dataSource={entregas}
          rowKey="id"
          pagination={{
            pageSize: 6
          }}
        />

      </Card>
    </div>
  )
}