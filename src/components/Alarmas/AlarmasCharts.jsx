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
  "#F2555A",
  "#F2A93B",
  "#35D07F"
]

const COLORS_SEVERIDAD = [
  "#F2555A",
  "#33C7D6",
  "#35D07F"
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
              valueStyle={{ color: "#F2555A" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="En Monitoreo"
              value={monitoreo}
              valueStyle={{ color: "#F2A93B" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Resueltas"
              value={resueltas}
              valueStyle={{ color: "#35D07F" }}
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

                <Tooltip contentStyle={{ background: "#1A222D", border: "1px solid #26303C", borderRadius: 8, color: "#E7EBF0" }} itemStyle={{ color: "#E7EBF0" }} />

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

                <Tooltip contentStyle={{ background: "#1A222D", border: "1px solid #26303C", borderRadius: 8, color: "#E7EBF0" }} itemStyle={{ color: "#E7EBF0" }} />

              </PieChart>
            </ResponsiveContainer>

          </Card>
        </Col>

      </Row>
    </>
  )
}