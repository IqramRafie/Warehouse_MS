import { createContext, useState} from 'react';
import api from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(null);

    const login = async (username, password) => {
        console.log("Attempting login for:", username);
        try {
            const res = await api.post("auth/token/", {username, password});
            console.log("Login response:", res.data);
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            setUser({username});
            console.log("Login successful, user set");
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    }

    return (
      <AuthContext.Provider value={{user, login, logout}}>
        {children}
      </AuthContext.Provider>
    );

}