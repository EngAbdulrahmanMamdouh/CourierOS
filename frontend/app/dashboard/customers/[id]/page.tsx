"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchCustomerById } from '@/services/customer'
import Link from 'next/link'

export default function CustomerDetails() {
  const params = useParams()
  const id = Number(params?.id)
  const [customer, setCustomer] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    if (!id) return
    fetchCustomerById(id).then((c) => { if (mounted) setCustomer(c) }).catch((e) => { if (mounted) setError(e instanceof Error ? e.message : 'Unable to load') })
    return () => { mounted = false }
  }, [id])

  if (error) return <div className="p-6 text-rose-400">{error}</div>
  if (!customer) return <div className="p-6 text-slate-400">Loading…</div>

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">{customer.full_name}</h1>
          <Link href="/dashboard/customers" className="text-sm text-slate-300">Back</Link>
        </div>
        <dl className="grid grid-cols-1 gap-4 text-sm text-slate-300">
          <div><dt className="font-medium text-slate-400">Phone</dt><dd>{customer.phone}</dd></div>
          <div><dt className="font-medium text-slate-400">Email</dt><dd>{customer.email ?? '—'}</dd></div>
          <div><dt className="font-medium text-slate-400">City</dt><dd>{customer.city}</dd></div>
          <div><dt className="font-medium text-slate-400">Address</dt><dd>{customer.address}</dd></div>
          <div><dt className="font-medium text-slate-400">Created</dt><dd>{new Date(customer.created_at).toLocaleString()}</dd></div>
        </dl>
      </div>
    </main>
  )
}
