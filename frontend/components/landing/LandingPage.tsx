import Link from 'next/link'

const features = [
  {
    title: 'Shipment tracking',
    description: 'Create, dispatch, and track shipments with live status updates from pending to delivered.'
  },
  {
    title: 'Cash on delivery (COD)',
    description: "Collect and reconcile COD payments per shipment, with a clear view of what's outstanding."
  },
  {
    title: 'Multi-branch management',
    description: 'Manage multiple branches, each with its own staff, coverage area, and delivery zones.'
  },
  {
    title: 'Driver management',
    description: 'Assign drivers to shipments, track vehicle details, and monitor delivery load per driver.'
  },
  {
    title: 'Delivery zones & pricing rules',
    description: 'Define coverage areas and set pricing by route, weight, and service type.'
  },
  {
    title: 'Customer & company records',
    description: 'Keep a organized record of every customer and partner company you work with.'
  }
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-[28px] border border-white/10 bg-slate-900/70 px-6 py-5 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div>
            <div className="text-lg font-semibold text-white">CourierOS</div>
            <div className="text-sm text-slate-400">Enterprise Platform</div>
          </div>
          <Link href="/login" className="btn btn-outline">
            Sign in
          </Link>
        </header>

        <section className="hero-panel px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="badge-pill mb-6">Logistics operations platform</div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Run your entire delivery operation from one workspace
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              CourierOS gives logistics companies a single platform to manage shipments, branches, drivers, and collections — from dispatch to delivery, in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary">
                Sign in
              </Link>
              <a href="#features" className="btn btn-outline">
                See what's included
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="card">
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel px-6 py-8 sm:px-8 lg:px-10">
          <h2 className="text-2xl font-semibold text-white">Ready to get started?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Sign in to your CourierOS workspace to manage your operations.
          </p>
          <div className="mt-6">
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
          </div>
        </section>

        <footer className="px-2 py-4 text-sm text-slate-500">
          © 2026 CourierOS
        </footer>
      </div>
    </main>
  )
}
