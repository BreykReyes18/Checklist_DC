import React, { useEffect } from "react"

import {
  Card,
  Table,
  Select,
  Tag,
  Button,
  message
} from "antd"

import {
  getAlarmas,
  updateAlarma,
  resolverAlarma
} from "../services/centroAlarmasService"

import { useCentroAlarmasStore } from "../store/centroAlarmasStore"

import AlarmasCharts from "../components/Alarmas/AlarmasCharts"

export default function CentroAlarmas() {

  const {
    alarmas,
    filtro,
    setAlarmas,
    setFiltro
  } = useCentroAlarmasStore()

  const cargar = async () => {

    const { data, error } =
      await getAlarmas()

    if (error) {
      message.error("Error cargando alarmas")
      return
    }

    setAlarmas(data || [])
  }

  useEffect(() => {
    cargar()
  }, [])

  const cambiarEstado = async (
    alarma,
    nuevoEstado
  ) => {

    const { error } =
      await updateAlarma(
        alarma.id,
        {
          estado: nuevoEstado
        }
      )

    if (error) {
      message.error("Error actualizando")
      return
    }

    cargar()
  }

  const resolver = async (id) => {

    const { error } =
      await resolverAlarma(id)

    if (error) {
      message.error("Error resolviendo")
      return
    }

    message.success("Alarma resuelta")

    cargar()
  }

  const colorEstado = (estado) => {

    if (estado === "Activa")
      return "red"

    if (estado === "En monitoreo")
      return "gold"

    if (estado === "Resuelta")
      return "green"

    return "default"
  }

  const colorSeveridad = (s) => {

    if (s === "Crítica")
      return "red"

    if (s === "Media")
      return "blue"

    if (s === "Baja")
      return "green"

    return "default"
  }

  const formatDuracion = (
    minutos
  ) => {

    if (!minutos) return "-"

    const dias =
      Math.floor(minutos / 1440)

    const horas =
      Math.floor(
        (minutos % 1440) / 60
      )

    const mins =
      minutos % 60

    return `${dias}d ${horas}h ${mins}m`
  }

  const filtradas =
    filtro === "Todas"
      ? alarmas
      : alarmas.filter(
          (a) => a.estado === filtro
        )

  const activas =
    alarmas.filter(
      (a) => a.estado === "Activa"
    ).length

  const monitoreo =
    alarmas.filter(
      (a) => a.estado === "En monitoreo"
    ).length

  const resueltas =
    alarmas.filter(
      (a) => a.estado === "Resuelta"
    ).length

  const criticas =
    alarmas.filter(
      (a) => a.severidad === "Crítica"
    ).length

  const medias =
    alarmas.filter(
      (a) => a.severidad === "Media"
    ).length

  const bajas =
    alarmas.filter(
      (a) => a.severidad === "Baja"
    ).length

  const columnas = [

    {
      title: "Equipo",
      dataIndex: "equipo"
    },

    {
      title: "Categoría",
      dataIndex: "categoria"
    },

    {
      title: "Severidad",
      dataIndex: "severidad",

      render: (v) => (
        <Tag color={colorSeveridad(v)}>
          {v}
        </Tag>
      )
    },

    {
      title: "Estado",
      dataIndex: "estado",

      render: (v) => (
        <Tag color={colorEstado(v)}>
          {v}
        </Tag>
      )
    },

    {
      title: "Responsable",
      dataIndex: "responsable"
    },

    {
      title: "Inicio",

      dataIndex: "fecha_inicio",

      render: (v) =>
        v
          ? new Date(v)
              .toLocaleString()
          : "-"
    },

    {
      title: "Fin",

      dataIndex:
        "fecha_resolucion",

      render: (v) =>
        v
          ? new Date(v)
              .toLocaleString()
          : "-"
    },

    {
      title: "Duración",

      dataIndex:
        "duracion_minutos",

      render: formatDuracion
    },

    {
      title: "Acciones",

      render: (_, record) => (

        <div className="flex gap-2">

          {
            record.estado !==
              "Resuelta" && (
              <Select
                size="small"
                style={{
                  width: 140
                }}
                value={record.estado}
                onChange={(v) =>
                  cambiarEstado(
                    record,
                    v
                  )
                }
                options={[
                  {
                    value:
                      "Activa",
                    label:
                      "Activa"
                  },
                  {
                    value:
                      "En monitoreo",
                    label:
                      "En monitoreo"
                  }
                ]}
              />
            )
          }

          {
            record.estado !==
              "Resuelta" && (
              <Button
                type="primary"
                size="small"
                onClick={() =>
                  resolver(
                    record.id
                  )
                }
              >
                Resolver
              </Button>
            )
          }

        </div>
      )
    }
  ]

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Centro de Alarmas
      </h1>

      <AlarmasCharts
        activas={activas}
        monitoreo={monitoreo}
        resueltas={resueltas}
        criticas={criticas}
        medias={medias}
        bajas={bajas}
      />

      <Card className="mt-6">

        <Select
          style={{
            width: 250,
            marginBottom: 16
          }}
          value={filtro}
          onChange={setFiltro}
          options={[
            {
              value: "Todas",
              label: "Todas"
            },
            {
              value: "Activa",
              label: "Activas"
            },
            {
              value: "En monitoreo",
              label:
                "En monitoreo"
            },
            {
              value: "Resuelta",
              label:
                "Resueltas"
            }
          ]}
        />

        <Table
          rowKey="id"
          columns={columnas}
          dataSource={filtradas}
        />

      </Card>

    </div>
  )
}