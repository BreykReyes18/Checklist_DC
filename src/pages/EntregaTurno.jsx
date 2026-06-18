import React, { useEffect } from "react"
import {
  Card,
  Input,
  Button,
  Table,
  Select,
  Tag,
  message,
  Popconfirm
} from "antd"

import {
  guardarEntregaTurno,
  getEntregasTurno,
  actualizarEntregaTurno,
  eliminarEntregaTurno
} from "../services/entregaTurnoService"

import { useEntregaTurnoStore } from "../store/entregaTurnoStore"
import {
  TURNO_BASE,
  getSemanaTurno
} from "../utils/constants"

const { TextArea } = Input

export default function EntregaTurno() {
  const {
    entrega,
    entregas,
    editandoId,
    actualizarCampo,
    setEntregas,
    resetEntrega,
    setEditando
  } = useEntregaTurnoStore()

  const semanaActual = getSemanaTurno()
  const operadorSaliente = TURNO_BASE.operadores[semanaActual]
  const operadorEntrante = TURNO_BASE.operadores[semanaActual === 1 ? 2 : 1]

  // =========================
  // CARGAR ENTREGAS
  // =========================
  const cargarEntregas = async () => {
    const { data, error } = await getEntregasTurno()

    if (error) {
      message.error("Error cargando entregas")
      return
    }

    setEntregas(data || [])
  }

  useEffect(() => {
    cargarEntregas()
  }, [])

  // =========================
  // AUTO-ASIGNAR OPERADORES
  // =========================
  useEffect(() => {
    if (editandoId) return

    if (entrega.operadorSaliente !== operadorSaliente) {
      actualizarCampo("operadorSaliente", operadorSaliente)
    }

    if (entrega.operadorEntrante !== operadorEntrante) {
      actualizarCampo("operadorEntrante", operadorEntrante)
    }
  }, [
    editandoId,
    entrega.operadorSaliente,
    entrega.operadorEntrante,
    operadorSaliente,
    operadorEntrante,
    actualizarCampo
  ])

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {
    if (!entrega.operadorSaliente || !entrega.operadorEntrante) {
      message.warning("Completa los campos obligatorios")
      return
    }

    const data = {
      operador_saliente: entrega.operadorSaliente,
      operador_entrante: entrega.operadorEntrante,
      estado_general: entrega.estadoGeneral,
      incidentes_actuales: entrega.incidentesActuales,
      problemas_pendientes: entrega.problemasPendientes,
      escalado_a: entrega.escaladoA,
      personal_informado: entrega.personalInformado,
      observaciones_criticas: entrega.observacionesCriticas
    }

    const res = editandoId
      ? await actualizarEntregaTurno(editandoId, data)
      : await guardarEntregaTurno(data)

    const { error } = res

    if (error) {
      console.error(error)
      message.error("Error guardando entrega")
      return
    }

    message.success(
      editandoId ? "Entrega actualizada" : "Entrega registrada"
    )

    resetEntrega()
    cargarEntregas()
  }

  // =========================
  // ELIMINAR
  // =========================
  const eliminar = async (id) => {
    const { error } = await eliminarEntregaTurno(id)

    if (error) {
      message.error("Error eliminando")
      return
    }

    message.success("Entrega eliminada")
    cargarEntregas()
  }

  // =========================
  // EDITAR
  // =========================
  const editar = (e) => {
    setEditando(e.id, {
      operadorSaliente: e.operador_saliente,
      operadorEntrante: e.operador_entrante,
      estadoGeneral: e.estado_general,
      incidentesActuales: e.incidentes_actuales,
      problemasPendientes: e.problemas_pendientes,
      escaladoA: e.escalado_a,
      personalInformado: e.personal_informado,
      observacionesCriticas: e.observaciones_criticas
    })
  }

  // =========================
  // COLOR ESTADO
  // =========================
  const colorEstado = (estado) => {
    if (estado === "Operativo") return "green"
    if (estado === "Degradado") return "orange"
    if (estado === "En Falla") return "red"
    if (estado === "En Mantenimiento") return "blue"
    return "default"
  }

  // =========================
  // TABLA
  // =========================
  const columnas = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (v) => new Date(v).toLocaleDateString()
    },
    {
      title: "Hora",
      dataIndex: "fecha",
      key: "hora",
      render: (v) => new Date(v).toLocaleTimeString()
    },
    {
      title: "Saliente",
      dataIndex: "operador_saliente",
      key: "operador_saliente"
    },
    {
      title: "Entrante",
      dataIndex: "operador_entrante",
      key: "operador_entrante"
    },
    {
      title: "Estado",
      dataIndex: "estado_general",
      key: "estado_general",
      render: (v) => <Tag color={colorEstado(v)}>{v}</Tag>
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button onClick={() => editar(record)}>Editar</Button>
          <Popconfirm title="Eliminar entrega?" onConfirm={() => eliminar(record.id)}>
            <Button danger>Eliminar</Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Entrega de Turno</h1>

      <Card className="rounded-2xl shadow-lg mb-6">
        <div className="mb-4">
          <Tag color={semanaActual === 1 ? "geekblue" : "purple"}>
            Semana {semanaActual} - {operadorSaliente}
          </Tag>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            placeholder="Operador Saliente"
            value={entrega.operadorSaliente ?? undefined}
            disabled
            options={Object.values(TURNO_BASE.operadores).map((op) => ({
              label: op,
              value: op
            }))}
          />

          <Select
            placeholder="Operador Entrante"
            value={entrega.operadorEntrante ?? undefined}
            disabled
            options={Object.values(TURNO_BASE.operadores).map((op) => ({
              label: op,
              value: op
            }))}
          />

          <Select
            placeholder="Estado General del DC"
            value={entrega.estadoGeneral}
            onChange={(v) => actualizarCampo("estadoGeneral", v)}
            options={[
              { value: "Operativo", label: "🟢 Operativo" },
              { value: "Degradado", label: "🟡 Degradado" },
              { value: "En Falla", label: "🔴 En Falla" },
              { value: "En Mantenimiento", label: "🔵 En Mantenimiento" }
            ]}
          />

          <Input
            placeholder="Escalado a"
            value={entrega.escaladoA}
            onChange={(e) => actualizarCampo("escaladoA", e.target.value)}
          />

          <Input
            placeholder="Personal informado"
            value={entrega.personalInformado}
            onChange={(e) => actualizarCampo("personalInformado", e.target.value)}
          />

          <TextArea
            rows={3}
            placeholder="Incidentes actuales"
            value={entrega.incidentesActuales}
            onChange={(e) => actualizarCampo("incidentesActuales", e.target.value)}
          />

          <TextArea
            rows={3}
            placeholder="Problemas pendientes"
            value={entrega.problemasPendientes}
            onChange={(e) => actualizarCampo("problemasPendientes", e.target.value)}
          />

          <TextArea
            rows={3}
            placeholder="Observaciones críticas"
            value={entrega.observacionesCriticas}
            onChange={(e) => actualizarCampo("observacionesCriticas", e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-5">
          <Button type="primary" onClick={guardar}>
            {editandoId ? "Actualizar Entrega" : "Registrar Entrega"}
          </Button>

          <Button onClick={resetEntrega}>Limpiar</Button>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-lg">
        <Table
          columns={columnas}
          dataSource={entregas}
          rowKey="id"
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </div>
  )
}