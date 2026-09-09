import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Menu,
  RefreshCw,
  X,
} from "lucide-react"

const API_URL = "http://127.0.0.1:8000"

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState(null)

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

      const [incidentsResponse, monitorsResponse] =
        await Promise.all([
          fetch(`${API_URL}/incidents`, { headers }),
          fetch(`${API_URL}/monitors`, { headers }),
        ])

      if (
        incidentsResponse.status === 401 ||
        monitorsResponse.status === 401
      ) {
        localStorage.removeItem("access_token")
        throw new Error("Authentication expired")
      }

      if (
        !incidentsResponse.ok ||
        !monitorsResponse.ok
      ) {
        throw new Error("Unable to load incident data")
      }

      const incidentData =
        await incidentsResponse.json()

      const monitorData =
        await monitorsResponse.json()

      setIncidents(incidentData)
      setMonitors(monitorData)
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

  const monitorMap = useMemo(() => {
    return Object.fromEntries(
      monitors.map((monitor) => [
        monitor.id,
        monitor,
      ])
    )
  }, [monitors])

  const activeIncidents = incidents.filter(
    (incident) => incident.status === "active"
  )

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "resolved"
  )

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

      <main className="lg:pl-[240px]">
        {/* Top bar */}
        <header className="hidden h-16 items-center justify-between border-b border-white/[0.07] px-8 lg:flex">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Infrastructure</span>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="text-gray-200">
              Incidents
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                    activeIncidents.length > 0
                      ? "bg-red-400"
                      : "bg-emerald-400"
                  }`}
                />

                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    activeIncidents.length > 0
                      ? "bg-red-400"
                      : "bg-emerald-400"
                  }`}
                />
              </span>

              <span className="text-xs text-gray-400">
                {activeIncidents.length > 0
                  ? "Incident detected"
                  : "Systems operational"}
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
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          {/* Hero */}
          <section className="mb-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Incident management
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                  {activeIncidents.length > 0
                    ? "Attention required."
                    : "Everything is stable."}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  Track active outages, resolved incidents,
                  and service recovery across your monitored
                  infrastructure.
                </p>
              </div>
            </div>
          </section>

          {/* Metrics */}
          <section className="mb-10 grid overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0f10] sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              icon={
                <AlertCircle className="h-4 w-4" />
              }
              label="Active incidents"
              value={activeIncidents.length}
              detail={
                activeIncidents.length > 0
                  ? "Require attention"
                  : "No active incidents"
              }
              danger={activeIncidents.length > 0}
            />

            <MetricCard
              icon={
                <CheckCircle2 className="h-4 w-4" />
              }
              label="Resolved"
              value={resolvedIncidents.length}
              detail="Recovered incidents"
              positive
            />

            <MetricCard
              icon={<Activity className="h-4 w-4" />}
              label="Total incidents"
              value={incidents.length}
              detail="Recorded incidents"
            />
          </section>

          {/* Active incidents */}
          <section className="mb-10">
            <div className="mb-4">
              <h2 className="text-base font-medium text-white">
                Active incidents
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Services currently experiencing an outage.
              </p>
            </div>

            <IncidentTable
              incidents={activeIncidents}
              monitorMap={monitorMap}
              loading={loading}
              emptyMessage="No active incidents. All monitored services are operational."
              onSelect={setSelectedIncident}
            />
          </section>

          {/* Incident history */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-medium text-white">
                Incident history
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Previously detected and resolved incidents.
              </p>
            </div>

            <IncidentTable
              incidents={resolvedIncidents}
              monitorMap={monitorMap}
              loading={loading}
              emptyMessage="No resolved incidents yet."
              onSelect={setSelectedIncident}
            />
          </section>
        </div>
      </main>

      {selectedIncident && (
        <IncidentDetails
          incident={selectedIncident}
          monitor={
            monitorMap[selectedIncident.monitor_id]
          }
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------
   Brand
------------------------------------------------------- */

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

/* -------------------------------------------------------
   Sidebar
------------------------------------------------------- */

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
          open
            ? "translate-x-0"
            : "-translate-x-full"
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
            onClick={() => {
              window.location.href = "/"
            }}
          />

          <SidebarItem
            icon={
              <AlertCircle className="h-4 w-4" />
            }
            label="Incidents"
            active
          />

          <SidebarItem
            icon={<Clock3 className="h-4 w-4" />}
            label="Endpoints"
          />

          <div className="my-6 border-t border-white/[0.05]" />

          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-700">
            System
          </p>

          <SidebarItem
            icon={<Activity className="h-4 w-4" />}
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

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}) {
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

/* -------------------------------------------------------
   Metrics
------------------------------------------------------- */

function MetricCard({
  icon,
  label,
  value,
  detail,
  positive,
  danger,
}) {
  return (
    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6 xl:border-b-0 xl:border-r xl:last:border-r-0">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}

        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <span
          className={`text-2xl font-semibold tracking-[-0.03em] ${
            danger
              ? "text-red-400"
              : positive
              ? "text-emerald-400"
              : "text-white"
          }`}
        >
          {value}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-600">
        {detail}
      </p>
    </div>
  )
}

/* -------------------------------------------------------
   Incident Table
------------------------------------------------------- */

function IncidentTable({
  incidents,
  monitorMap,
  loading,
  emptyMessage,
  onSelect,
}) {
  if (loading) {
    return <LoadingRows />
  }

  if (!incidents.length) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-[#0d0f10] px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400" />

        <p className="mt-4 text-sm font-medium text-gray-300">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0f10]">
      <div className="hidden grid-cols-[minmax(260px,1fr)_120px_180px_180px] gap-6 border-b border-white/[0.06] px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-600 md:grid">
        <span>Monitor</span>
        <span>Status</span>
        <span>Started</span>
        <span>Resolved</span>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {incidents.map((incident) => {
          const monitor =
            monitorMap[incident.monitor_id]

          const active =
            incident.status === "active"

          return (
            <button
              key={incident.id}
              onClick={() => onSelect(incident)}
              className="group block w-full px-5 py-5 text-left transition hover:bg-white/[0.025] md:px-6"
            >
              <div className="grid gap-4 md:grid-cols-[minmax(260px,1fr)_120px_180px_180px] md:items-center md:gap-6">
                {/* Monitor */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        active
                          ? "bg-red-400"
                          : "bg-emerald-400"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-200">
                        {monitor?.name ||
                          `Monitor #${incident.monitor_id}`}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-600">
                        {incident.reason ||
                          "No reason provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  {active ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved
                    </div>
                  )}
                </div>

                {/* Started */}
                <div>
                  <p className="text-xs text-gray-400">
                    {formatDate(incident.started_at)}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-700">
                    Started
                  </p>
                </div>

                {/* Resolved */}
                <div>
                  <p className="text-xs text-gray-400">
                    {incident.resolved_at
                      ? formatDate(
                          incident.resolved_at
                        )
                      : "—"}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-700">
                    {active
                      ? "Still active"
                      : "Resolved"}
                  </p>
                </div>
              </div>

              {/* Mobile details */}
              <div className="mt-4 grid grid-cols-2 gap-3 md:hidden">
                <div className="rounded-lg bg-white/[0.025] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-gray-700">
                    Started
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(
                      incident.started_at
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.025] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-gray-700">
                    Resolved
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {incident.resolved_at
                      ? formatDate(
                          incident.resolved_at
                        )
                      : "Still active"}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------
   Incident Details
------------------------------------------------------- */

function IncidentDetails({
  incident,
  monitor,
  onClose,
}) {
  const active = incident.status === "active"

  const duration = calculateDuration(
    incident.started_at,
    incident.resolved_at
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f10] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  active
                    ? "bg-red-400"
                    : "bg-emerald-400"
                }`}
              />

              <h2 className="text-lg font-semibold tracking-tight">
                Incident #{incident.id}
              </h2>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              {monitor?.name ||
                `Monitor #${incident.monitor_id}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-600">
              Reason
            </p>

            <p className="mt-2 text-sm text-gray-300">
              {incident.reason ||
                "No reason provided"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <DetailStat
              label="Status"
              value={
                active ? "Active" : "Resolved"
              }
              positive={!active}
              danger={active}
            />

            <DetailStat
              label="Started"
              value={formatDate(
                incident.started_at
              )}
            />

            <DetailStat
              label="Duration"
              value={duration}
            />
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="h-4 w-4 text-gray-600" />

              <div>
                <p className="text-sm font-medium text-gray-300">
                  Incident timeline
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {active
                    ? "The service has not recovered yet."
                    : `Service recovered at ${formatDate(
                        incident.resolved_at
                      )}.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailStat({
  label,
  value,
  positive,
  danger,
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4">
      <p className="text-[10px] uppercase tracking-wide text-gray-700">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-medium ${
          positive
            ? "text-emerald-400"
            : danger
            ? "text-red-400"
            : "text-gray-300"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

function formatDate(value) {
  if (!value) return "—"

  return new Date(value).toLocaleString()
}

function calculateDuration(start, end) {
  if (!start) return "—"

  const startTime = new Date(start).getTime()

  const endTime = end
    ? new Date(end).getTime()
    : Date.now()

  const seconds = Math.max(
    0,
    Math.floor((endTime - startTime) / 1000)
  )

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 1) {
    return `${remainingSeconds}s`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours < 1) {
    return `${minutes}m`
  }

  return `${hours}h ${remainingMinutes}m`
}

function LoadingRows() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0f10]">
      <div className="divide-y divide-white/[0.05]">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse px-6 py-6"
          >
            <div className="h-4 w-1/3 rounded bg-white/[0.05]" />

            <div className="mt-3 h-3 w-1/4 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  )
}

