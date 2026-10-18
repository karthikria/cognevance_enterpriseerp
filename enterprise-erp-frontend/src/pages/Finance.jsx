
import { useCallback, useEffect, useState } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, Plus, Search,
  RefreshCw, Pencil, Trash2, X, ArrowUpDown,
} from 'lucide-react'

const API = 'http://localhost:8080'

const today = () => new Date().toLocaleDateString('en-CA')

const emptyForm = {
  type: 'INCOME',
  amount: '',
  category: '',
  description: '',
  transactionDate: today(),
}

const money = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  })

export default function Finance({ token }) {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadFinance = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        fetch(`${API}/api/finance`, { headers }),
        fetch(`${API}/api/finance/summary`, { headers }),
      ])

      if (!transactionsRes.ok || !summaryRes.ok) {
        throw new Error(
          transactionsRes.status === 401 ||
          transactionsRes.status === 403 ||
          summaryRes.status === 401 ||
          summaryRes.status === 403
            ? 'Access denied. Please sign in again.'
            : 'Unable to load finance data.'
        )
      }

      const [transactionData, summaryData] = await Promise.all([
        transactionsRes.json(),
        summaryRes.json(),
      ])

      if (!Array.isArray(transactionData)) {
        throw new Error('Unexpected finance API response.')
      }

      setTransactions(transactionData)
      setSummary(summaryData)
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadFinance()
  }, [loadFinance])

  function openAddForm() {
    setForm({ ...emptyForm, transactionDate: today() })
    setEditingId(null)
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(transaction) {
    setForm({
      type: transaction.type || 'INCOME',
      amount: String(transaction.amount ?? ''),
      category: transaction.category || '',
      description: transaction.description || '',
      transactionDate: transaction.transactionDate || today(),
    })
    setEditingId(transaction.id)
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const amount = Number(form.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Amount must be greater than zero.')
      return
    }

    if (!form.category.trim()) {
      setError('Please enter a category.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        editingId
          ? `${API}/api/finance/${editingId}`
          : `${API}/api/finance`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: form.type,
            amount,
            category: form.category.trim(),
            description: form.description.trim(),
            transactionDate: form.transactionDate,
          }),
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(
          body.message ||
          body.detail ||
          (response.status === 401 || response.status === 403
            ? 'You do not have permission to save this transaction.'
            : `Could not save transaction (${response.status}).`)
        )
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      setMessage(
        editingId
          ? 'Transaction updated successfully.'
          : 'Transaction added successfully.'
      )

      await loadFinance()
    } catch (err) {
      setError(err.message || 'Could not save transaction.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(transaction) {
    if (!window.confirm(
      `Delete this ${transaction.type.toLowerCase()} transaction?`
    )) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API}/api/finance/${transaction.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(
          body.message ||
          `Could not delete transaction (${response.status}).`
        )
      }

      setMessage('Transaction deleted successfully.')
      await loadFinance()
    } catch (err) {
      setError(err.message || 'Could not delete transaction.')
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType =
      typeFilter === 'ALL' || transaction.type === typeFilter

    const term = search.toLowerCase()
    const matchesSearch = [
      transaction.category,
      transaction.description,
      transaction.type,
      transaction.id,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(term)
    )

    return matchesType && matchesSearch
  })

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Finance Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track income, expenses and your business balance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadFinance}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Add Transaction
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Income</p>
            <TrendingUp className="text-green-600" size={22} />
          </div>
          <p className="text-2xl font-bold text-green-700">
            {money(summary.totalIncome)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Expenses</p>
            <TrendingDown className="text-red-600" size={22} />
          </div>
          <p className="text-2xl font-bold text-red-700">
            {money(summary.totalExpenses)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">Net Balance</p>
            <Wallet className="text-blue-600" size={22} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {money(summary.netBalance)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search category, description or ID..."
              className="w-full py-3 text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={17} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
            >
              <option value="ALL">All transactions</option>
              <option value="INCOME">Income only</option>
              <option value="EXPENSE">Expenses only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-900">Transaction History</h3>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading transactions...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold">
                      #{transaction.id}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transaction.type === 'INCOME'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">
                      {transaction.category}
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-500">
                      {transaction.description || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {transaction.transactionDate || '—'}
                    </td>
                    <td className={`whitespace-nowrap px-5 py-4 font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      {transaction.type === 'EXPENSE' ? '−' : '+'}
                      {money(transaction.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(transaction)}
                          aria-label={`Edit transaction ${transaction.id}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction)}
                          aria-label={`Delete transaction ${transaction.id}`}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filteredTransactions.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      {search || typeFilter !== 'ALL'
                        ? 'No matching transactions found.'
                        : 'No transactions yet. Add your first transaction.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="finance-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Transaction type
                </label>
                <select
                  id="finance-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              <div>
                <label htmlFor="finance-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amount (₹)
                </label>
                <input
                  id="finance-amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="finance-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <input
                  id="finance-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="e.g. Salary, Rent, Product sales"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="finance-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description (optional)
                </label>
                <textarea
                  id="finance-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Add transaction details..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="finance-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Transaction date
                </label>
                <input
                  id="finance-date"
                  name="transactionDate"
                  type="date"
                  value={form.transactionDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
