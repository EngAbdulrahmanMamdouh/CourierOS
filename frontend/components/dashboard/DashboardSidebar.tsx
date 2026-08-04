'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import { getAuthenticatedUserContext, getRoleLabel } from '@/services/rbac'
import {
  BellRing,
  Building2,
  CircleDollarSign,
  LayoutDashboard,
  MapPin,
  Package,
  PackageCheck,
  Receipt,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
  MoveRight,
} from 'lucide-react'

// ⬇️ الصق هنا

type NavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  allowed?: boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Shipments',
        href: '/dashboard/shipments',
        icon: Package,
      },
    ],
  },

  {
    title: 'Operations',
    items: [
      {
        label: 'Branches',
        href: '/dashboard/branches',
        icon: Warehouse,
      },
      {
        label: 'Companies',
        href: '/dashboard/companies',
        icon: Building2,
      },
      {
        label: 'Customers',
        href: '/dashboard/customers',
        icon: Users,
      },
      {
        label: 'Users',
        href: '/dashboard/users',
        icon: Users,
      },
      {
        label: 'Drivers',
        href: '/dashboard/drivers',
        icon: Truck,
      },
      {
        label: 'Cities',
        href: '/dashboard/cities',
        icon: MapPin,
      },
      {
        label: 'Delivery Zones',
        href: '/dashboard/delivery-zones',
        icon: MapPin,
      },
      {
        label: 'Pickup Requests',
        href: '/dashboard/pickup-requests',
        icon: PackageCheck,
      },
    ],
  },

  {
    title: 'Finance',
    items: [
      {
        label: 'COD',
        href: '/dashboard/cod',
        icon: Receipt,
      },
      {
        label: 'Payments',
        href: '/dashboard/payments',
        icon: CircleDollarSign,
      },
      {
        label: 'Pricing Rules',
        href: '/dashboard/pricing-rules',
        icon: ShieldCheck,
      },
    ],
  },

  {
    title: 'System',
    items: [
      {
        label: 'Notifications',
        href: '/dashboard/notifications',
        icon: BellRing,
      },
      {
        label: 'Company Settings',
        href: '/dashboard/company-settings',
        icon: Settings,
      },
      {
        label: 'Tracking',
        href: '/dashboard/tracking',
        icon: MoveRight,
      },
    ],
  },
]

// ⬇️ بعد كده يبدأ الكومبوننت

export default function DashboardSidebar() {
  const pathname = usePathname()
  const activeHref = pathname || '/dashboard'
  const { role, username } = getAuthenticatedUserContext()
  const roleLabel = getRoleLabel(role)

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.href === '/dashboard') {
          return true
        }

        if (item.href === '/dashboard/companies') {
          return ['super_admin', 'company_admin', 'admin'].includes(role)
        }

        if (item.href === '/dashboard/users') {
          return ['super_admin', 'company_admin', 'admin'].includes(role)
        }

        if (item.href === '/dashboard/branches') {
          return ['super_admin', 'company_admin', 'admin'].includes(role)
        }

        if (item.href === '/dashboard/cod' || item.href === '/dashboard/payments' || item.href === '/dashboard/pricing-rules') {
          return ['super_admin', 'company_admin', 'admin', 'branch_manager'].includes(role)
        }

        if (item.href === '/dashboard/company-settings') {
          return ['super_admin', 'company_admin', 'admin'].includes(role)
        }

        if (item.href === '/dashboard/notifications') {
          return ['super_admin', 'company_admin', 'admin', 'branch_manager', 'dispatcher', 'employee', 'driver'].includes(role)
        }

        if (item.href === '/dashboard/tracking') {
          return ['super_admin', 'company_admin', 'admin', 'branch_manager', 'dispatcher', 'driver'].includes(role)
        }

        return true
      }),
    }))
    .filter((section) => section.items.length > 0)

  return (
  <aside className="glass-card w-[260px] min-h-screen overflow-hidden">
    <div className="flex w-full flex-col px-6 py-6">

      {/* Brand */}
      <div className="mb-8 flex h-16 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#1F2937]">
          <Package className="h-[18px] w-[18px] text-sky-400" />
        </div>

        <div>
          <p className="text-[16px] font-semibold text-gray-50">
            CourierOS
          </p>

          <p className="text-xs text-gray-400">
            Enterprise Platform
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">

        {visibleSections.map((section) => (
          <div key={section.title} className="mb-8">

            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
              {section.title}
            </p>

            <div className="space-y-1">

              {section.items.map((item) => {

                const Icon = item.icon

                const active =
                  activeHref === item.href ||
                  (item.href !== "/dashboard" &&
                    activeHref.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex h-11 items-center gap-3 rounded-[10px] px-3 transition-all duration-200 ${
                      active
                        ? "bg-sky-400/10 text-sky-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        active
                          ? "text-sky-400"
                          : "text-gray-500 group-hover:text-gray-200"
                      }`}
                    />

                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </Link>
                )

              })}

            </div>

          </div>
        ))}

      </nav>

      {/* Footer */}

      <div className="border-t border-white/10 pt-5">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F2937] text-sm font-semibold text-white">
            A
          </div>

          <div>

            <p className="text-sm font-medium text-gray-100">
              {username || 'User'}
            </p>

            <p className="text-xs text-gray-500">
              {roleLabel}
            </p>

          </div>

        </div>

      </div>

    </div>
  </aside>
  )
}