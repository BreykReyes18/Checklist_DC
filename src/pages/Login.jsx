// src/pages/Login.jsx
// LOGIN COMPLETO CORREGIDO + ENTER FUNCIONAL + SUPABASE AUTH

import React, { useState } from "react"
import {
  Card,
  Input,
  Button,
  Typography
} from "antd"

import {
  UserOutlined,
  LockOutlined
} from "@ant-design/icons"

import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

const { Title, Text } = Typography

export default function Login() {
  const navigate = useNavigate()

  const {
    login,
    resetPassword
  } = useAuthStore()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  // =========================
  // INICIAR SESIÓN
  // =========================

  const iniciarSesion = async () => {
    if (!form.email || !form.password) {
      alert("Completa todos los campos")
      return
    }

    setLoading(true)

    const ok = await login(
      form.email,
      form.password
    )

    setLoading(false)

    if (ok) {
      navigate("/")
    }
  }

  // =========================
  // RECUPERAR PASSWORD
  // =========================

  const recuperarAcceso = async () => {
    if (!form.email) {
      alert("Ingresa tu correo")
      return
    }

    await resetPassword(form.email)
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">

      <Card
        className="w-full max-w-md rounded-2xl shadow-xl"
      >
        <Title
          level={2}
          className="text-center"
        >
          DATA CENTER CASA PELLAS
        </Title>

        <Text className="block text-center mb-6">
          Inicio de sesión seguro
        </Text>

        {/* FORM PARA QUE ENTER FUNCIONE */}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            iniciarSesion()
          }}
        >
          <div className="space-y-4">

            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
            />

            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />

            <Button
              htmlType="submit"
              type="primary"
              block
              size="large"
              loading={loading}
            >
              Iniciar Sesión
            </Button>

            <Button
              block
              onClick={recuperarAcceso}
            >
              Recuperar contraseña
            </Button>

          </div>
        </form>

      </Card>
    </div>
  )
}