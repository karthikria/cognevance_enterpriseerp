
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Building2,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Employees', icon: Users },
  { name: 'Inventory', icon: Package },
  { name: 'Sales', icon: ShoppingCart },
  { name: 'Finance', icon: Wallet },
  { name: 'Analytics', icon: ChartNoAxesCombined },
]

export default function Sidebar({
  activePage = 'Dashboard',
  onNavigate,
  onLogout,
}) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-6">
        <div className="rounded-xl bg-blue-600 p-2.5 text-white">
          <Building2 size={23} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Enterprise ERP
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Business Management
          </p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map(({ name, icon: Icon }) => {
            const active = activePage === name

            return (
              <button
                key={name}
                type="button"
                onClick={() => onNavigate?.(name)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={19} />
                <span className="flex-1">{name}</span>

                {active && <ChevronRight size={16} />}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-2 border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={() => onNavigate?.('Settings')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <Settings size={19} />
          Settings
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={19} />
          Sign out
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300">
            ERP
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              Enterprise Admin
            </p>
            <p className="text-xs text-slate-500">Management Portal</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
