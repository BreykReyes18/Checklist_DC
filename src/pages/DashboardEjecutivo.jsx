import React, { useEffect, useState } from "react"
import { Card, Row, Col, Statistic } from "antd"
import {
  CheckCircleOutlined,
  WarningOutlined
} from "@ant-design/icons"

import { getBitacoras } from "../services/bitacoraService"

export default function DashboardEjecutivo() {
  const [bitacoras, setBitacoras] = useState([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    const { data } = await getBitacoras()
    setBitacoras(data || [])
  }

  const total = bitacoras.length
  const completas = bitacoras.filter(b => b.checklist_completo).length
  const pendientes = total - completas

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard Ejecutivo
      </h1>

      <Row gutter={16}>

        <Col span={8}>
          <Card>
            <Statistic title="Total" value={total} />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Completas"
              value={completas}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Pendientes"
              value={pendientes}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>

      </Row>

    </div>
  )
}