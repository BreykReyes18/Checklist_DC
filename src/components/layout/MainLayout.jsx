// components/layout/MainLayout.jsx import { Layout } from "antd" import { Sidebar } from "./Sidebar"

const { Content } = Layout

export function MainLayout({ children }) { return ( <Layout style={{ minHeight: "100vh" }}> <Sidebar />

<Layout>
    <Content className="bg-slate-100 p-6">
      {children}
    </Content>
  </Layout>
</Layout>

) }