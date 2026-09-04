
import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Gauge,
  Menu,
  Monitor as MonitorIcon,
  Pencil,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Trash2,
  X,
  Zap
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

  const loadData = async () => {
    try {
      setRefreshing(true)

      const [monitorsResponse, resultsResponse] =
        await Promise.all([
          fetch(`${API_URL}/monitors`),
          fetch(`${API_URL}/check_results`)
        ])

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
        .filter(
          (result) => result.monitor_id === monitor.id
        )
        .sort(
          (a, b) =>
            new Date(b.checked_at) -
            new Date(a.checked_at)
        )

      return {
        ...monitor,
        results,
        latest: results[0] || null
      }
    })
  }, [monitors, checkResults])

  const healthy = monitorData.filter(
    (monitor) => monitor.latest?.is_up
  ).length

  const down = monitorData.filter(
    (monitor) =>
      monitor.latest &&
      !monitor.latest.is_up
  ).length

  const unknown = monitors.length - healthy - down

  const averageResponse = useMemo(() => {
    const values = checkResults
      .filter(
        (result) =>
          result.response_time !== null &&
          result.response_time !== undefined
      )
      .map((result) => result.response_time)

    if (!values.length) {
      return 0
    }

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
    if (
      !window.confirm(
        "Are you sure you want to delete this monitor?"
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/monitors/${id}`,
        {
          method: "DELETE"
        }
      )

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
    <div className="min-h-screen bg-[#08040f] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-fuchsia-700/10 blur-[130px]" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-purple-900/30 bg-[#0b0612]/90 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="flex h-20 items-center gap-3 border-b border-purple-900/30 px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>

              <div>
                <h1 className="text-lg font-bold">
                  Uptime
                  <span className="text-purple-400">
                    Monitor
                  </span>
                </h1>

                <p className="text-[9px] uppercase tracking-[0.25em] text-purple-300/40">
                  Observability
                </p>
              </div>
            </div>

            <div className="flex-1 px-4 py-6">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                Monitoring
              </p>

              <div className="space-y-1">
                <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-3 text-sm text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.06)]">
                  <Gauge className="h-4 w-4 text-purple-400" />
                  Dashboard
                </div>

                <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-purple-500/5 hover:text-gray-300">
                  <MonitorIcon className="h-4 w-4" />
                  Monitors
                </div>

                <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-purple-500/5 hover:text-gray-300">
                  <AlertTriangle className="h-4 w-4" />
                  Incidents
                </div>
              </div>

              <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                System
              </p>

              <div className="space-y-1">
                <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-purple-500/5 hover:text-gray-300">
                  <Server className="h-4 w-4" />
                  Infrastructure
                </div>

                <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-purple-500/5 hover:text-gray-300">
                  <ShieldCheck className="h-4 w-4" />
                  Availability
                </div>
              </div>
            </div>

            <div className="border-t border-purple-900/30 p-4">
              <div className="rounded-xl border border-purple-900/30 bg-purple-950/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400 shadow-[0_0_12px_#a855f7]" />
                  <span className="text-xs font-medium text-purple-300">
                    Monitoring Engine
                  </span>
                </div>

                <p className="text-[11px] text-gray-600">
                  Scheduler operational
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-purple-900/30 bg-[#08040f]/80 px-4 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-4">
              <button className="rounded-lg p-2 text-gray-500 hover:bg-purple-500/10 hover:text-white lg:hidden">
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-xs text-purple-400">
                  Infrastructure
                </p>

                <h2 className="text-lg font-semibold">
                  Monitoring Dashboard
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-purple-900/30 bg-purple-950/20 px-3 py-2 sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
                <span className="text-xs text-gray-400">
                  Live
                </span>
              </div>

              <button
                onClick={loadData}
                className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-2.5 text-gray-400 transition hover:border-purple-500/40 hover:text-purple-300"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold shadow-[0_0_25px_rgba(147,51,234,0.25)] transition hover:bg-purple-500"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  New Monitor
                </span>
              </button>
            </div>
          </header>

          <div className="p-4 sm:p-8">
            <div className="mx-auto max-w-[1600px]">
              <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-purple-400">
                  System Overview
                </p>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Infrastructure
                  <span className="text-purple-400">
                    {" "}
                    Health
                  </span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Real-time visibility into your monitored
                  endpoints and service availability.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Total Monitors"
                  value={monitors.length}
                  icon={MonitorIcon}
                  description="Configured endpoints"
                />

                <MetricCard
                  title="Healthy"
                  value={healthy}
                  icon={CheckCircle2}
                  description="Operational services"
                  success
                />

                <MetricCard
                  title="Down"
                  value={down}
                  icon={AlertTriangle}
                  description="Active failures"
                  danger={down > 0}
                />

                <MetricCard
                  title="Avg Response"
                  value={`${averageResponse.toFixed(0)} ms`}
                  icon={Zap}
                  description="Across all checks"
                />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl border border-purple-900/30 bg-[#0e0818] p-6 xl:col-span-2">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Overall Availability
                      </p>

                      <div className="mt-2 flex items-end gap-3">
                        <span className="text-4xl font-bold">
                          {uptimePercentage}%
                        </span>

                        <span className="mb-1 flex items-center gap-1 text-xs text-green-400">
                          <ArrowUpRightIcon />
                          Live
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3">
                      <ShieldCheck className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>

                  <div className="relative mt-8">
                    <div className="h-3 overflow-hidden rounded-full bg-purple-950/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-800 via-purple-500 to-fuchsia-400 shadow-[0_0_18px_rgba(168,85,247,0.7)] transition-all duration-700"
                        style={{
                          width: `${uptimePercentage}%`
                        }}
                      />
                    </div>

                    <div className="mt-4 flex justify-between text-xs text-gray-600">
                      <span>
                        {healthy} healthy
                      </span>

                      <span>
                        {down} down
                      </span>

                      <span>
                        {unknown} awaiting data
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-900/30 bg-[#0e0818] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Monitoring Engine
                      </p>

                      <h3 className="mt-1 font-semibold">
                        Scheduler
                      </h3>
                    </div>

                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3">
                      <Activity className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-green-500/10 bg-green-500/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          Operational
                        </p>

                        <p className="text-xs text-gray-600">
                          Background checks active
                        </p>
                      </div>

                      <span className="ml-auto h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-purple-900/30 bg-[#0e0818]">
                <div className="flex flex-col gap-4 border-b border-purple-900/30 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Monitored Services
                    </h3>

                    <p className="mt-1 text-xs text-gray-600">
                      Latest health state from your monitoring engine
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock3 className="h-3.5 w-3.5" />
                    Auto-refreshing every 10 seconds
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4 p-6">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-16 animate-pulse rounded-xl bg-purple-950/20"
                      />
                    ))}
                  </div>
                ) : monitorData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
                      <MonitorIcon className="h-7 w-7 text-purple-400" />
                    </div>

                    <h3 className="text-lg font-semibold">
                      No monitors yet
                    </h3>

                    <p className="mt-2 max-w-md text-sm text-gray-600">
                      Add your first endpoint to start monitoring
                      service availability and response time.
                    </p>

                    <button
                      onClick={() => setShowCreate(true)}
                      className="mt-6 flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold hover:bg-purple-500"
                    >
                      <Plus className="h-4 w-4" />
                      Create Monitor
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-purple-900/20">
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
            </div>
          </div>
        </main>
      </div>

      {showCreate && (
        <MonitorForm
          title="Create Monitor"
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            loadData()
          }}
        />
      )}

      {showEdit && editingMonitor && (
        <MonitorForm
          title="Edit Monitor"
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
          onDelete={() =>
            deleteMonitor(selectedMonitor.id)
          }
        />
      )}
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  success,
  danger
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-purple-900/30 bg-[#0e0818] p-5 transition hover:border-purple-500/30">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-purple-600/5 blur-2xl transition group-hover:bg-purple-600/10" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
            {title}
          </p>

          <p
            className={`mt-3 text-3xl font-bold ${
              success
                ? "text-green-400"
                : danger
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            success
              ? "border-green-500/20 bg-green-500/10"
              : danger
              ? "border-red-500/20 bg-red-500/10"
              : "border-purple-500/20 bg-purple-500/10"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              success
                ? "text-green-400"
                : danger
                ? "text-red-400"
                : "text-purple-400"
            }`}
          />
        </div>
      </div>
    </div>
  )
}

function MonitorRow({
  monitor,
  onSelect,
  onEdit,
  onDelete
}) {
  const isUp = monitor.latest?.is_up
  const hasResult = monitor.latest !== null

  return (
    <div className="group flex flex-col gap-4 px-6 py-5 transition hover:bg-purple-500/[0.03] lg:flex-row lg:items-center">
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
            !hasResult
              ? "border-gray-700/40 bg-gray-800/20"
              : isUp
              ? "border-green-500/20 bg-green-500/10"
              : "border-red-500/20 bg-red-500/10"
          }`}
        >
          <MonitorIcon
            className={`h-5 w-5 ${
              !hasResult
                ? "text-gray-600"
                : isUp
                ? "text-green-400"
                : "text-red-400"
            }`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium text-gray-200">
              {monitor.name}
            </h4>

            <span
              className={`h-2 w-2 rounded-full ${
                !hasResult
                  ? "bg-gray-600"
                  : isUp
                  ? "bg-green-400 shadow-[0_0_8px_#4ade80]"
                  : "bg-red-400 shadow-[0_0_8px_#f87171]"
              }`}
            />
          </div>

          <div className="mt-1 flex items-center gap-2">
            <p className="max-w-[300px] truncate text-xs text-gray-600">
              {monitor.url}
            </p>

            <ExternalLink className="h-3 w-3 shrink-0 text-gray-700" />
          </div>
        </div>
      </button>

      <div className="grid grid-cols-3 gap-6 lg:w-[420px]">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-700">
            Status
          </p>

          <p
            className={`mt-1 text-sm font-medium ${
              !hasResult
                ? "text-gray-500"
                : isUp
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {!hasResult
              ? "Pending"
              : isUp
              ? "Operational"
              : "Down"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-700">
            Response
          </p>

          <p className="mt-1 text-sm font-medium text-gray-300">
            {monitor.latest?.response_time
              ? `${monitor.latest.response_time.toFixed(0)} ms`
              : "--"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-700">
            Interval
          </p>

          <p className="mt-1 text-sm font-medium text-gray-300">
            {monitor.check_interval}s
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="rounded-lg border border-purple-900/30 p-2 text-gray-600 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg border border-red-900/20 p-2 text-gray-600 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function MonitorForm({
  title,
  monitor,
  onClose,
  onSuccess
}) {
  const [name, setName] = useState(
    monitor?.name || ""
  )
  const [url, setUrl] = useState(
    monitor?.url || ""
  )
  const [checkInterval, setCheckInterval] =
    useState(
      monitor?.check_interval || 30
    )
  const [expectedStatus, setExpectedStatus] =
    useState(
      monitor?.expected_status || 200
    )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setError("")

    try {
      const payload = {
        name,
        url,
        check_interval: Number(checkInterval),
        expected_status: Number(expectedStatus)
      }

      const response = await fetch(
        monitor
          ? `${API_URL}/monitors/${monitor.id}`
          : `${API_URL}/monitors`,
        {
          method: monitor ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        throw new Error(
          "Unable to save monitor"
        )
      }

      onSuccess()
    } catch (error) {
      console.error(error)
      setError("Unable to save monitor.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-purple-900/40 bg-[#0e0818] shadow-[0_0_60px_rgba(109,40,217,0.2)]">
        <div className="flex items-center justify-between border-b border-purple-900/30 p-6">
          <div>
            <p className="text-xs text-purple-400">
              Monitoring Configuration
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-purple-500/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-5 p-6"
        >
          <FormField
            label="Monitor Name"
            value={name}
            onChange={setName}
            placeholder="Production API"
          />

          <FormField
            label="URL"
            value={url}
            onChange={setUrl}
            placeholder="https://example.com"
            type="url"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Check Interval"
              value={checkInterval}
              onChange={setCheckInterval}
              type="number"
              suffix="seconds"
            />

            <FormField
              label="Expected Status"
              value={expectedStatus}
              onChange={setExpectedStatus}
              type="number"
              suffix="HTTP"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold shadow-[0_0_25px_rgba(147,51,234,0.2)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}

            {saving
              ? "Saving..."
              : monitor
              ? "Save Changes"
              : "Create Monitor"}
          </button>
        </form>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-500">
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
          className="w-full rounded-xl border border-purple-900/40 bg-[#09050f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-gray-700">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function MonitorDetails({
  monitor,
  onClose,
  onEdit,
  onDelete
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
          (successfulChecks / results.length) *
            100
        )
      : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-purple-900/40 bg-[#0e0818] shadow-[0_0_70px_rgba(109,40,217,0.2)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-purple-900/30 bg-[#0e0818]/95 p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                monitor.latest?.is_up
                  ? "bg-green-500/10"
                  : "bg-red-500/10"
              }`}
            >
              <MonitorIcon
                className={`h-6 w-6 ${
                  monitor.latest?.is_up
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {monitor.name}
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                {monitor.url}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-purple-500/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <DetailMetric
              title="Availability"
              value={`${availability}%`}
              icon={ShieldCheck}
            />

            <DetailMetric
              title="Avg Response"
              value={`${average.toFixed(0)} ms`}
              icon={Zap}
            />

            <DetailMetric
              title="Check Interval"
              value={`${monitor.check_interval}s`}
              icon={Clock3}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-purple-900/30 bg-[#09050f]">
            <div className="border-b border-purple-900/30 p-5">
              <h3 className="font-semibold">
                Check History
              </h3>

              <p className="mt-1 text-xs text-gray-600">
                Latest monitoring results
              </p>
            </div>

            <div className="divide-y divide-purple-900/20">
              {results.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-600">
                  No check results available yet.
                </div>
              ) : (
                results.slice(0, 20).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          result.is_up
                            ? "bg-green-400 shadow-[0_0_8px_#4ade80]"
                            : "bg-red-400 shadow-[0_0_8px_#f87171]"
                        }`}
                      />

                      <div>
                        <p
                          className={`text-sm font-medium ${
                            result.is_up
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {result.is_up
                            ? "Operational"
                            : "Failed"}
                        </p>

                        <p className="text-[11px] text-gray-700">
                          {result.checked_at
                            ? new Date(
                                result.checked_at
                              ).toLocaleString()
                            : "Unknown time"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-300">
                        {result.status_code ||
                          "--"}
                      </p>

                      <p className="text-[11px] text-gray-700">
                        {result.response_time
                          ? `${result.response_time.toFixed(
                              0
                            )} ms`
                          : "--"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-500"
            >
              <Pencil className="h-4 w-4" />
              Edit Monitor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailMetric({
  title,
  value,
  icon: Icon
}) {
  return (
    <div className="rounded-2xl border border-purple-900/30 bg-[#09050f] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-gray-600">
          {title}
        </p>

        <Icon className="h-4 w-4 text-purple-400" />
      </div>

      <p className="mt-3 text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}

function ArrowUpRightIcon() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M5 15L15 5M8 5h7v7" />
    </svg>
  )
}

