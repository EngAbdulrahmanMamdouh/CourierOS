'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { setLocalDevAuth, isLocalDevAuthEnabled } from '@/services/auth'
import { canAccessRoute } from '@/services/rbac'

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const showDevBypass = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    const allowed = canAccessRoute(pathname)
    setHasAccess(allowed)
    setIsReady(true)

    if (!allowed) {
      router.replace('/dashboard')
    }
  }, [pathname, router])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-center text-slate-300">
        <div className="max-w-md rounded-[24px] border border-slate-800/80 bg-slate-900/70 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Loading</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Preparing your workspace…</h1>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-center text-slate-300">
        <div className="max-w-md rounded-[24px] border border-rose-500/20 bg-slate-900/70 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-300">Access denied</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">You do not have permission to view this page.</h1>
          <p className="mt-3 text-sm text-slate-400">Please contact an administrator if you believe this is an error.</p>
          {showDevBypass ? (
            <button
              type="button"
              onClick={() => {
                setLocalDevAuth(true, 'super_admin', 'local-dev-admin', 1)
                setHasAccess(true)
                router.refresh()
              }}
              className="mt-6 inline-flex items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20"
            >
              Continue in demo mode
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
