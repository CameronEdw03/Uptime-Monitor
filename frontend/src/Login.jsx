
import { useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  Server,
  ShieldCheck,
} from "lucide-react"

const API_URL = "http://127.0.0.1:8000"

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login")

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const isLogin = mode === "login"

  const resetMessages = () => {
    setError("")
    setSuccess("")
  }

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login")
    setUsername("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    resetMessages()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!isLogin) {
        if (password !== confirmPassword) {
          setError("Passwords do not match.")
          return
        }

        if (password.length < 8) {
          setError("Password must be at least 8 characters.")
          return
        }

        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Unable to create account."
          )
        }

        setSuccess("Account created successfully.")

        setMode("login")
        setUsername("")
        setPassword("")
        setConfirmPassword("")

        return
      }

      const formData = new URLSearchParams()

      formData.append("username", email)
      formData.append("password", password)

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid email or password."
        )
      }

      if (!data.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        )
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      )

      if (onLogin) {
        onLogin(data.access_token)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.message || "Unable to sign in.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090a0b] text-gray-100">

      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative flex min-h-screen">

        {/* ========================================================= */}
        {/* LEFT SIDE — PRODUCT / SYSTEM STATUS */}
        {/* ========================================================= */}

        <div className="hidden w-[55%] flex-col justify-between border-r border-white/[0.07] bg-[#0b0c0d] p-10 lg:flex">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04]">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <div className="text-sm font-semibold tracking-tight">
                  Uptime Monitor
                </div>

                <div className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                  Infrastructure Observability
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-400">
                Monitoring engine online
              </span>
            </div>

            <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white xl:text-5xl">
              Know when your
              <br />
              infrastructure
              <br />
              <span className="text-gray-500">
                stops responding.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-gray-500">
              Monitor endpoints, track response times, and understand
              service availability from a single operational dashboard.
            </p>

            {/* System visualization */}
            <div className="mt-10 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f1011]">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">

                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-gray-500" />

                  <span className="text-[11px] font-medium text-gray-400">
                    System health
                  </span>
                </div>

                <span className="text-[10px] font-mono text-gray-600">
                  LIVE
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 divide-x divide-white/[0.07]">

                <MiniMetric
                  label="Availability"
                  value="99.98%"
                />

                <MiniMetric
                  label="Response"
                  value="142ms"
                />

                <MiniMetric
                  label="Monitors"
                  value="12"
                />

              </div>

              {/* Uptime bars */}
              <div className="border-t border-white/[0.07] p-4">

                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-gray-600">
                    Last 24 hours
                  </span>

                  <span className="text-[10px] text-gray-600">
                    100 checks
                  </span>
                </div>

                <div className="flex h-7 gap-1">

                  {Array.from({ length: 72 }).map((_, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-[2px] ${
                        index === 47
                          ? "bg-amber-500/70"
                          : "bg-emerald-500/60"
                      }`}
                    />
                  ))}

                </div>

              </div>

              {/* Services */}
              <div className="border-t border-white/[0.07] divide-y divide-white/[0.05]">

                <ServiceRow
                  icon={Globe}
                  name="api.production.com"
                  response="128ms"
                />

                <ServiceRow
                  icon={Server}
                  name="app.production.com"
                  response="164ms"
                />

                <ServiceRow
                  icon={Database}
                  name="database.internal"
                  response="91ms"
                />

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-5 text-[10px] uppercase tracking-wider text-gray-700">
              <span>API</span>
              <span>Scheduler</span>
              <span>Database</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure access
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE — AUTH */}
        {/* ========================================================= */}

        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[45%]">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04]">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  Uptime Monitor
                </div>

                <div className="text-[10px] uppercase tracking-wider text-gray-600">
                  Infrastructure Observability
                </div>
              </div>

            </div>

            {/* Heading */}
            <div className="mb-8">

              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-600">
                <span className="h-px w-5 bg-gray-700" />
                Account access
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {isLogin
                  ? "Welcome back."
                  : "Create your account."}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {isLogin
                  ? "Sign in to access your monitoring workspace."
                  : "Create an account to start monitoring your services."}
              </p>

            </div>

            {/* Auth card */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0f10] shadow-2xl shadow-black/20">

              {/* Tabs */}
              <div className="grid grid-cols-2 border-b border-white/[0.07]">

                <button
                  type="button"
                  onClick={() => {
                    setMode("login")
                    resetMessages()
                  }}
                  className={`relative px-4 py-3.5 text-xs font-medium transition ${
                    isLogin
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  Sign in

                  {isLogin && (
                    <span className="absolute bottom-[-1px] left-4 right-4 h-px bg-emerald-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup")
                    resetMessages()
                  }}
                  className={`relative px-4 py-3.5 text-xs font-medium transition ${
                    !isLogin
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  Create account

                  {!isLogin && (
                    <span className="absolute bottom-[-1px] left-4 right-4 h-px bg-emerald-400" />
                  )}
                </button>

              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >

                {!isLogin && (
                  <FormField
                    label="Username"
                    value={username}
                    onChange={setUsername}
                    placeholder="cameron"
                    autoComplete="username"
                  />
                )}

                <FormField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                />

                <FormField
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  type="password"
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                />

                {!isLogin && (
                  <FormField
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                  />
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3.5">

                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                    <span className="text-xs leading-5 text-red-400">
                      {error}
                    </span>

                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5">

                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                    <span className="text-xs leading-5 text-emerald-400">
                      {success}
                    </span>

                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-[#07110c] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? isLogin
                      ? "Signing in..."
                      : "Creating account..."
                    : isLogin
                    ? "Sign in"
                    : "Create account"}

                  {!loading && (
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>

              </form>
            </div>

            {/* Switch */}
            <div className="mt-6 text-center">

              <p className="text-xs text-gray-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>

              <button
                type="button"
                onClick={switchMode}
                className="mt-1.5 text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                {isLogin
                  ? "Create an account"
                  : "Sign in instead"}
              </button>

            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-white/[0.06] pt-5 text-center">

              <p className="text-[10px] uppercase tracking-[0.14em] text-gray-700">
                Uptime Monitor · Service availability platform
              </p>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

/* =============================================================== */
/* FORM FIELD */
/* =============================================================== */

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-lg border border-white/[0.09] bg-[#090a0b] px-3.5 py-3 text-sm text-gray-200 outline-none transition placeholder:text-gray-700 hover:border-white/[0.14] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10"
      />
    </div>
  )
}

/* =============================================================== */
/* MINI METRIC */
/* =============================================================== */

function MiniMetric({ label, value }) {
  return (
    <div className="px-4 py-4">

      <div className="text-[9px] uppercase tracking-wider text-gray-600">
        {label}
      </div>

      <div className="mt-1.5 font-mono text-sm font-medium text-gray-200">
        {value}
      </div>

    </div>
  )
}

/* =============================================================== */
/* SERVICE ROW */
/* =============================================================== */

function ServiceRow({
  icon: Icon,
  name,
  response,
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">

      <div className="flex items-center gap-2.5">

        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/[0.07]">
          <Icon className="h-3 w-3 text-emerald-400" />
        </div>

        <span className="font-mono text-[10px] text-gray-500">
          {name}
        </span>

      </div>

      <div className="flex items-center gap-2">

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

        <span className="font-mono text-[10px] text-gray-600">
          {response}
        </span>

      </div>

    </div>
  )
}

