import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeRole,
  changeStatus,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  type User,
  type UserCreatePayload,
  type UserRoleUpdatePayload,
  type UserStatusUpdatePayload,
  type UserUpdatePayload,
} from '@/services/user'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all] as const,
  detail: (id: number) => [...userKeys.all, id] as const,
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: userKeys.lists(),
    queryFn: () => getUsers(),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, UserCreatePayload>({
    mutationFn: (payload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, { id: number; payload: UserUpdatePayload }>({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useChangeRole() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, { id: number; payload: UserRoleUpdatePayload }>({
    mutationFn: ({ id, payload }) => changeRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useChangeStatus() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, { id: number; payload: UserStatusUpdatePayload }>({
    mutationFn: ({ id, payload }) => changeStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUser(id: number) {
  return useQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
  })
}
