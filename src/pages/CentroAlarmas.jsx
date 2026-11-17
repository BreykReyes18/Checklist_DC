import React, { useEffect, useState } from "react"

import {
  Card,
  Table,
  Select,
  Tag,
  Button,
  message,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
  Tooltip
} from "antd"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

import {
  getAlarmas,
  updateAlarma,
  resolverAlarma
} from "../services/centroAlarmasService"

import { useCentroAlarmasStore } from "../store/centroAlarmasStore"
import { useAuthStore } from "../store/authStore"

import AlarmasCharts from "../components/Alarmas/AlarmasCharts"

const ESTADO_COLORS = {
  Activa: "#F2555A",
  "En monitoreo": "#F2A93B",
  Resuelta: "#35D07F"
}

const SEVERIDAD_COLORS = {
  Crítica: "#F2555A",
  Media: "#33C7D6",
  Baja: "#35D07F"
}

export default function CentroAlarmas() {
  const { puede } = useAuthStore()
  const {
    alarmas,
    filtro,
    setAlarmas,
    setFiltro
  } = useCentroAlarmasStore()

  const [loading, setLoading] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const cargar = async () => {
    setLoading(true)
    const { data, error } = await getAlarmas()

    if (error) {
      console.error(error)
      message.error("Error cargando alarmas")
      setLoading(false)
      return
    }

    setAlarmas(data || [])
    setLoading(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  const formatearDuracion = (minutos) => {
    if (minutos === null || minutos === undefined) return "-"

    const total = Number(minutos)
    if (Number.isNaN(total) || total < 0) return "-"

    const dias = Math.floor(total / 1440)
    const horas = Math.floor((total % 1440) / 60)
    const mins = total % 60

    return `${dias}d ${horas}h ${mins}m`
  }

  const formatearFechaHora = (valor) => {
    if (!valor) return "-"
    const d = new Date(valor)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleString()
  }

  const cambiarEstado = async (record, nuevoEstado) => {
    if (!record || record.estado === nuevoEstado) return

    try {
      setLoading(true)

      if (nuevoEstado === "Resuelta") {
        const { error } = await resolverAlarma(record.id)

        if (error) {
          console.error(error)
          message.error("Error resolviendo alarma")
          setLoading(false)
          return
        }

        message.success("Alarma resuelta")
        await cargar()
        return
      }

      // Una alarma resuelta queda cerrada: no se puede reabrir
      if (record.estado === "Resuelta") {
        setLoading(false)
        return
      }

      const { error } = await updateAlarma(record.id, {
        estado: nuevoEstado
      })

      if (error) {
        console.error(error)
        message.error("Error actualizando alarma")
        setLoading(false)
        return
      }

      message.success("Estado actualizado")
      await cargar()
    } catch (error) {
      console.error(error)
      message.error("Error actualizando alarma")
      setLoading(false)
    }
  }

  const resolver = async (id) => {
    try {
      setLoading(true)

      const { error } = await resolverAlarma(id)

      if (error) {
        console.error(error)
        message.error("Error resolviendo alarma")
        setLoading(false)
        return
      }

      message.success("Alarma resuelta")
      await cargar()
    } catch (error) {
      console.error(error)
      message.error("Error resolviendo alarma")
      setLoading(false)
    }
  }

  const colorEstado = (estado) => {
    if (estado === "Activa") return "red"
    if (estado === "En monitoreo") return "gold"
    if (estado === "Resuelta") return "green"
    return "default"
  }

  const colorSeveridad = (s) => {
    if (s === "Crítica") return "red"
    if (s === "Media") return "blue"
    if (s === "Baja") return "green"
    return "default"
  }

  const aplicarFiltroFechas = (lista) => {
    let data = [...lista]

    if (fechaInicio || fechaFin) {
      data = data.filter((a) => {
        if (!a.fecha_inicio) return false

        const fecha = new Date(a.fecha_inicio).getTime()
        const inicio = fechaInicio
          ? new Date(`${fechaInicio}T00:00:00`).getTime()
          : null
        const fin = fechaFin
          ? new Date(`${fechaFin}T23:59:59.999`).getTime()
          : null

        if (inicio !== null && fecha < inicio) return false
        if (fin !== null && fecha > fin) return false

        return true
      })
    }

    return data
  }

  const filtradasBase =
    filtro === "Todas"
      ? alarmas
      : alarmas.filter((a) => a.estado === filtro)

  const filtradas = aplicarFiltroFechas(filtradasBase)

  const activas =
    filtradas.filter((a) => a.estado === "Activa").length

  const monitoreo =
    filtradas.filter((a) => a.estado === "En monitoreo").length

  const resueltas =
    filtradas.filter((a) => a.estado === "Resuelta").length

  const criticas =
    filtradas.filter((a) => a.severidad === "Crítica").length

  const medias =
    filtradas.filter((a) => a.severidad === "Media").length

  const bajas =
    filtradas.filter((a) => a.severidad === "Baja").length

  const estadoChartData = [
    { name: "Activas", value: activas },
    { name: "En monitoreo", value: monitoreo },
    { name: "Resueltas", value: resueltas }
  ]

  const severidadChartData = [
    { name: "Crítica", value: criticas },
    { name: "Media", value: medias },
    { name: "Baja", value: bajas }
  ]

  const columnas = [
    {
      title: "Equipo",
      dataIndex: "equipo"
    },
    {
      title: "Categoría",
      dataIndex: "categoria"
    },
    {
      title: "Severidad",
      dataIndex: "severidad",
      render: (v) => (
        <Tag color={colorSeveridad(v)}>
          {v}
        </Tag>
      )
    },
    {
      title: "Estado",
      dataIndex: "estado",
      render: (v) => (
        <Tag color={colorEstado(v)}>
          {v}
        </Tag>
      )
    },
    {
      title: "Responsable",
      dataIndex: "responsable"
    },
    {
      title: "Inicio",
      dataIndex: "fecha_inicio",
      render: (v) =>
        v
          ? new Date(v).toLocaleString()
          : "-"
    },
    {
      title: "Fin",
      dataIndex: "fecha_resolucion",
      render: (v) =>
        v
          ? new Date(v).toLocaleString()
          : "-"
    },
    {
      title: "Duración",
      dataIndex: "duracion_minutos",
      render: formatearDuracion
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {record.estado === "Resuelta" ? (
            <Tag color="green">Cerrada</Tag>
          ) : (
            <>
              <Select
                size="small"
                style={{ width: "100%" }}
                value={record.estado}
                disabled={!puede("alarmas.gestionar")}
                onChange={(v) => cambiarEstado(record, v)}
                options={[
                  { value: "Activa", label: "Activa" },
                  { value: "En monitoreo", label: "En monitoreo" }
                ]}
              />

              {puede("alarmas.gestionar") && (
                <Tooltip title="Marcar como resuelta">
                  <Button
                    type="primary"
                    size="small"
                    block
                    onClick={() => resolver(record.id)}
                  >
                    Resolver
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Centro de Alarmas
      </h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Activas"
              value={activas}
              valueStyle={{ color: ESTADO_COLORS.Activa }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="En monitoreo"
              value={monitoreo}
              valueStyle={{ color: ESTADO_COLORS["En monitoreo"] }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Resueltas"
              value={resueltas}
              valueStyle={{ color: ESTADO_COLORS.Resuelta }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Estado de Alarmas" className="h-full">
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadoChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    cx="50%"
                    cy="50%"
                  >
                    {estadoChartData.map((entry, index) => {
                      const color =
                        index === 0
                          ? ESTADO_COLORS.Activa
                          : index === 1
                            ? ESTADO_COLORS["En monitoreo"]
                            : ESTADO_COLORS.Resuelta

                      return (
                        <Cell key={`estado-${index}`} fill={color} />
                      )
                    })}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: "#1A222D", border: "1px solid #26303C", borderRadius: 8, color: "#E7EBF0" }} itemStyle={{ color: "#E7EBF0" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Severidad" className="h-full">
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severidadChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    cx="50%"
                    cy="50%"
                  >
                    {severidadChartData.map((entry, index) => {
                      const color =
                        index === 0
                          ? SEVERIDAD_COLORS.Crítica
                          : index === 1
                            ? SEVERIDAD_COLORS.Media
                            : SEVERIDAD_COLORS.Baja

                      return (
                        <Cell key={`sev-${index}`} fill={color} />
                      )
                    })}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: "#1A222D", border: "1px solid #26303C", borderRadius: 8, color: "#E7EBF0" }} itemStyle={{ color: "#E7EBF0" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="rounded-2xl shadow-lg">
        <Space
          direction="vertical"
          size={16}
          style={{ width: "100%" }}
        >
          <Space wrap>
            <Select
              style={{ width: 260 }}
              value={filtro}
              onChange={setFiltro}
              options={[
                { value: "Todas", label: "Todas" },
                { value: "Activa", label: "Activas" },
                { value: "En monitoreo", label: "En monitoreo" },
                { value: "Resuelta", label: "Resueltas" }
              ]}
            />

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                height: 32,
                padding: "0 12px",
                border: "1px solid #26303C",
                background: "#1A222D",
                color: "#E7EBF0",
                colorScheme: "dark",
                borderRadius: 6
              }}
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                height: 32,
                padding: "0 12px",
                border: "1px solid #26303C",
                background: "#1A222D",
                color: "#E7EBF0",
                colorScheme: "dark",
                borderRadius: 6
              }}
            />

            <Button
              onClick={() => {
                setFechaInicio("")
                setFechaFin("")
              }}
            >
              Limpiar fechas
            </Button>

            <Button onClick={cargar} loading={loading}>
              Refrescar
            </Button>
          </Space>

          <Divider style={{ margin: "8px 0" }} />

          <Table
            rowKey="id"
            columns={columnas}
            dataSource={filtradas}
            loading={loading}
            scroll={{ x: 1280 }}
            pagination={{
              pageSize: 8,
              showSizeChanger: false
            }}
          />
        </Space>
      </Card>
    </div>
  )
}