"use client"
import { useEffect, useState } from "react"
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
  totalEncuestas?: number
  completadas?: number
  colegios: Colegio[]
}

interface DRE {
  id: string
  nombre: string
  totalEncuestas?: number
  completadas?: number
  ugels: UGEL[]
}

const toNonNegative = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function ProgressBar({ completadas, total }: { completadas: number; total: number }) {
  const safeTotal = total > 0 ? total : 0
  const safeCompleted = safeTotal > 0 ? Math.min(completadas, safeTotal) : 0
  const percentage = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100)
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
  const [dres, setDres] = useState<DRE[]>([])
  const [loadingDres, setLoadingDres] = useState(true)
  const [errorDres, setErrorDres] = useState<string | null>(null)
  const [ugelsLoading, setUgelsLoading] = useState<Record<string, boolean>>({})
  const [ugelsError, setUgelsError] = useState<Record<string, string | null>>({})
  const [schoolsLoading, setSchoolsLoading] = useState<Record<string, boolean>>({})
  const [schoolsError, setSchoolsError] = useState<Record<string, string | null>>({})
  const [viewState, setViewState] = useState<ViewState>({ type: "dres" })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDres = async () => {
      try {
        setLoadingDres(true)
        setErrorDres(null)

        const response = await fetch("/api/dres")
        if (!response.ok) throw new Error("No se pudo cargar la lista de DREs")

        const payload = await response.json()
        const mapped: DRE[] = Array.isArray(payload)
          ? payload.map((dre: any, index: number) => ({
              id: String(dre?.id ?? `dre-${index}`),
              nombre: dre?.name ?? "Sin nombre",
              totalEncuestas: toNonNegative(dre?.total_students),
              completadas: toNonNegative(dre?.completed_students),
              ugels: [],
            }))
          : []

        setDres(mapped)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado al cargar las DREs"
        setErrorDres(message)
        setDres([])
      } finally {
        setLoadingDres(false)
      }
    }

    fetchDres()
  }, [])

  useEffect(() => {
    setViewState((prev) => {
      if (!prev.selectedDRE) return prev
      const refreshedDre = dres.find((dre) => dre.id === prev.selectedDRE?.id)
      if (!refreshedDre) return prev

      let changed = false
      const nextState: ViewState = { ...prev }

      if (refreshedDre !== prev.selectedDRE) {
        nextState.selectedDRE = refreshedDre
        changed = true
      }

      if (prev.selectedUGEL) {
        const refreshedUGEL = refreshedDre.ugels.find((u) => u.id === prev.selectedUGEL?.id)
        if (refreshedUGEL && refreshedUGEL !== prev.selectedUGEL) {
          nextState.selectedUGEL = refreshedUGEL
          changed = true
        }
      }

      return changed ? nextState : prev
    })
  }, [dres])

  const loadUgels = async (dreId: string) => {
    const currentDre = dres.find((dre) => dre.id === dreId)
    if (!currentDre || currentDre.ugels.length > 0 || ugelsLoading[dreId]) return

    setUgelsLoading((prev) => ({ ...prev, [dreId]: true }))
    setUgelsError((prev) => ({ ...prev, [dreId]: null }))

    try {
      const res = await fetch(`/api/ugels?dreId=${encodeURIComponent(dreId)}`)
      if (!res.ok) throw new Error("No se pudieron cargar las UGELs")

      const data = await res.json()
      const mapped: UGEL[] = Array.isArray(data)
        ? data.map((ugel: any, index: number) => ({
            id: String(ugel?.id ?? `ugel-${dreId}-${index}`),
            nombre: ugel?.name ?? "Sin nombre",
            totalEncuestas: toNonNegative(ugel?.total_students),
            completadas: toNonNegative(ugel?.completed_students),
            colegios: [],
          }))
        : []

      setDres((prev) =>
        prev.map((dre) => (dre.id === dreId ? { ...dre, ugels: mapped } : dre)),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado al cargar las UGELs"
      setUgelsError((prev) => ({ ...prev, [dreId]: message }))
    } finally {
      setUgelsLoading((prev) => ({ ...prev, [dreId]: false }))
    }
  }

  const loadSchools = async (dreId: string, ugelId: string) => {
    const currentDre = dres.find((dre) => dre.id === dreId)
    const currentUGEL = currentDre?.ugels.find((ugel) => ugel.id === ugelId)
    if (!currentUGEL || currentUGEL.colegios.length > 0 || schoolsLoading[ugelId]) return

    setSchoolsLoading((prev) => ({ ...prev, [ugelId]: true }))
    setSchoolsError((prev) => ({ ...prev, [ugelId]: null }))

    try {
      const res = await fetch(`/api/schools?ugelId=${encodeURIComponent(ugelId)}`)
      if (!res.ok) throw new Error("No se pudieron cargar los colegios")

      const data = await res.json()
      const mapped: Colegio[] = Array.isArray(data)
        ? data.map((colegio: any, index: number) => ({
            id: String(colegio?.id ?? `school-${ugelId}-${index}`),
            nombre: colegio?.name ?? "Sin nombre",
            totalEncuestas: toNonNegative(colegio?.total_students),
            completadas: toNonNegative(colegio?.completed_students),
          }))
        : []

      setDres((prev) =>
        prev.map((dre) =>
          dre.id === dreId
            ? {
                ...dre,
                ugels: dre.ugels.map((ugel) => (ugel.id === ugelId ? { ...ugel, colegios: mapped } : ugel)),
              }
            : dre,
        ),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado al cargar los colegios"
      setSchoolsError((prev) => ({ ...prev, [ugelId]: message }))
    } finally {
      setSchoolsLoading((prev) => ({ ...prev, [ugelId]: false }))
    }
  }

  const handleSelectDRE = (dre: DRE) => {
    setViewState({ type: "ugels", selectedDRE: dre })
    setSearchTerm("")

    if (!dre.ugels || dre.ugels.length === 0) {
      loadUgels(dre.id)
    }
  }

  const handleSelectUGEL = (ugel: UGEL) => {
    if (viewState.selectedDRE) {
      setViewState({ type: "colegios", selectedDRE: viewState.selectedDRE, selectedUGEL: ugel })
      setSearchTerm("")

      if (!ugel.colegios || ugel.colegios.length === 0) {
        loadSchools(viewState.selectedDRE.id, ugel.id)
      }
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

      {viewState.type === "dres" && (
        <DREsTable
          dres={dres}
          loading={loadingDres}
          error={errorDres}
          onSelectDRE={handleSelectDRE}
          searchTerm={searchTerm}
        />
      )}
      {viewState.type === "ugels" && viewState.selectedDRE && (
        <UGELsTable
          dre={viewState.selectedDRE}
          onSelectUGEL={handleSelectUGEL}
          searchTerm={searchTerm}
          loading={!!ugelsLoading[viewState.selectedDRE.id]}
          error={ugelsError[viewState.selectedDRE.id] ?? null}
        />
      )}
      {viewState.type === "colegios" && viewState.selectedUGEL && (
        <ColegiosTable
          ugel={viewState.selectedUGEL}
          searchTerm={searchTerm}
          loading={!!schoolsLoading[viewState.selectedUGEL.id]}
          error={schoolsError[viewState.selectedUGEL.id] ?? null}
        />
      )}
    </div>
  )
}

function DREsTable({
  dres,
  loading,
  error,
  onSelectDRE,
  searchTerm,
}: {
  dres: DRE[]
  loading: boolean
  error: string | null
  onSelectDRE: (dre: DRE) => void
  searchTerm: string
}) {
  const filteredDREs = dres.filter((dre) => dre.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

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
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                Cargando DREs...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-red-600">{error}</td>
            </tr>
          ) : filteredDREs.length > 0 ? (
            filteredDREs.map((dre) => {
              const dreTotalFromUgels = dre.ugels.reduce(
                (sum, ugel) => sum + ugel.colegios.reduce((ugelSum, col) => ugelSum + col.totalEncuestas, 0),
                0,
              )
              const dreCompletadasFromUgels = dre.ugels.reduce(
                (sum, ugel) => sum + ugel.colegios.reduce((ugelSum, col) => ugelSum + col.completadas, 0),
                0,
              )
              const dreTotal = dre.totalEncuestas ?? dreTotalFromUgels
              const dreCompletadas = dre.completadas ?? dreCompletadasFromUgels

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
  loading,
  error,
}: {
  dre: DRE
  onSelectUGEL: (ugel: UGEL) => void
  searchTerm: string
  loading: boolean
  error: string | null
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
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                Cargando UGELs...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-red-600">{error}</td>
            </tr>
          ) : filteredUGELs.length > 0 ? (
            filteredUGELs.map((ugel) => {
              const ugelTotalFromSchools = ugel.colegios.reduce((sum, c) => sum + c.totalEncuestas, 0)
              const ugelCompletadasFromSchools = ugel.colegios.reduce((sum, c) => sum + c.completadas, 0)
              const ugelTotal = ugel.totalEncuestas ?? ugelTotalFromSchools
              const ugelCompletadas = ugel.completadas ?? ugelCompletadasFromSchools

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
            searchTerm ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  No se encontraron resultados para "{searchTerm}"
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  Esta DRE aún no tiene UGELs registradas.
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

function ColegiosTable({
  ugel,
  searchTerm,
  loading,
  error,
}: {
  ugel: UGEL
  searchTerm: string
  loading: boolean
  error: string | null
}) {
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
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                Cargando colegios...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-red-600">{error}</td>
            </tr>
          ) : filteredColegios.length > 0 ? (
            filteredColegios.map((colegio) => (
              <tr key={colegio.id} className="border-b border-slate-100 bg-slate-50 hover:bg-slate-50 transition-colors">
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
          ) : searchTerm ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                No se encontraron resultados para "{searchTerm}"
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                Esta UGEL aún no tiene colegios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
