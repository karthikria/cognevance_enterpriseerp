
import { useCallback, useEffect, useState } from 'react'
import {
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  ChartNoAxesCombined,
} from 'lucide-react'

import StatCard from '../components/StatCard'
import RevenueChart from '../components/RevenueChart'
import SalesChart from '../components/SalesChart'

const API = 'http://localhost:8080'

const money = (value) =>
  Number(value ?? 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  })

export default function Analytics({ token }) {
  const [dashboard, setDashboard] = useState({})
  const [revenueHistory, setRevenueHistory] = useState([])
  const [salesHistory, setSalesHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    const headers = {
      Authorization: `Bearer ${token}`,
    }

    try {
      const [dashboardRes, revenueRes, salesRes] = await Promise.all([
        fetch(`${API}/api/analytics/dashboard`, { headers }),
        fetch(`${API}/api/analytics/revenue-history`, { headers }),
        fetch(`${API}/api/analytics/sales-history`, { headers }),
      ])

      const responses = [dashboardRes, revenueRes, salesRes]

      if (responses.some((res) => res.status === 401 || res.status === 403)) {
        throw new Error('Access denied. Please sign in again.')
      }

      if (responses.some((res) => !res.ok)) {
        throw new Error('Unable to load analytics data.')
      }

      const [dashboardData, revenueData, salesData] = await Promise.all(
        responses.map((res) => res.json())
      )

      if (!Array.isArray(revenueData) || !Array.isArray(salesData)) {
        throw new Error('Unexpected chart data returned by the API.')
      }

      setDashboard(dashboardData)
      setRevenueHistory(revenueData)
      setSalesHistory(salesData)
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const stats = [
    {
      title: 'Total Sales',
      value: dashboard.totalSales ?? 0,
      icon: ShoppingCart,
      accent: 'blue',
    },
    {
      title: 'Total Revenue',
      value: money(dashboard.totalRevenue),
      icon: IndianRupee,
      accent: 'emerald',
    },
    {
      title: 'Total Income',
      value: money(dashboard.totalIncome),
      icon: TrendingUp,
      accent: 'violet',
    },
    {
      title: 'Net Balance',
      value: money(dashboard.netBalance),
      icon: ChartNoAxesCombined,
      accent: 'amber',
    },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Business Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review revenue trends and sales performance.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh analytics
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : !error ? (
        <>
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <RevenueChart data={revenueHistory} />
            <SalesChart data={salesHistory} />
          </section>
        </>
      ) : null}
    </section>
  )
}
