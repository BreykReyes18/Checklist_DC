// src/pages/Bitacora.jsx

import React from "react"
import { Card, Input, Button, Divider } from "antd"
import { useBitacoraStore } from "../store/bitacoraStore"
import { guardarBitacora } from "../services/bitacoraService"

export default function Bitacora() {
  const {
    bitacora,
    actualizarCampo,
    resetBitacora
  } = useBitacoraStore()

  // ==============================
  // GUARDAR
  // ==============================
  const guardar = async () => {
    if (!bitacora.responsable) {
      alert("Responsable es obligatorio")
      return
    }

    const { error } = await guardarBitacora(bitacora)

    if (error) {
      alert("Error guardando")
      return
    }

    alert("Bitácora guardada correctamente")
    resetBitacora()
  }

  // ==============================
  // CHECK COMPONENT
  // ==============================
  const Check = ({ campo, label }) => (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={!!bitacora[campo]}
        onChange={(e) =>
          actualizarCampo(campo, e.target.checked)
        }
      />
      {label}
    </label>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Bitácora Data Center
      </h1>

      <Card className="rounded-2xl shadow-lg">

        {/* DATOS GENERALES */}
        <div className="grid md:grid-cols-2 gap-4">

          <Input
            placeholder="Responsable"
            value={bitacora.responsable}
            onChange={(e) =>
              actualizarCampo("responsable", e.target.value)
            }
          />

          <Input
            placeholder="Temperatura (°C)"
            value={bitacora.temperatura}
            onChange={(e) =>
              actualizarCampo("temperatura", e.target.value)
            }
          />

          <Input
            placeholder="Estado de Energía (Normal / Planta / Falla)"
            value={bitacora.energia}
            onChange={(e) =>
              actualizarCampo("energia", e.target.value)
            }
          />

        </div>

        <Input.TextArea
          rows={3}
          className="mt-4"
          placeholder="Observaciones"
          value={bitacora.observacion}
          onChange={(e) =>
            actualizarCampo("observacion", e.target.value)
          }
        />

        {/* ============================= */}
        {/* INFRAESTRUCTURA ELÉCTRICA */}
        {/* ============================= */}

        <Divider>Infraestructura Eléctrica</Divider>

        <div className="grid md:grid-cols-2 gap-2">
          <Check campo="ups_revisada" label="UPS" />
          <Check campo="apc_revisado" label="APC InRow" />
          <Check campo="energia_comercial" label="Energía Comercial" />
          <Check campo="planta_electrica" label="Planta Eléctrica" />
          <Check campo="generador" label="Generador" />
        </div>

        {/* ============================= */}
        {/* INFRAESTRUCTURA TI */}
        {/* ============================= */}

        <Divider>Infraestructura TI</Divider>

        <div className="grid md:grid-cols-2 gap-2">
          <Check campo="switch_core" label="Switch Core" />
          <Check campo="ibm_revisado" label="Servidor IBM" />
          <Check campo="red_wan_lan" label="Red WAN / LAN" />
        </div>

        {/* ============================= */}
        {/* CLIMATIZACIÓN */}
        {/* ============================= */}

        <Divider>Climatización</Divider>

        <div className="grid md:grid-cols-2 gap-2">
          <Check campo="aire_acondicionado" label="Aire Acondicionado" />
          <Check campo="humedad_ok" label="Humedad OK" />
        </div>

        {/* ============================= */}
        {/* SEGURIDAD */}
        {/* ============================= */}

        <Divider>Seguridad Física</Divider>

        <div className="grid md:grid-cols-2 gap-2">
          <Check campo="alarmas" label="Alarmas" />
          <Check campo="control_acceso" label="Control de Acceso" />
          <Check campo="sensores_humo" label="Sensores de Humo" />
          <Check campo="extintores" label="Extintores" />
          <Check campo="puertas_seguridad" label="Puertas de Seguridad" />
          <Check campo="panel_incendios" label="Panel Contra Incendios" />
        </div>

        {/* BOTONES */}

        <div className="flex gap-4 mt-6">
          <Button type="primary" onClick={guardar}>
            Guardar Bitácora
          </Button>

          <Button onClick={resetBitacora}>
            Limpiar
          </Button>
        </div>

      </Card>
    </div>
  )
}