import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    //load user from localStorage on initial load
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  })

  //save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  //login function
  const login = (userData) => {
    setUser(userData)
    navigate("/dashboard") // redirect after login
  }

  //logout function
  const logout = () => {
    setUser(null)
    navigate("/login") // redirect after logout
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  )
}

//custom hook to use context
export const useAuth = () => useContext(AuthContext)