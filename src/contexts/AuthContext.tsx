import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomUser {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('authenticate-user', {
        body: { username, password }
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      if (data.error) {
        setIsLoading(false);
        return { error: { message: data.error } };
      }

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setIsLoading(false);
        return { error: null };
      }

      setIsLoading(false);
      return { error: { message: 'Authentication failed' } };
    } catch (error) {
      setIsLoading(false);
      return { error: { message: 'Network error. Please try again.' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
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