'use client'

import { Bell, Search, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type DashboardHeaderProps = {
  greeting: string
  dateLabel: string
}

export default function DashboardHeader({ greeting, dateLabel }: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState('')

  return (
    <section className="glass-card border-white/10 px-6 py-6 shadow-slate-950/20 fade-in">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr_auto] lg:items-center">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">Operations</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">{greeting}</h1>
          <p className="text-sm text-slate-400">{dateLabel}</p>
        </div>

        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            type="search"
            placeholder="Search shipments, customers, branches"
            className="input h-14 w-full rounded-[18px] border-white/10 bg-slate-950/80 px-12 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:bg-slate-900"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/companies" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Companies
          </Link>
          <Link href="/dashboard/payments" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Payments
          </Link>
          <Link href="/dashboard/pickup-requests" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Pickup Requests
          </Link>
          <Link href="/dashboard/cod" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            COD
          </Link>
          <Link href="/dashboard/customers" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Customers
          </Link>
          <Link href="/dashboard/pricing-rules" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Pricing Rules
          </Link>
          <Link href="/dashboard/delivery-zones" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Delivery Zones
          </Link>
          <Link href="/dashboard/company-settings" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Company Settings
          </Link>
          <Link href="/dashboard/live-tracking" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            Tracking
          </Link>
          <Link href="/finance" className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-emerald-400/20 bg-emerald-500/10 px-4 text-emerald-200 transition hover:border-emerald-400/40 hover:bg-emerald-500/20">
            Finance
          </Link>
          <Link href="/dashboard/notifications" className="inline-flex h-12 items-center justify-center rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900">
            <Bell className="mr-2 h-4 w-4 text-slate-200" />
            <span className="text-sm text-slate-100">Notifications</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-12 items-center gap-3 rounded-[18px] border border-white/8 bg-slate-900/80 px-4 text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900"
          >
            <UserCircle className="h-5 w-5 text-slate-100" />
            <span className="text-sm text-slate-100">Abdelrahman</span>
          </button>
        </div>
      </div>
    </section>
  )
}
