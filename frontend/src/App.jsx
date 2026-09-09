import { useState } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import Login from "./Login"
import Monitor from "./Monitor"
import Incidents from "./Incidents"

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  )

  const handleLogin = (accessToken) => {
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    setToken(null)
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Monitor onLogout={handleLogout} />
          }
        />

        <Route
          path="/incidents"
          element={
            <Incidents onLogout={handleLogout} />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

