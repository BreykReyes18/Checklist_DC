// src/pages/Login.jsx

import React, { useState } from "react"
import { Card, Input, Button, Select } from "antd"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const { Option } = Select

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({
    usuario: "",
    password: "",
    rol: ""
  })

  const iniciarSesion = () => {
    if (!form.usuario || !form.password || !form.rol) {
      alert("Completa todos los campos")
      return
    }

    if (
      form.usuario === "bicruz" &&
      form.password === "000"
    ) {
      login(form)

      alert("Inicio de sesión exitoso")
      navigate("/")
    } else {
      alert("Credenciales incorrectas")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Login Data Center
        </h1>

        <div className="space-y-4">

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
            placeholder="Selecciona Rol"
            value={form.rol || undefined}
            onChange={(value) =>
              setForm({
                ...form,
                rol: value
              })
            }
            className="w-full"
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

          <Button
            type="primary"
            block
            onClick={iniciarSesion}
          >
            Iniciar Sesión
          </Button>

        </div>

      </Card>
    </div>
  )
}