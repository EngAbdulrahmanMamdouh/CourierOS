"use client"

import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  if (!open || !user) return null

  return (
    <AlertDialog
      open={open}
      onClose={onClose}
      title={t('users.delete_title', { username: user.username })}
      description={t('users.delete_description')}
      confirmLabel={t('users.button.delete_user')}
      cancelLabel={t('common.button.cancel')}
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
      confirmVariant="danger"
    />
  )
}
