// pages/Usuarios.jsx

import React, { useState } from "react"
import { Card, Input, Button, Select, Table } from "antd"

const { Option } = Select

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: "Administrador DC",
      correo: "admin@datacenter.com",
      rol: "Administrador"
    }
  ])

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    rol: ""
  })

  const agregarUsuario = () => {
    if (!form.nombre || !form.correo || !form.rol) {
      alert("Todos los campos son obligatorios")
      return
    }

    const nuevoUsuario = {
      id: Date.now(),
      ...form
    }

    setUsuarios([...usuarios, nuevoUsuario])

    setForm({
      nombre: "",
      correo: "",
      rol: ""
    })
  }

  const columnas = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre"
    },
    {
      title: "Correo",
      dataIndex: "correo",
      key: "correo"
    },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol"
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Gestión de Usuarios
      </h1>

      <Card className="rounded-2xl shadow-lg mb-6">

        <div className="grid md:grid-cols-3 gap-4">

          <Input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) =>
              setForm({
                ...form,
                nombre: e.target.value
              })
            }
          />

          <Input
            placeholder="Correo"
            value={form.correo}
            onChange={(e) =>
              setForm({
                ...form,
                correo: e.target.value
              })
            }
          />

          <Select
            placeholder="Rol"
            value={form.rol || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                rol: value
              })
            }
          >
            <Option value="Administrador">
              Administrador
            </Option>

            <Option value="Supervisor">
              Supervisor
            </Option>

            <Option value="Operador">
              Operador
            </Option>
          </Select>

        </div>

        <Button
          type="primary"
          className="mt-4"
          onClick={agregarUsuario}
        >
          Agregar Usuario
        </Button>

      </Card>

      <Card className="rounded-2xl shadow-lg">

        <Table
          columns={columnas}
          dataSource={usuarios}
          rowKey="id"
          pagination={{
            pageSize: 6
          }}
        />

      </Card>
    </div>
  )
}