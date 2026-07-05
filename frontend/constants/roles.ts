export const ROLES = ['platform_admin','company_admin','employee','user'] as const
export type Role = (typeof ROLES)[number]
