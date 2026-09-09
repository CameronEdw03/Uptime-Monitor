
import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  Gauge,
  Globe2,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Trash2,
  X,
  Zap,
} from "lucide-react"

const API_URL = "http://127.0.0.1:8000"

export default function Monitor() {
  const [monitors, setMonitors] = useState([])
  const [checkResults, setCheckResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedMonitor, setSelectedMonitor] = useState(null)
  const [editingMonitor, setEditingMonitor] = useState(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadData = async () => {
    try {
      setRefreshing(true)

      const token = localStorage.getItem("access_token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [monitorsResponse, resultsResponse] = await Promise.all([
        fetch(`${API_URL}/monitors`, { headers }),
        fetch(`${API_URL}/check_results`, { headers }),
      ])

      if (
        monitorsResponse.status === 401 ||
        resultsResponse.status === 401
      ) {
        localStorage.removeItem("access_token")
        throw new Error("Authentication expired")
      }

      if (!monitorsResponse.ok || !resultsResponse.ok) {
        throw new Error("Unable to load monitoring data")
      }

      const monitorData = await monitorsResponse.json()
      const resultData = await resultsResponse.json()

      setMonitors(monitorData)
      setCheckResults(resultData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()

    const interval = setInterval(loadData, 10000)

    return () => clearInterval(interval)
  }, [])

  const monitorData = useMemo(() => {
    return monitors.map((monitor) => {
      const results = checkResults
        .filter((result) => result.monitor_id === monitor.id)
        .sort(
          (a, b) =>
            new Date(b.checked_at) - new Date(a.checked_at)
        )

      return {
        ...monitor,
        results,
        latest: results[0] || null,
      }
    })
  }, [monitors, checkResults])

  const healthy = monitorData.filter(
    (monitor) => monitor.latest?.is_up
  ).length

  const down = monitorData.filter(
    (monitor) =>
      monitor.latest && !monitor.latest.is_up
  ).length

  const pending = monitors.length - healthy - down

  const averageResponse = useMemo(() => {
    const values = checkResults
      .filter(
        (result) =>
          result.response_time !== null &&
          result.response_time !== undefined
      )
      .map((result) => result.response_time)

    if (!values.length) return 0

    return (
      values.reduce((total, value) => total + value, 0) /
      values.length
    )
  }, [checkResults])

  const uptimePercentage =
    monitors.length > 0
      ? Math.round((healthy / monitors.length) * 100)
      : 0

  const deleteMonitor = async (id) => {
    if (!window.confirm("Delete this monitor?")) return

    try {
      const token = localStorage.getItem("access_token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${API_URL}/monitors/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        localStorage.removeItem("access_token")
        throw new Error("Authentication expired")
      }

      if (!response.ok) {
        throw new Error("Failed to delete monitor")
      }

      setSelectedMonitor(null)
      await loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const openEdit = (monitor) => {
    setEditingMonitor(monitor)
    setShowEdit(true)
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.07] px-5 lg:hidden">
        <Brand />

        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-400 hover:bg-white/[0.05]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="lg:pl-[240px]">
        {/* Top bar */}
        <header className="hidden h-16 items-center justify-between border-b border-white/[0.07] px-8 lg:flex">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Infrastructure</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-200">Monitors</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-xs text-gray-400">
                Monitoring active
              </span>
            </div>

            <button
              onClick={loadData}
              disabled={refreshing}
              className="rounded-lg border border-white/[0.07] p-2 text-gray-500 transition hover:bg-white/[0.05] hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              New monitor
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          {/* Hero */}
          <section className="mb-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-600">
                  <Activity className="h-3.5 w-3.5" />
                  System health
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                  Everything looks{" "}
                  <span className="text-emerald-400">
                    healthy.
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  Real-time availability and performance
                  monitoring for your services and endpoints.
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs text-gray-600">
                  Last updated
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Just now
                </p>
              </div>
            </div>
          </section>

          {/* Metrics */}
          <section className="mb-10 grid overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0f10] sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<Server className="h-4 w-4" />}
              label="Monitors"
              value={monitors.length}
              detail={`${pending} pending`}
            />

            <MetricCard
              icon={<Zap className="h-4 w-4" />}
              label="Operational"
              value={healthy}
              detail={
                down > 0
                  ? `${down} require attention`
                  : "All systems operational"
              }
              positive={down === 0}
            />

            <MetricCard
              icon={<Gauge className="h-4 w-4" />}
              label="Avg. response"
              value={`${averageResponse.toFixed(0)}ms`}
              detail="Across recent checks"
            />

            <MetricCard
              icon={<Activity className="h-4 w-4" />}
              label="Availability"
              value={`${uptimePercentage}%`}
              detail="Current fleet health"
              positive={uptimePercentage >= 99}
            />
          </section>

          {/* Monitor Section */}
          <section>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-base font-medium text-white">
                  Monitors
                </h2>

                <p className="mt-1 text-xs text-gray-600">
                  Endpoint health checks run automatically every
                  10 seconds.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <StatusDot color="bg-emerald-400" label="Operational" />
                <StatusDot color="bg-red-400" label="Down" />
                <StatusDot color="bg-gray-600" label="Pending" />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0f10]">
              <div className="hidden grid-cols-[minmax(280px,1fr)_140px_140px_140px_70px] gap-6 border-b border-white/[0.06] px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-600 md:grid">
                <span>Service</span>
                <span>Status</span>
                <span>Response</span>
                <span>Uptime</span>
                <span />
              </div>

              {loading ? (
                <LoadingRows />
              ) : monitorData.length === 0 ? (
                <EmptyState
                  onCreate={() => setShowCreate(true)}
                />
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {monitorData.map((monitor) => (
                    <MonitorRow
                      key={monitor.id}
                      monitor={monitor}
                      onSelect={() =>
                        setSelectedMonitor(monitor)
                      }
                      onEdit={() => openEdit(monitor)}
                      onDelete={() =>
                        deleteMonitor(monitor.id)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Bottom panels */}
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <AvailabilityPanel
              healthy={healthy}
              down={down}
              pending={pending}
              uptimePercentage={uptimePercentage}
            />

            <EnginePanel />
          </section>
        </div>
      </main>

      {/* Modals */}
      {showCreate && (
        <MonitorForm
          title="Create monitor"
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            loadData()
          }}
        />
      )}

      {showEdit && editingMonitor && (
        <MonitorForm
          title="Edit monitor"
          monitor={editingMonitor}
          onClose={() => {
            setShowEdit(false)
            setEditingMonitor(null)
          }}
          onSuccess={() => {
            setShowEdit(false)
            setEditingMonitor(null)
            loadData()
          }}
        />
      )}

      {selectedMonitor && (
        <MonitorDetails
          monitor={selectedMonitor}
          onClose={() => setSelectedMonitor(null)}
          onEdit={() => {
            setSelectedMonitor(null)
            openEdit(selectedMonitor)
          }}
          onDelete={() => deleteMonitor(selectedMonitor.id)}
        />
      )}
    </div>
  )
}



function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
        <Activity className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-semibold tracking-tight">
          Uptime
        </p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600">
          Monitor
        </p>
      </div>
    </div>
  )
}

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-white/[0.07] bg-[#090a0b] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/[0.07] px-5">
          <Brand />

          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1.5 text-gray-600 hover:bg-white/[0.05] hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-700">
            Workspace
          </p>

          <SidebarItem
            icon={<Activity className="h-4 w-4" />}
            label="Monitors"
            active
          />

          <SidebarItem
            icon={<AlertCircle className="h-4 w-4" />}
            label="Incidents"
            onClick={() => {
              window.location.href = "/incidents"
            }}
          />
          <SidebarItem
            icon={<Globe2 className="h-4 w-4" />}
            label="Endpoints"
          />

          <div className="my-6 border-t border-white/[0.05]" />

          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-700">
            System
          </p>

          <SidebarItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
          />
        </div>

        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-lg p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium text-gray-400">
              U
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-gray-300">
                Monitoring workspace
              </p>

              <p className="mt-0.5 text-[10px] text-gray-600">
                Personal
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
        active
          ? "bg-white/[0.07] text-white"
          : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}


function MetricCard({
  icon,
  label,
  value,
  detail,
  positive,
}) {
  return (
    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6 sm:even:border-l xl:border-b-0 xl:border-r xl:last:border-r-0">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <span
          className={`text-2xl font-semibold tracking-[-0.03em] ${
            positive ? "text-emerald-400" : "text-white"
          }`}
        >
          {value}
        </span>

        {positive && (
          <Check className="mb-1 h-4 w-4 text-emerald-400" />
        )}
      </div>

      <p className="mt-2 text-xs text-gray-600">
        {detail}
      </p>
    </div>
  )
}

function StatusDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </div>
  )
}



