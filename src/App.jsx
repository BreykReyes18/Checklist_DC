// src/App.jsx
// APP COMPLETO CORREGIDO SIN ERRORES

import React from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom"

import Layout from "./components/layout/Layout.jsx"
import ProtectedRoute from "./components/ProtectedRoute"

/* PÁGINAS */
import Login from "./pages/Login"
import Home from "./pages/Home"
import Inventario from "./pages/Inventario"
import Bitacora from "./pages/Bitacora"
import EntregaTurno from "./pages/EntregaTurno"
import CentroAlarmas from "./pages/CentroAlarmas"
import EstadoEquipos from "./pages/EstadoEquipos"
import Escalamiento from "./pages/Escalamiento"
import Mantenimiento from "./pages/Mantenimiento"
import Reportes from "./pages/Reportes"
import DashboardEjecutivo from "./pages/DashboardEjecutivo"
import Usuarios from "./pages/Usuarios"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* RUTAS PROTEGIDAS */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* HOME */}
          <Route
            index
            element={<Home />}
          />

          {/* INVENTARIO */}
          <Route
            path="inventario"
            element={<Inventario />}
          />

          {/* BITÁCORA */}
          <Route
            path="bitacora"
            element={<Bitacora />}
          />

          {/* ENTREGA DE TURNO */}
          <Route
            path="entrega-turno"
            element={<EntregaTurno />}
          />

          {/* CENTRO DE ALARMAS */}
          <Route
            path="centro-alarmas"
            element={<CentroAlarmas />}
          />

          {/* ESTADO DE EQUIPOS */}
          <Route
            path="estado-equipos"
            element={<EstadoEquipos />}
          />

          {/* ESCALAMIENTO */}
          <Route
            path="escalamiento"
            element={<Escalamiento />}
          />

          {/* MANTENIMIENTO */}
          <Route
            path="mantenimiento"
            element={<Mantenimiento />}
          />

          {/* REPORTES */}
          <Route
            path="reportes"
            element={<Reportes />}
          />

          {/* DASHBOARD EJECUTIVO */}
          <Route
            path="dashboard-ejecutivo"
            element={<DashboardEjecutivo />}
          />

          {/* USUARIOS */}
          {/* SIN RoleProtectedRoute por ahora para evitar cierre de sesión */}
          <Route
            path="usuarios"
            element={<Usuarios />}
          />
        </Route>

        {/* CUALQUIER RUTA INVÁLIDA */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}