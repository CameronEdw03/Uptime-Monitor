import { useState } from "react"
import Login from "./Login"
import Monitor from "./Monitor"

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

  return <Monitor onLogout={handleLogout} />
}

export default App