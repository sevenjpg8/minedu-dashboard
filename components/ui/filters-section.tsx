"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FiltersSectionProps {
  selectedDRE: string
  selectedUGEL: string
  selectedColegio: string
  dres: string[]
  ugels: string[]
  colegios: string[]
  onDREChange: (dre: string) => void
  onUGELChange: (ugel: string) => void
  onColegioChange: (colegio: string) => void
  onSearch: () => void
  onClear: () => void
}

export default function FiltersSection({
  selectedDRE,
  selectedUGEL,
  selectedColegio,
  dres,
  ugels,
  colegios,
  onDREChange,
  onUGELChange,
  onColegioChange,
  onSearch,
  onClear,
}: FiltersSectionProps) {
  return (
    <Card className="mb-8 border-slate-200">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* DRE Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">DRE</label>
              <Select value={selectedDRE} onValueChange={onDREChange}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="-- Selecciona una DRE --" />
                </SelectTrigger>
                <SelectContent>
                  {dres.map((dre) => (
                    <SelectItem key={dre} value={dre}>
                      {dre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* UGEL Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">UGEL</label>
              <Select value={selectedUGEL} onValueChange={onUGELChange} disabled={!selectedDRE}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="-- Selecciona una UGEL --" />
                </SelectTrigger>
                <SelectContent>
                  {ugels.map((ugel) => (
                    <SelectItem key={ugel} value={ugel}>
                      {ugel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Colegio Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Colegio</label>
              <Select value={selectedColegio} onValueChange={onColegioChange} disabled={!selectedUGEL}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="-- Selecciona un Colegio --" />
                </SelectTrigger>
                <SelectContent>
                  {colegios.map((colegio) => (
                    <SelectItem key={colegio} value={colegio}>
                      {colegio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-2">
              <Button onClick={onSearch} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Buscar
              </Button>
              <Button
                onClick={onClear}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
