
import { useEffect, useState } from 'react'
import { Bell, Search, Menu, X, RefreshCw } from 'lucide-react'

import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Finance from './pages/Finance'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import SignUp from './pages/SignUp'

const API = 'http://localhost:8080'

function App() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [activePage, setActivePage] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [role, setRole] = useState('')
  const [showSignUp, setShowSignUp] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoginLoading(true)

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Check your credentials.')
      }

      if (!data.token) {
        throw new Error('The login response did not contain a token.')
      }

      setToken(data.token)
      setEmail(data.email || email)
setRole(data.role || 'EMPLOYEE')
      setPassword('')
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setLoginLoading(false)
    }
  }

  
  async function loadDashboard() {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [dashboardRes, revenueRes, salesRes] = await Promise.all([
        fetch(`${API}/api/analytics/dashboard`, { headers }),
        fetch(`${API}/api/analytics/revenue-history`, { headers }),
        fetch(`${API}/api/analytics/sales-history`, { headers }),
      ])

      const responses = [dashboardRes, revenueRes, salesRes]

      if (responses.some(res => res.status === 401 || res.status === 403)) {
        throw new Error('Session expired or access denied. Please sign in again.')
      }

      if (responses.some(res => !res.ok)) {
        throw new Error('Failed to load analytics data.')
      }

      const [dashboardData, revenueHistory, salesHistory] =
        await Promise.all(responses.map(res => res.json()))

      setDashboard({
        ...dashboardData,
        revenueHistory,
        salesHistory,
      })
    } catch (err) {
      setError(err.message || 'Could not load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadDashboard()
    }
  }, [token])

  function handleLogout() {
    setToken('')
    setEmail('')
    setPassword('')
    setRole('')
    setDashboard(null)
    setError('')
    setActivePage('Dashboard')
    setSidebarOpen(false)
  }

  function navigate(page) {
    setActivePage(page)
    setSidebarOpen(false)
  }

  if (!token) {

    if (showSignUp) {
  return (
    <SignUp
      onBack={() => {
        setShowSignUp(false)
        setError('')
      }}
      onRegistered={(registeredEmail) => {
        setEmail(registeredEmail)
        setPassword('')
        setError('')
        setShowSignUp(false)
      }}
    />
  )
}
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
        >
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white shadow-lg shadow-blue-200">
              🏢
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Enterprise ERP
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage your business
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          />

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-5 text-center text-xs text-slate-400">
  Secure access to your business workspace
</p>

<p className="mt-4 text-center text-sm text-slate-500">
  Don't have an account?{' '}
  <button
    type="button"
    onClick={() => {
      setError('')
      setShowSignUp(true)
    }}
    className="font-semibold text-blue-600 hover:text-blue-700"
  >
    Create Account
  </button>
</p>
         
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <div className="absolute right-2 top-3 z-10 md:hidden">
            <button
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>
          <Sidebar
            activePage={activePage}
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 md:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
                Enterprise workspace
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                {activePage}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
              <Search size={17} className="text-slate-400" />
              <span className="text-sm text-slate-400">
                Business overview
              </span>
            </div>

            <button
              aria-label="Notifications"
              title="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <Bell size={19} />
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">Signed in</p>
              <p className="text-xs text-slate-500">Authenticated user</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <span>{error}</span>
              <button
                onClick={handleLogout}
                className="font-semibold underline"
              >
                Sign in again
              </button>
            </div>
          )}


{activePage === 'Dashboard' ? (
  <>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Business overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your business metrics in one place.
        </p>
      </div>

      <button
        onClick={loadDashboard}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>

    <Dashboard data={dashboard ?? {}} loading={loading} />
  </>
) : activePage === 'Employees' ? (
  <Employees token={token} />
) : activePage === 'Inventory' ? (
  <Products token={token} />
)  : activePage === 'Sales' ? (
  <Sales token={token} />): activePage === 'Finance' ? (
  <Finance token={token} />
) :  activePage === 'Analytics' ? (
  <Analytics token={token} />
)  : activePage === 'Settings' ? (
  <Settings token={token} email={email} role={role} />
) : (
  <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <h2 className="text-xl font-bold text-slate-900">
      {activePage}
    </h2>
    <p className="mt-2 text-slate-500">
      This module will be implemented next.
    </p>
    <button
      onClick={() => navigate('Dashboard')}
      className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
    >
      Return to Dashboard
    </button>
  </section>
)}

        </div>

        <footer className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-400 sm:px-8">
          Enterprise ERP · Business Management Platform
        </footer>
      </main>
    </div>
  )
}

export default App
