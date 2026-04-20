// src/pages/Configuracion.jsx

import React, { useState, useEffect } from "react"
import { Card, Input, Button, Switch } from "antd"

export default function Configuracion() {
  const [config, setConfig] = useState({
    nombreEmpresa: "",
    correoAdmin: "",
    alertasActivas: true,
    modoOscuro: false
  })

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("configuracion"))

    if (saved) {
      setConfig(saved)
    }
  }, [])

  const guardarConfiguracion = () => {
    localStorage.setItem(
      "configuracion",
      JSON.stringify(config)
    )

    alert("Configuración guardada correctamente")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Configuración del Sistema
      </h1>

      <Card className="rounded-2xl shadow-lg">

        <div className="space-y-5">

          <Input
            placeholder="Nombre de la empresa"
            value={config.nombreEmpresa}
            onChange={(e) =>
              setConfig({
                ...config,
                nombreEmpresa: e.target.value
              })
            }
          />

          <Input
            placeholder="Correo Administrador"
            value={config.correoAdmin}
            onChange={(e) =>
              setConfig({
                ...config,
                correoAdmin: e.target.value
              })
            }
          />

          <div className="flex justify-between items-center">
            <span>Alertas activas</span>

            <Switch
              checked={config.alertasActivas}
              onChange={(value) =>
                setConfig({
                  ...config,
                  alertasActivas: value
                })
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <span>Modo oscuro</span>

            <Switch
              checked={config.modoOscuro}
              onChange={(value) =>
                setConfig({
                  ...config,
                  modoOscuro: value
                })
              }
            />
          </div>

          <Button
            type="primary"
            onClick={guardarConfiguracion}
          >
            Guardar Configuración
          </Button>

        </div>

      </Card>
    </div>
  )
}