
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Plus,
  Package,
  IndianRupee,
  X,
} from 'lucide-react'

const API = 'http://localhost:8080'

const money = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  })

export default function Sales({ token }) {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  )

  const loadData = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const [productRes, salesRes] = await Promise.all([
        fetch(`${API}/api/products`, { headers }),
        fetch(`${API}/api/sales`, { headers }),
      ])

      if (!productRes.ok || !salesRes.ok) {
        throw new Error(
          productRes.status === 401 ||
          productRes.status === 403 ||
          salesRes.status === 401 ||
          salesRes.status === 403
            ? 'Access denied. Please sign in again.'
            : 'Unable to load products or sales history.'
        )
      }

      const [productData, salesData] = await Promise.all([
        productRes.json(),
        salesRes.json(),
      ])

      if (!Array.isArray(productData) || !Array.isArray(salesData)) {
        throw new Error('Unexpected API response.')
      }

      setProducts(productData)
      setSales(salesData)

      setProductId((current) => {
        const available = productData.find(
          (product) => String(product.id) === current &&
            Number(product.quantity) > 0
        )

        return available
          ? current
          : String(
              productData.find((product) => Number(product.quantity) > 0)?.id ?? ''
            )
      })
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }, [token, headers])

  useEffect(() => {
    loadData()
  }, [loadData])

  const selectedProduct = products.find(
    (product) => String(product.id) === productId
  )

  const requestedQuantity = Number(quantity)
  const validQuantity =
    Number.isInteger(requestedQuantity) && requestedQuantity > 0

  const total = selectedProduct && validQuantity
    ? Number(selectedProduct.price || 0) * requestedQuantity
    : 0

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0
  )

  const totalUnitsSold = sales.reduce(
    (sum, sale) => sum + Number(sale.quantity || 0),
    0
  )

  const filteredSales = sales.filter((sale) => {
    const productName =
      typeof sale.product === 'object'
        ? sale.product?.name
        : ''

    const term = search.toLowerCase()

    return (
      String(productName || '').toLowerCase().includes(term) ||
      String(sale.id || '').includes(term)
    )
  })

  async function handleCreateSale(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!selectedProduct) {
      setError('Please select a product.')
      return
    }

    if (!validQuantity) {
      setError('Quantity must be a whole number greater than zero.')
      return
    }

    if (requestedQuantity > Number(selectedProduct.quantity)) {
      setError('Insufficient stock available.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`${API}/api/sales`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: Number(productId),
          quantity: requestedQuantity,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          (response.status === 401 || response.status === 403
            ? 'Access denied. Please sign in again.'
            : `Could not create sale (${response.status}).`)
        )
      }

      setMessage('Sale created successfully. Inventory stock has been refreshed.')
      setQuantity('1')
      setShowForm(false)

      await loadData()
    } catch (err) {
      setError(err.message || 'Could not create sale.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Sales Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Record sales and track your sales history.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => {
              setError('')
              setMessage('')
              setShowForm(true)
            }}
            disabled={!products.some((product) => Number(product.quantity) > 0)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={17} />
            Create Sale
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ShoppingCart className="mb-3 text-blue-600" size={24} />
          <p className="text-sm text-slate-500">Total sales</p>
          <p className="mt-1 text-2xl font-bold">{sales.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Package className="mb-3 text-indigo-600" size={24} />
          <p className="text-sm text-slate-500">Units sold</p>
          <p className="mt-1 text-2xl font-bold">{totalUnitsSold}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <IndianRupee className="mb-3 text-green-600" size={24} />
          <p className="text-sm text-slate-500">Total sales revenue</p>
          <p className="mt-1 text-2xl font-bold">{money(totalRevenue)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name or sale ID..."
            className="w-full py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-900">Sales History</h3>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading sales...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Sale ID</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Unit price</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold">#{sale.id}</td>
                    <td className="px-5 py-4">
                      {sale.product?.name || 'Unknown product'}
                    </td>
                    <td className="px-5 py-4">{sale.quantity}</td>
                    <td className="px-5 py-4">{money(sale.unitPrice)}</td>
                    <td className="px-5 py-4 font-semibold">
                      {money(sale.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {sale.saleDate
                        ? new Date(sale.saleDate).toLocaleString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                ))}

                {!filteredSales.length && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      {search
                        ? 'No matching sales found.'
                        : 'No sales recorded yet.'}
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
                Create New Sale
              </h3>

              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4">
              <div>
                <label htmlFor="sale-product" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Select product
                </label>

                <select
                  id="sale-product"
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">Choose a product</option>
                  {products
                    .filter((product) => Number(product.quantity) > 0)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — Stock: {product.quantity}
                      </option>
                    ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Available stock</span>
                    <strong>{selectedProduct.quantity}</strong>
                  </div>
                  <div className="mt-2 flex justify-between gap-3">
                    <span className="text-slate-500">Price per unit</span>
                    <strong>{money(selectedProduct.price)}</strong>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="sale-quantity" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Quantity
                </label>
                <input
                  id="sale-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
                />
                {selectedProduct && validQuantity &&
                  requestedQuantity > Number(selectedProduct.quantity) && (
                    <p className="mt-1 text-sm text-red-600">
                      Quantity exceeds available stock.
                    </p>
                  )}
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-blue-700">Estimated total</p>
                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {money(total)}
                </p>
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
                  disabled={
                    saving ||
                    !selectedProduct ||
                    !validQuantity ||
                    requestedQuantity > Number(selectedProduct?.quantity || 0)
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Confirm Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