function MonitorRow({
  monitor,
  onSelect,
  onEdit,
  onDelete,
}) {
  const isUp = monitor.latest?.is_up
  const hasResult = monitor.latest !== null

  const uptime = calculateUptime(monitor.results)

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer px-5 py-5 transition hover:bg-white/[0.025] md:px-6"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(280px,1fr)_140px_140px_140px_70px] md:items-center md:gap-6">
        {/* Service */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <StatusIndicator
              isUp={isUp}
              hasResult={hasResult}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-medium text-gray-200">
                  {monitor.name}
                </h3>

                <ArrowUpRight className="h-3.5 w-3.5 text-gray-700 opacity-0 transition group-hover:opacity-100" />
              </div>

              <div className="mt-1 flex items-center gap-1.5">
                <Globe2 className="h-3 w-3 shrink-0 text-gray-700" />

                <p className="truncate text-xs text-gray-600">
                  {monitor.url}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile uptime visualization */}
          <div className="mt-4 md:hidden">
            <UptimeBars results={monitor.results} />
          </div>
        </div>

        {/* Status */}
        <div>
          <StatusBadge
            isUp={isUp}
            hasResult={hasResult}
          />
        </div>

        {/* Response */}
        <div>
          <p className="text-sm text-gray-300">
            {monitor.latest?.response_time
              ? `${monitor.latest.response_time.toFixed(0)} ms`
              : "--"}
          </p>

          <p className="mt-1 text-[10px] text-gray-700">
            Latest check
          </p>
        </div>

        {/* Uptime */}
        <div className="hidden md:block">
          <UptimeBars results={monitor.results} />

          <p className="mt-2 text-[10px] text-gray-700">
            {uptime}% availability
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-1 opacity-100 md:opacity-0 md:transition group-hover:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-white/[0.06] hover:text-white"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:hidden">
        <div className="rounded-lg bg-white/[0.025] p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-700">
            Interval
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Every {monitor.check_interval}s
          </p>
        </div>

        <div className="rounded-lg bg-white/[0.025] p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-700">
            Expected
          </p>

          <p className="mt-1 text-xs text-gray-400">
            HTTP {monitor.expected_status}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatusIndicator({ isUp, hasResult }) {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <div
        className={`absolute inset-0 rounded-full opacity-10 ${
          !hasResult
            ? "bg-gray-500"
            : isUp
            ? "bg-emerald-400"
            : "bg-red-400"
        }`}
      />

      <span
        className={`h-2.5 w-2.5 rounded-full ${
          !hasResult
            ? "bg-gray-600"
            : isUp
            ? "bg-emerald-400"
            : "bg-red-400"
        }`}
      />
    </div>
  )
}

