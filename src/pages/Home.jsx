// pages/Home.jsx

import React, { useEffect, useState } from "react"
import { Card } from "antd"

import {
  getInventario
} from "../services/inventarioService"

import {
  getBitacoras
} from "../services/bitacoraService"

export default function Home() {
  const [totalEquipos, setTotalEquipos] = useState(0)
  const [totalBitacoras, setTotalBitacoras] = useState(0)
  const [equiposActivos, setEquiposActivos] = useState(0)

  const cargarDashboard = async () => {
    // Inventario
    const inventario = await getInventario()

    if (inventario.data) {
      setTotalEquipos(inventario.data.length)

      const activos = inventario.data.filter(
        (item) =>
          item.estado?.toLowerCase() === "activo"
      )

      setEquiposActivos(activos.length)
    }

    // Bitácoras
    const bitacoras = await getBitacoras()

    if (bitacoras.data) {
      setTotalBitacoras(bitacoras.data.length)
    }
  }

  useEffect(() => {
    cargarDashboard()
  }, [])

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">
        Dashboard Data Center Casa Pellas - Operadores IT
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <Card className="rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold">
            Equipos Registrados
          </h2>

          <p className="text-4xl mt-4 font-bold">
            {totalEquipos}
          </p>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold">
            Equipos Activos
          </h2>

          <p className="text-4xl mt-4 font-bold">
            {equiposActivos}
          </p>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold">
            Bitácoras Registradas
          </h2>

          <p className="text-4xl mt-4 font-bold">
            {totalBitacoras}
          </p>
        </Card>

      </div>
    </div>
  )
}