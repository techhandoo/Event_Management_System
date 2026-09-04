import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, AuthResponse } from '../types';

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
  const token = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');
  if (token && storedUser) {
   setUser(JSON.parse(storedUser));
  }
  setIsLoading(false);
 }, []);

 const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const data: AuthResponse = response.data.data;
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  setUser(data.user);
  return data.user; // return user so caller can use the role
 };

 const register = async (email: string, password: string, fullName: string, role?: string) => {
  const response = await api.post('/auth/register', { email, password, fullName, role: role || 'ATTENDEE' });
  const data: AuthResponse = response.data.data;
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  setUser(data.user);
 };

 const logout = async () => {
  // Revoke refresh token on server before clearing local state
  const refreshToken = localStorage.getItem('refreshToken');
  try {
   await api.post('/auth/logout', null, {
    headers: refreshToken ? { 'Refresh-Token': refreshToken } : {},
   });
  } catch {
   // Logout should succeed even if server call fails
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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