function StatusBadge({ isUp, hasResult }) {
  if (!hasResult) {
    return (
      <span className="text-xs font-medium text-gray-600">
        Pending
      </span>
    )
  }

  if (isUp) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
        <Check className="h-3.5 w-3.5" />
        Operational
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-red-400">
      <AlertCircle className="h-3.5 w-3.5" />
      Down
    </div>
  )
}

/* -------------------------------------------------------
   Uptime Visualization
------------------------------------------------------- */

function UptimeBars({ results = [] }) {
  const bars = results.slice(0, 30).reverse()

  if (!bars.length) {
    return (
      <div className="flex h-5 items-center gap-[2px]">
        {Array.from({ length: 30 }).map((_, index) => (
          <span
            key={index}
            className="h-4 flex-1 rounded-[2px] bg-white/[0.05]"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-5 items-center gap-[2px]">
      {bars.map((result, index) => (
        <span
          key={result.id || index}
          title={
            result.checked_at
              ? new Date(result.checked_at).toLocaleString()
              : ""
          }
          className={`h-4 flex-1 rounded-[2px] transition ${
            result.is_up
              ? "bg-emerald-400/70 hover:bg-emerald-400"
              : "bg-red-400/80 hover:bg-red-400"
          }`}
        />
      ))}

      {Array.from({
        length: Math.max(0, 30 - bars.length),
      }).map((_, index) => (
        <span
          key={`empty-${index}`}
          className="h-4 flex-1 rounded-[2px] bg-white/[0.05]"
        />
      ))}
    </div>
  )
}

function calculateUptime(results) {
  if (!results?.length) return 0

  const successful = results.filter(
    (result) => result.is_up
  ).length

  return Math.round((successful / results.length) * 100)
}

/* -------------------------------------------------------
   Bottom Panels
------------------------------------------------------- */

function AvailabilityPanel({
  healthy,
  down,
  pending,
  uptimePercentage,
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0d0f10] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Fleet availability
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Current health across all monitored services.
          </p>
        </div>

        <Activity className="h-4 w-4 text-gray-700" />
      </div>

      <div className="mt-8 flex items-center gap-8">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[6px] border-emerald-400/10">
          <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-emerald-400/80 rotate-45" />

          <div className="text-center">
            <p className="text-2xl font-semibold tracking-tight">
              {uptimePercentage}%
            </p>

            <p className="mt-0.5 text-[9px] uppercase tracking-wider text-gray-600">
              healthy
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <HealthLine
            label="Operational"
            value={healthy}
            percentage={uptimePercentage}
            color="bg-emerald-400"
          />

          <HealthLine
            label="Down"
            value={down}
            percentage={
              healthy + down + pending > 0
                ? Math.round(
                    (down /
                      (healthy + down + pending)) *
                      100
                  )
                : 0
            }
            color="bg-red-400"
          />

          <HealthLine
            label="Pending"
            value={pending}
            percentage={
              healthy + down + pending > 0
                ? Math.round(
                    (pending /
                      (healthy + down + pending)) *
                      100
                  )
                : 0
            }
            color="bg-gray-600"
          />
        </div>
      </div>
    </div>
  )
}

function HealthLine({
  label,
  value,
  percentage,
  color,
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-400">{value}</span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  )
}

function EnginePanel() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0d0f10] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Monitoring engine
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Background health-check scheduler.
          </p>
        </div>

        <Zap className="h-4 w-4 text-gray-700" />
      </div>

      <div className="mt-8 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.025] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10">
            <Check className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-200">
              Scheduler operational
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Health checks are running normally.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.025] p-3">
          <Clock3 className="h-3.5 w-3.5 text-gray-600" />

          <p className="mt-3 text-xs text-gray-500">
            Check frequency
          </p>

          <p className="mt-1 text-sm font-medium text-gray-300">
            10 seconds
          </p>
        </div>

        <div className="rounded-lg bg-white/[0.025] p-3">
          <Activity className="h-3.5 w-3.5 text-gray-600" />

          <p className="mt-3 text-xs text-gray-500">
            System state
          </p>

          <p className="mt-1 text-sm font-medium text-emerald-400">
            Healthy
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------
   Empty / Loading
------------------------------------------------------- */

function LoadingRows() {
  return (
    <div className="divide-y divide-white/[0.05]">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="animate-pulse px-6 py-6"
        >
          <div className="h-4 w-1/3 rounded bg-white/[0.05]" />
          <div className="mt-3 h-3 w-1/4 rounded bg-white/[0.03]" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
        <Activity className="h-5 w-5 text-gray-600" />
      </div>

      <h3 className="mt-5 text-sm font-medium text-gray-200">
        No monitors yet
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-gray-600">
        Add your first endpoint to start collecting
        availability and response-time data.
      </p>

      <button
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
      >
        <Plus className="h-4 w-4" />
        Create monitor
      </button>
    </div>
  )
}

/* -------------------------------------------------------
   Monitor Form
------------------------------------------------------- */

function MonitorForm({
  title,
  monitor,
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState(
    monitor?.name || ""
  )

  const [url, setUrl] = useState(
    monitor?.url || ""
  )

  const [checkInterval, setCheckInterval] = useState(
    monitor?.check_interval || 30
  )

  const [expectedStatus, setExpectedStatus] = useState(
    monitor?.expected_status || 200
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const payload = {
        name,
        url,
        check_interval: Number(checkInterval),
        expected_status: Number(expectedStatus),
      }

      const response = await fetch(
        monitor
          ? `${API_URL}/monitors/${monitor.id}`
          : `${API_URL}/monitors`,
        {
          method: monitor ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.status === 401) {
        localStorage.removeItem("access_token")
        throw new Error("Authentication expired")
      }

      if (!response.ok) {
        throw new Error("Unable to save monitor")
      }

      onSuccess()
    } catch (error) {
      console.error(error)

      setError(
        error.message === "Authentication expired"
          ? "Your session has expired. Please sign in again."
          : "Unable to save monitor. Check the values and try again."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f10] shadow-2xl">
        <div className="border-b border-white/[0.07] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-600">
                Configuration
              </p>

              <h2 className="mt-2 text-lg font-semibold tracking-tight">
                {title}
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Configure how this endpoint should be monitored.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-600 hover:bg-white/[0.05] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="space-y-5 p-6"
        >
          <FormField
            label="Monitor name"
            value={name}
            onChange={setName}
            placeholder="Production API"
          />

          <FormField
            label="Endpoint URL"
            value={url}
            onChange={setUrl}
            placeholder="https://api.example.com/health"
            type="url"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Check interval"
              value={checkInterval}
              onChange={setCheckInterval}
              type="number"
              suffix="sec"
            />

            <FormField
              label="Expected status"
              value={expectedStatus}
              onChange={setExpectedStatus}
              type="number"
              suffix="HTTP"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-400/10 bg-red-400/[0.04] p-3.5 text-xs text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.07] px-4 py-2.5 text-sm text-gray-500 transition hover:bg-white/[0.04] hover:text-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 disabled:opacity-50"
            >
              {saving && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              )}

              {saving
                ? "Saving..."
                : monitor
                ? "Save changes"
                : "Create monitor"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-400">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          required
          className={`w-full rounded-lg border border-white/[0.08] bg-[#08090a] px-3.5 py-3 text-sm text-gray-200 outline-none transition placeholder:text-gray-700 focus:border-white/[0.2] focus:bg-white/[0.02] ${
            suffix ? "pr-14" : ""
          }`}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wide text-gray-600">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------
   Monitor Details
------------------------------------------------------- */

function MonitorDetails({
  monitor,
  onClose,
  onEdit,
  onDelete,
}) {
  const results = monitor.results || []

  const average =
    results.length > 0
      ? results.reduce(
          (sum, result) =>
            sum + (result.response_time || 0),
          0
        ) / results.length
      : 0

  const successfulChecks = results.filter(
    (result) => result.is_up
  ).length

  const availability =
    results.length > 0
      ? Math.round(
          (successfulChecks / results.length) * 100
        )
      : 0

  const latest = monitor.latest

  return (
    <Modal>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f10] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  latest?.is_up
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />

              <h2 className="truncate text-lg font-semibold tracking-tight">
                {monitor.name}
              </h2>
            </div>

            <div className="mt-2 flex items-center gap-2 pl-5">
              <Globe2 className="h-3 w-3 text-gray-700" />

              <p className="truncate text-xs text-gray-600">
                {monitor.url}
              </p>

              <ExternalLink className="h-3 w-3 text-gray-700" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-85px)] overflow-y-auto p-6">
          {/* Overview */}
          <div className="grid gap-3 sm:grid-cols-3">
            <DetailMetric
              title="Availability"
              value={`${availability}%`}
              positive={availability >= 99}
            />

            <DetailMetric
              title="Avg. response"
              value={`${average.toFixed(0)} ms`}
            />

            <DetailMetric
              title="Check interval"
              value={`${monitor.check_interval}s`}
            />
          </div>

          {/* Current state */}
          <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.015] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">
                  Current status
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Latest health check result.
                </p>
              </div>

              <StatusBadge
                isUp={latest?.is_up}
                hasResult={!!latest}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SmallStat
                label="HTTP status"
                value={latest?.status_code || "--"}
              />

              <SmallStat
                label="Response"
                value={
                  latest?.response_time
                    ? `${latest.response_time.toFixed(0)} ms`
                    : "--"
                }
              />

              <SmallStat
                label="Expected"
                value={monitor.expected_status}
              />

              <SmallStat
                label="Interval"
                value={`${monitor.check_interval}s`}
              />
            </div>
          </div>

          {/* History */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.07]">
            <div className="border-b border-white/[0.07] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-200">
                    Check history
                  </h3>

                  <p className="mt-1 text-xs text-gray-600">
                    Recent endpoint health checks.
                  </p>
                </div>

                <span className="text-xs text-gray-600">
                  {results.length} checks
                </span>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-600">
                No check results available yet.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {results.slice(0, 25).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          result.is_up
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      />

                      <div className="min-w-0">
                        <p
                          className={`text-xs font-medium ${
                            result.is_up
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {result.is_up
                            ? "Operational"
                            : "Failed"}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-gray-700">
                          {result.checked_at
                            ? new Date(
                                result.checked_at
                              ).toLocaleString()
                            : "Unknown time"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-6 text-xs">
                      <span className="text-gray-500">
                        HTTP {result.status_code || "--"}
                      </span>

                      <span className="w-16 text-right text-gray-600">
                        {result.response_time
                          ? `${result.response_time.toFixed(0)} ms`
                          : "--"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-400/[0.06]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete monitor
            </button>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-black transition hover:bg-gray-200"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit monitor
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function DetailMetric({
  title,
  value,
  positive,
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-600">
        {title}
      </p>

      <p
        className={`mt-3 text-xl font-semibold tracking-tight ${
          positive
            ? "text-emerald-400"
            : "text-gray-200"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function SmallStat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-700">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-gray-300">
        {value}
      </p>
    </div>
  )
}

/* -------------------------------------------------------
   Modal
------------------------------------------------------- */

function Modal({ children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      {children}
    </div>
  )
}

