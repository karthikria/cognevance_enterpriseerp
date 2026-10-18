
import { useCallback, useEffect, useState } from 'react'
import {
  Search, RefreshCw, Users, Plus, Pencil, Trash2, X,
} from 'lucide-react'

const API = 'http://localhost:8080'

const emptyForm = {
  name: '',
  email: '',
  department: '',
  designation: '',
  salary: '',
}

export default function Employees({ token }) {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadEmployees = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Access denied. Please sign in again.'
            : `Could not load employees (${response.status}).`
        )
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Unexpected employee API response.')
      }

      setEmployees(data)
    } catch (err) {
      setError(err.message || 'Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  function openAddForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setMessage('')
    setShowForm(true)
  }

  function openEditForm(employee) {
    setForm({
      name: employee.name ?? '',
      email: employee.email ?? '',
      department: employee.department ?? '',
      designation: employee.designation ?? '',
      salary: String(employee.salary ?? ''),
    })
    setEditingId(employee.id)
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

    const salary = Number(form.salary)

    if (!Number.isFinite(salary) || salary < 0) {
      setError('Please enter a valid non-negative salary.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        editingId
          ? `${API}/api/employees/${editingId}`
          : `${API}/api/employees`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            department: form.department.trim(),
            designation: form.designation.trim(),
            salary,
          }),
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(
          body.message ||
          body.detail ||
          (response.status === 401 || response.status === 403
            ? 'You do not have permission to perform this action.'
            : `Could not save employee (${response.status}).`)
        )
      }

      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      setMessage(editingId
        ? 'Employee updated successfully.'
        : 'Employee added successfully.')

      await loadEmployees()
    } catch (err) {
      setError(err.message || 'Could not save employee.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Delete employee "${employee.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API}/api/employees/${employee.id}`,
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
            ? 'Only an authorized user can delete employees.'
            : `Could not delete employee (${response.status}).`)
        )
      }

      setMessage('Employee deleted successfully.')
      await loadEmployees()
    } catch (err) {
      setError(err.message || 'Could not delete employee.')
    }
  }

  const filteredEmployees = employees.filter((employee) =>
    [
      employee.name,
      employee.email,
      employee.department,
      employee.designation,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Employee Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage employee records and information.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadEmployees}
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
            Add Employee
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total employees</p>
            <p className="text-2xl font-bold text-slate-900">
              {employees.length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label htmlFor="employee-search" className="mb-2 block text-sm font-medium">
            Search employees
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={18} className="text-slate-400" />
            <input
              id="employee-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email or department..."
              className="w-full py-3 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-900">Employee Directory</h3>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading employees...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Designation</th>
                  <th className="px-5 py-4">Salary</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {employee.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {employee.email}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {employee.department || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {employee.designation || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {Number(employee.salary ?? 0).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(employee)}
                          title="Edit employee"
                          aria-label={`Edit ${employee.name}`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee)}
                          title="Delete employee"
                          aria-label={`Delete ${employee.name}`}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filteredEmployees.length && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      {search
                        ? 'No matching employees found.'
                        : 'No employees found. Add your first employee.'}
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
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Employee' : 'Add Employee'}
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
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email Address', type: 'email', required: true },
                { name: 'department', label: 'Department', type: 'text' },
                { name: 'designation', label: 'Designation', type: 'text' },
                { name: 'salary', label: 'Salary (₹)', type: 'number', required: true },
              ].map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    min={field.name === 'salary' ? '0' : undefined}
                    step={field.name === 'salary' ? '0.01' : undefined}
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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
