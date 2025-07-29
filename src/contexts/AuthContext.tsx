import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize mock users in localStorage if not exists
const initializeMockUsers = () => {
  const savedUsers = localStorage.getItem('mockUsers');
  if (!savedUsers) {
    const defaultUsers: (User & { password: string })[] = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'IT Administrator'
      },
      {
        id: '2',
        username: 'john.doe',
        password: 'user123',
        role: 'user',
        name: 'John Doe'
      },
      {
        id: '3',
        username: 'jane.smith',
        password: 'user123',
        role: 'user',
        name: 'Jane Smith'
      }
    ];
    localStorage.setItem('mockUsers', JSON.stringify(defaultUsers));
  }
};

const getMockUsers = (): (User & { password: string })[] => {
  const savedUsers = localStorage.getItem('mockUsers');
  return savedUsers ? JSON.parse(savedUsers) : [];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    initializeMockUsers();
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers = getMockUsers();
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name
      };
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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