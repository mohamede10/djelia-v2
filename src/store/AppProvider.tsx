import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { 
  UserProfile, 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetUserPassword, 
  updateUserProfileData,
  fetchUserProfile,
} from '../services/authService';
import { 
  fetchUserFavorites, 
  toggleFavoriteRecord, 
  seedInitialStoriesToFirestore 
} from '../services/dataService';
import { clearLocalUser, readLocalUser, writeLocalUser } from '../services/storageService';

type AppContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  favorites: string[];
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleFavorite: (storyId: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Si Firebase est configuré, écouter les changements d'état d'authentification
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          if (fbUser) {
            const storedProfile = await fetchUserProfile(fbUser.uid);
            const profile: UserProfile = storedProfile || {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Initié Djelia',
              email: fbUser.email || '',
              photoUrl: fbUser.photoURL || undefined,
              preferredLanguages: ['Mandingue', 'Pular', 'Soussou'],
              role: 'user',
            };
            setUser(profile);

            // Charger les favoris depuis Firestore
            const favs = await fetchUserFavorites(fbUser.uid);
            setFavorites(favs);
          } else {
            setUser(null);
            setFavorites([]);
          }
        } catch (error) {
          console.error("Auth state handling error:", error);
        } finally {
          setIsLoading(false);
        }
      });

      // Tenter une synchronisation initiale des récits si nécessaire
      seedInitialStoriesToFirestore().catch(() => {});

      return () => unsubscribe();
    } else {
      // Mode hors-ligne / développement local : on restaure la session de démo
      // (profil + favoris) pour ne pas repartir de zéro à chaque lancement.
      let cancelled = false;
      const restoreDemoSession = async () => {
        try {
          const stored = await readLocalUser();
          if (cancelled) return;
          if (stored) {
            setUser(stored);
            const favs = await fetchUserFavorites(stored.id);
            if (!cancelled) setFavorites(favs);
          }
        } catch (e) {
          console.warn('Demo session restore error:', e);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      restoreDemoSession();

      return () => {
        cancelled = true;
      };
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const profile = await loginUser(email, pass);
      setUser(profile);
      if (!isFirebaseConfigured) {
        await writeLocalUser(profile);
      }
      if (profile.id) {
        const favs = await fetchUserFavorites(profile.id);
        setFavorites(favs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const profile = await registerUser(name, email, pass);
      setUser(profile);
      if (!isFirebaseConfigured) {
        await writeLocalUser(profile);
      }
      setFavorites(await fetchUserFavorites(profile.id));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      if (!isFirebaseConfigured) {
        await clearLocalUser();
      }
      setUser(null);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await resetUserPassword(email);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfileData(user.id, data);
    const nextUser = { ...user, ...data };
    setUser(nextUser);
    // En mode démo, on persiste aussi le profil pour qu'il survive au rechargement.
    if (!isFirebaseConfigured) {
      await writeLocalUser(nextUser);
    }
  };

  const toggleFavorite = async (storyId: string) => {
    const userId = user?.id || 'local_user';
    const updated = await toggleFavoriteRecord(userId, storyId, favorites);
    setFavorites(updated);
  };

  return (
    <AppContext.Provider 
      value={{ 
        user, 
        isLoading, 
        favorites, 
        login, 
        signup, 
        logout, 
        resetPassword, 
        updateProfile, 
        toggleFavorite 
      }}
    >
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
