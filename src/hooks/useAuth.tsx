import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI, setToken, removeToken, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and fetch user
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const loginWithOTP = async (phone: string, otp: string) => {
    const response = await authAPI.verifyLoginOTP({ phone, otp });
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithOTP,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
