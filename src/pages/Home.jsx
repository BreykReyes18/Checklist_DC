// pages/Home.jsx

import React, { useEffect, useState } from "react"

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

  const stats = [
    { n: totalEquipos, l: "Equipos registrados", c: "" },
    { n: equiposActivos, l: "Equipos activos", c: "accent-ok" },
    { n: totalBitacoras, l: "Bitácoras registradas", c: "" }
  ]

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Dashboard Data Center Casa Pellas</h2>
          <p>Operadores IT</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.l} className={`stat-card ${s.c}`}>
            <div className="num">{s.n}</div>
            <div className="lbl">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
