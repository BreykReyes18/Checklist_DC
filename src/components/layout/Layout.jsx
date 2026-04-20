// src/layout/Layout.jsx
// MENÚ LATERAL COMPLETO ACTUALIZADO

import React from "react"
import {
  Layout as AntLayout,
  Menu,
  Button
} from "antd"

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
  LogoutOutlined
} from "@ant-design/icons"

import {
  Outlet,
  useNavigate,
  useLocation
} from "react-router-dom"

import { useAuthStore } from "../../store/authStore"

const { Sider, Header, Content } = AntLayout

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

  const cerrarSesion = () => {
    logout()
    navigate("/login")
  }

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Inicio"
    },
    {
      key: "/inventario",
      icon: <DatabaseOutlined />,
      label: "Inventario"
    },
    {
      key: "/bitacora",
      icon: <FileTextOutlined />,
      label: "Bitácora"
    },
    {
      key: "/entrega-turno",
      icon: <SwapOutlined />,
      label: "Entrega de Turno"
    },
    {
      key: "/centro-alarmas",
      icon: <AlertOutlined />,
      label: "Centro de Alarmas"
    },
    {
      key: "/estado-equipos",
      icon: <DashboardOutlined />,
      label: "Estado de Equipos"
    },
    {
      key: "/escalamiento",
      icon: <WarningOutlined />,
      label: "Escalamiento Técnico"
    },
    {
      key: "/mantenimiento",
      icon: <ToolOutlined />,
      label: "Mantenimiento"
    },
    {
      key: "/reportes",
      icon: <BarChartOutlined />,
      label: "Reportes"
    },
    {
      key: "/dashboard-ejecutivo",
      icon: <DashboardOutlined />,
      label: "Dashboard"
    },
    {
      key: "/usuarios",
      icon: <TeamOutlined />,
      label: "Usuarios"
    }
  ]

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider width={270}>

        <div className="text-white text-center text-xl font-bold py-6">
          Casa Pellas
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => navigate(key)}
        />

      </Sider>

      <AntLayout>

        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 24
          }}
        >
          <h2 className="text-xl font-bold">
            Sistema de Gestión Data Center by Brandon Cruz Reyes.
          </h2>

          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={cerrarSesion}
          >
            Cerrar Sesión
          </Button>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 16
          }}
        >
          <Outlet />
        </Content>

      </AntLayout>
    </AntLayout>
  )
}