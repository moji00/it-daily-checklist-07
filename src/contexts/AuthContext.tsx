import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface CustomUser {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'user';
  sessionToken: string;
  expiresAt: Date;
  // Add email for backward compatibility
  email?: string;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}

interface AuthContextType {
  user: CustomUser | null;
  profile: Profile | null;
  session: Session | null;
  signInWithUsername: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('checklistUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.expiresAt && new Date(userData.expiresAt) > new Date()) {
          setUser(userData);
        } else {
          localStorage.removeItem('checklistUser');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('checklistUser');
      }
    }
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('authenticate-user', {
        body: { username, password }
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message || 'Authentication failed' };
      }

      if (data.error) {
        setIsLoading(false);
        return { error: data.error };
      }

      if (data.success && data.user) {
        const userData = {
          ...data.user,
          expiresAt: new Date(data.user.expiresAt)
        };
        setUser(userData);
        localStorage.setItem('checklistUser', JSON.stringify(userData));
        setIsLoading(false);
        return { error: null };
      }

      setIsLoading(false);
      return { error: 'Invalid response from server' };
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      return { error: 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('checklistUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      signInWithUsername,
      signOut,
      isLoading
    }}>
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