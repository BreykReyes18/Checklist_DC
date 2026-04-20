import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleProtectedRoute from "./components/RoleProtectedRoute"

import Login from "./pages/Login"
import Home from "./pages/Home"
import Inventario from "./pages/Inventario"
import Bitacora from "./pages/Bitacora"
import Reportes from "./pages/Reportes"
import Usuarios from "./pages/Usuarios"
import Mantenimiento from "./pages/Mantenimiento"
import Configuracion from "./pages/Configuracion"

import EntregaTurno from "./pages/EntregaTurno"
import CentroAlarmas from "./pages/CentroAlarmas"
import EstadoEquipos from "./pages/EstadoEquipos"
import Escalamiento from "./pages/Escalamiento"
import DashboardEjecutivo from "./pages/DashboardEjecutivo"
import Auditoria from "./pages/Auditoria"
import Alertas from "./pages/Alertas"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN (público) */}
        <Route path="/login" element={<Login />} />

        {/* RUTA BASE PROTEGIDA */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* DASHBOARD PRINCIPAL */}
          <Route index element={<Home />} />

          {/* MÓDULOS OPERATIVOS */}
          <Route path="inventario" element={<Inventario />} />
          <Route path="bitacora" element={<Bitacora />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="mantenimiento" element={<Mantenimiento />} />
          <Route path="configuracion" element={<Configuracion />} />

          {/* OPERACIÓN DATA CENTER */}
          <Route path="entrega-turno" element={<EntregaTurno />} />
          <Route path="centro-alarmas" element={<CentroAlarmas />} />
          <Route path="estado-equipos" element={<EstadoEquipos />} />
          <Route path="escalamiento" element={<Escalamiento />} />
          <Route path="alertas" element={<Alertas />} />

          {/* EJECUTIVO */}
          <Route path="dashboard-ejecutivo" element={<DashboardEjecutivo />} />

          {/* ADMIN SOLO */}
          <Route
            path="usuarios"
            element={
              <RoleProtectedRoute allowedRoles={["Administrador"]}>
                <Usuarios />
              </RoleProtectedRoute>
            }
          />

          {/* AUDITORIA (si lo usas para control interno) */}
          <Route path="auditoria" element={<Auditoria />} />

        </Route>

        {/* CUALQUIER RUTA INVALIDA */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}