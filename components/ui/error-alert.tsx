"use client"

import { AlertCircle } from "lucide-react"
import { useEffect } from "react"

interface ErrorAlertProps {
  message: string
  onClose: () => void
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
    </div>
  )
}
