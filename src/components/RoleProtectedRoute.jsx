// src/components/RoleProtectedRoute.jsx

import React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

// Protege una ruta por rol (allowedRoles) o por permiso (permiso)
export default function RoleProtectedRoute({
  children,
  allowedRoles,
  permiso
}) {
  const { perfil, puede } = useAuthStore()

  if (!perfil) return <Navigate to="/" replace />
  if (allowedRoles && !allowedRoles.includes(perfil.rol)) {
    return <Navigate to="/" replace />
  }
  if (permiso && !puede(permiso)) return <Navigate to="/" replace />

  return children
}
