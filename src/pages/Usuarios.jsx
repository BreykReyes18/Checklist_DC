// src/pages/Usuarios.jsx
// PANEL ADMIN PRO - CREAR USUARIOS + TABLA

import React, { useState } from "react"
import {
  Card,
  Input,
  Button,
  Select,
  Table,
  Tag,
  Switch
} from "antd"

import { crearUsuario } from "../services/userService"

const { Option } = Select

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])

  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    email: "",
    password: "",
    rol: "",
    area: ""
  })

  const guardarUsuario = async () => {
    if (
      !form.nombre ||
      !form.usuario ||
      !form.email ||
      !form.password ||
      !form.rol
    ) {
      alert("Completa todos los campos obligatorios")
      return
    }

    const ok = await crearUsuario({
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      usuario: form.usuario,
      rol: form.rol,
      area: form.area
    })

    if (!ok) return

    const nuevoUsuario = {
      id: Date.now(),
      nombre: form.nombre,
      usuario: form.usuario,
      correo: form.email,
      rol: form.rol,
      area: form.area,
      activo: true
    }

    setUsuarios([nuevoUsuario, ...usuarios])

    setForm({
      nombre: "",
      usuario: "",
      email: "",
      password: "",
      rol: "",
      area: ""
    })
  }

  const cambiarEstado = (id) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, activo: !u.activo }
          : u
      )
    )
  }

  const columnas = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre"
    },
    {
      title: "Usuario",
      dataIndex: "usuario",
      key: "usuario"
    },
    {
      title: "Correo",
      dataIndex: "correo",
      key: "correo"
    },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
      render: (rol) => (
        <Tag color={
          rol === "Administrador"
            ? "red"
            : "blue"
        }>
          {rol}
        </Tag>
      )
    },
    {
      title: "Área",
      dataIndex: "area",
      key: "area"
    },
    {
      title: "Activo",
      dataIndex: "activo",
      key: "activo",
      render: (_, record) => (
        <Switch
          checked={record.activo}
          onChange={() =>
            cambiarEstado(record.id)
          }
        />
      )
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Administración de Usuarios
      </h1>

      <Card className="rounded-2xl shadow-lg mb-6">

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) =>
              setForm({
                ...form,
                nombre: e.target.value
              })
            }
          />

          <Input
            placeholder="Usuario"
            value={form.usuario}
            onChange={(e) =>
              setForm({
                ...form,
                usuario: e.target.value
              })
            }
          />

          <Input
            placeholder="Correo"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />

          <Input.Password
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
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

            <Option value="Operador">
              Operador
            </Option>

            <Option value="Supervisor">
              Supervisor
            </Option>
          </Select>

          <Input
            placeholder="Área"
            value={form.area}
            onChange={(e) =>
              setForm({
                ...form,
                area: e.target.value
              })
            }
          />

        </div>

        <Button
          type="primary"
          className="mt-4"
          onClick={guardarUsuario}
        >
          Crear Usuario
        </Button>

      </Card>

      <Card className="rounded-2xl shadow-lg">

        <Table
          columns={columnas}
          dataSource={usuarios}
          rowKey="id"
          pagination={{
            pageSize: 8
          }}
        />

      </Card>
    </div>
  )
}