'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { canAccessRoute } from '@/services/rbac'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!canAccessRoute(pathname)) {
      router.replace('/dashboard')
    }
  }, [pathname, router])

  if (!canAccessRoute(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-center text-slate-300">
        <div className="max-w-md rounded-[24px] border border-rose-500/20 bg-slate-900/70 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-300">Access denied</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">You do not have permission to view this page.</h1>
          <p className="mt-3 text-sm text-slate-400">Please contact an administrator if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
