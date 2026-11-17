// src/pages/Mantenimiento.jsx
// Planes de mantenimiento periodico, avisos y registro de mantenimientos realizados

import React, { useCallback, useEffect, useState } from "react"
import {
  Card,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Table,
  Select,
  Tag,
  Modal,
  Form,
  Progress,
  Empty,
  message
} from "antd"
import dayjs from "dayjs"

import {
  getPlanes,
  crearPlan,
  actualizarPlan,
  getMantenimientos,
  registrarMantenimiento,
  enviarAvisoPrueba,
  diasPara
} from "../services/mantenimientoService"
import { useAuthStore } from "../store/authStore"

const formatoFecha = (iso) => (iso ? dayjs(iso).format("DD/MM/YYYY") : "-")

const textoDias = (dias) => {
  if (dias === null) return "Sin fecha"
  if (dias > 1) return `Faltan ${dias} días`
  if (dias === 1) return "Mañana"
  if (dias === 0) return "Hoy"
  return `Vencido hace ${-dias} ${dias === -1 ? "día" : "días"}`
}

const colorPlan = (plan) => {
  const dias = diasPara(plan.proxima_fecha)
  if (dias === null) return "default"
  if (dias < 0) return "red"
  if (dias <= plan.dias_aviso) return "orange"
  return "green"
}

const correosValidos = (lista) =>
  lista.every((c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c))

