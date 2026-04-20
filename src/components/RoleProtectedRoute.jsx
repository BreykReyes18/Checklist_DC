// src/components/RoleProtectedRoute.jsx

import React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function RoleProtectedRoute({
  children,
  allowedRoles
}) {
  const { usuario } = useAuthStore()

  // Si no hay usuario → login
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Si el rol no está permitido → dashboard
  if (!allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}