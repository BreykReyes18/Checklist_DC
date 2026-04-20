// pages/Inventario.jsx

import React, { useEffect } from "react"
import { Card, Button } from "antd"

import {
  getInventario,
  deleteInventario
} from "../services/inventarioService"

import { useInventarioStore } from "../store/inventarioStore"

export default function Inventario() {
  const {
    equipos,
    setEquipos,
    eliminarEquipoLocal
  } = useInventarioStore()

  const cargarInventario = async () => {
    const { data, error } = await getInventario()

    if (!error) {
      setEquipos(data)
    }
  }

  const eliminarEquipo = async (id) => {
    await deleteInventario(id)
    eliminarEquipoLocal(id)
  }

  useEffect(() => {
    cargarInventario()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Inventario Data Center
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        {equipos.map((equipo) => (
          <Card
            key={equipo.id}
            className="rounded-2xl shadow-md"
          >
            <h2 className="text-xl font-bold">
              {equipo.nombre_equipo}
            </h2>

            <p><strong>Categoría:</strong> {equipo.categoria}</p>
            <p><strong>Marca:</strong> {equipo.marca}</p>
            <p><strong>Modelo:</strong> {equipo.modelo}</p>
            <p><strong>Rack:</strong> {equipo.ubicacion_rack}</p>
            <p><strong>Estado:</strong> {equipo.estado}</p>

            <Button
              danger
              className="mt-4"
              onClick={() => eliminarEquipo(equipo.id)}
            >
              Eliminar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}