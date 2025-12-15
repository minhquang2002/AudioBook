import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User as ApiUser } from '@/lib/api';

interface UserData {
  username: string;
  fullname: string;
  email: string;
  phonenumber: string;
  role: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    password: string;
    fullname: string;
    email: string;
    phonenumber: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const role = await authApi.login(username, password);
      const userData = await authApi.getUser(username);
      
      const user: UserData = {
        ...userData,
        role,
      };

      setUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: {
    username: string;
    password: string;
    fullname: string;
    email: string;
    phonenumber: string;
  }) => {
    try {
      await authApi.register(data);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userData');
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const userData = await authApi.getUser(user.username);
        const updatedUser: UserData = {
          ...userData,
          role: user.role,
        };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to refresh profile:', error);
      }
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile,
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
