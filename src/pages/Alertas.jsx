// src/pages/Alertas.jsx

import React, { useEffect, useState } from "react"
import { Card, Table, Tag } from "antd"

export default function Alertas() {
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    const data = [
      {
        id: 1,
        equipo: "UPS Principal",
        tipo: "Crítica",
        mensaje: "Batería baja detectada",
        fecha: "20/04/2026 08:30"
      },
      {
        id: 2,
        equipo: "APC InRow 02",
        tipo: "Media",
        mensaje: "Temperatura elevada",
        fecha: "20/04/2026 09:10"
      },
      {
        id: 3,
        equipo: "Switch Core",
        tipo: "Baja",
        mensaje: "Revisión preventiva pendiente",
        fecha: "20/04/2026 10:15"
      }
    ]

    setAlertas(data)
  }, [])

  const columnas = [
    {
      title: "Equipo",
      dataIndex: "equipo",
      key: "equipo"
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo) => {
        let color = "blue"

        if (tipo === "Crítica") color = "red"
        if (tipo === "Media") color = "orange"
        if (tipo === "Baja") color = "green"

        return <Tag color={color}>{tipo}</Tag>
      }
    },
    {
      title: "Mensaje",
      dataIndex: "mensaje",
      key: "mensaje"
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha"
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Centro de Alertas
      </h1>

      <Card className="rounded-2xl shadow-lg">
        <Table
          columns={columnas}
          dataSource={alertas}
          rowKey="id"
          pagination={{
            pageSize: 8
          }}
        />
      </Card>
    </div>
  )
}