// src/pages/Auditoria.jsx

import React, { useEffect, useState } from "react"
import { Card, Table, Tag } from "antd"

export default function Auditoria() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const historial =
      JSON.parse(localStorage.getItem("auditoria")) || []

    setLogs(historial)
  }, [])

  const columnas = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha"
    },
    {
      title: "Usuario",
      dataIndex: "usuario",
      key: "usuario"
    },
    {
      title: "Acción",
      dataIndex: "accion",
      key: "accion"
    },
    {
      title: "Módulo",
      dataIndex: "modulo",
      key: "modulo"
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => (
        <Tag color={estado === "OK" ? "green" : "red"}>
          {estado}
        </Tag>
      )
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Auditoría del Sistema
      </h1>

      <Card className="rounded-2xl shadow-lg">
        <Table
          columns={columnas}
          dataSource={logs}
          rowKey={(record) => record.fecha + record.accion}
          pagination={{
            pageSize: 10
          }}
        />
      </Card>
    </div>
  )
}