"use client"

import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"

interface LoadingDialogProps {
  isOpen: boolean
  message?: string
  duration?: number
  onClose?: () => void
}

export function LoadingDialog({ isOpen, message = "Procesando...", duration, onClose }: LoadingDialogProps) {
  useEffect(() => {
    if (!isOpen || !duration) return

    const timer = setTimeout(() => {
      if (onClose) {
        onClose()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-[80]">
      <div className="bg-white rounded-lg shadow-lg px-8 py-6 flex flex-col items-center gap-4">
        <Spinner className="size-8 text-blue-600" />
        <p className="text-gray-700 font-medium text-center">{message}</p>
      </div>
    </div>
  )
}
