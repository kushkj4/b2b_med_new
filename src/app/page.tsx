import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, BarChart3, Users, Building2 } from 'lucide-react';

export default async function Home() {
  const session = await auth();

  // Redirect authenticated users to their dashboard
  if (session?.user) {
    if (session.user.role === 'admin') redirect('/admin/dashboard');
    if (session.user.role === 'distributor') redirect('/distributor/dashboard');
    if (session.user.role === 'retailer') redirect('/retailer/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-slate-900">MedB2B</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all shadow-sm shadow-teal-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative overflow-hidden bg-white pb-16 pt-20 sm:pb-24 sm:pt-32 lg:pb-32 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl lg:max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Transforming B2B <span className="text-teal-600">Pharmaceutical</span> Trade
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Connect directly with verified manufacturers and distributors. Streamline your procurement process with our secure, compliant, and efficient digital platform.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-all flex items-center gap-2"
                >
                  Join the Network <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="text-sm font-semibold leading-6 text-slate-900 hover:text-teal-600 transition-colors">
                  Login to Portal <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-40rem)]" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#0d9488] to-[#2dd4bf] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-slate-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-teal-600">Why MedB2B?</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to manage your pharma business
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-600">
                      <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    Verified Network
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Every participant is verified with valid drug licenses and GST registration, ensuring a secure trading environment.</p>
                  </dd>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-600">
                      <Truck className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    Smart Logistics
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Real-time inventory tracking and optimized delivery routes to ensure stock is always available when needed.</p>
                  </dd>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-600">
                      <BarChart3 className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    Analytics & Insights
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Powerful dashboard providing insights into sales trends, inventory turnover, and purchasing patterns.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-slate-600">Verified Companies</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">800+</dd>
              </div>
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-slate-600">Products Listed</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">98k+</dd>
              </div>
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-slate-600">Transactions</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">1M+</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white">MedB2B</span>
            </div>
            <p className="text-slate-400 text-sm">© 2024 MedB2B Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
