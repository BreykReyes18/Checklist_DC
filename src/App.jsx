import { useEffect, useState } from "react"
import { Input, Button, Card, Select } from "antd"
import { motion } from "framer-motion"
import {
  getInventario,
  addInventario,
  deleteInventario
} from "./services/inventarioService"
 
const { Option } = Select
 
function App() {
  const [equipos, setEquipos] = useState([])
 
  const [form, setForm] = useState({
    nombre_equipo: "",
    categoria: "",
    marca: "",
    modelo: "",
    ubicacion_rack: "",
    estado: "",
    observaciones: ""
  })
 
  const cargarInventario = async () => {
    const { data, error } = await getInventario()
 
    if (!error) {
      setEquipos(data)
    }
  }
 
  const guardarEquipo = async () => {
    if (!form.nombre_equipo || !form.categoria) return
 
    await addInventario({
      ...form,
      fecha_registro: new Date()
    })
 
    setForm({
      nombre_equipo: "",
      categoria: "",
      marca: "",
      modelo: "",
      ubicacion_rack: "",
      estado: "",
      observaciones: ""
    })
 
    cargarInventario()
  }
 
  const eliminarEquipo = async (id) => {
    await deleteInventario(id)
    cargarInventario()
  }
 
  useEffect(() => {
    cargarInventario()
  }, [])
 
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
 
        <h1 className="text-4xl font-bold mb-2">
          Data Center Management 
        </h1>
 
        <p className="text-gray-600 mb-6">
          Inventario + Dashboard + Bitácora
        </p>
 
        {/* FORMULARIO */}
 
        <Card className="mb-6 rounded-2xl shadow-lg">
          <div className="grid md:grid-cols-2 gap-4">
 
            <Input
              placeholder="Nombre del equipo"
              value={form.nombre_equipo}
              onChange={(e) =>
                setForm({
                  ...form,
                  nombre_equipo: e.target.value
                })
              }
            />
 
            <Select
              placeholder="Categoría"
              value={form.categoria || undefined}
              onChange={(value) =>
                setForm({
                  ...form,
                  categoria: value
                })
              }
            >
              <Option value="Rack">Rack</Option>
              <Option value="Switch">Switch</Option>
              <Option value="IBM">IBM</Option>
              <Option value="ODS">ODS</Option>
              <Option value="SW">SW</Option>
              <Option value="UPS">UPS</Option>
              <Option value="Perimetral">Perimetral</Option>
              <Option value="Aire APC InRow">
                Aire APC InRow
              </Option>
            </Select>
 
            <Input
              placeholder="Marca"
              value={form.marca}
              onChange={(e) =>
                setForm({
                  ...form,
                  marca: e.target.value
                })
              }
            />
 
            <Input
              placeholder="Modelo"
              value={form.modelo}
              onChange={(e) =>
                setForm({
                  ...form,
                  modelo: e.target.value
                })
              }
            />
 
            <Input
              placeholder="Ubicación Rack"
              value={form.ubicacion_rack}
              onChange={(e) =>
                setForm({
                  ...form,
                  ubicacion_rack: e.target.value
                })
              }
            />
 
            <Input
              placeholder="Estado"
              value={form.estado}
              onChange={(e) =>
                setForm({
                  ...form,
                  estado: e.target.value
                })
              }
            />
 
            <Input.TextArea
              rows={3}
              placeholder="Observaciones"
              value={form.observaciones}
              onChange={(e) =>
                setForm({
                  ...form,
                  observaciones: e.target.value
                })
              }
            />
          </div>
 
          <Button
            type="primary"
            className="mt-4"
            onClick={guardarEquipo}
          >
            Agregar Equipo
          </Button>
        </Card>
 
        {/* DASHBOARD */}
 
        <div className="mb-6">
          <Card className="rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold">
              Equipos registrados: {equipos.length}
            </h2>
          </Card>
        </div>
 
        {/* CARDS */}
 
        <div className="grid md:grid-cols-3 gap-4">
          {equipos.map((equipo) => (
            <motion.div
              key={equipo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl shadow-md">
                <h2 className="text-xl font-bold">
                  {equipo.nombre_equipo}
                </h2>
 
                <p><strong>Categoría:</strong> {equipo.categoria}</p>
                <p><strong>Marca:</strong> {equipo.marca}</p>
                <p><strong>Modelo:</strong> {equipo.modelo}</p>
                <p><strong>Rack:</strong> {equipo.ubicacion_rack}</p>
                <p><strong>Estado:</strong> {equipo.estado}</p>
 
                <Button
                  danger
                  className="mt-4"
                  onClick={() => eliminarEquipo(equipo.id)}
                >
                  Eliminar
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
 
      </div>
    </div>
  )
}
 
export default App