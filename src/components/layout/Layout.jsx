import React, { useState } from "react"
import { Layout as AntLayout, Menu, Button } from "antd"

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
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons"

import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"

const { Sider, Header, Content } = AntLayout

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

  const cerrarSesion = () => {
    logout()
    navigate("/login")
  }

  const items = [
    { key: "/", icon: <HomeOutlined />, label: "Inicio" },
    { key: "/inventario", icon: <DatabaseOutlined />, label: "Inventario" },
    { key: "/bitacora", icon: <FileTextOutlined />, label: "Bitácora" },
    { key: "/entrega-turno", icon: <SwapOutlined />, label: "Entrega de Turno" },
    { key: "/centro-alarmas", icon: <AlertOutlined />, label: "Centro de Alarmas" },
    { key: "/estado-equipos", icon: <DashboardOutlined />, label: "Estado de Equipos" },
    { key: "/escalamiento", icon: <WarningOutlined />, label: "Escalamiento Técnico" },
    { key: "/mantenimiento", icon: <ToolOutlined />, label: "Mantenimiento" },
    { key: "/reportes", icon: <BarChartOutlined />, label: "Reportes" },
    { key: "/dashboard-ejecutivo", icon: <DashboardOutlined />, label: "Dashboard Ejecutivo" },
    { key: "/usuarios", icon: <TeamOutlined />, label: "Usuarios" }
  ]

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        width={270}
        collapsedWidth={80}
        collapsed={collapsed}
        trigger={null}
        style={{
          background: "#041b33"
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 16px",
            color: "#fff",
            fontWeight: 700,
            fontSize: collapsed ? 18 : 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          {collapsed ? "DC" : "DATA CENTER PRO"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "#041b33",
            borderRight: 0
          }}
        />
      </Sider>

      <AntLayout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <h2 className="text-xl font-bold m-0">
              Sistema de Gestión Data Center
            </h2>
          </div>

          <Button danger icon={<LogoutOutlined />} onClick={cerrarSesion}>
            Cerrar Sesión
          </Button>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 16,
            minHeight: "calc(100vh - 112px)"
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}