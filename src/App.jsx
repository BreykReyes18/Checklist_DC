// src/App.jsx
// APP COMPLETO CORREGIDO SIN ERRORES

import React from "react"
import { ConfigProvider } from "antd"
import esES from "antd/locale/es_ES"
import { antdTheme } from "./app/theme"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom"

import Layout from "./components/layout/Layout.jsx"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleProtectedRoute from "./components/RoleProtectedRoute"

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
    <ConfigProvider theme={antdTheme} locale={esES}>
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
            element={
              <RoleProtectedRoute permiso="inventario.ver">
                <Inventario />
              </RoleProtectedRoute>
            }
          />

          {/* BITÁCORA */}
          <Route
            path="bitacora"
            element={
              <RoleProtectedRoute permiso="bitacoras.ver">
                <Bitacora />
              </RoleProtectedRoute>
            }
          />

          {/* ENTREGA DE TURNO */}
          <Route
            path="entrega-turno"
            element={
              <RoleProtectedRoute permiso="entregas.ver">
                <EntregaTurno />
              </RoleProtectedRoute>
            }
          />

          {/* CENTRO DE ALARMAS */}
          <Route
            path="centro-alarmas"
            element={
              <RoleProtectedRoute permiso="alarmas.ver">
                <CentroAlarmas />
              </RoleProtectedRoute>
            }
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
            element={
              <RoleProtectedRoute permiso="mantenimiento.ver">
                <Mantenimiento />
              </RoleProtectedRoute>
            }
          />

          {/* REPORTES */}
          <Route
            path="reportes"
            element={
              <RoleProtectedRoute permiso="bitacoras.ver">
                <Reportes />
              </RoleProtectedRoute>
            }
          />

          {/* DASHBOARD EJECUTIVO */}
          <Route
            path="dashboard-ejecutivo"
            element={
              <RoleProtectedRoute permiso="bitacoras.ver">
                <DashboardEjecutivo />
              </RoleProtectedRoute>
            }
          />

          {/* USUARIOS */}
          <Route
            path="usuarios"
            element={
              <RoleProtectedRoute allowedRoles={["Administrador"]}>
                <Usuarios />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* CUALQUIER RUTA INVÁLIDA */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
    </ConfigProvider>
  )
}