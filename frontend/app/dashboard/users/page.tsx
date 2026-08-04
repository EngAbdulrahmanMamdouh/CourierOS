"use client"

import { useMemo, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useChangeRole, useChangeStatus, useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '@/hooks/useUsers'
import UserDialog, { type UserFormValues } from '@/components/users/UserDialog'
import DeleteUserDialog from '@/components/users/DeleteUserDialog'
import RoleDialog from '@/components/users/RoleDialog'
import StatusToggle from '@/components/users/StatusToggle'
import UsersTable from '@/components/users/UsersTable'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { canCreateUsers, canDeleteUsers, canUpdateUsers, canViewUsers } from '@/services/rbac'
import type { User } from '@/services/user'

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const canView = canViewUsers()
  const canCreate = canCreateUsers()
  const canUpdate = canUpdateUsers()
  const canDelete = canDeleteUsers()
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { data: users = [], isLoading, isError, error } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const changeRoleMutation = useChangeRole()
  const changeStatusMutation = useChangeStatus()

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return users

    return users.filter((user) => {
      const username = user.username?.toLowerCase() ?? ''
      const fullName = user.full_name?.toLowerCase() ?? ''
      const email = user.email?.toLowerCase() ?? ''

      return username.includes(query) || fullName.includes(query) || email.includes(query)
    })
  }, [search, users])

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.is_active).length,
      inactive: users.filter((user) => !user.is_active).length,
    }),
    [users],
  )

  const closeDialogs = () => {
    setIsUserDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setIsRoleDialogOpen(false)
    setIsStatusDialogOpen(false)
    setSelectedUser(null)
    setSubmitError(null)
  }

  const openCreateDialog = () => {
    setSelectedUser(null)
    setSubmitError(null)
    setIsUserDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setSubmitError(null)
    setIsUserDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setSubmitError(null)
    setIsDeleteDialogOpen(true)
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setSubmitError(null)
    setIsRoleDialogOpen(true)
  }

  const openStatusDialog = (user: User) => {
    setSelectedUser(user)
    setSubmitError(null)
    setIsStatusDialogOpen(true)
  }

  const handleUserSubmit = async (values: UserFormValues) => {
    setSubmitError(null)

    try {
      if (selectedUser) {
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          payload: {
            email: values.email,
            full_name: values.full_name || null,
            phone: values.phone || null,
          },
        })
        toast.success('User updated successfully')
      } else {
        const normalizedCompanyId: number | null = values.company_id == null ? null : Number(values.company_id)
        const safeCompanyId = normalizedCompanyId === null ? null : Number.isFinite(normalizedCompanyId) && normalizedCompanyId > 0 ? normalizedCompanyId : null

        await createUserMutation.mutateAsync({
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password || '',
          company_id: safeCompanyId,
          role: values.role || 'employee',
          full_name: values.full_name?.trim() || null,
          phone: values.phone?.trim() || null,
        })

        toast.success('User created successfully')
      }

      closeDialogs()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save user.'
      setSubmitError(message)
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id)
      closeDialogs()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to delete user.')
    }
  }

  const handleRoleChange = async (role: string) => {
    if (!selectedUser) return

    try {
      await changeRoleMutation.mutateAsync({
        id: selectedUser.id,
        payload: { role },
      })
      closeDialogs()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to change role.')
    }
  }

  const handleStatusChange = async (active: boolean) => {
    if (!selectedUser) return

    try {
      await changeStatusMutation.mutateAsync({
        id: selectedUser.id,
        payload: { is_active: active },
      })
      closeDialogs()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to update status.')
    }
  }

  const renderContent = () => {
    if (!canView) {
      return <Card className="p-6 text-sm text-rose-300">You do not have access to this module.</Card>
    }

    if (isLoading) {
      return <Card className="p-6 text-sm text-slate-400">Loading users…</Card>
    }

    if (isError) {
      return <Card className="border-rose-500/30 bg-rose-950/20 p-6 text-sm text-rose-300">{error instanceof Error ? error.message : 'Unable to load users.'}</Card>
    }

    if (!filteredUsers.length) {
      return (
        <Card className="border-dashed border-white/10 bg-slate-900/60 p-12 text-center text-sm text-slate-400">
          <p className="text-lg font-medium text-slate-200">No users found</p>
          <p className="mt-2">Try a different search term or add a new user.</p>
        </Card>
      )
    }

    return <UsersTable users={filteredUsers} onEdit={canUpdate ? openEditDialog : () => undefined} onDelete={canDelete ? openDeleteDialog : () => undefined} onRole={canUpdate ? openRoleDialog : () => undefined} onToggleStatus={canUpdate ? openStatusDialog : () => undefined} />
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8 px-6 py-6">
      <Card className="flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Users</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage users</h1>
          <p className="mt-2 text-sm text-slate-400">Browse and manage platform users and permissions.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-slate-300">{stats.total} users</div>
          {canCreate ? (
            <Button onClick={openCreateDialog} className="gap-2" variant="primary">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          ) : null}
        </div>
      </Card>

      <Card className="rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total</p>
            <p className="mt-3 text-2xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Active</p>
            <p className="mt-3 text-2xl font-semibold text-white">{stats.active}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Inactive</p>
            <p className="mt-3 text-2xl font-semibold text-white">{stats.inactive}</p>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="user-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" className="pl-11 pr-4" />
          </div>
          {search ? (
            <Button type="button" variant="secondary" onClick={() => setSearch('')} className="whitespace-nowrap">
              Clear
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="mt-6">{renderContent()}</div>

      <UserDialog
        open={isUserDialogOpen}
        onClose={closeDialogs}
        onSubmit={handleUserSubmit}
        isSubmitting={createUserMutation.isPending || updateUserMutation.isPending}
        submitError={submitError}
        editing={selectedUser}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onClose={closeDialogs}
        onConfirm={handleDelete}
        isSubmitting={deleteUserMutation.isPending}
        user={selectedUser}
      />

      <RoleDialog
        open={isRoleDialogOpen}
        onClose={closeDialogs}
        onConfirm={handleRoleChange}
        isSubmitting={changeRoleMutation.isPending}
        user={selectedUser}
        currentRole={selectedUser?.role}
      />

      <StatusToggle
        open={isStatusDialogOpen}
        onClose={closeDialogs}
        onConfirm={handleStatusChange}
        isSubmitting={changeStatusMutation.isPending}
        user={selectedUser}
        currentStatus={selectedUser?.is_active}
      />
    </div>
  )
}
