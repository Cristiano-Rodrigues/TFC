'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  active: boolean;
  permissions: string[];
  company_id?: string;
  companyName?: string;
  role_id?: string;
  department_id?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; profile?: UserProfile }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      if (res.ok && data.user) {
        const activeRole = data.user.role as 'admin' | 'manager' | 'user' || 'user';
        const dynamicPermissions = Array.isArray(data.user.permissions) ? data.user.permissions : [];

        const loadedProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name || data.user.email?.split('@')[0] || "Colaborador",
          role: activeRole,
          department: data.user.department || "Geral",
          active: data.user.active !== false,
          permissions: dynamicPermissions,
          company_id: data.user.company_id,
          companyName: data.user.companyName,
          role_id: data.user.role_id,
          department_id: data.user.department_id
        };
        
        setUser(data.user);
        setProfile(loadedProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || "Email ou palavra-passe incorretos" };
      }

      await refreshSession();
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Email ou palavra-passe incorretos" };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
