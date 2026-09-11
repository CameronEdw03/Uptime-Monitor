import { useEffect, useState } from "react"
import {
  Activity,
  Bell,
  ChevronRight,
  CircleUserRound,
  LogOut,
  Monitor,
  Settings as SettingsIcon,
  Shield,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const API_URL = "http://127.0.0.1:8000"

function Settings({ onLogout }) {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [incidentNotifications, setIncidentNotifications] = useState(true)
  const [maintenanceNotifications, setMaintenanceNotifications] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  const [profileUsername, setProfileUsername] = useState("")
  const [profileEmail, setProfileEmail] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const token = localStorage.getItem("access_token")

  const loadAccount = async () => {
    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load account")
      }

      const data = await response.json()

      setUsername(data.username)
      setEmail(data.email)

      setEmailNotifications(data.email_notifications)
      setIncidentNotifications(data.incident_alerts)
      setMaintenanceNotifications(data.maintenance_notifications)

      localStorage.setItem("user_email", data.email)
    } catch (err) {
      setError("Unable to load account information.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccount()
  }, [])

  const updateAccount = async (updates) => {
    try {
      setSaving(true)
      setMessage("")
      setError("")

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update account")
      }

      const updatedUser = data.user

      setUsername(updatedUser.username)
      setEmail(updatedUser.email)

      setEmailNotifications(updatedUser.email_notifications)
      setIncidentNotifications(updatedUser.incident_alerts)
      setMaintenanceNotifications(
        updatedUser.maintenance_notifications
      )

      localStorage.setItem("user_email", updatedUser.email)

      setMessage("Settings saved successfully.")

      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()

    const success = await updateAccount({
      username: profileUsername,
      email: profileEmail,
    })

    if (success) {
      setProfileModalOpen(false)
    }
  }

  const handleNotificationChange = async (setting, value) => {
    if (setting === "email") {
      setEmailNotifications(value)

      await updateAccount({
        email_notifications: value,
      })
    }

    if (setting === "incident") {
      setIncidentNotifications(value)

      await updateAccount({
        incident_alerts: value,
      })
    }

    if (setting === "maintenance") {
      setMaintenanceNotifications(value)

      await updateAccount({
        maintenance_notifications: value,
      })
    }
  }

  const openProfileModal = () => {
    setProfileUsername(username)
    setProfileEmail(email)
    setMessage("")
    setError("")
    setProfileModalOpen(true)
  }

  const openPasswordModal = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setMessage("")
    setError("")
    setPasswordModalOpen(true)
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()

    setMessage("")
    setError("")

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    try {
      setSaving(true)

      const response = await fetch(
        `${API_URL}/users/me/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update password"
        )
      }

      setPasswordModalOpen(false)
      setMessage("Password updated successfully.")
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    onLogout()
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-[#0c0c0f] flex flex-col">

          {/* Logo */}
          <div className="h-16 px-5 border-b border-zinc-800 flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Activity size={16} className="text-zinc-200" />
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Uptime Monitor
                </div>

                <div className="text-[11px] text-zinc-500">
                  Infrastructure
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5">

            <div className="px-2 mb-2 text-[11px] font-medium text-zinc-600">
              MONITORING
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition"
            >
              <Monitor size={17} />
              Monitors
            </button>

            <button
              onClick={() => navigate("/incidents")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition"
            >
              <Shield size={17} />
              Incidents
            </button>

            <div className="px-2 mt-7 mb-2 text-[11px] font-medium text-zinc-600">
              SYSTEM
            </div>

            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white bg-zinc-800/80 border border-zinc-700/70"
            >
              <SettingsIcon size={17} />
              Settings
            </button>
          </nav>

          {/* User / Logout */}
          <div className="border-t border-zinc-800 p-3">

            <div className="flex items-center gap-3 px-2 py-2 mb-1">
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <CircleUserRound
                  size={17}
                  className="text-zinc-400"
                />
              </div>

              <div className="min-w-0">
                <div className="text-sm text-zinc-200 truncate">
                  {loading ? "Account" : username}
                </div>

                <div className="text-[11px] text-zinc-500 truncate">
                  {loading ? "Loading..." : email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 transition"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">

          {/* Header */}
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8">
            <div>
              <h1 className="text-lg font-semibold text-white">
                Settings
              </h1>

              <p className="text-xs text-zinc-500 mt-0.5">
                Manage your account and monitoring preferences
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              System operational
            </div>
          </header>

          <div className="max-w-5xl px-8 py-8">

            {/* Messages */}
            {message && (
              <div className="mb-5 border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 rounded-md text-sm text-emerald-400">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 border border-red-900/50 bg-red-950/20 px-4 py-3 rounded-md text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Account */}
            <section className="mb-8">

              <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Account
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                  Basic information about your Uptime Monitor account.
                </p>
              </div>

              <div className="border border-zinc-800 bg-[#0c0c0f] rounded-lg divide-y divide-zinc-800">

                <button
                  onClick={openProfileModal}
                  className="w-full text-left hover:bg-zinc-900/60 transition"
                >
                  <SettingRow
                    icon={<CircleUserRound size={17} />}
                    title="Profile"
                    description="Manage your username and account information"
                    action={
                      <ChevronRight
                        size={17}
                        className="text-zinc-600"
                      />
                    }
                  />
                </button>

                <button
                  onClick={openProfileModal}
                  className="w-full text-left hover:bg-zinc-900/60 transition"
                >
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-200">
                        Email address
                      </div>

                      <div className="text-xs text-zinc-500 mt-1">
                        Used for account notifications and alerts
                      </div>
                    </div>

                    <div className="text-sm text-zinc-400">
                      {loading ? "Loading..." : email}
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* Notifications */}
            <section className="mb-8">

              <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Notifications
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                  Choose which monitoring events should notify you.
                </p>
              </div>

              <div className="border border-zinc-800 bg-[#0c0c0f] rounded-lg divide-y divide-zinc-800">

                <ToggleRow
                  icon={<Bell size={17} />}
                  title="Email notifications"
                  description="Receive monitoring notifications by email"
                  enabled={emailNotifications}
                  onChange={(value) =>
                    handleNotificationChange("email", value)
                  }
                />

                <ToggleRow
                  icon={<Shield size={17} />}
                  title="Incident alerts"
                  description="Notify me when a monitor goes down or recovers"
                  enabled={incidentNotifications}
                  onChange={(value) =>
                    handleNotificationChange("incident", value)
                  }
                />

                <ToggleRow
                  icon={<Activity size={17} />}
                  title="Maintenance notifications"
                  description="Receive notifications about scheduled maintenance"
                  enabled={maintenanceNotifications}
                  onChange={(value) =>
                    handleNotificationChange("maintenance", value)
                  }
                />
              </div>
            </section>

            {/* Monitoring */}
            <section className="mb-8">

              <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Monitoring
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                  Default behavior for your monitoring system.
                </p>
              </div>

              <div className="border border-zinc-800 bg-[#0c0c0f] rounded-lg divide-y divide-zinc-800">

                <SettingRow
                  icon={<SlidersHorizontal size={17} />}
                  title="Check engine"
                  description="Automated monitoring checks run in the background"
                  action={
                    <span className="text-xs text-emerald-400">
                      Running
                    </span>
                  }
                />

                <SettingRow
                  icon={<Activity size={17} />}
                  title="Health checks"
                  description="Monitor availability, response time, and HTTP status"
                  action={
                    <span className="text-xs text-zinc-500">
                      Automatic
                    </span>
                  }
                />

                <SettingRow
                  icon={<Monitor size={17} />}
                  title="Monitoring history"
                  description="Store check results and incident history"
                  action={
                    <span className="text-xs text-zinc-500">
                      Enabled
                    </span>
                  }
                />
              </div>
            </section>

            {/* Security */}
            <section className="mb-8">

              <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Security
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                  Manage account security settings.
                </p>
              </div>

              <div className="border border-zinc-800 bg-[#0c0c0f] rounded-lg divide-y divide-zinc-800">

                <button
                  onClick={openPasswordModal}
                  className="w-full text-left hover:bg-zinc-900/60 transition"
                >
                  <SettingRow
                    icon={<Shield size={17} />}
                    title="Authentication"
                    description="Change your account password"
                    action={
                      <ChevronRight
                        size={17}
                        className="text-zinc-600"
                      />
                    }
                  />
                </button>

                <SettingRow
                  icon={<SettingsIcon size={17} />}
                  title="API access"
                  description="API access settings can be configured as the platform expands"
                  action={
                    <span className="text-xs text-zinc-600">
                      Coming soon
                    </span>
                  }
                />
              </div>
            </section>

            {/* Account actions */}
            <section>

              <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Account actions
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                  Actions that affect your current session.
                </p>
              </div>

              <div className="border border-zinc-800 bg-[#0c0c0f] rounded-lg">

                <div className="px-5 py-5 flex items-center justify-between">

                  <div>
                    <div className="text-sm text-zinc-200">
                      Sign out
                    </div>

                    <div className="text-xs text-zinc-500 mt-1">
                      End your current Uptime Monitor session.
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-10 pt-5 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-[11px] text-zinc-600">
                Uptime Monitor
              </div>

              <div className="text-[11px] text-zinc-600">
                Settings are saved automatically
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <Modal
          title="Edit profile"
          onClose={() => setProfileModalOpen(false)}
        >
          <form onSubmit={handleProfileSave}>

            <div className="space-y-4">

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={profileUsername}
                  onChange={(e) =>
                    setProfileUsername(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-md border border-zinc-700 bg-zinc-950 text-sm text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Email address
                </label>

                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) =>
                    setProfileEmail(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-md border border-zinc-700 bg-zinc-950 text-sm text-white outline-none focus:border-zinc-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-3.5 py-2 rounded-md border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-3.5 py-2 rounded-md bg-zinc-100 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

            </div>
          </form>
        </Modal>
      )}

      {/* Password Modal */}
      {passwordModalOpen && (
        <Modal
          title="Change password"
          onClose={() => setPasswordModalOpen(false)}
        >
          <form onSubmit={handlePasswordSave}>

            <div className="space-y-4">

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Current password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-md border border-zinc-700 bg-zinc-950 text-sm text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  New password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 rounded-md border border-zinc-700 bg-zinc-950 text-sm text-white outline-none focus:border-zinc-500"
                />

                <p className="text-[11px] text-zinc-600 mt-1.5">
                  Must be at least 8 characters.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Confirm new password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-md border border-zinc-700 bg-zinc-950 text-sm text-white outline-none focus:border-zinc-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="px-3.5 py-2 rounded-md border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-3.5 py-2 rounded-md bg-zinc-100 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50 transition"
              >
                {saving ? "Updating..." : "Update password"}
              </button>

            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}


/* -------------------------------- */
/* Modal                             */
/* -------------------------------- */

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

      <div className="w-full max-w-md border border-zinc-800 bg-[#0c0c0f] rounded-lg shadow-2xl">

        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">

          <h2 className="text-sm font-semibold text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition"
          >
            <X size={17} />
          </button>

        </div>

        <div className="p-5">
          {children}
        </div>

      </div>
    </div>
  )
}


/* -------------------------------- */
/* Setting Row                       */
/* -------------------------------- */

function SettingRow({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-6">

      <div className="flex items-center gap-3 min-w-0">

        <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-sm text-zinc-200">
            {title}
          </div>

          <div className="text-xs text-zinc-500 mt-1">
            {description}
          </div>
        </div>

      </div>

      <div className="flex-shrink-0">
        {action}
      </div>

    </div>
  )
}


/* -------------------------------- */
/* Toggle                            */
/* -------------------------------- */

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-6">

      <div className="flex items-center gap-3">

        <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
          {icon}
        </div>

        <div>
          <div className="text-sm text-zinc-200">
            {title}
          </div>

          <div className="text-xs text-zinc-500 mt-1">
            {description}
          </div>
        </div>

      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative w-10 h-5 rounded-full border transition ${
          enabled
            ? "bg-zinc-600 border-zinc-500"
            : "bg-zinc-900 border-zinc-700"
        }`}
        aria-label={`Toggle ${title}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>

    </div>
  )
}

export default Settings

