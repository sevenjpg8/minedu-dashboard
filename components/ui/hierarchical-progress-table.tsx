"use client"
import { useState } from "react"
import { ChevronRight, ArrowLeft, Search, HelpCircle } from "lucide-react"

interface Colegio {
  id: string
  nombre: string
  totalEncuestas: number
  completadas: number
}

interface UGEL {
  id: string
  nombre: string
  colegios: Colegio[]
}

interface DRE {
  id: string
  nombre: string
  ugels: UGEL[]
}

// Datos de ejemplo
const mockData: DRE[] = [
  {
    id: "dre-lima",
    nombre: "DRE Lima",
    ugels: [
      {
        id: "ugel-lima-este",
        nombre: "UGEL Lima Este",
        colegios: [
          { id: "col-1", nombre: "Colegio San Fernando", totalEncuestas: 450, completadas: 380 },
          { id: "col-2", nombre: "Colegio Gran Unidad Escolar", totalEncuestas: 520, completadas: 420 },
        ],
      },
      {
        id: "ugel-lima-norte",
        nombre: "UGEL Lima Norte",
        colegios: [
          { id: "col-3", nombre: "Colegio Mariscal Castilla", totalEncuestas: 380, completadas: 290 },
          { id: "col-4", nombre: "Colegio Villa El Salvador", totalEncuestas: 410, completadas: 350 },
        ],
      },
      {
        id: "ugel-lima-sur",
        nombre: "UGEL Lima Sur",
        colegios: [
          { id: "col-5", nombre: "Colegio Miguel Ángel Buonarroti", totalEncuestas: 490, completadas: 430 },
          { id: "col-6", nombre: "Colegio Jorge Chávez", totalEncuestas: 350, completadas: 280 },
        ],
      },
    ],
  },
  {
    id: "dre-arequipa",
    nombre: "DRE Arequipa",
    ugels: [
      {
        id: "ugel-arequipa",
        nombre: "UGEL Arequipa",
        colegios: [
          { id: "col-7", nombre: "Colegio Independencia", totalEncuestas: 380, completadas: 340 },
          { id: "col-8", nombre: "Colegio La Salle", totalEncuestas: 420, completadas: 350 },
        ],
      },
      {
        id: "ugel-caylloma",
        nombre: "UGEL Caylloma",
        colegios: [
          { id: "col-9", nombre: "Colegio San Juan Bautista", totalEncuestas: 290, completadas: 210 },
          { id: "col-10", nombre: "Colegio Salesiano", totalEncuestas: 310, completadas: 250 },
        ],
      },
    ],
  },
  {
    id: "dre-cusco",
    nombre: "DRE Cusco",
    ugels: [
      {
        id: "ugel-cusco",
        nombre: "UGEL Cusco",
        colegios: [
          { id: "col-11", nombre: "Colegio Inca Garcilaso", totalEncuestas: 500, completadas: 440 },
          { id: "col-12", nombre: "Colegio Andahuaylillas", totalEncuestas: 360, completadas: 300 },
        ],
      },
      {
        id: "ugel-calca",
        nombre: "UGEL Calca",
        colegios: [
          { id: "col-13", nombre: "Colegio Urubamba", totalEncuestas: 280, completadas: 200 },
          { id: "col-14", nombre: "Colegio Ollantaytambo", totalEncuestas: 320, completadas: 260 },
        ],
      },
    ],
  },
]

function ProgressBar({ completadas, total }: { completadas: number; total: number }) {
  const percentage = Math.round((completadas / total) * 100)
  const getColor = (pct: number) => {
    if (pct >= 80) return "bg-green-500"
    if (pct >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1">
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getColor(percentage)} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-700 w-12 text-right">{percentage}%</span>
    </div>
  )
}

type ViewType = "dres" | "ugels" | "colegios"

interface ViewState {
  type: ViewType
  selectedDRE?: DRE
  selectedUGEL?: UGEL
}

function SearchTooltip() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
        title="Ayuda de búsqueda"
      >
        <HelpCircle size={18} />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 text-white text-xs rounded-md p-3 shadow-lg z-10 whitespace-normal">
          <p className="font-semibold mb-1">Consejos de búsqueda:</p>
          <ul className="space-y-1 text-slate-200">
            <li>• Escribe el nombre completo o parcial</li>
            <li>• Búsqueda sin distinción de mayúsculas</li>
            <li>• Se actualiza en tiempo real</li>
          </ul>
          <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  )
}

