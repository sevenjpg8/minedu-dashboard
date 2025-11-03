"use client"

interface ProgressBarProps {
  current: number
  total: number
  porcentaje: number
}

export default function ProgressBar({ current, total, porcentaje }: ProgressBarProps) {
  const getBarColor = () => {
    if (porcentaje === 100) return "bg-green-500"
    if (porcentaje >= 50) return "bg-blue-500"
    return "bg-red-500"
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div className={`h-full ${getBarColor()} transition-all duration-300`} style={{ width: `${porcentaje}%` }} />
        </div>
        <span className="text-sm text-slate-600 whitespace-nowrap">
          {current}/{total}
        </span>
      </div>
    </div>
  )
}
