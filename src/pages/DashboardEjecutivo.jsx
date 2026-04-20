// src/pages/DashboardEjecutivo.jsx

import React from "react"
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag
} from "antd"

import {
  WarningOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ThunderboltOutlined
} from "@ant-design/icons"

export default function DashboardEjecutivo() {
  const resumen = {
    equiposOperativos: 42,
    alarmasActivas: 5,
    mantenimientosPendientes: 7,
    incidentesEscalados: 3,
    disponibilidad: 96
  }

  const incidentesRecientes = [
    {
      id: 1,
      equipo: "UPS Principal",
      incidente: "Batería baja",
      estado: "Abierto"
    },
    {
      id: 2,
      equipo: "Switch Core",
      incidente: "Latencia elevada",
      estado: "En Proceso"
    },
    {
      id: 3,
      equipo: "APC InRow 02",
      incidente: "Temperatura alta",
      estado: "Monitoreo"
    }
  ]

  const columnas = [
    {
      title: "Equipo",
      dataIndex: "equipo",
      key: "equipo"
    },
    {
      title: "Incidente",
      dataIndex: "incidente",
      key: "incidente"
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        let color = "blue"

        if (estado === "Abierto") color = "red"
        if (estado === "En Proceso") color = "orange"
        if (estado === "Monitoreo") color = "blue"
        if (estado === "Resuelto") color = "green"

        return <Tag color={color}>{estado}</Tag>
      }
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <Row gutter={[16, 16]}>

        <Col xs={24} md={12} lg={6}>
          <Card className="rounded-2xl shadow-lg">
            <Statistic
              title="Equipos Operativos"
              value={resumen.equiposOperativos}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className="rounded-2xl shadow-lg">
            <Statistic
              title="Alarmas Activas"
              value={resumen.alarmasActivas}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className="rounded-2xl shadow-lg">
            <Statistic
              title="Mantenimientos"
              value={resumen.mantenimientosPendientes}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className="rounded-2xl shadow-lg">
            <Statistic
              title="Escalamientos"
              value={resumen.incidentesEscalados}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>

      </Row>

      <Card className="rounded-2xl shadow-lg mt-6">
        <h2 className="text-xl font-bold mb-4">
          Disponibilidad General del Data Center
        </h2>

        <Progress
          percent={resumen.disponibilidad}
          status="active"
        />
      </Card>

      <Card className="rounded-2xl shadow-lg mt-6">
        <h2 className="text-xl font-bold mb-4">
          Incidentes Recientes
        </h2>

        <Table
          columns={columnas}
          dataSource={incidentesRecientes}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}