// src/components/ProtectedRoute.jsx

import React, { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function ProtectedRoute({ children }) {
  const {
    user,
    loading,
    obtenerSesion
  } = useAuthStore()

  useEffect(() => {
    obtenerSesion()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando sesión...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}