'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  active: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; profile?: UserProfile }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data: storedUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && storedUser) {
        const permissionsMap: Record<'admin' | 'manager' | 'user', string[]> = {
          admin: ["doc:view", "doc:upload", "doc:delete", "doc:manage_perms", "wiki:view", "wiki:generate", "integrations:manage", "users:manage"],
          manager: ["doc:view", "doc:upload", "wiki:view", "wiki:generate", "integrations:manage"],
          user: ["doc:view", "wiki:view"]
        };

        const activeRole = storedUser.role as 'admin' | 'manager' | 'user' || 'user';

        const loadedProfile: UserProfile = {
          id: userId,
          email: email,
          fullName: storedUser.full_name || storedUser.email?.split('@')[0] || "Colaborador",
          role: activeRole,
          department: storedUser.department || "Geral",
          active: storedUser.active !== false,
          permissions: permissionsMap[activeRole] || ["doc:view"]
        };
        
        setProfile(loadedProfile);
      } else {
        // Fallback for new users that might not have a profile generated yet
        const defaultProfile: UserProfile = {
          id: userId,
          email: email,
          fullName: email.split('@')[0],
          role: 'user',
          department: 'Suporte',
          active: true,
          permissions: ["doc:view", "wiki:view"]
        };
        setProfile(defaultProfile);
      }
    } catch (e) {
      console.warn("Database profiles query error:", e);
    }
  };

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn("Supabase Auth not available", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email || '');
        // Profile will be available via state, but we return early
        return { error: null };
      }
      return { error: "Sem utilizador retornado" };
    } catch (err: any) {
      console.error("Autenticação falhou:", err);
      return { error: err.message || "Email ou palavra-passe incorretos" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("SignOut Supabase failed:", e);
    }
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
        signOut
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
