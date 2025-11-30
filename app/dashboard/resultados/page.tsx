"use client"

import ReportePDF from "@/components/pdf/ReportePDF";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const ChartCard = ({ title, data }: { title: string; data: any[] }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="# de Respuestas" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

interface RowItem {
  question_text: string
  option_text: string
  cantidad: number
}

interface Filters {
  dre?: string;
  ugel?: string;
  colegio?: string;
  tipoEncuesta?: string;
}


function getExportEndpoint(filters: any) {
  const encuesta = filters.encuesta
  const dre = filters.dre
  const ugel = filters.ugel
  const colegio = filters.colegio

  // Caso 1 → Solo encuesta
  if (encuesta && !dre && !ugel && !colegio) {
    return `/api/resultados/export/encuesta/${encuesta}`
  }

  // Caso 2 → Encuesta + DRE
  if (encuesta && dre && !ugel && !colegio) {
    return `/api/resultados/export/dre/${encuesta}?dre=${dre}`
  }

  // Caso 3 → Encuesta + DRE + UGEL
  if (encuesta && dre && ugel && !colegio) {
    return `/api/resultados/export/ugel/${encuesta}?dre=${dre}&ugel=${ugel}`
  }

  // Caso 4 → Encuesta + DRE + UGEL + Colegio
  if (encuesta && dre && ugel && colegio) {
    return `/api/resultados/export/colegio/${colegio}?encuesta=${encuesta}&dre=${dre}&ugel=${ugel}`;
  }

  // Fallback (no debería pasar)
  return ""
}

export default function ReportesPage() {
  const [filters, setFilters] = useState({
    encuesta: "",
    dre: "",
    ugel: "",
    colegio: "",
    colegioNombre: "",
    nivelEducativo: "",
    grado: "",
  })

  const [surveys, setSurveys] = useState<any[]>([])
  const [dres, setDres] = useState<any[]>([])
  const [ugels, setUgels] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [charts, setCharts] = useState<any[]>([]);
  const [pdfRows, setPdfRows] = useState<RowItem[]>([]);
  const [pdfFilters, setPdfFilters] = useState<Filters>({});
  const [pdfData, setPdfData] = useState<{ rows: RowItem[]; filters: Filters } | null>(null);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSelectEncuesta = (encuestaId: string) => {
    const survey = surveys.find((s) => s.id === encuestaId)

    setFilters((prev) => ({
      ...prev,
      encuesta: encuestaId,
      nivelEducativo: survey?.level ? survey.level.toLowerCase() : "",
      colegio: "",
      colegioNombre: "",
      grado: ""
    }))

    setSchools([])
    setFilteredSchools([])
  }

  const handleClearFilters = () => {
    setFilters({
      encuesta: "",
      dre: "",
      ugel: "",
      colegio: "",
      colegioNombre: "",
      nivelEducativo: "",
      grado: "",
    })
    setUgels([])
    setSchools([])
    setFilteredSchools([]) // 🔹 limpiar resultados de búsqueda
    setCharts([])
  }

  // Cargar encuestas y DREs al inicio
  useEffect(() => {
    fetch("/api/surveys").then((res) => res.json()).then(setSurveys)
    fetch("/api/dres").then((res) => res.json()).then(setDres)
  }, [])

  // Cargar UGELs al seleccionar DRE
  useEffect(() => {
    if (!filters.dre) {
      setUgels([])
      setSchools([])
      return
    }

    fetch(`/api/ugels?dreId=${filters.dre}`)
      .then((res) => res.json())
      .then((data) => {
        // 🔒 Asegurar que siempre sea un array
        setUgels(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error("Error cargando UGELs:", err)
        setUgels([]) // en caso de error también limpia
      })
  }, [filters.dre])

  useEffect(() => {
    if (!filters.ugel) {
      setSchools([])
      return
    }
    fetch(`/api/schools?ugelId=${filters.ugel}`).then((res) => res.json()).then(setSchools)
  }, [filters.ugel])

  const showCharts = filters.encuesta !== ""

  const [filteredSchools, setFilteredSchools] = useState<any[]>([])

  const handleSearchSchool = async (value: string) => {
    handleFilterChange("colegioNombre", value)
    setFilteredSchools([])

    if (value.trim() === "") {
      setFilters(prev => ({
        ...prev,
        colegio: "",
        grado: ""
      }))
      return
    }

    if (!filters.ugel || value.length < 3) return

    try {
      const res = await fetch(`/api/schoolsSearch?ugelId=${filters.ugel}&query=${value}`)
      const data = await res.json()

      setFilteredSchools(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error buscando colegios:", error)
    }
  }

  function normalizarNivel(nivel: string): string {
    if (!nivel) return ""
    nivel = nivel.toLowerCase()

    if (nivel.includes("inicial")) return "inicial"
    if (nivel.includes("primaria")) return "primaria"
    if (nivel.includes("secundaria")) return "secundaria"

    return ""
  }

  const handleDownloadCSV = async () => {
    const endpoint = getExportEndpoint(filters)

    if (!endpoint) {
      alert("Seleccione al menos una encuesta")
      return
    }

    const res = await fetch(endpoint)
    if (!res.ok) {
      alert("No se pudo generar el CSV")
      return
    }

    const blob = await res.blob()
    const downloadUrl = window.URL.createObjectURL(blob)

    let fileName = "reporte";
    if (filters.encuesta) fileName += `_encuesta_${filters.encuesta}`;
    if (filters.dre) fileName += `_dre_${filters.dre}`;
    if (filters.ugel) fileName += `_ugel_${filters.ugel}`;
    if (filters.colegio) fileName += `_colegio_${filters.colegio}`;
    fileName += ".csv";

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(downloadUrl)
  }


  const handleSelectSchool = (school: any) => {
    setFilteredSchools([])
    setFilters((prev) => ({
      ...prev,
      colegio: school.id,
      colegioNombre: school.name,
      grado: "",
    }))
  }

  // 🔹 Determinar los grados disponibles según el nivel
  const level = filters.nivelEducativo || ""
  const gradeOptions =
    level.toLowerCase() === "primaria"
      ? ["4", "5", "6"]
      : level.toLowerCase() === "secundaria"
        ? ["1", "2", "3", "4", "5"]
        : [] // 🔒 si es inicial u otro, no hay grados disponibles

  useEffect(() => {
    const fetchCharts = async () => {
      if (!filters.encuesta) return;
      setLoading(true);

      const params = new URLSearchParams();

      params.append("encuesta", filters.encuesta);

      if (filters.dre) params.append("dre", filters.dre);

      // 👉 Si hay colegio, también enviar UGEL
      if (filters.colegio) {
        params.append("colegio", filters.colegio);
        if (filters.ugel) params.append("ugel", filters.ugel);
        if (filters.grado) params.append("grado", filters.grado);
      } else {
        // 👉 Si NO hay colegio, usar ugel normal
        if (filters.ugel) params.append("ugel", filters.ugel);
      }

      const res = await fetch(`/api/resultados?${params.toString()}`);
      const data = await res.json();

      if (!data.success) {
        setCharts([]);
        setLoading(false);
        return;
      }

      const sortedCharts = [...(data.charts || [])].sort((a, b) => {
        const idA = a.id ?? 0
        const idB = b.id ?? 0
        return idA - idB
      })

      setCharts(sortedCharts)
      setLoading(false)
    };

    fetchCharts();
  }, [
    filters.encuesta,
    filters.dre,
    filters.ugel,
    filters.colegio,
    filters.grado
  ]);

  function convertChartsToRows(charts: any[]): RowItem[] {
    const rows: RowItem[] = [];

    charts.forEach(chart => {
      if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
        // Si no hay datos, puedes agregar un row con "Sin respuesta" opcional
        rows.push({
          question_text: String(chart.question ?? ""),
          option_text: "Sin respuestas",
          cantidad: 0
        });
        return;
      }

      chart.data.forEach((item: any) => {
        rows.push({
          question_text: String(chart.question ?? ""),
          option_text: String(item?.name ?? "Sin respuesta"),
          cantidad: Number(item?.["# de Respuestas"] ?? 0)
        });
      });
    });

    return rows;
  }

  useEffect(() => {
    if (charts.length === 0) return;

    setPdfRows(convertChartsToRows(charts));
    setPdfFilters({
      dre: dres.find(d => d.id === filters.dre)?.name || "",
      ugel: ugels.find(u => u.id === filters.ugel)?.name || "",
      colegio: schools.find(s => s.id === filters.colegio)?.name || "",
      tipoEncuesta: surveys.find(s => s.id === filters.encuesta)?.title || ""
    });
  }, [charts, filters, dres, ugels, schools, surveys]);

  const handleExportPDFDirect = async () => {
    if (!charts || charts.length === 0) return;

    // Crear el documento PDF
    const doc = <ReportePDF rows={pdfRows} filters={pdfFilters} />;
    
    // Generar el PDF como blob
    const asPdf = pdf(doc);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();

    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Opciones Múltiples</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* FILA 1: Encuesta y DRE */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Encuesta</label>
            <select
              value={filters.encuesta}
              onChange={(e) => handleSelectEncuesta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccione una encuesta --</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">DRE</label>
            <select
              value={filters.dre}
              onChange={(e) => handleFilterChange("dre", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccione una DRE --</option>
              {dres.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FILA 2: UGEL y Colegio */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">UGEL</label>
            <select
              value={filters.ugel}
              onChange={(e) => handleFilterChange("ugel", e.target.value)}
              disabled={!filters.dre}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Seleccione una UGEL --</option>
              {ugels.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colegio</label>
            <input
              type="text"
              value={filters.colegioNombre || ""}
              onChange={(e) => handleSearchSchool(e.target.value)}
              placeholder="Escribe el nombre del colegio..."
              disabled={!filters.ugel}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

            {filteredSchools.length > 0 && (
              <ul className="border rounded mt-2 max-h-60 overflow-y-auto bg-white shadow">
                {filteredSchools.map((s) => (
                  <li
                    key={s.id}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelectSchool(s)}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* FILA 3: Nivel educativo (siempre bloqueado) y grado */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel Educativo</label>
            <select
              value={filters.nivelEducativo}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            >
              <option value="">-- Nivel automático --</option>
              <option value="inicial">Inicial</option>
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
            <select
              value={filters.grado}
              onChange={(e) => handleFilterChange("grado", e.target.value)}
              disabled={!filters.colegio || level.toLowerCase() === "inicial"} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Todos los Grados --</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button> 
          <button
            onClick={handleDownloadCSV}
            disabled={!filters.encuesta}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Exportar CSV
          </button>
          <button
            onClick={handleExportPDFDirect}
            disabled={!charts || charts.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-12 text-gray-600">Cargando reportes...</div>
      ) : showCharts ? (
        charts.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {charts.map((chart, i) => (
              <ChartCard key={i} title={chart.question} data={chart.data} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No hay datos disponibles para los filtros seleccionados.</p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">Por favor, seleccione una encuesta para ver los resultados.</p>
        </div>
      )}
    </div>
  )
}