export default function Mantenimiento() {
  const { puede } = useAuthStore()
  const gestionar = puede("mantenimiento.gestionar")

  const [planes, setPlanes] = useState([])
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)

  const [planEditando, setPlanEditando] = useState(null)
  const [registroAbierto, setRegistroAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [probando, setProbando] = useState(null)

  const [formPlan] = Form.useForm()
  const [formRegistro] = Form.useForm()
  const [msg, contexto] = message.useMessage()

  const cargar = useCallback(async () => {
    const [p, r] = await Promise.all([getPlanes(), getMantenimientos()])
    if (p.error) msg.error("Error cargando planes")
    else setPlanes(p.data || [])
    if (r.error) msg.error("Error cargando mantenimientos")
    else setRegistros(r.data || [])
  }, [msg])

  useEffect(() => {
    let vigente = true
    Promise.all([getPlanes(), getMantenimientos()]).then(([p, r]) => {
      if (!vigente) return
      if (!p.error) setPlanes(p.data || [])
      if (!r.error) setRegistros(r.data || [])
      setCargando(false)
    })
    return () => {
      vigente = false
    }
  }, [])

  // ======================
  // PLANES
  // ======================
  const abrirPlan = (plan = null) => {
    setPlanEditando(plan || { id: null })
    formPlan.resetFields()
    formPlan.setFieldsValue(
      plan
        ? {
            ...plan,
            ultima_fecha: plan.ultima_fecha ? dayjs(plan.ultima_fecha) : null
          }
        : { frecuencia_meses: 4, dias_aviso: 7, correos_aviso: [] }
    )
  }

  const guardarPlan = async () => {
    let v
    try {
      v = await formPlan.validateFields()
    } catch {
      return
    }

    const correos = (v.correos_aviso || []).map((c) => c.trim()).filter(Boolean)
    if (!correosValidos(correos)) {
      msg.error("Revisa los correos: alguno no es válido")
      return
    }

    const datos = {
      nombre: v.nombre.trim(),
      proveedor: v.proveedor?.trim() || null,
      frecuencia_meses: v.frecuencia_meses,
      dias_aviso: v.dias_aviso,
      correos_aviso: correos,
      ultima_fecha: v.ultima_fecha ? v.ultima_fecha.format("YYYY-MM-DD") : null
    }

    setGuardando(true)
    const { error } = planEditando.id
      ? await actualizarPlan(planEditando.id, datos)
      : await crearPlan(datos)
    setGuardando(false)

    if (error) {
      msg.error(error.message || "No se pudo guardar el plan")
      return
    }

    msg.success("Plan guardado")
    setPlanEditando(null)
    cargar()
  }

  const probarAviso = async (plan) => {
    if (!plan.correos_aviso?.length) {
      msg.warning("Agrega al menos un correo en el plan para probar el aviso")
      return
    }
    if (!plan.proxima_fecha) {
      msg.warning("Registra la fecha del último mantenimiento para calcular la próxima")
      return
    }

    setProbando(plan.id)
    try {
      const r = await enviarAvisoPrueba(plan.id)
      const enviado = r?.resultados?.[0]?.enviado
      if (enviado) msg.success(`Correo de prueba enviado a ${plan.correos_aviso.join(", ")}`)
      else msg.error("El servicio de correo rechazó el envío")
    } catch (e) {
      msg.error(e.message)
    } finally {
      setProbando(null)
    }
  }

  // ======================
  // REGISTRO DE MANTENIMIENTOS
  // ======================
  const abrirRegistro = (plan = null) => {
    formRegistro.resetFields()
    formRegistro.setFieldsValue({
      plan_id: plan?.id,
      equipo: plan?.nombre,
      proveedor: plan?.proveedor,
      tipo: "Preventivo",
      fecha: dayjs()
    })
    setRegistroAbierto(true)
  }

  const guardarRegistro = async () => {
    let v
    try {
      v = await formRegistro.validateFields()
    } catch {
      return
    }

    setGuardando(true)
    const { error } = await registrarMantenimiento({
      plan_id: v.plan_id ?? null,
      equipo: v.equipo.trim(),
      tipo: v.tipo,
      proveedor: v.proveedor?.trim() || null,
      responsable: v.responsable.trim(),
      fecha: v.fecha.format("YYYY-MM-DD"),
      observacion: v.observacion?.trim() || null
    })
    setGuardando(false)

    if (error) {
      msg.error(error.message || "No se pudo registrar el mantenimiento")
      return
    }

    msg.success("Mantenimiento registrado")
    setRegistroAbierto(false)
    cargar()
  }

  const nombrePlan = (id) => planes.find((p) => p.id === id)?.nombre

  const columnas = [
    { title: "Fecha", dataIndex: "fecha", render: formatoFecha, width: 110 },
    {
      title: "Equipo / plan",
      dataIndex: "equipo",
      render: (eq, r) => (
        <span>
          {eq}
          {r.plan_id && nombrePlan(r.plan_id) !== eq && (
            <Tag className="ml-2">{nombrePlan(r.plan_id)}</Tag>
          )}
        </span>
      )
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      render: (t) => (
        <Tag color={t === "Preventivo" ? "blue" : t === "Correctivo" ? "orange" : "red"}>
          {t}
        </Tag>
      )
    },
    { title: "Proveedor", dataIndex: "proveedor", render: (v) => v || "-" },
    { title: "Responsable", dataIndex: "responsable" },
    { title: "Observación", dataIndex: "observacion", render: (v) => v || "-" }
  ]

  return (
    <div>
      {contexto}

      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <h1>Gestión de Mantenimiento</h1>
        {gestionar && (
          <div className="flex gap-2">
            <Button onClick={() => abrirPlan()}>Nuevo plan</Button>
            <Button type="primary" onClick={() => abrirRegistro()}>
              Registrar mantenimiento
            </Button>
          </div>
        )}
      </div>

      {/* PLANES */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {planes.map((plan) => {
          const dias = diasPara(plan.proxima_fecha)
          const transcurrido =
            dias === null
              ? 0
              : Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round(
                      100 - (dias / (plan.frecuencia_meses * 30.4)) * 100
                    )
                  )
                )
          const color = colorPlan(plan)

          return (
            <Card key={plan.id} className="rounded-2xl">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div>
                  <h2 className="text-xl font-bold">{plan.nombre}</h2>
                  <p style={{ color: "var(--ink-2)" }}>
                    {plan.proveedor || "Sin proveedor"} · cada{" "}
                    {plan.frecuencia_meses}{" "}
                    {plan.frecuencia_meses === 1 ? "mes" : "meses"}
                  </p>
                </div>
                <Tag color={color}>{textoDias(dias)}</Tag>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <div style={{ color: "var(--ink-3)", fontSize: 12 }}>
                    Último
                  </div>
                  <b>{formatoFecha(plan.ultima_fecha)}</b>
                </div>
                <div>
                  <div style={{ color: "var(--ink-3)", fontSize: 12 }}>
                    Próximo
                  </div>
                  <b>{formatoFecha(plan.proxima_fecha)}</b>
                </div>
              </div>

              {dias !== null && (
                <Progress
                  percent={transcurrido}
                  showInfo={false}
                  size="small"
                  strokeColor={
                    color === "red"
                      ? "#F2555A"
                      : color === "orange"
                        ? "#F2A93B"
                        : "#35D07F"
                  }
                />
              )}

              <p style={{ color: "var(--ink-2)", fontSize: 12.5 }} className="mt-2">
                🔔 Aviso {plan.dias_aviso}{" "}
                {plan.dias_aviso === 1 ? "día" : "días"} antes ·{" "}
                {plan.correos_aviso?.length
                  ? plan.correos_aviso.join(", ")
                  : "sin correos configurados"}
              </p>

              {!plan.ultima_fecha && (
                <p style={{ color: "#F2A93B", fontSize: 12.5 }} className="mt-2">
                  Registra el último mantenimiento realizado para calcular el
                  próximo.
                </p>
              )}

              {gestionar && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button type="primary" onClick={() => abrirRegistro(plan)}>
                    Registrar realizado
                  </Button>
                  <Button onClick={() => abrirPlan(plan)}>Configurar</Button>
                  <Button
                    loading={probando === plan.id}
                    onClick={() => probarAviso(plan)}
                  >
                    Probar correo
                  </Button>
                </div>
              )}
            </Card>
          )
        })}

        {!cargando && planes.length === 0 && (
          <Empty description="No hay planes de mantenimiento" />
        )}
      </div>

      {/* HISTORIAL */}
      <Card title="Historial de mantenimientos">
        <Table
          columns={columnas}
          dataSource={registros}
          rowKey="id"
          loading={cargando}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "Aún no hay mantenimientos registrados" }}
        />
      </Card>

      {/* MODAL PLAN */}
      <Modal
        open={!!planEditando}
        title={planEditando?.id ? "Configurar plan" : "Nuevo plan de mantenimiento"}
        onCancel={() => setPlanEditando(null)}
        onOk={guardarPlan}
        confirmLoading={guardando}
        okText="Guardar"
        cancelText="Cancelar"
        width={640}
      >
        <Form layout="vertical" form={formPlan}>
          <div className="grid md:grid-cols-2 gap-x-4">
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: "Campo obligatorio" }]}
            >
              <Input placeholder="Ej. Aires acondicionados" />
            </Form.Item>

            <Form.Item label="Proveedor" name="proveedor">
              <Input placeholder="Ej. Microtek" />
            </Form.Item>

            <Form.Item
              label="Cada cuántos meses"
              name="frecuencia_meses"
              rules={[{ required: true, message: "Campo obligatorio" }]}
            >
              <InputNumber min={1} max={60} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Avisar con cuántos días de anticipación"
              name="dias_aviso"
              rules={[{ required: true, message: "Campo obligatorio" }]}
            >
              <InputNumber min={0} max={90} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Fecha del último mantenimiento"
              name="ultima_fecha"
              extra="La próxima fecha se calcula sola. Al registrar un mantenimiento preventivo se actualiza automáticamente."
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="Correos que reciben el aviso"
              name="correos_aviso"
              extra="Escribe un correo y presiona Enter."
            >
              <Select
                mode="tags"
                tokenSeparators={[",", " ", ";"]}
                placeholder="correo@casapellas.com"
                open={false}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* MODAL REGISTRO */}
      <Modal
        open={registroAbierto}
        title="Registrar mantenimiento"
        onCancel={() => setRegistroAbierto(false)}
        onOk={guardarRegistro}
        confirmLoading={guardando}
        okText="Guardar"
        cancelText="Cancelar"
        width={640}
      >
        <Form layout="vertical" form={formRegistro}>
          <div className="grid md:grid-cols-2 gap-x-4">
            <Form.Item label="Plan" name="plan_id">
              <Select
                allowClear
                placeholder="Sin plan (mantenimiento puntual)"
                options={planes.map((p) => ({ value: p.id, label: p.nombre }))}
                onChange={(id) => {
                  const p = planes.find((x) => x.id === id)
                  if (p) {
                    formRegistro.setFieldsValue({
                      equipo: p.nombre,
                      proveedor: p.proveedor
                    })
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="Equipo"
              name="equipo"
              rules={[{ required: true, message: "Campo obligatorio" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Tipo"
              name="tipo"
              rules={[{ required: true }]}
              extra="Solo el preventivo mueve la fecha del plan."
            >
              <Select
                options={[
                  { value: "Preventivo", label: "Preventivo" },
                  { value: "Correctivo", label: "Correctivo" },
                  { value: "Emergencia", label: "Emergencia" }
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Fecha realizado"
              name="fecha"
              rules={[{ required: true, message: "Campo obligatorio" }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Proveedor" name="proveedor">
              <Input />
            </Form.Item>

            <Form.Item
              label="Responsable"
              name="responsable"
              rules={[{ required: true, message: "Campo obligatorio" }]}
            >
              <Input placeholder="Quién atendió o recibió el trabajo" />
            </Form.Item>
          </div>

          <Form.Item label="Observación" name="observacion">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

