// src/components/RoleProtectedRoute.jsx

import React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function RoleProtectedRoute({
  children,
  allowedRoles
}) {
  const { perfil } = useAuthStore()

  if (!perfil || !allowedRoles.includes(perfil.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}
