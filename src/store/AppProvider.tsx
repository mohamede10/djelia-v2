import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
};

type AppContextType = {
  user: User | null;
  isLoading: boolean;
  favorites: string[];
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (storyId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Simulate checking for token on app start
    const checkUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // In a real app, validate token with backend
          setUser({ id: '1', name: 'Amadou', email: 'amadou@example.com' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({ id: '1', name: 'Amadou', email });
      
      try {
        await SecureStore.setItemAsync('userToken', 'dummy-auth-token');
      } catch (e) {
        console.warn('SecureStore is not available on this platform, skipping token persistence.');
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      try {
        await SecureStore.deleteItemAsync('userToken');
      } catch (e) {
        // Ignore secure store errors on platforms where it's unavailable
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (storyId: string) => {
    setFavorites((prev) => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  return (
    <AppContext.Provider value={{ user, isLoading, favorites, login, logout, toggleFavorite }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
