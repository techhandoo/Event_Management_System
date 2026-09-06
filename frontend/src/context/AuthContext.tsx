import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import api from '../services/api';
import { User } from '../types';

/** Return the default landing page for a given role. */
export function homeForRole(role?: string): string {
 switch (role) {
  case 'ADMIN': return '/admin';
  case 'ORGANIZER': return '/organizer';
  default: return '/dashboard';
 }
}

interface AuthContextType {
 user: User | null;
 isAuthenticated: boolean;
 isLoading: boolean;
 login: (email: string, password: string) => Promise<User | null>;
 register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
 logout: () => void;
 homeForRole: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  // On mount: check if we have a stored user (cookies handle tokens)
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
   try {
    setUser(JSON.parse(storedUser));
   } catch {
    localStorage.removeItem('user');
   }
  }
  setIsLoading(false);
 }, []);

 const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const userData: User = response.data.data;
  // Only store user info — tokens are in httpOnly cookies
  localStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
  return userData;
 };

 const register = async (email: string, password: string, fullName: string, role?: string) => {
  const response = await api.post('/auth/register', { email, password, fullName, role: role || 'ATTENDEE' });
  const userData: User = response.data.data;
  localStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
 };

 const logout = async () => {
  // Backend clears httpOnly cookies on /auth/logout
  // Use raw axios to avoid interceptor refresh loop
  try {
   await axios.post('https://eventry-api.onrender.com/api/auth/logout', null, {
    withCredentials: true,
   });
  } catch {
   // Logout should succeed even if server call fails
  }
  localStorage.removeItem('user');
  setUser(null);
 };

 return (
  <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, homeForRole }}>
   {children}
  </AuthContext.Provider>
 );
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) throw new Error('useAuth must be used within an AuthProvider');
 return context;
}
