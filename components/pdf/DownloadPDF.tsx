// components/DownloadPDF.tsx
"use client"

import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportePDF from "./ReportePDF";

export default function DownloadPDF({ rows, filters }: { rows: any[], filters: any }) {
  if (!rows || rows.length === 0) return null;

  return (
    <PDFDownloadLink
      document={<ReportePDF rows={rows} filters={filters} />}
      fileName="reporte.pdf"
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer"
        >
          {loading ? "Generando..." : "Exportar PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
