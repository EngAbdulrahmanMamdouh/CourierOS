"use client"

import { AlertDialog } from '@/components/ui/alert-dialog'
import type { User } from '@/services/user'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  isSubmitting?: boolean
  user: User | null
}

export default function DeleteUserDialog({ open, onClose, onConfirm, isSubmitting, user }: Props) {
  if (!open || !user) return null

  return (
    <AlertDialog
      open={open}
      onClose={onClose}
      title={`Remove ${user.username}?`}
      description="This action cannot be undone. The user will be removed from the system and will no longer be able to sign in."
      confirmLabel="Delete user"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
      confirmVariant="danger"
    />
  )
}
