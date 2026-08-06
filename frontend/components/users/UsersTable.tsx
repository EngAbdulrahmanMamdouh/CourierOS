"use client"

import { PencilLine, ShieldCheck, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table'
import type { User } from '@/services/user'

type UsersTableProps = {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onRole: (user: User) => void
  onToggleStatus: (user: User) => void
}

function getInitials(value?: string | null) {
  if (!value) return 'U'

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'
}

function roleVariant(role: string) {
  switch (role) {
    case 'super_admin':
      return 'primary'
    case 'company_admin':
      return 'default'
    case 'branch_manager':
      return 'warning'
    case 'dispatcher':
      return 'success'
    case 'driver':
      return 'muted'
    default:
      return 'default'
  }
}

export default function UsersTable({ users, onEdit, onDelete, onRole, onToggleStatus }: UsersTableProps) {
  const { t } = useTranslation()

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('users.page.title')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{t('users.page.manage')}</h2>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-6">
        <Table className="min-w-full">
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeaderCell>{t('users.table.avatar')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.username')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.full_name')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.email')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.phone')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.role')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.company')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.status')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.created')}</TableHeaderCell>
              <TableHeaderCell>{t('users.table.actions')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-white/5">
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800/80 text-sm font-semibold text-slate-200">
                    {getInitials(user.full_name || user.username)}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-white">{user.username}</TableCell>
                <TableCell>{user.full_name || '—'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '—'}</TableCell>
                <TableCell>
                  <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                </TableCell>
                <TableCell>{user.company_id ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'success' : 'muted'}>{user.is_active ? t('users.page.active') : t('users.page.inactive')}</Badge>
                </TableCell>
                <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" className="gap-2 px-3 py-2" onClick={() => onEdit(user)}>
                      <PencilLine className="h-4 w-4" /> {t('users.table.edit')}
                    </Button>
                    <Button variant="secondary" className="gap-2 px-3 py-2" onClick={() => onRole(user)}>
                      <ShieldCheck className="h-4 w-4" /> {t('users.table.role')}
                    </Button>
                    <Button variant="secondary" className="gap-2 px-3 py-2" onClick={() => onToggleStatus(user)}>
                      {user.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                      {user.is_active ? t('users.table.disable') : t('users.table.enable')}
                    </Button>
                    <Button variant="danger" className="gap-2 bg-rose-500/20 px-3 py-2 text-rose-200 hover:bg-rose-500/30" onClick={() => onDelete(user)}>
                      <Trash2 className="h-4 w-4" /> {t('users.table.delete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  )
}
