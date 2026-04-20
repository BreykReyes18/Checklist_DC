// components/layout/Sidebar.jsx import { Layout, Menu } from "antd" import { DashboardOutlined, DatabaseOutlined, FileTextOutlined, BarChartOutlined, } from "@ant-design/icons" import { useNavigate, useLocation } from "react-router-dom"

const { Sider } = Layout

export function Sidebar() { const navigate = useNavigate() 
    const location = useLocation()

const items = [ { key: "/", icon: <DashboardOutlined />, label: "Dashboard", }, { key: "/inventario", icon: <DatabaseOutlined />, label: "Inventario", }, { key: "/bitacora", icon: <FileTextOutlined />, label: "Bitácora", }, { key: "/reportes", icon: <BarChartOutlined />, label: "Reportes", }, ]

return ( <Sider collapsible width={250}> <div className="text-white text-center py-5 text-xl font-bold"> DC Manager </div>

<Menu
    theme="dark"
    mode="inline"
    selectedKeys={[location.pathname]}
    items={items}
    onClick={({ key }) => navigate(key)}
  />
</Sider>

) }
