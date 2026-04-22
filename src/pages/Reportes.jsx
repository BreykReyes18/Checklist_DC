import React, { useEffect, useState } from "react"
import {
  Card,
  Button,
  Table,
  Tag,
  DatePicker,
  Select,
  Space
} from "antd"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import dayjs from "dayjs"

import { getBitacoras } from "../services/bitacoraService"

const { RangePicker } = DatePicker

export default function Reportes() {
  const [bitacoras, setBitacoras] = useState([])
  const [filtrados, setFiltrados] = useState([])
  const [tipoPDF, setTipoPDF] = useState("diario")
  const [seleccionadas, setSeleccionadas] = useState([])

  // =============================
  // CARGAR DATOS
  // =============================
  const cargar = async () => {
    const { data } = await getBitacoras()
    setBitacoras(data || [])
    setFiltrados(data || [])
  }

  useEffect(() => {
    cargar()
  }, [])

  // =============================
  // FILTRO FECHAS
  // =============================
  const filtrar = (fechas) => {
    if (!fechas) {
      setFiltrados(bitacoras)
      return
    }

    const inicio = dayjs(fechas[0]).format("YYYY-MM-DD")
    const fin = dayjs(fechas[1]).format("YYYY-MM-DD")

    const data = bitacoras.filter(
      (b) => b.fecha >= inicio && b.fecha <= fin
    )

    setFiltrados(data)
  }

  // =============================
  // PDF
  // =============================
  const generarPDF = async () => {
    const doc = new jsPDF()

    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width

    // 👉 SI HAY SELECCIÓN, USA ESO
    const dataPDF =
      seleccionadas.length > 0
        ? filtrados.filter((b) => seleccionadas.includes(b.id))
        : filtrados

    // =========================
    // LOGO GRANDE
    // =========================
    try {
      const img = new Image()
      img.src = "/logo03.png"

      await new Promise((resolve) => {
        img.onload = resolve
      })

      doc.addImage(img, "WEBP", 130, 8, 70, 20)
    } catch (e) {
      console.log("No se pudo cargar el logo")
    }

    // =========================
    // ENCABEZADO
    // =========================
    doc.setFontSize(16)
    doc.text("CASA PELLAS", 14, 15)

    doc.setFontSize(12)
    doc.text("CHECKLIST OPERATIVO DATA CENTER", 14, 22)

    doc.setFontSize(10)
    doc.text(`Fecha: ${dayjs().format("YYYY-MM-DD")}`, 14, 28)

    doc.text(`Tipo de Reporte: ${tipoPDF.toUpperCase()}`, 14, 34)

    // =========================
    // TABLA
    // =========================
    autoTable(doc, {
      startY: 40,
      head: [[
        "Fecha",
        "Responsable",
        "UPS",
        "APC",
        "Switch",
        "Alarmas",
        "IBM",
        "Estado"
      ]],
      body: dataPDF.map((b) => [
        b.fecha,
        b.responsable,
        b.ups_revisada ? "OK" : "X",
        b.apc_revisado ? "OK" : "X",
        b.switch_core ? "OK" : "X",
        b.alarmas ? "OK" : "X",
        b.ibm_revisado ? "OK" : "X",
        b.checklist_completo ? "Completo" : "Pendiente"
      ])
    })

    let y = doc.lastAutoTable.finalY + 10

    // =========================
    // OBSERVACIONES
    // =========================
    doc.text("OBSERVACIONES GENERALES:", 14, y)
    y += 6

    dataPDF.forEach((b) => {
      doc.text(
        `- ${b.observacion || "Sin observaciones"}`,
        14,
        y
      )
      y += 5
    })

    // =========================
    // FIRMAS CENTRADAS
    // =========================
    const footerY = pageHeight - 25

    doc.text("_________________________", pageWidth / 2 - 70, footerY)
    doc.text("Firma Operador", pageWidth / 2 - 60, footerY + 5)

    doc.text("_________________________", pageWidth / 2 + 10, footerY)
    doc.text("Firma Supervisor", pageWidth / 2 + 20, footerY + 5)

    // =========================
    // GUARDAR PDF
    // =========================
    doc.save("Reporte_DataCenter.pdf")
  }

  // =============================
  // COLUMNAS TABLA
  // =============================
  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha"
    },
    {
      title: "Responsable",
      dataIndex: "responsable"
    },
    {
      title: "Estado",
      dataIndex: "checklist_completo",
      render: (v) =>
        v ? (
          <Tag color="green">Completo</Tag>
        ) : (
          <Tag color="orange">Pendiente</Tag>
        )
    }
  ]

  // =============================
  // UI
  // =============================
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Reportes Data Center
      </h1>

      <Card>
        <Space className="mb-4" wrap>
          <RangePicker onChange={filtrar} />

          <Select
            value={tipoPDF}
            onChange={setTipoPDF}
            style={{ width: 200 }}
            options={[
              { value: "diario", label: "Reporte Diario" },
              { value: "ejecutivo", label: "Reporte Ejecutivo" },
              { value: "operador", label: "Por Operador" }
            ]}
          />

          <Button type="primary" onClick={generarPDF}>
            Generar PDF
          </Button>
        </Space>

        <Table
          rowKey="id"
          dataSource={filtrados}
          columns={columns}
          rowSelection={{
            selectedRowKeys: seleccionadas,
            onChange: (keys) => setSeleccionadas(keys)
          }}
        />
      </Card>
    </div>
  )
}