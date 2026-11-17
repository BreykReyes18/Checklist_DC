import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Row,
  Col,
  Empty
} from "antd"

import Swal from "../utils/swal"

import {
  getInventario,
  addInventario,
  updateInventario,
  deleteInventario
} from "../services/inventarioService"
import {
  getCategorias,
  crearCategoria,
  renombrarCategoria
} from "../services/categoriaService"

import { useInventarioStore } from "../store/inventarioStore"
import { useAuthStore } from "../store/authStore"

const SIN_CATEGORIA = "Sin categoría"

const colorEstado = (estado) => {
  if (estado === "Activo") return "green"
  if (estado === "Mantenimiento") return "orange"
  if (estado === "Inactivo") return "red"
  return "default"
}

export default function Inventario() {
  const { equipos = [], setEquipos } = useInventarioStore()
  const { puede } = useAuthStore()

  const [categorias, setCategorias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form] = Form.useForm()

  const [catModal, setCatModal] = useState(null)
  const [catNombre, setCatNombre] = useState("")
  const [catGuardando, setCatGuardando] = useState(false)

  const [msg, contexto] = message.useMessage()

  const cargar = useCallback(async () => {
    const [inv, cat] = await Promise.all([getInventario(), getCategorias()])

    if (inv.error) msg.error("Error cargando inventario")
    else setEquipos(inv.data || [])

    if (cat.error) msg.error("Error cargando categorías")
    else setCategorias(cat.data || [])
  }, [msg, setEquipos])

  useEffect(() => {
    let vigente = true
    Promise.all([getInventario(), getCategorias()]).then(([inv, cat]) => {
      if (!vigente) return
      if (!inv.error) setEquipos(inv.data || [])
      if (!cat.error) setCategorias(cat.data || [])
    })
    return () => {
      vigente = false
    }
  }, [setEquipos])

  // ======================
  // TARJETAS POR CATEGORIA (incluye categorias sin equipos)
  // ======================
  const tarjetas = useMemo(() => {
    const vacia = (id, nombre) => ({
      id,
      nombre,
      total: 0,
      Activo: 0,
      Mantenimiento: 0,
      Inactivo: 0
    })

    const mapa = new Map(categorias.map((c) => [c.id, vacia(c.id, c.nombre)]))
    let sinCat = null

    equipos.forEach((e) => {
      let t = mapa.get(e.categoria_id)
      if (!t) {
        sinCat = sinCat || vacia(null, SIN_CATEGORIA)
        t = sinCat
      }
      t.total += 1
      if (t[e.estado] !== undefined) t[e.estado] += 1
    })

    const lista = [...mapa.values()]
    if (sinCat) lista.push(sinCat)
    return lista
  }, [categorias, equipos])

  const tarjetaVigente = categoriaActiva
    ? tarjetas.find((t) => t.nombre === categoriaActiva) || null
    : null

  const equiposDeCategoria = useMemo(() => {
    if (!tarjetaVigente) return []
    if (tarjetaVigente.id === null) {
      const ids = new Set(categorias.map((c) => c.id))
      return equipos.filter((e) => !ids.has(e.categoria_id))
    }
    return equipos.filter((e) => e.categoria_id === tarjetaVigente.id)
  }, [equipos, categorias, tarjetaVigente])

  // ======================
  // EQUIPOS
  // ======================
  const abrirModal = (equipo = null) => {
    setOpen(true)

    if (equipo) {
      setEditId(equipo.id)
      form.setFieldsValue(equipo)
    } else {
      setEditId(null)
      form.resetFields()
      form.setFieldsValue({
        estado: "Activo",
        categoria_id: tarjetaVigente?.id ?? undefined
      })
    }
  }

  const guardar = async () => {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return
    }

    setLoading(true)
    const { error } = editId
      ? await updateInventario(editId, values)
      : await addInventario(values)
    setLoading(false)

    if (error) {
      const duplicado = error.code === "23505"
      msg.error(
        duplicado
          ? "Ya existe un equipo activo con ese nombre"
          : error.message || "No se pudo guardar el equipo"
      )
      return
    }

    setOpen(false)
    Swal.fire({
      icon: "success",
      title: editId ? "Actualizado" : "Creado",
      text: editId
        ? "Equipo actualizado correctamente"
        : "Equipo creado correctamente",
      confirmButtonColor: "#33C7D6"
    })
    cargar()
  }

  const eliminar = async (equipo) => {
    const result = await Swal.fire({
      title: `¿Dar de baja "${equipo.nombre_equipo}"?`,
      text: "Dejará de aparecer en el inventario y en la bitácora. Su historial de alarmas y bitácoras se conserva.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F2555A",
      cancelButtonColor: "#26303C",
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar"
    })

    if (!result.isConfirmed) return

    const { error } = await deleteInventario(equipo.id)

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo dar de baja el equipo"
      })
      return
    }

    msg.success("Equipo dado de baja")
    cargar()
  }

  // ======================
  // CATEGORIAS
  // ======================
  const abrirCategoria = (cat = null) => {
    setCatModal(cat ? { id: cat.id } : { id: null })
    setCatNombre(cat?.nombre || "")
  }

  const guardarCategoria = async () => {
    const nombre = catNombre.trim()
    if (!nombre) {
      msg.warning("Escribe el nombre de la categoría")
      return
    }

    setCatGuardando(true)
    const { data, error } = catModal.id
      ? await renombrarCategoria(catModal.id, nombre)
      : await crearCategoria(nombre)
    setCatGuardando(false)

    if (error) {
      msg.error(error.message || "No se pudo guardar la categoría")
      return
    }

    msg.success(catModal.id ? "Categoría renombrada" : "Categoría creada")
    if (catModal.id && tarjetaVigente?.id === catModal.id) {
      setCategoriaActiva(data.nombre)
    }
    setCatModal(null)
    cargar()
  }

  // ======================
  // UI
  // ======================
  return (
    <div>
      {contexto}

      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {tarjetaVigente && (
            <Button onClick={() => setCategoriaActiva(null)}>
              ← Categorías
            </Button>
          )}
          <h1>
            {tarjetaVigente
              ? `Inventario · ${tarjetaVigente.nombre}`
              : "Inventario Data Center"}
          </h1>
        </div>

        <div className="flex gap-2">
          {tarjetaVigente?.id && puede("categorias.editar") && (
            <Button onClick={() => abrirCategoria(tarjetaVigente)}>
              Renombrar categoría
            </Button>
          )}
          {!tarjetaVigente && puede("categorias.crear") && (
            <Button onClick={() => abrirCategoria()}>
              Nueva categoría
            </Button>
          )}
          {puede("inventario.crear") && (
            <Button type="primary" onClick={() => abrirModal()}>
              Nuevo Equipo
            </Button>
          )}
        </div>
      </div>

      {!tarjetaVigente && (
        <div className="grid md:grid-cols-3 gap-5">
          {tarjetas.map((c) => (
            <Card
              key={c.id ?? "sin"}
              hoverable
              className="rounded-2xl"
              onClick={() => setCategoriaActiva(c.nombre)}
            >
              <h2 className="text-xl font-bold mb-1">{c.nombre}</h2>
              <p style={{ color: "var(--ink-2)" }} className="mb-4">
                {c.total} {c.total === 1 ? "equipo" : "equipos"}
              </p>

              <div className="flex gap-2 flex-wrap">
                {c.Activo > 0 && <Tag color="green">{c.Activo} activos</Tag>}
                {c.Mantenimiento > 0 && (
                  <Tag color="orange">{c.Mantenimiento} en mantenimiento</Tag>
                )}
                {c.Inactivo > 0 && (
                  <Tag color="red">{c.Inactivo} inactivos</Tag>
                )}
                {c.total === 0 && <Tag>Sin equipos</Tag>}
              </div>
            </Card>
          ))}

          {tarjetas.length === 0 && (
            <Empty description="Aún no hay categorías. Crea una con «Nueva categoría»." />
          )}
        </div>
      )}

      {tarjetaVigente && (
        <div className="grid md:grid-cols-3 gap-5">
          {equiposDeCategoria.map((e) => (
            <Card key={e.id} className="rounded-2xl shadow-md">
              <h2 className="text-xl font-bold mb-4">{e.nombre_equipo}</h2>

              <p>
                <strong>Marca:</strong> {e.marca || "-"}
              </p>
              <p>
                <strong>Modelo:</strong> {e.modelo || "-"}
              </p>
              <p>
                <strong>Ubicación Rack:</strong> {e.ubicacion_rack || "-"}
              </p>

              <p className="mt-2">
                <strong>Estado:</strong>{" "}
                <Tag color={colorEstado(e.estado)}>
                  {e.estado || "Sin definir"}
                </Tag>
              </p>

              <p className="mt-2">
                <strong>Observaciones:</strong>{" "}
                {e.observaciones || "Sin observaciones"}
              </p>

              <div className="flex gap-2 mt-5">
                {puede("inventario.editar") && (
                  <Button onClick={() => abrirModal(e)}>Editar</Button>
                )}
                {puede("inventario.eliminar") && (
                  <Button danger onClick={() => eliminar(e)}>
                    Dar de baja
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {equiposDeCategoria.length === 0 && (
            <Empty description="Esta categoría todavía no tiene equipos." />
          )}
        </div>
      )}

      {/* MODAL EQUIPO */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={guardar}
        confirmLoading={loading}
        title={editId ? "Editar Equipo" : "Nuevo Equipo"}
        width={900}
        okText={editId ? "Actualizar" : "Guardar"}
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nombre del equipo"
                name="nombre_equipo"
                rules={[{ required: true, message: "Campo obligatorio" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Categoría"
                name="categoria_id"
                rules={[{ required: true, message: "Elige una categoría" }]}
              >
                <Select
                  placeholder="Elige una categoría"
                  options={categorias.map((c) => ({
                    value: c.id,
                    label: c.nombre
                  }))}
                  notFoundContent="No hay categorías. Crea una con «Nueva categoría»."
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Marca" name="marca">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Modelo" name="modelo">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Ubicación Rack" name="ubicacion_rack">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Estado" name="estado">
                <Select
                  options={[
                    { value: "Activo", label: "🟢 Activo" },
                    { value: "Mantenimiento", label: "🟡 Mantenimiento" },
                    { value: "Inactivo", label: "🔴 Inactivo" }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Observaciones" name="observaciones">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL CATEGORIA */}
      <Modal
        open={!!catModal}
        onCancel={() => setCatModal(null)}
        onOk={guardarCategoria}
        confirmLoading={catGuardando}
        title={catModal?.id ? "Renombrar categoría" : "Nueva categoría"}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Input
          autoFocus
          placeholder="Ej. UPS, Aire acondicionado, Switches"
          value={catNombre}
          onChange={(e) => setCatNombre(e.target.value)}
          onPressEnter={guardarCategoria}
        />
      </Modal>
    </div>
  )
}
