import React, { useEffect, useMemo, useState } from "react"
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  AutoComplete,
  Tag,
  message,
  Row,
  Col
} from "antd"

import Swal from "../utils/swal"

import {
  getInventario,
  addInventario,
  updateInventario,
  deleteInventario
} from "../services/inventarioService"

import { useInventarioStore } from "../store/inventarioStore"

export default function Inventario() {
  const { equipos = [], setEquipos } = useInventarioStore()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [categoriaActiva, setCategoriaActiva] = useState(null)

  const [form] = Form.useForm()

  // ======================
  // CARGAR INVENTARIO
  // ======================
  const cargar = async () => {
    const { data, error } = await getInventario()

    if (error) {
      message.error("Error cargando inventario")
      return
    }

    setEquipos(data || [])
  }

  useEffect(() => {
    cargar()
  }, [])

  // ======================
  // CATEGORIAS (se generan solas a partir de los equipos)
  // ======================
  const categorias = useMemo(() => {
    const mapa = {}
    equipos.forEach((e) => {
      const nombre = e.categoria?.trim() || "Sin categoría"
      if (!mapa[nombre]) {
        mapa[nombre] = { nombre, total: 0, Activo: 0, Mantenimiento: 0, Inactivo: 0 }
      }
      mapa[nombre].total += 1
      if (mapa[nombre][e.estado] !== undefined) mapa[nombre][e.estado] += 1
    })
    return Object.values(mapa).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [equipos])

  const equiposDeCategoria = useMemo(
    () =>
      equipos.filter(
        (e) => (e.categoria?.trim() || "Sin categoría") === categoriaActiva
      ),
    [equipos, categoriaActiva]
  )

  const categoriaVigente =
    categoriaActiva && categorias.some((c) => c.nombre === categoriaActiva)
      ? categoriaActiva
      : null

  // ======================
  // ABRIR MODAL
  // ======================
  const abrirModal = (equipo = null) => {
    setOpen(true)

    if (equipo) {
      setEditId(equipo.id)
      form.setFieldsValue(equipo)
    } else {
      setEditId(null)
      form.resetFields()
      if (categoriaVigente && categoriaVigente !== "Sin categoría") {
        form.setFieldsValue({ categoria: categoriaVigente })
      }
    }
  }

  // ======================
  // GUARDAR
  // ======================
  const guardar = async () => {
    try {
      setLoading(true)

      const values = await form.validateFields()

      if (editId) {
        const { error } = await updateInventario(editId, values)

        if (error) {
          message.error("Error actualizando")
        } else {
          Swal.fire({
            icon: "success",
            title: "Actualizado",
            text: "Equipo actualizado correctamente",
            confirmButtonColor: "#33C7D6"
          })
          cargar()
        }
      } else {
        const { error } = await addInventario(values)

        if (error) {
          message.error("Error creando equipo")
        } else {
          Swal.fire({
            icon: "success",
            title: "Creado",
            text: "Equipo creado correctamente",
            confirmButtonColor: "#33C7D6"
          })
          cargar()
        }
      }

      setOpen(false)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  // ======================
  // ELIMINAR
  // ======================
  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar equipo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F2555A",
      cancelButtonColor: "#26303C",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    })

    if (!result.isConfirmed) return

    const { error } = await deleteInventario(id)

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el equipo"
      })
      return
    }

    Swal.fire({
      icon: "success",
      title: "Eliminado",
      text: "Equipo eliminado correctamente",
      confirmButtonColor: "#33C7D6"
    })

    cargar()
  }

  // ======================
  // COLOR DEL ESTADO
  // ======================
  const colorEstado = (estado) => {
    if (estado === "Activo") return "green"
    if (estado === "Mantenimiento") return "orange"
    if (estado === "Inactivo") return "red"
    return "default"
  }

  // ======================
  // UI
  // ======================
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {categoriaVigente && (
            <Button onClick={() => setCategoriaActiva(null)}>
              ← Categorías
            </Button>
          )}
          <h1>
            {categoriaVigente
              ? `Inventario · ${categoriaVigente}`
              : "Inventario Data Center"}
          </h1>
        </div>

        <Button
          type="primary"
          onClick={() => abrirModal()}
        >
          Nuevo Equipo
        </Button>
      </div>

      {/* CATEGORIAS */}
      {!categoriaVigente && (
        <div className="grid md:grid-cols-3 gap-5">
          {categorias.map((c) => (
            <Card
              key={c.nombre}
              hoverable
              className="rounded-2xl"
              onClick={() => setCategoriaActiva(c.nombre)}
            >
              <h2 className="text-xl font-bold mb-1">{c.nombre}</h2>
              <p style={{ color: "var(--ink-2)" }} className="mb-4">
                {c.total} {c.total === 1 ? "equipo" : "equipos"}
              </p>

              <div className="flex gap-2 flex-wrap">
                {c.Activo > 0 && (
                  <Tag color="green">{c.Activo} activos</Tag>
                )}
                {c.Mantenimiento > 0 && (
                  <Tag color="orange">{c.Mantenimiento} en mantenimiento</Tag>
                )}
                {c.Inactivo > 0 && (
                  <Tag color="red">{c.Inactivo} inactivos</Tag>
                )}
              </div>
            </Card>
          ))}

          {categorias.length === 0 && (
            <p style={{ color: "var(--ink-2)" }}>
              Aún no hay equipos. Usa "Nuevo Equipo" para crear el primero.
            </p>
          )}
        </div>
      )}

      {/* EQUIPOS DE LA CATEGORIA */}
      {categoriaVigente && (
        <div className="grid md:grid-cols-3 gap-5">
          {equiposDeCategoria.map((e) => (
            <Card
              key={e.id}
              className="rounded-2xl shadow-md"
            >
              <h2 className="text-xl font-bold mb-4">
                {e.nombre_equipo}
              </h2>

              <p>
                <strong>Marca:</strong>{" "}
                {e.marca || "-"}
              </p>

              <p>
                <strong>Modelo:</strong>{" "}
                {e.modelo || "-" }
              </p>

              <p>
                <strong>Ubicación Rack:</strong>{" "}
                {e.ubicacion_rack || "-"}
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
                <Button onClick={() => abrirModal(e)}>
                  Editar
                </Button>

                <Button
                  danger
                  onClick={() => eliminar(e.id)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={guardar}
        confirmLoading={loading}
        title={
          editId
            ? "Editar Equipo"
            : "Nuevo Equipo"
        }
        width={900}
        okText={editId ? "Actualizar" : "Guardar"}
        cancelText="Cancelar"
      >
        <Form
          layout="vertical"
          form={form}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nombre del equipo"
                name="nombre_equipo"
                rules={[
                  {
                    required: true,
                    message: "Campo obligatorio"
                  }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Categoría (elige una o escribe una nueva)"
                name="categoria"
              >
                <AutoComplete
                  options={categorias
                    .filter((c) => c.nombre !== "Sin categoría")
                    .map((c) => ({ value: c.nombre }))}
                  filterOption={(texto, op) =>
                    op.value.toLowerCase().includes(texto.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Marca"
                name="marca"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Modelo"
                name="modelo"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Ubicación Rack"
                name="ubicacion_rack"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Estado"
                name="estado"
              >
                <Select
                  options={[
                    {
                      value: "Activo",
                      label: "🟢 Activo"
                    },
                    {
                      value: "Mantenimiento",
                      label: "🟡 Mantenimiento"
                    },
                    {
                      value: "Inactivo",
                      label: "🔴 Inactivo"
                    }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Observaciones"
                name="observaciones"
              >
                <Input.TextArea
                  rows={4}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}