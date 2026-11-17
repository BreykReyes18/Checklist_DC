// Generador del PDF de la bitacora (diseño: resumen primero, alertas al final)

import jsPDF from "jspdf"

const AZUL = [30, 58, 138]
const ROJO = [214, 43, 43]
const TEXTO = [17, 24, 39]
const GRIS = [75, 85, 99]
const LINEA = [229, 231, 235]

const ESTILOS = {
  VERIFICADO: { texto: [20, 96, 45], fondo: [231, 244, 234], etiqueta: "Verificado" },
  PENDIENTE: { texto: [55, 65, 81], fondo: [238, 240, 243], etiqueta: "Pendiente" },
  ALERTA: { texto: [165, 34, 26], fondo: [253, 236, 234], etiqueta: "Alerta" }
}

const MARGEN = 15
const ANCHO = 210
const ALTO = 297
const COL_GAP = 8
const COL_W = (ANCHO - MARGEN * 2 - COL_GAP) / 2

const cargarLogo = (src) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })

const formatearFecha = (valor) => {
  if (!valor) return "-"
  const [f, h] = String(valor).split(" ")
  const [y, m, d] = f.split("-")
  if (!y || !m || !d) return valor
  return h ? `${d}/${m}/${y} ${h}` : `${d}/${m}/${y}`
}

const estadoDe = (extra) => {
  if (!extra) return "PENDIENTE"
  if (extra.alerta) return "ALERTA"
  if (extra.revisado) return "VERIFICADO"
  return "PENDIENTE"
}

// Une el inventario con el estado de cada equipo y guarda nombre y categoria,
// asi el PDF de una bitacora guardada es siempre el mismo aunque cambie el inventario
export const armarEquiposExtra = (inventario = [], extras = []) => {
  const porId = new Map(extras.map((e) => [e.id, e]))
  const vigentes = inventario.map((eq) => ({
    revisado: false,
    alerta: false,
    ...(porId.get(eq.id) || {}),
    id: eq.id,
    nombre_equipo: eq.nombre_equipo,
    categoria: eq.categoria || "Otros"
  }))
  const ids = new Set(inventario.map((e) => e.id))
  const historicos = extras.filter((e) => e.nombre_equipo && !ids.has(e.id))
  return [...vigentes, ...historicos]
}

const resolverEquipos = (bitacora, inventario) => {
  const copia = (bitacora.equipos_extra || []).filter((e) => e.nombre_equipo)
  if (copia.length) {
    return copia.map((e) => ({
      id: e.id,
      nombre_equipo: e.nombre_equipo,
      categoria: e.categoria
    }))
  }
  return inventario
}

export const resumenBitacora = (bitacora, inventario = []) => {
  const equipos = resolverEquipos(bitacora, inventario)
  const extras = bitacora.equipos_extra || []
  const r = { VERIFICADO: 0, PENDIENTE: 0, ALERTA: 0 }
  equipos.forEach((eq) => {
    r[estadoDe(extras.find((x) => x.id === eq.id))] += 1
  })
  return r
}

