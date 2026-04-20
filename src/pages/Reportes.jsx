// pages/Reportes.jsx

import React, { useEffect, useState } from "react"
import { Table, Card, Input, Button } from "antd"

import {
  getBitacoras
} from "../services/bitacoraService"

export default function Reportes() {
  const [bitacoras, setBitacoras] = useState([])
  const [busqueda, setBusqueda] = useState("")

  const cargarBitacoras = async () => {
    const { data, error } = await getBitacoras()

    if (!error) {
      setBitacoras(data)
    }
  }

  useEffect(() => {
    cargarBitacoras()
  }, [])

  const datosFiltrados = bitacoras.filter((item) =>
    item.responsable
      ?.toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  const columnas = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha"
    },
    {
      title: "Responsable",
      dataIndex: "responsable",
      key: "responsable"
    },
    {
      title: "Temperatura",
      dataIndex: "temperatura",
      key: "temperatura"
    },
    {
      title: "Energía",
      dataIndex: "energia",
      key: "energia"
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
        Historial de Bitácoras
      </h1>

      <Card className="rounded-2xl shadow-lg">

        <div className="flex gap-4 mb-6">

          <Input
            placeholder="Buscar por responsable..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />

          <Button onClick={cargarBitacoras}>
            Actualizar
          </Button>

        </div>

        <Table
          columns={columnas}
          dataSource={datosFiltrados}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />

      </Card>
    </div>
  )
}