"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { login, LoginCredentials } from '@/services/auth'

type LoginFormValues = LoginCredentials

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<LoginFormValues>({ mode: 'onBlur' })

  const showUsernameError = Boolean(errors.username && (touchedFields.username || isSubmitted))
  const showPasswordError = Boolean(errors.password && (touchedFields.password || isSubmitted))

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setError(null)
    setIsLoading(true)

    try {
      await login(data)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 sm:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-[432px] items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[340px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />

        <div className={`glass-card relative z-10 w-full overflow-hidden transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="px-7 py-10 sm:px-9 sm:py-12">
            <div className="mb-12">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                CourierOS
              </p>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Access your CourierOS workspace.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-200">
                  Email or username
                </label>
                <input
                  id="username"
                  {...register('username', { required: 'Username is required' })}
                  type="text"
                  placeholder="you@courieros.com"
                  className="input h-14 rounded-[18px] border-white/10 bg-white/5 px-5 text-white placeholder:text-slate-500 transition duration-200 focus:border-sky-400 focus:bg-white/10"
                  aria-invalid={showUsernameError ? 'true' : 'false'}
                  aria-describedby={showUsernameError ? 'username-error' : undefined}
                />
                {showUsernameError && (
                  <p id="username-error" className="mt-2 text-sm text-rose-400">
                    {errors.username?.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  placeholder="Enter your password"
                  className="input h-14 rounded-[18px] border-white/10 bg-white/5 px-5 text-white placeholder:text-slate-500 transition duration-200 focus:border-sky-400 focus:bg-white/10"
                  aria-invalid={showPasswordError ? 'true' : 'false'}
                  aria-describedby={showPasswordError ? 'password-error' : undefined}
                />
                {showPasswordError && (
                  <p id="password-error" className="mt-2 text-sm text-rose-400">
                    {errors.password?.message}
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-rose-400">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-14 w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-6 text-base font-semibold text-slate-100 shadow-[0_18px_48px_-18px_rgba(15,23,42,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-slate-700 hover:via-slate-800 hover:to-slate-700 hover:shadow-[0_22px_60px_-18px_rgba(56,189,248,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-500">
              © 2026 CourierOS
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