export function HierarchicalProgressTable() {
  const [viewState, setViewState] = useState<ViewState>({ type: "dres" })
  const [searchTerm, setSearchTerm] = useState("")

  const handleSelectDRE = (dre: DRE) => {
    setViewState({ type: "ugels", selectedDRE: dre })
    setSearchTerm("")
  }

  const handleSelectUGEL = (ugel: UGEL) => {
    if (viewState.selectedDRE) {
      setViewState({ type: "colegios", selectedDRE: viewState.selectedDRE, selectedUGEL: ugel })
      setSearchTerm("")
    }
  }

  const handleBack = () => {
    setSearchTerm("")
    if (viewState.type === "colegios") {
      setViewState({ type: "ugels", selectedDRE: viewState.selectedDRE })
    } else if (viewState.type === "ugels") {
      setViewState({ type: "dres" })
    }
  }

  return (
    <div className="space-y-4">
      {viewState.type !== "dres" && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft size={18} />
          Atrás
        </button>
      )}

      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={
                viewState.type === "dres"
                  ? "Buscar por región (DRE)..."
                  : viewState.type === "ugels"
                    ? "Buscar por UGEL..."
                    : "Buscar por colegio..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <SearchTooltip />
        </div>
      </div>

      {viewState.type === "dres" && <DREsTable onSelectDRE={handleSelectDRE} searchTerm={searchTerm} />}
      {viewState.type === "ugels" && viewState.selectedDRE && (
        <UGELsTable dre={viewState.selectedDRE} onSelectUGEL={handleSelectUGEL} searchTerm={searchTerm} />
      )}
      {viewState.type === "colegios" && viewState.selectedUGEL && (
        <ColegiosTable ugel={viewState.selectedUGEL} searchTerm={searchTerm} />
      )}
    </div>
  )
}

function DREsTable({ onSelectDRE, searchTerm }: { onSelectDRE: (dre: DRE) => void; searchTerm: string }) {
  const filteredDREs = mockData.filter((dre) => dre.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-300 bg-slate-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Región (DRE)</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Progreso</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Completadas</th>
          </tr>
        </thead>
        <tbody>
          {filteredDREs.length > 0 ? (
            filteredDREs.map((dre) => {
              const dreTotal = dre.ugels.reduce(
                (sum, ugel) => sum + ugel.colegios.reduce((ugelSum, col) => ugelSum + col.totalEncuestas, 0),
                0,
              )
              const dreCompletadas = dre.ugels.reduce(
                (sum, ugel) => sum + ugel.colegios.reduce((ugelSum, col) => ugelSum + col.completadas, 0),
                0,
              )

              return (
                <tr
                  key={dre.id}
                  onClick={() => onSelectDRE(dre)}
                  className="border-b border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{dre.nombre}</span>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{dreTotal} alumnos</td>
                  <td className="px-4 py-3">
                    <ProgressBar completadas={dreCompletadas} total={dreTotal} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-700 font-semibold">
                    {dreCompletadas} / {dreTotal}
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                No se encontraron resultados para "{searchTerm}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function UGELsTable({
  dre,
  onSelectUGEL,
  searchTerm,
}: {
  dre: DRE
  onSelectUGEL: (ugel: UGEL) => void
  searchTerm: string
}) {
  const filteredUGELs = dre.ugels.filter((ugel) => ugel.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">UGELs de {dre.nombre}</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-300 bg-slate-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">UGEL</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Progreso</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Completadas</th>
          </tr>
        </thead>
        <tbody>
          {filteredUGELs.length > 0 ? (
            filteredUGELs.map((ugel) => {
              const ugelTotal = ugel.colegios.reduce((sum, c) => sum + c.totalEncuestas, 0)
              const ugelCompletadas = ugel.colegios.reduce((sum, c) => sum + c.completadas, 0)

              return (
                <tr
                  key={ugel.id}
                  onClick={() => onSelectUGEL(ugel)}
                  className="border-b border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{ugel.nombre}</span>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{ugelTotal} alumnos</td>
                  <td className="px-4 py-3">
                    <ProgressBar completadas={ugelCompletadas} total={ugelTotal} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-700 font-semibold">
                    {ugelCompletadas} / {ugelTotal}
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                No se encontraron resultados para "{searchTerm}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ColegiosTable({ ugel, searchTerm }: { ugel: UGEL; searchTerm: string }) {
  const filteredColegios = ugel.colegios.filter((colegio) =>
    colegio.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Colegios de {ugel.nombre}</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-300 bg-slate-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Colegio</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Progreso</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Completadas</th>
          </tr>
        </thead>
        <tbody>
          {filteredColegios.length > 0 ? (
            filteredColegios.map((colegio) => (
              <tr
                key={colegio.id}
                className="border-b border-slate-100 bg-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-700">{colegio.nombre}</span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{colegio.totalEncuestas} alumnos</td>
                <td className="px-4 py-3">
                  <ProgressBar completadas={colegio.completadas} total={colegio.totalEncuestas} />
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-700 font-semibold">
                  {colegio.completadas} / {colegio.totalEncuestas}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                No se encontraron resultados para "{searchTerm}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
