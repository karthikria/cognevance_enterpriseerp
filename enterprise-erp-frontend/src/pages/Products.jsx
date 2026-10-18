
import { useCallback, useEffect, useState } from 'react'
import {
  Package, Plus, Search, RefreshCw, Pencil, Trash2, X, Boxes,
} from 'lucide-react'

const API = 'http://localhost:8080'

const emptyForm = {
  name: '',
  category: '',
  quantity: '0',
  price: '',
}

export default function Products({ token }) {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadProducts = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Access denied. Please sign in again.'
            : `Failed to load products (${response.status}).`
        )
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Unexpected products API response.')
      }

      setProducts(data)
    } catch (err) {
      setError(err.message || 'Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  function openAddForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(product) {
    setForm({
      name: product.name ?? '',
      category: product.category ?? '',
      quantity: String(product.quantity ?? 0),
      price: String(product.price ?? ''),
    })
    setEditingId(product.id)
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

    const quantity = Number(form.quantity)
    const price = Number(form.price)

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError('Quantity must be a whole number of 0 or more.')
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be a valid number of 0 or more.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        editingId
          ? `${API}/api/products/${editingId}`
          : `${API}/api/products`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            category: form.category.trim(),
            quantity,
            price,
          }),
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(
          body.message ||
          body.detail ||
          (response.status === 401 || response.status === 403
            ? 'You do not have permission to save this product.'
            : `Could not save product (${response.status}).`)
        )
      }

      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      setMessage(
        editingId ? 'Product updated successfully.' : 'Product added successfully.'
      )

      await loadProducts()
    } catch (err) {
      setError(err.message || 'Could not save product.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete product "${product.name}"?`)) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API}/api/products/${product.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(
          body.message ||
          (response.status === 401 || response.status === 403
            ? 'You do not have permission to delete this product.'
            : `Could not delete product (${response.status}).`)
        )
      }

      setMessage('Product deleted successfully.')
      await loadProducts()
    } catch (err) {
      setError(err.message || 'Could not delete product.')
    }
  }

  const filteredProducts = products.filter((product) =>
    [product.name, product.category].some((value) =>
      String(value ?? '').toLowerCase().includes(search.toLowerCase())
    )
  )

  const totalUnits = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  )

  const inventoryValue = products.reduce(
    (total, product) =>
      total + Number(product.price || 0) * Number(product.quantity || 0),
    0
  )

  const money = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    })

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Inventory Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage products, prices and available stock.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadProducts}
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
            Add Product
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
          <Package className="mb-3 text-blue-600" size={24} />
          <p className="text-sm text-slate-500">Total products</p>
          <p className="mt-1 text-2xl font-bold">{products.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Boxes className="mb-3 text-indigo-600" size={24} />
          <p className="text-sm text-slate-500">Total units in stock</p>
          <p className="mt-1 text-2xl font-bold">
            {totalUnits.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-500">
            Stock value at current prices
          </p>
          <p className="text-2xl font-bold">{money(inventoryValue)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product name or category..."
            className="w-full py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-900">Product Directory</h3>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading products...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Stock Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {product.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {product.category}
                    </td>
                    <td className="px-5 py-4">{money(product.price)}</td>
                    <td className="px-5 py-4">{product.quantity}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.quantity === 0
                          ? 'bg-red-50 text-red-700'
                          : product.quantity <= 5
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-green-50 text-green-700'
                      }`}>
                        {product.quantity === 0
                          ? 'Out of stock'
                          : product.quantity <= 5
                            ? 'Low stock'
                            : 'In stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          aria-label={`Edit ${product.name}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          aria-label={`Delete ${product.name}`}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filteredProducts.length && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      {search
                        ? 'No matching products found.'
                        : 'No products found. Add your first product.'}
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
                {editingId ? 'Edit Product' : 'Add Product'}
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
              {[
                { name: 'name', label: 'Product Name', type: 'text', required: true },
                { name: 'category', label: 'Category', type: 'text', required: true },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true },
                { name: 'price', label: 'Price (₹)', type: 'number', required: true },
              ].map((field) => (
                <div key={field.name}>
                  <label htmlFor={`product-${field.name}`} className="mb-1.5 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    id={`product-${field.name}`}
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    min={['quantity', 'price'].includes(field.name) ? '0' : undefined}
                    step={field.name === 'price' ? '0.01' : field.name === 'quantity' ? '1' : undefined}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              ))}

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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
