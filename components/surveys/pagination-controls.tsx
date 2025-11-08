"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const start = pageSize > 0 ? (currentPage - 1) * pageSize + 1 : 1
  const end = pageSize > 0 ? Math.min(currentPage * pageSize, totalItems) : totalItems

  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      <div className="text-sm text-gray-600">{`Mostrando ${start}–${end} de ${totalItems}`}</div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 mr-2">Filas:</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={0}>Todos</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded disabled:opacity-50 border"
          title="Primera"
        >
          {"<<"}
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded disabled:opacity-50 border flex items-center gap-1"
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        <div className="flex items-center gap-1 px-2">
          {(() => {
            const pages: number[] = []
            const range = 3
            let start = Math.max(1, currentPage - range)
            let end = Math.min(totalPages, currentPage + range)
            if (currentPage <= range) {
              end = Math.min(totalPages, 1 + range * 2)
            }
            if (currentPage + range > totalPages) {
              start = Math.max(1, totalPages - range * 2)
            }
            for (let i = start; i <= end; i++) pages.push(i)
            return pages.map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1 rounded ${p === currentPage ? "bg-blue-600 text-white" : "border"}`}
              >
                {p}
              </button>
            ))
          })()}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded disabled:opacity-50 border flex items-center gap-1"
        >
          Siguiente <ChevronRight size={14} />
        </button>
        <button
          onClick={() => gotoPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded disabled:opacity-50 border"
          title="Última"
        >
          {">>"}
        </button>
      </div>
    </div>
  )
}

function gotoPage(page: number) {
  return page
}
