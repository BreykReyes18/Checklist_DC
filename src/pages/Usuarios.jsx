// src/pages/Usuarios.jsx
// Administracion de usuarios: solo visible para el Administrador

import React, { useEffect, useState, useCallback } from "react"
import { Card, Input, Button, Select, Table, Switch, message } from "antd"

import {
  getUsuarios,
  getRoles,
  actualizarUsuario,
  crearUsuario
} from "../services/userService"
import { useAuthStore } from "../store/authStore"

const FORM_VACIO = {
  nombre: "",
  usuario: "",
  email: "",
  password: "",
  rol: undefined,
  area: ""
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [msg, contexto] = message.useMessage()
  const { perfil } = useAuthStore()

  const cargar = useCallback(async () => {
    try {
      const [u, r] = await Promise.all([getUsuarios(), getRoles()])
      setUsuarios(u)
      setRoles(r)
    } catch (e) {
      msg.error(e.message)
    } finally {
      setCargando(false)
    }
  }, [msg])

  useEffect(() => {
    let vigente = true
    Promise.all([getUsuarios(), getRoles()])
      .then(([u, r]) => {
        if (!vigente) return
        setUsuarios(u)
        setRoles(r)
      })
      .catch((e) => vigente && msg.error(e.message))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [msg])

  const guardarCambio = async (registro, cambios) => {
    try {
      const nuevo = await actualizarUsuario(registro.id, cambios)
      setUsuarios((prev) =>
        prev.map((u) => (u.id === registro.id ? { ...u, ...nuevo } : u))
      )
      msg.success("Cambio guardado")
    } catch (e) {
      msg.error(e.message)
    }
  }

  const crear = async () => {
    const { nombre, usuario, email, password, rol } = form
    if (!nombre || !usuario || !email || !password || !rol) {
      msg.warning("Completa todos los campos obligatorios")
      return
    }

    setGuardando(true)
    try {
      await crearUsuario({ ...form })
      msg.success("Usuario creado")
      setForm(FORM_VACIO)
      await cargar()
    } catch (e) {
      msg.error(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const esPropio = (r) => r.auth_id === perfil?.auth_id || r.id === perfil?.id

  const columnas = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Usuario", dataIndex: "usuario", key: "usuario" },
    { title: "Correo", dataIndex: "correo", key: "correo" },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
      render: (rol, r) => (
        <Select
          value={rol}
          style={{ width: 160 }}
          disabled={esPropio(r)}
          onChange={(v) => guardarCambio(r, { rol: v })}
          options={roles.map((x) => ({ value: x.nombre, label: x.nombre }))}
        />
      )
    },
    {
      title: "Área",
      dataIndex: "area",
      key: "area",
      render: (area, r) => (
        <Input
          defaultValue={area}
          style={{ width: 180 }}
          onBlur={(e) => {
            if (e.target.value !== (area || "")) {
              guardarCambio(r, { area: e.target.value })
            }
          }}
        />
      )
    },
    {
      title: "Activo",
      dataIndex: "activo",
      key: "activo",
      render: (activo, r) => (
        <Switch
          checked={activo !== false}
          disabled={esPropio(r)}
          onChange={(v) => guardarCambio(r, { activo: v })}
        />
      )
    }
  ]

  return (
    <div>
      {contexto}
      <h1 className="mb-6">Administración de Usuarios</h1>

      <Card className="mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <Input
            placeholder="Usuario"
            value={form.usuario}
            onChange={(e) => setForm({ ...form, usuario: e.target.value })}
          />
          <Input
            placeholder="Correo"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input.Password
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            placeholder="Rol"
            value={form.rol}
            onChange={(v) => setForm({ ...form, rol: v })}
            options={roles.map((x) => ({ value: x.nombre, label: x.nombre }))}
          />
          <Input
            placeholder="Área"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
        </div>

        <Button
          type="primary"
          className="mt-4"
          loading={guardando}
          onClick={crear}
        >
          Crear Usuario
        </Button>
      </Card>

      <Card>
        <Table
          columns={columnas}
          dataSource={usuarios}
          rowKey="id"
          loading={cargando}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  )
}
