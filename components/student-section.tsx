"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

interface GradoItem {
  grade: number | string
  total: number
  publica: number
  privada: number
}


interface SeccionItem {
  grade: string;
  section: string;
  total: string;
  publica?: string;
  privada?: string;
}

export default function StudentsSection({ totals }: { totals: any }) {
    const [expandedRow, setExpandedRow] = useState<"Primaria" | "Secundaria" | null>(null)
    const [expandedSubRow, setExpandedSubRow] = useState<"Grado" | "Seccion" | null>(null)

    const toggleExpand = (row: "Primaria" | "Secundaria") => setExpandedRow(expandedRow === row ? null : row)

    const toggleSubExpand = (sub: "Grado" | "Seccion") => setExpandedSubRow(expandedSubRow === sub ? null : sub)

    const primaryBlue = "#1e40af"
    const accentRed = "#dc2626"
    const borderGray = "#e5e7eb"

    const getGradeNumber = (grade: number | string) => {
        const match = String(grade).match(/\d+/)
        return match ? parseInt(match[0], 10) : null
    }

    const filterEvaluatedGrades = <T extends { grade: number | string }>(items: T[]) =>
        items?.filter((item) => {
            const gradeNumber = getGradeNumber(item.grade)
            return gradeNumber !== null && gradeNumber >= 4 && gradeNumber <= 6
        }) ?? []

    const primariaGrados: GradoItem[] = filterEvaluatedGrades<GradoItem>(totals?.primaria?.grados ?? [])
    const primariaSecciones: SeccionItem[] = filterEvaluatedGrades<SeccionItem>(totals?.primaria?.secciones ?? [])

    return (
        <Card className="border">
            <CardHeader>
                <CardTitle className="text-xl">I. Estudiantes Participantes</CardTitle>
                <CardDescription>Desglose por nivel, grado, sección, UGEL y DRE</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderColor: borderGray }} className="border-b">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                    Categoría
                                </th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                                    Total
                                </th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                                    Gestión Pública
                                </th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                                    Gestión Privada
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* NIVEL PRIMARIA */}
                            <tr
                                onClick={() => toggleExpand("Primaria")}
                                className="border-b hover:bg-blue-50 cursor-pointer"
                                style={{ borderColor: borderGray }}
                            >
                                <td className="py-3 px-4 text-gray-900 font-medium flex items-center gap-2">
                                    Primaria
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform ${expandedRow === "Primaria" ? "rotate-90" : ""}`}
                                    />
                                </td>
                                <td className="text-right py-3 px-4 font-semibold text-gray-900">
                                    {Number(totals.primaria.total)?.toLocaleString() ?? 0}
                                </td>
                                <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                                    {totals.primaria?.publica?.toLocaleString?.() ?? 0}
                                </td>
                                <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                                    {totals.primaria?.privada?.toLocaleString?.() ?? 0}
                                </td>
                            </tr>

                            {/* Subniveles Primaria */}
                            {expandedRow === "Primaria" && (
                                <>
                                    {/* Grado */}
                                    <tr
                                        onClick={() => toggleSubExpand("Grado")}
                                        className="border-b bg-blue-50/30 cursor-pointer"
                                        style={{ borderColor: borderGray }}
                                    >
                                        <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                                            Grado
                                            <ChevronRight
                                                className={`w-4 h-4 transition-transform ${expandedSubRow === "Grado" ? "rotate-90" : ""
                                                    }`}
                                            />
                                        </td>
                                        <td className="text-right py-2 px-4">
                                            -
                                        </td>
                                        <td className="text-right py-2 px-4" style={{ color: primaryBlue }}>
                                            -
                                        </td>
                                        <td className="text-right py-2 px-4" style={{ color: accentRed }}>
                                            -
                                        </td>
                                    </tr>

                                    {/* Subniveles dentro de Grado */}
                                    {expandedSubRow === "Grado" && (
                                        <>
                                            {primariaGrados.map((g: GradoItem) => (
                                                <tr
                                                    key={g.grade}
                                                    className="border-b bg-blue-50/50"
                                                    style={{ borderColor: borderGray }}
                                                >
                                                    <td className="py-2 px-10 text-gray-600">
                                                        └─ {g.grade}°
                                                    </td>

                                                    <td className="text-right py-2 px-4">
                                                        {Number(g.total).toLocaleString()}
                                                    </td>

                                                    <td className="text-right py-2 px-4">
                                                        {Number(g.publica ?? 0).toLocaleString()}
                                                    </td>

                                                    <td className="text-right py-2 px-4">
                                                        {Number(g.privada ?? 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}

                                    {/* Sección */}
                                    <tr
                                        onClick={() => toggleSubExpand("Seccion")}
                                        className="border-b bg-blue-50/30 cursor-pointer"
                                        style={{ borderColor: borderGray }}
                                    >
                                        <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                                            Sección
                                            <ChevronRight
                                                className={`w-4 h-4 transition-transform ${expandedSubRow === "Seccion" ? "rotate-90" : ""
                                                    }`}
                                            />
                                        </td>
                                        <td className="text-right py-2 px-4">
                                            -
                                        </td>
                                        <td className="text-right py-2 px-4" style={{ color: primaryBlue }}>
                                            -
                                        </td>
                                        <td className="text-right py-2 px-4" style={{ color: accentRed }}>
                                            -
                                        </td>
                                    </tr>

                                    {/* Subniveles dentro de Sección */}
                                    {expandedSubRow === "Seccion" && (
                                        <>
                                            {primariaSecciones.map((s: SeccionItem) => (
                                                <tr
                                                    key={`${s.grade}-${s.section}`}
                                                    className="border-b bg-blue-50/50"
                                                    style={{ borderColor: borderGray }}
                                                >
                                                    <td className="py-2 px-10 text-gray-600">
                                                        └─ {s.grade}° — Sección {s.section}
                                                    </td>

                                                    <td className="text-right py-2 px-4">
                                                        {Number(s.total).toLocaleString()}
                                                    </td>

                                                    <td className="text-right py-2 px-4">
                                                        {Number(s.publica ?? 0).toLocaleString()}
                                                    </td>

                                                    <td className="text-right py-2 px-4">
                                                        {Number(s.privada ?? 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}

                            {/* NIVEL SECUNDARIA */}
                            <tr
                                onClick={() => toggleExpand("Secundaria")}
                                className="border-b hover:bg-blue-50 cursor-pointer"
                                style={{ borderColor: borderGray }}
                            >
                                <td className="py-3 px-4 text-gray-900 font-medium flex items-center gap-2">
                                    Secundaria
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform ${expandedRow === "Secundaria" ? "rotate-90" : ""}`}
                                    />
                                </td>
                                <td className="text-right py-3 px-4 font-semibold text-gray-900">
                                    {Number(totals.secundaria.total)?.toLocaleString() ?? 0}
                                </td>
                                <td className="text-right py-3 px-4" style={{ color: primaryBlue }}>
                                    {totals.secundaria?.publica?.toLocaleString?.() ?? 0}
                                </td>
                                <td className="text-right py-3 px-4" style={{ color: accentRed }}>
                                    {totals.secundaria?.privada?.toLocaleString?.() ?? 0}
                                </td>
                            </tr>

                            {/* Subniveles Secundaria */}
                            {expandedRow === "Secundaria" && (
                                <>
                                    {/* GRADO */}
                                    <tr
                                    onClick={() => toggleSubExpand("Grado")}
                                    className="border-b bg-blue-50/30 cursor-pointer"
                                    >
                                    <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                                        Grado
                                        <ChevronRight
                                        className={`w-4 h-4 transition-transform ${
                                            expandedSubRow === "Grado" ? "rotate-90" : ""
                                        }`}
                                        />
                                    </td>
                                    <td className="text-right py-2 px-4">-</td>
                                    <td className="text-right py-2 px-4">-</td>
                                    <td className="text-right py-2 px-4">-</td>
                                    </tr>

                                    {/* SUBNIVELES GRADO */}
                                    {expandedSubRow === "Grado" && (
                                    <>
                                        {totals.secundaria.grados?.map((g: GradoItem) => (
                                        <tr key={g.grade} className="border-b bg-blue-50/50">
                                            <td className="py-2 px-10 text-gray-600">└─ {g.grade}°</td>
                                            <td className="text-right py-2 px-4">{g.total}</td>
                                            <td className="text-right py-2 px-4">{g.publica}</td>
                                            <td className="text-right py-2 px-4">{g.privada}</td>
                                        </tr>
                                        ))}
                                    </>
                                    )}

                                    {/* SECCIÓN */}
                                    <tr
                                    onClick={() => toggleSubExpand("Seccion")}
                                    className="border-b bg-blue-50/30 cursor-pointer"
                                    >
                                    <td className="py-2 px-6 text-gray-700 flex items-center gap-2">
                                        Sección
                                        <ChevronRight
                                        className={`w-4 h-4 transition-transform ${
                                            expandedSubRow === "Seccion" ? "rotate-90" : ""
                                        }`}
                                        />
                                    </td>
                                    <td className="text-right py-2 px-4">-</td>
                                    <td className="text-right py-2 px-4">-</td>
                                    <td className="text-right py-2 px-4">-</td>
                                    </tr>

                                    {/* SUBNIVELES SECCION */}
                                    {expandedSubRow === "Seccion" && (
                                    <>
                                        {totals.secundaria.secciones?.map((s: SeccionItem) => (
                                        <tr key={`${s.grade}-${s.section}`} className="border-b bg-blue-50/50">
                                            <td className="py-2 px-10 text-gray-600">
                                            └─ {s.grade}° — Sección {s.section}
                                            </td>
                                            <td className="text-right py-2 px-4">{s.total}</td>
                                            <td className="text-right py-2 px-4">{s.publica}</td>
                                            <td className="text-right py-2 px-4">{s.privada}</td>
                                        </tr>
                                        ))}
                                    </>
                                    )}
                                </>
                            )}
                        </tbody>

                        {/* TOTAL NACIONAL */}
                        <tfoot>
                            <tr
                                style={{ borderColor: borderGray, backgroundColor: "#f3f4f6" }}
                                className="border-t-2"
                            >
                                <td className="py-3 px-4 font-bold text-gray-900">NACIONAL</td>
                                <td className="text-right py-3 px-4 font-bold text-gray-900">
                                    {Number(totals.nacional)?.toLocaleString() ?? 0}
                                </td>
                                <td
                                    className="text-right py-3 px-4 font-bold"
                                    style={{ color: primaryBlue }}
                                >
                                    {totals.colegios?.publica?.toLocaleString?.() ?? 0}
                                </td>
                                <td
                                    className="text-right py-3 px-4 font-bold"
                                    style={{ color: accentRed }}
                                >
                                    {totals.colegios?.privada?.toLocaleString?.() ?? 0}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