const dibujarBitacora = (doc, bitacora, inventario, logo) => {
  const equipos = resolverEquipos(bitacora, inventario)
  const extras = bitacora.equipos_extra || []

  const agrupados = equipos.reduce((acc, eq) => {
    const cat = eq.categoria || "Otros"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(eq)
    return acc
  }, {})

  // Numeracion de alertas en orden de aparicion
  const alertas = []
  const numeroAlerta = {}
  Object.values(agrupados).flat().forEach((eq) => {
    const ex = extras.find((x) => x.id === eq.id)
    if (ex?.alerta) {
      alertas.push({ eq, ex })
      numeroAlerta[eq.id] = alertas.length
    }
  })

  const conteo = { VERIFICADO: 0, PENDIENTE: 0, ALERTA: 0 }
  equipos.forEach((eq) => {
    conteo[estadoDe(extras.find((x) => x.id === eq.id))] += 1
  })
  const revisados = conteo.VERIFICADO + conteo.ALERTA

  // -------- Encabezado --------
  if (logo) {
    const h = 14
    doc.addImage(logo, "PNG", MARGEN, 12, h * (logo.width / logo.height), h)
  }

  doc.setFontSize(9)
  const datos = [
    ["Fecha:", formatearFecha(bitacora.fecha)],
    ["Responsable:", bitacora.responsable || "-"],
    ["Temperatura:", bitacora.temperatura ? `${bitacora.temperatura} °C` : "-"]
  ]
  datos.forEach(([k, v], i) => {
    const y = 14 + i * 4.6
    doc.setFont("helvetica", "bold")
    const wv = doc.getTextWidth(v)
    doc.text(v, ANCHO - MARGEN, y, { align: "right" })
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...GRIS)
    doc.text(k, ANCHO - MARGEN - wv - 1.5, y, { align: "right" })
    doc.setTextColor(...TEXTO)
  })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(19)
  doc.setTextColor(...AZUL)
  doc.text("Bitácora Data Center", MARGEN, 38)
  doc.setFillColor(...ROJO)
  doc.rect(MARGEN, 41, 17, 0.9, "F")

  // -------- Tarjetas resumen --------
  const tarjetas = [
    { n: revisados, t: "Equipos revisados", borde: [203, 213, 225], fondo: [248, 250, 252], color: TEXTO },
    { n: conteo.VERIFICADO, t: "Verificados", borde: [183, 223, 194], fondo: [231, 244, 234], color: [20, 96, 45] },
    { n: conteo.PENDIENTE, t: "Pendientes", borde: [203, 213, 225], fondo: [238, 240, 243], color: [55, 65, 81] },
    { n: conteo.ALERTA, t: "Con alerta", borde: [242, 184, 178], fondo: [253, 236, 234], color: [165, 34, 26] }
  ]
  const cw = (ANCHO - MARGEN * 2 - 3 * 3) / 4
  tarjetas.forEach((c, i) => {
    const x = MARGEN + i * (cw + 3)
    doc.setFillColor(...c.fondo)
    doc.setDrawColor(...c.borde)
    doc.roundedRect(x, 47, cw, 17, 1.5, 1.5, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(...c.color)
    doc.text(String(c.n), x + 3.5, 56.5)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...TEXTO)
    doc.text(c.t, x + 3.5, 61.5)
  })

  // -------- Categorias en dos columnas --------
  const filaH = 6.2
  const tituloH = 7
  const limiteY = ALTO - 62
  let y0 = 71
  let col = 0
  let y = y0

  const pintarPill = (x, yy, estado) => {
    const e = ESTILOS[estado]
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    const w = doc.getTextWidth(e.etiqueta) + 5
    doc.setFillColor(...e.fondo)
    doc.roundedRect(x - w, yy - 3.4, w, 4.6, 2.3, 2.3, "F")
    doc.setTextColor(...e.texto)
    doc.text(e.etiqueta, x - w / 2, yy, { align: "center" })
  }

  const bloques = Object.entries(agrupados).map(([cat, items]) => ({
    cat,
    items,
    alto: tituloH + items.length * filaH + 3
  }))
  const total = bloques.reduce((s, b) => s + b.alto, 0)
  const objetivo = Math.min(total / 2, limiteY - y0)

  let altoCol = 0
  let finMax = y0

  bloques.forEach((blq) => {
    // Pasa a la segunda columna al llegar a la mitad; a otra pagina si no cabe
    if (col === 0 && altoCol > 0 && altoCol + blq.alto / 2 > objetivo) {
      col = 1
      altoCol = 0
    }
    if (y0 + altoCol + blq.alto > limiteY && altoCol > 0) {
      if (col === 0) {
        col = 1
      } else {
        doc.addPage()
        col = 0
        y0 = 20
        finMax = y0
      }
      altoCol = 0
    }
    y = y0 + altoCol
    const x = MARGEN + col * (COL_W + COL_GAP)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(...AZUL)
    doc.text(blq.cat.toUpperCase(), x, y)
    doc.setDrawColor(...AZUL)
    doc.setLineWidth(0.5)
    doc.line(x, y + 1.6, x + COL_W, y + 1.6)
    y += tituloH

    blq.items.forEach((eq) => {
      const ex = extras.find((z) => z.id === eq.id)
      const estado = estadoDe(ex)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9.5)
      doc.setTextColor(...TEXTO)
      doc.text(eq.nombre_equipo || "-", x, y, { maxWidth: COL_W - 28 })

      if (numeroAlerta[eq.id]) {
        const w = doc.getTextWidth(eq.nombre_equipo || "")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7)
        doc.setTextColor(...ESTILOS.ALERTA.texto)
        doc.text(String(numeroAlerta[eq.id]), x + Math.min(w, COL_W - 28) + 0.8, y - 1.6)
      }

      pintarPill(x + COL_W, y, estado)

      doc.setDrawColor(...LINEA)
      doc.setLineWidth(0.2)
      doc.line(x, y + 2, x + COL_W, y + 2)
      y += filaH
    })
    altoCol += blq.alto
    finMax = Math.max(finMax, y0 + altoCol)
  })

  // -------- Bloques finales (notas, observaciones, firmas) --------
  let yb = finMax + 2

  const lineasObs = doc.splitTextToSize(bitacora.observacion || "-", ANCHO - MARGEN * 2 - 10)
  const alturaNotas = alertas.length
    ? 9 + alertas.reduce((s, a) => {
        const t = `${numeroAlerta[a.eq.id]}   ${a.eq.nombre_equipo} - Severidad ${a.ex.severidad || "Media"} - ${a.ex.estado || "Activa"}${a.ex.observacion ? ": " + a.ex.observacion : ""}`
        return s + doc.splitTextToSize(t, ANCHO - MARGEN * 2 - 8).length * 4.2
      }, 0)
    : 0
  const alturaObs = 10 + Math.max(lineasObs.length, 3) * 4.2
  const necesario = alturaNotas + alturaObs + 8 + 28

  if (yb + necesario > ALTO - 15) {
    doc.addPage()
    yb = 20
  }

  if (alertas.length) {
    doc.setFillColor(254, 245, 244)
    doc.setDrawColor(242, 184, 178)
    doc.setLineWidth(0.3)
    doc.roundedRect(MARGEN, yb, ANCHO - MARGEN * 2, alturaNotas, 1.5, 1.5, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(...ESTILOS.ALERTA.texto)
    doc.text("NOTAS DE ALERTA", MARGEN + 4, yb + 5.5)

    let ya = yb + 10.5
    alertas.forEach((a) => {
      const n = numeroAlerta[a.eq.id]
      const t = `${a.eq.nombre_equipo} - Severidad ${a.ex.severidad || "Media"} - ${a.ex.estado || "Activa"}${a.ex.observacion ? ": " + a.ex.observacion : ""}`
      const lineas = doc.splitTextToSize(t, ANCHO - MARGEN * 2 - 14)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(...ESTILOS.ALERTA.texto)
      doc.text(String(n), MARGEN + 4, ya)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...TEXTO)
      doc.text(lineas, MARGEN + 9, ya)
      ya += lineas.length * 4.2
    })
    yb += alturaNotas + 4
  }

  doc.setFillColor(241, 245, 249)
  doc.rect(MARGEN, yb, ANCHO - MARGEN * 2, alturaObs, "F")
  doc.setFillColor(...AZUL)
  doc.rect(MARGEN, yb, 1.2, alturaObs, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(...AZUL)
  doc.text("OBSERVACIONES GENERALES", MARGEN + 5, yb + 5.5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(...TEXTO)
  doc.text(lineasObs, MARGEN + 5, yb + 11)

  // Firmas al pie de la ultima pagina
  const yf = ALTO - 25
  doc.setDrawColor(...TEXTO)
  doc.setLineWidth(0.3)
  const fw = 62
  const x1 = MARGEN + 12
  const x2 = ANCHO - MARGEN - 12 - fw
  doc.line(x1, yf, x1 + fw, yf)
  doc.line(x2, yf, x2 + fw, yf)
  doc.setFontSize(9)
  doc.text("Firma Operador", x1 + fw / 2, yf + 5, { align: "center" })
  doc.text("Firma Supervisor", x2 + fw / 2, yf + 5, { align: "center" })

}

export const generarBitacorasPdf = async (lista, inventario, nombreArchivo) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const logo = await cargarLogo("/logo03.png")

  lista.forEach((b, i) => {
    if (i > 0) doc.addPage()
    dibujarBitacora(doc, b, inventario, logo)
  })

  const paginas = doc.getNumberOfPages()
  if (paginas > 1) {
    for (let p = 1; p <= paginas; p++) {
      doc.setPage(p)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(...GRIS)
      doc.text(`Página ${p} de ${paginas}`, ANCHO - MARGEN, ALTO - 8, { align: "right" })
    }
  }

  const unica = (lista[0]?.fecha || "").split(" ")[0] || "bitacora"
  doc.save(
    nombreArchivo ||
      (lista.length === 1
        ? `Bitacora_DataCenter_${unica}.pdf`
        : `Reporte_Bitacoras_${lista.length}.pdf`)
  )
}

export const generarBitacoraPdf = ({ bitacora, equipos }) =>
  generarBitacorasPdf(
    [{ ...bitacora, equipos_extra: armarEquiposExtra(equipos, bitacora.equipos_extra) }],
    equipos
  )
