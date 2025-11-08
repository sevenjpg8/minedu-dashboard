"use client"

import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { AlertDialog } from "@/components/dialogs/alert-dialog"
import { LoadingDialog } from "@/components/dialogs/loading-dialog"

interface DialogState {
  isOpen: boolean
  title: string
  description?: string
  message?: string
  type?: "success" | "error" | "info"
  onConfirm?: () => void
}

interface SurveyDialogsProps {
  confirmDialog: DialogState & { onConfirm: () => void; description: string }
  alertDialog: DialogState & { type: "success" | "error" | "info"; message: string }
  isSubmitting: boolean
  editingId: number | null
  onConfirmClose: () => void
  onAlertClose: () => void
  onSubmittingClose: () => void
}

export function SurveyDialogs({
  confirmDialog,
  alertDialog,
  isSubmitting,
  editingId,
  onConfirmClose,
  onAlertClose,
  onSubmittingClose,
}: SurveyDialogsProps) {
  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={confirmDialog.onConfirm}
        onCancel={onConfirmClose}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={onAlertClose}
      />

      <LoadingDialog
        isOpen={isSubmitting}
        message={editingId ? "Actualizando encuesta..." : "Creando encuesta..."}
        duration={5000}
        onClose={onSubmittingClose}
      />
    </>
  )
}
