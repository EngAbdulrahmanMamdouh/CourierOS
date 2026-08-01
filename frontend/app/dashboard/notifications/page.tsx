"use client"

import { useMemo } from 'react'
import { CheckCheck, Circle, Loader2, Inbox } from 'lucide-react'
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useNotificationQueries'

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, error } = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.is_read).length, [notifications])

  const handleMarkRead = async (notificationId: number) => {
    await markReadMutation.mutateAsync(notificationId)
  }

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync()
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <section className="glass-card rounded-[28px] border-white/10 p-6 shadow-slate-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Notifications</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Your inbox</h1>
              <p className="mt-2 text-sm text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending || unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        </section>

        {isLoading ? (
          <section className="glass-card rounded-[24px] border-white/10 p-8 text-center text-slate-400">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
            Loading notifications…
          </section>
        ) : isError ? (
          <section className="glass-card rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300">
            {error instanceof Error ? error.message : 'Unable to load notifications.'}
          </section>
        ) : notifications.length === 0 ? (
          <section className="glass-card rounded-[24px] border-white/10 p-12 text-center text-slate-400">
            <Inbox className="mx-auto mb-3 h-8 w-8 text-slate-500" />
            <p className="text-lg font-medium text-white">No notifications yet</p>
            <p className="mt-2 text-sm">Your activity updates will appear here.</p>
          </section>
        ) : (
          <section className="glass-card rounded-[24px] border-white/10 p-4">
            <ul className="divide-y divide-white/8">
              {notifications.map((notification) => (
                <li key={notification.id} className={`flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-start sm:justify-between ${notification.is_read ? 'opacity-70' : ''}`}>
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80">
                      {notification.is_read ? <Circle className="h-4 w-4 text-slate-500" /> : <Circle className="h-4 w-4 text-sky-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{notification.message}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {new Date(notification.created_at).toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>

                  {!notification.is_read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={markReadMutation.isPending}
                      className="inline-flex items-center gap-2 self-start rounded-[12px] border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark read
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
