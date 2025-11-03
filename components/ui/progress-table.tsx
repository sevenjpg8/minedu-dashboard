"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import ProgressBar from "@/components/ui/progress-bar"

interface ProgressData {
  dre: string
  ugel: string
  colegio: string
  totalEncuestas: number
  completadas: number
  porcentaje: number
  estado: "completado" | "en-progreso" | "no-iniciado"
}

interface ProgressTableProps {
  data: ProgressData[]
}

export default function ProgressTable({ data }: ProgressTableProps) {
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case "en-progreso":
        return <Badge className="bg-amber-100 text-amber-800">En Progreso</Badge>
      case "no-iniciado":
        return <Badge className="bg-red-100 text-red-800">No Iniciado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200 hover:bg-slate-50">
            <TableHead className="text-slate-700 font-semibold">DRE</TableHead>
            <TableHead className="text-slate-700 font-semibold">UGEL</TableHead>
            <TableHead className="text-slate-700 font-semibold">Colegio</TableHead>
            <TableHead className="text-slate-700 font-semibold">Total</TableHead>
            <TableHead className="text-slate-700 font-semibold">Completadas</TableHead>
            <TableHead className="text-slate-700 font-semibold">Progreso</TableHead>
            <TableHead className="text-slate-700 font-semibold">Porcentaje</TableHead>
            <TableHead className="text-slate-700 font-semibold">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx} className="border-slate-200 hover:bg-slate-50">
              <TableCell className="text-slate-900">{row.dre}</TableCell>
              <TableCell className="text-slate-900">{row.ugel}</TableCell>
              <TableCell className="text-slate-900">{row.colegio}</TableCell>
              <TableCell className="text-slate-900 font-medium">{row.totalEncuestas}</TableCell>
              <TableCell className="text-slate-900 font-medium">{row.completadas}</TableCell>
              <TableCell>
                <ProgressBar current={row.completadas} total={row.totalEncuestas} porcentaje={row.porcentaje} />
              </TableCell>
              <TableCell className="text-slate-900 font-semibold">{row.porcentaje}%</TableCell>
              <TableCell>{getStatusBadge(row.estado)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
