import React from "react"
import {
  Card,
  Statistic,
  Row,
  Col
} from "antd"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const COLORS_ESTADO = [
  "#ef4444",
  "#facc15",
  "#22c55e"
]

const COLORS_SEVERIDAD = [
  "#ef4444",
  "#38bdf8",
  "#22c55e"
]

export default function AlarmasCharts({
  activas,
  monitoreo,
  resueltas,
  criticas,
  medias,
  bajas
}) {

  const estadoData = [
    { name: "Activas", value: activas },
    { name: "Monitoreo", value: monitoreo },
    { name: "Resueltas", value: resueltas }
  ]

  const severidadData = [
    { name: "Crítica", value: criticas },
    { name: "Media", value: medias },
    { name: "Baja", value: bajas }
  ]

  return (
    <>
      <Row gutter={16} className="mb-6">

        <Col span={8}>
          <Card>
            <Statistic
              title="Activas"
              value={activas}
              valueStyle={{ color: "#ef4444" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="En Monitoreo"
              value={monitoreo}
              valueStyle={{ color: "#facc15" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Resueltas"
              value={resueltas}
              valueStyle={{ color: "#22c55e" }}
            />
          </Card>
        </Col>

      </Row>

      <Row gutter={16}>

        <Col span={12}>
          <Card title="Estado de Alarmas">

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>

                <Pie
                  data={estadoData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                >
                  {estadoData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS_ESTADO[index]}
                    />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

          </Card>
        </Col>

        <Col span={12}>
          <Card title="Severidad">

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>

                <Pie
                  data={severidadData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                >
                  {severidadData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS_SEVERIDAD[index]}
                    />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

          </Card>
        </Col>

      </Row>
    </>
  )
}