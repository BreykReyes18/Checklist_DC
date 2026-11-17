import React, { useEffect, useMemo, useState } from "react"
import { Card, Button, Table, Tag, DatePicker, Space, message } from "antd"
import dayjs from "dayjs"

import { getBitacoras } from "../services/bitacoraService"
import { getInventario } from "../services/inventarioService"
import {
  generarBitacorasPdf,
  resumenBitacora
} from "../utils/bitacoraPdf"

const { RangePicker } = DatePicker

const soloFecha = (f) => String(f || "").slice(0, 10)

const formatear = (f) => {
  const [dia, hora] = String(f || "").split(" ")
  const [y, m, d] = dia.split("-")
  if (!y || !m || !d) return f || "-"
  return hora ? `${d}/${m}/${y} ${hora}` : `${d}/${m}/${y}`
}

export default function Reportes() {
  const [bitacoras, setBitacoras] = useState([])
  const [inventario, setInventario] = useState([])
  const [rango, setRango] = useState(null)
  const [seleccionadas, setSeleccionadas] = useState([])
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    let vigente = true
    Promise.all([getBitacoras(), getInventario()]).then(([b, i]) => {
      if (!vigente) return
      setBitacoras(b.data || [])
      setInventario(i.data || [])
    })
    return () => {
      vigente = false
    }
  }, [])

  const filtradas = useMemo(() => {
    if (!rango) return bitacoras
    const inicio = dayjs(rango[0]).format("YYYY-MM-DD")
    const fin = dayjs(rango[1]).format("YYYY-MM-DD")
    return bitacoras.filter((b) => {
      const f = soloFecha(b.fecha)
      return f >= inicio && f <= fin
    })
  }, [bitacoras, rango])

  const descargar = async (lista) => {
    if (!lista.length) {
      message.warning("No hay bitácoras para descargar")
      return
    }
    setGenerando(true)
    try {
      await generarBitacorasPdf(lista, inventario)
    } finally {
      setGenerando(false)
    }
  }

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      render: formatear
    },
    { title: "Responsable", dataIndex: "responsable" },
    {
      title: "Temp.",
      dataIndex: "temperatura",
      render: (t) => (t ? `${t} °C` : "-")
    },
    {
      title: "Verificados",
      key: "ver",
      render: (_, b) => resumenBitacora(b, inventario).VERIFICADO
    },
    {
      title: "Pendientes",
      key: "pen",
      render: (_, b) => resumenBitacora(b, inventario).PENDIENTE
    },
    {
      title: "Alertas",
      key: "ale",
      render: (_, b) => {
        const n = resumenBitacora(b, inventario).ALERTA
        return n > 0 ? <Tag color="red">{n}</Tag> : 0
      }
    },
    {
      title: "PDF",
      key: "pdf",
      render: (_, b) => (
        <Button size="small" onClick={() => descargar([b])}>
          Descargar
        </Button>
      )
    }
  ]

  const elegidas = filtradas.filter((b) => seleccionadas.includes(b.id))

  return (
    <div>
      <h1 className="mb-6">Reportes Data Center</h1>

      <Card>
        <Space className="mb-4" wrap>
          <RangePicker onChange={setRango} />

          <Button
            type="primary"
            loading={generando}
            onClick={() =>
              descargar(elegidas.length ? elegidas : filtradas)
            }
          >
            {elegidas.length
              ? `Descargar PDF (${elegidas.length} seleccionadas)`
              : "Descargar PDF de todas"}
          </Button>
        </Space>

        <Table
          rowKey="id"
          dataSource={filtradas}
          columns={columns}
          rowSelection={{
            selectedRowKeys: seleccionadas,
            onChange: setSeleccionadas
          }}
        />
      </Card>
    </div>
  )
}
