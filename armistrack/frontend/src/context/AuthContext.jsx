import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on first mount
  useEffect(() => {
    const token     = localStorage.getItem("armistrack_token");
    const savedUser = localStorage.getItem("armistrack_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("armistrack_user");
        localStorage.removeItem("armistrack_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await apiLogin(username, password);
    localStorage.setItem("armistrack_token", data.token);
    localStorage.setItem("armistrack_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("armistrack_token");
    localStorage.removeItem("armistrack_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);