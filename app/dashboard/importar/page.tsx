// app/dashboard/importar/page.tsx
"use client"

import { useState } from "react"
import Papa from "papaparse"
import { Upload } from "lucide-react"

export default function ImportarPage() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    // Validar extensión
    if (!file.name.endsWith(".csv")) {
      alert("Por favor selecciona un archivo CSV.")
      return
    }

    Papa.parse(file, {
      header: true, // Usa la primera fila como encabezado
      skipEmptyLines: true,
      complete: (result) => {
        console.log("Datos importados:", result.data)
        setData(result.data)
      },
      error: (err) => {
        console.error("Error al leer el CSV:", err)
        alert("Ocurrió un error al procesar el archivo.")
      },
    })
  }

  const handleImport = async () => {
    if (data.length === 0) {
      alert("No hay datos para importar.")
      return
    }

    try {
      const res = await fetch("/api/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Error al importar")

      alert(result.message)
    } catch (error) {
      console.error("Error al importar:", error)
      alert("Ocurrió un error al importar los datos.")
    }
  }


  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Importar Relación de Colegios</h1>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Instrucciones:</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="font-medium">•</span>
              <span>
                El archivo a subir debe ser un <span className="font-semibold">CSV</span>.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">•</span>
              <span>La primera fila del archivo debe contener los encabezados de las columnas.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">•</span>
              <span>
                Las columnas mínimas requeridas son:{" "}
                <span className="font-semibold">Código, Nombre de la IE, DRE, y UGEL</span>.
              </span>
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Seleccionar archivo</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors">
              <Upload size={18} />
              Choose File
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
            <span className="text-gray-600">{fileName || "No file chosen"}</span>
          </div>
        </div>

        <button
          onClick={handleImport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          INICIAR IMPORTACIÓN
        </button>
      </div>
    </div>
  )
}
