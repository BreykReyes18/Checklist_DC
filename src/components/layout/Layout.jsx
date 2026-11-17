import React, { useEffect, useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"

import {
  HomeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
  AlertOutlined,
  ToolOutlined,
  WarningOutlined,
  SwapOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckCircleOutlined,
  UserOutlined
} from "@ant-design/icons"

import { useAuthStore } from "../../store/authStore"
import { getAlarmas } from "../../services/centroAlarmasService"
import { getPlanes, planEnAviso } from "../../services/mantenimientoService"
import { getOperadorTurno } from "../../utils/constants"

import "./Layout.css"

const NAV = [
  { key: "/", icon: <HomeOutlined />, label: "Inicio", sub: "Resumen general del Data Center" },
  { key: "/inventario", permiso: "inventario.ver", icon: <DatabaseOutlined />, label: "Inventario", sub: "Equipos registrados del Data Center" },
  { key: "/bitacora", permiso: "bitacoras.ver", icon: <FileTextOutlined />, label: "Bitácora", sub: "Revisión de equipos por turno" },
  { key: "/entrega-turno", permiso: "entregas.ver", icon: <SwapOutlined />, label: "Entrega de Turno", sub: "Relevo entre operadores" },
  { key: "/centro-alarmas", permiso: "alarmas.ver", icon: <AlertOutlined />, label: "Centro de Alarmas", sub: "Seguimiento y resolución de incidentes", badge: true, badgeKey: "alarmas" },
  { key: "/estado-equipos", icon: <CheckCircleOutlined />, label: "Estado de Equipos", sub: "Disponibilidad en tiempo real" },
  { key: "/escalamiento", icon: <WarningOutlined />, label: "Escalamiento Técnico", sub: "Contactos y niveles de escalamiento" },
  { key: "/mantenimiento", permiso: "mantenimiento.ver", badgeKey: "mantenimiento", icon: <ToolOutlined />, label: "Mantenimiento", sub: "Mantenimientos programados" },
  { key: "/reportes", permiso: "bitacoras.ver", icon: <BarChartOutlined />, label: "Reportes", sub: "Historial y exportación" },
  { key: "/dashboard-ejecutivo", permiso: "bitacoras.ver", icon: <DashboardOutlined />, label: "Dashboard Ejecutivo", sub: "Indicadores consolidados" },
  { key: "/usuarios", icon: <TeamOutlined />, label: "Usuarios", sub: "Gestión de acceso" }
]

const formatClock = (d) =>
  d.toLocaleTimeString("es-NI", { hour12: false })

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [alarmasActivas, setAlarmasActivas] = useState(0)
  const [mantProximos, setMantProximos] = useState(0)
  const [now, setNow] = useState(new Date())

  const navigate = useNavigate()
  const location = useLocation()
  const { logout, esAdmin, perfil, user, puede } = useAuthStore()

  const nombreSesion = perfil?.nombre || user?.email || "Usuario"
  const rolSesion = perfil?.rol || ""
  const iniciales = nombreSesion
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("")
  const navVisible = NAV.filter((n) => {
    if (n.key === "/usuarios") return esAdmin
    return !n.permiso || puede(n.permiso)
  })

  const actual =
    NAV.find((n) => n.key === location.pathname) || NAV[0]

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let activo = true

    const contar = async () => {
      const [{ data }, planes] = await Promise.all([
        getAlarmas(),
        getPlanes()
      ])
      if (!activo) return
      if (data) {
        setAlarmasActivas(
          data.filter((a) => a.estado === "Activa").length
        )
      }
      if (planes.data) {
        setMantProximos(planes.data.filter(planEnAviso).length)
      }
    }

    contar()
    return () => {
      activo = false
    }
  }, [location.pathname])

  const cerrarSesion = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="shell">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-head">
          <div className="mark">CP</div>
          <div className="brand">
            <b>Data Center</b>
            <span>Casa Pellas</span>
          </div>
        </div>

        <nav className="nav">
          {navVisible.map((item) => (
            <button
              key={item.key}
              type="button"
              title={item.label}
              className={`nav-item ${
                location.pathname === item.key ? "active" : ""
              }`}
              onClick={() => navigate(item.key)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              {item.badgeKey === "alarmas" && alarmasActivas > 0 && (
                <span className="badge">{alarmasActivas}</span>
              )}
              {item.badgeKey === "mantenimiento" && mantProximos > 0 && (
                <span className="badge warn" title="Mantenimientos próximos o vencidos">
                  {mantProximos}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sesion-card" title={`${nombreSesion} · ${rolSesion}`}>
            <div className="avatar">{iniciales}</div>
            <div className="sesion-datos">
              <b>{nombreSesion}</b>
              <span>{rolSesion}</span>
            </div>
          </div>
          <button
            type="button"
            className="foot-btn logout"
            onClick={cerrarSesion}
            title="Cerrar sesión"
          >
            <LogoutOutlined />
            <span className="label">Cerrar sesión</span>
          </button>
          <button
            type="button"
            className="foot-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            <span className="label">Colapsar</span>
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1>{actual.label}</h1>
            <div className="sub">{actual.sub}</div>
          </div>

          <div className="topbar-right">
            <div className="turno-chip">
              <ClockCircleOutlined />
              Turno activo · <b>{getOperadorTurno(now)}</b>
            </div>
            <div className="turno-chip sesion-chip">
              <UserOutlined />
              Sesión · <b>{nombreSesion}</b>
              {rolSesion && <span className="rol-tag">{rolSesion}</span>}
            </div>
            <div className="clock">{formatClock(now)}</div>
          </div>
        </header>

        <main className="content view-fade" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
