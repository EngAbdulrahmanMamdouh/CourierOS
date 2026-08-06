import { getAccessToken, isLocalDevAuthEnabled, LOCAL_DEV_ROLE_STORAGE_KEY, LOCAL_DEV_USERNAME_STORAGE_KEY, LOCAL_DEV_COMPANY_ID_STORAGE_KEY } from '@/services/auth'

export type FrontendPermission =
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'companies.view'
  | 'companies.manage'
  | 'shipments.view'
  | 'shipments.create'
  | 'shipments.update'
  | 'shipments.delete'
  | 'shipments.assign_driver'
  | 'customers.view'
  | 'customers.manage'
  | 'finance.view'
  | 'finance.manage'
  | 'reports.view'

export type FrontendRole = 'super_admin' | 'company_admin' | 'branch_manager' | 'dispatcher' | 'driver' | 'employee' | 'admin' | 'user'

export type AuthUserContext = {
  role: FrontendRole
  companyId: number | null
  username: string | null
}

const ROLE_PERMISSIONS: Record<FrontendRole, Set<FrontendPermission>> = {
  super_admin: new Set<FrontendPermission>([
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'companies.view',
    'companies.manage',
    'shipments.view',
    'shipments.create',
    'shipments.update',
    'shipments.delete',
    'shipments.assign_driver',
    'customers.view',
    'customers.manage',
    'finance.view',
    'finance.manage',
    'reports.view',
  ]),
  admin: new Set<FrontendPermission>([
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'companies.view',
    'companies.manage',
    'shipments.view',
    'shipments.create',
    'shipments.update',
    'shipments.delete',
    'shipments.assign_driver',
    'customers.view',
    'customers.manage',
    'finance.view',
    'finance.manage',
    'reports.view',
  ]),
  company_admin: new Set<FrontendPermission>([
    'users.view',
    'users.create',
    'users.update',
    'companies.view',
    'companies.manage',
    'shipments.view',
    'shipments.create',
    'shipments.update',
    'shipments.assign_driver',
    'customers.view',
    'customers.manage',
    'finance.view',
    'finance.manage',
    'reports.view',
  ]),
  branch_manager: new Set<FrontendPermission>([
    'shipments.view',
    'shipments.create',
    'shipments.update',
    'shipments.assign_driver',
    'customers.view',
    'customers.manage',
    'finance.view',
    'reports.view',
  ]),
  dispatcher: new Set<FrontendPermission>([
    'shipments.view',
    'shipments.create',
    'shipments.update',
    'shipments.assign_driver',
    'customers.view',
    'reports.view',
  ]),
  driver: new Set<FrontendPermission>(['shipments.view', 'shipments.update']),
  employee: new Set<FrontendPermission>(['shipments.view', 'customers.view', 'reports.view']),
  user: new Set<FrontendPermission>(),
}

const ROUTE_PERMISSION_MAP: Array<{ match: (pathname: string) => boolean; permission: FrontendPermission }> = [
  {
    match: (pathname) => pathname === '/dashboard' || pathname === '/dashboard/',
    permission: 'shipments.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/shipments' || pathname.startsWith('/dashboard/shipments/'),
    permission: 'shipments.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/branches' || pathname.startsWith('/dashboard/branches/'),
    permission: 'companies.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/companies' || pathname.startsWith('/dashboard/companies/'),
    permission: 'companies.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/customers' || pathname.startsWith('/dashboard/customers/'),
    permission: 'customers.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/users' || pathname.startsWith('/dashboard/users/'),
    permission: 'users.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/drivers' || pathname.startsWith('/dashboard/drivers/'),
    permission: 'shipments.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/cities' || pathname.startsWith('/dashboard/cities/'),
    permission: 'companies.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/delivery-zones' || pathname.startsWith('/dashboard/delivery-zones/'),
    permission: 'companies.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/pickup-requests' || pathname.startsWith('/dashboard/pickup-requests/'),
    permission: 'shipments.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/finance' || pathname.startsWith('/dashboard/finance/'),
    permission: 'finance.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/cod' || pathname.startsWith('/dashboard/cod/'),
    permission: 'finance.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/payments' || pathname.startsWith('/dashboard/payments/'),
    permission: 'finance.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/pricing-rules' || pathname.startsWith('/dashboard/pricing-rules/'),
    permission: 'finance.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/notifications' || pathname.startsWith('/dashboard/notifications/'),
    permission: 'shipments.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/company-settings' || pathname.startsWith('/dashboard/company-settings/'),
    permission: 'companies.manage',
  },
  {
    match: (pathname) => pathname === '/dashboard/tracking' || pathname.startsWith('/dashboard/tracking/'),
    permission: 'shipments.view',
  },
  {
    match: (pathname) => pathname === '/dashboard/reports' || pathname.startsWith('/dashboard/reports/'),
    permission: 'reports.view',
  },
]

