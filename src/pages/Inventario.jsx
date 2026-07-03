import React, { useEffect, useState } from "react"
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
  Col
} from "antd"

import Swal from "sweetalert2"

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
            confirmButtonColor: "#1677ff"
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
            confirmButtonColor: "#1677ff"
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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
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
      confirmButtonColor: "#1677ff"
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
        <h1 className="text-3xl font-bold">
          Inventario Data Center
        </h1>

        <Button
          type="primary"
          onClick={() => abrirModal()}
        >
          Nuevo Equipo
        </Button>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-5">
        {equipos.map((e) => (
          <Card
            key={e.id}
            className="rounded-2xl shadow-md"
          >
            <h2 className="text-xl font-bold mb-4">
              Inventario del Equipo
            </h2>

            <p>
              <strong>Nombre del equipo:</strong>{" "}
              {e.nombre_equipo}
            </p>

            <p>
              <strong>Categoría:</strong>{" "}
              {e.categoria || "-"}
            </p>

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
                label="Categoría"
                name="categoria"
              >
                <Input />
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