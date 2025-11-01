"use client"

import { CheckCircle, AlertCircle, X } from "lucide-react"

interface AlertDialogProps {
  isOpen: boolean
  title: string
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
}

export function AlertDialog({ isOpen, title, message, type = "info", onClose }: AlertDialogProps) {
  if (!isOpen) return null

  const typeConfig = {
    success: {
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      borderColor: "border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700",
      Icon: CheckCircle,
    },
    error: {
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      borderColor: "border-red-200",
      buttonColor: "bg-red-600 hover:bg-red-700",
      Icon: AlertCircle,
    },
    info: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      Icon: AlertCircle,
    },
  }

  const config = typeConfig[type]
  const Icon = config.Icon

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
        <div className={`flex items-center justify-between p-6 border-b ${config.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon size={20} className={config.textColor} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-center">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`${config.buttonColor} text-white font-medium py-2 px-6 rounded-lg transition-colors`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
