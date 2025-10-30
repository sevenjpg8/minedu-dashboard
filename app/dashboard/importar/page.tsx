"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"

export default function ImportarPage() {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
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
                El archivo a subir debe ser un <span className="font-semibold">XLSX o XLS</span>.
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
              <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
            </label>
            <span className="text-gray-600">{fileName || "No file chosen"}</span>
          </div>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          INICIAR IMPORTACIÓN
        </button>
      </div>
    </div>
  )
}
