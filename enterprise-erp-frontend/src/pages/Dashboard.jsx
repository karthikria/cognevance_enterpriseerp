
import {
  Users,
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
} from 'lucide-react'

import StatCard from '../components/StatCard'
import RevenueChart from '../components/RevenueChart'
import SalesChart from '../components/SalesChart'

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  })
}

export default function Dashboard({ data = {}, loading = false }) {
  const stats = [
    {
      title: 'Total Employees',
      value: data.totalEmployees ?? 0,
      icon: Users,
      accent: 'blue',
    },
    {
      title: 'Total Products',
      value: data.totalProducts ?? 0,
      icon: Package,
      accent: 'violet',
    },
    {
      title: 'Total Sales',
      value: data.totalSales ?? 0,
      icon: ShoppingCart,
      accent: 'emerald',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: CircleDollarSign,
      accent: 'amber',
    },
    {
      title: 'Total Income',
      value: formatCurrency(data.totalIncome),
      icon: TrendingUp,
      accent: 'emerald',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(data.totalExpenses),
      icon: TrendingDown,
      accent: 'rose',
    },
    {
      title: 'Net Balance',
      value: formatCurrency(data.netBalance),
      icon: Wallet,
      accent: 'blue',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <RevenueChart data={data.revenueHistory ?? []} />
        <SalesChart data={data.salesHistory ?? []} />
      </section>
    </div>
  )
}