export function normalizeRole(role: string | null | undefined): FrontendRole {
  const normalized = (role || '').trim().toLowerCase()

  switch (normalized) {
    case 'super_admin':
    case 'platform_admin':
    case 'admin':
      return 'super_admin'
    case 'company_admin':
      return 'company_admin'
    case 'branch_manager':
      return 'branch_manager'
    case 'dispatcher':
      return 'dispatcher'
    case 'driver':
      return 'driver'
    case 'employee':
      return 'employee'
    case 'user':
      return 'user'
    default:
      return 'user'
  }
}

export function getAuthenticatedUserContext(): AuthUserContext {
  if (isLocalDevAuthEnabled() && typeof window !== 'undefined') {
    try {
      const role = localStorage.getItem(LOCAL_DEV_ROLE_STORAGE_KEY) || 'super_admin'
      const username = localStorage.getItem(LOCAL_DEV_USERNAME_STORAGE_KEY) || 'local-dev-admin'
      const companyIdValue = Number(localStorage.getItem(LOCAL_DEV_COMPANY_ID_STORAGE_KEY) || '1')

      return {
        role: normalizeRole(role),
        companyId: Number.isFinite(companyIdValue) ? companyIdValue : 1,
        username,
      }
    } catch {
      return { role: 'super_admin', companyId: 1, username: 'local-dev-admin' }
    }
  }

  const token = getAccessToken()

  if (!token) {
    return { role: 'user', companyId: null, username: null }
  }

  try {
    const parts = token.split('.')

    if (parts.length < 2) {
      return { role: 'user', companyId: null, username: null }
    }

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalizedPayload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=')
    const decoded = window.atob(normalizedPayload)
    const parsed = JSON.parse(decoded) as {
      role?: string
      company_id?: number | string | null
      sub?: string
      username?: string
    }

    const companyId = typeof parsed.company_id === 'number'
      ? parsed.company_id
      : typeof parsed.company_id === 'string' && parsed.company_id.trim() !== ''
        ? Number(parsed.company_id)
        : null

    return {
      role: normalizeRole(parsed.role),
      companyId: Number.isFinite(companyId) ? companyId : null,
      username: parsed.sub || parsed.username || null,
    }
  } catch {
    return { role: 'user', companyId: null, username: null }
  }
}

export function getCurrentRole(): FrontendRole {
  return getAuthenticatedUserContext().role
}

export function getRoleLabel(role: string | null | undefined): string {
  switch (normalizeRole(role)) {
    case 'super_admin':
      return 'Platform Admin'
    case 'company_admin':
      return 'Company Admin'
    case 'branch_manager':
      return 'Branch Manager'
    case 'dispatcher':
      return 'Dispatcher'
    case 'driver':
      return 'Driver'
    case 'employee':
      return 'Employee'
    default:
      return 'User'
  }
}

export function hasPermission(permission: FrontendPermission): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const role = getCurrentRole()
  const permissions = ROLE_PERMISSIONS[role]

  return permissions?.has(permission) ?? false
}

export function canManageUsers(): boolean {
  return hasPermission('users.create') || hasPermission('users.update') || hasPermission('users.delete')
}

export function canViewUsers(): boolean {
  return hasPermission('users.view')
}

export function canCreateUsers(): boolean {
  return hasPermission('users.create')
}

export function canUpdateUsers(): boolean {
  return hasPermission('users.update')
}

export function canDeleteUsers(): boolean {
  return hasPermission('users.delete')
}

export function canAccessRoute(pathname: string): boolean {
  if (isLocalDevAuthEnabled()) {
    return true
  }

  const token = getAccessToken()

  if (!token) {
    return false
  }

  const normalizedPath = pathname || '/dashboard'

  const matchedRoute = ROUTE_PERMISSION_MAP.find((entry) => entry.match(normalizedPath))

  if (!matchedRoute) {
    return true
  }

  return hasPermission(matchedRoute.permission)
}
