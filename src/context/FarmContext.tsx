import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Advisory, DiseaseScan, Farm, FarmerProfile, Language, WeatherData } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../i18n/translations';
import {
  subscribeToAuth,
  signInWithGoogle,
  signOutFarmer,
  getOrCreateUserProfile,
  saveUserFarm,
  getUserAdvisories,
  saveUserAdvisory,
  updateUserAdvisoryStatus,
  deleteUserAdvisory,
  getUserScans,
  saveUserScan,
} from '../services/firebase';

export type NavigationTab = 'landing' | 'home' | 'ai_saathi' | 'scanner' | 'satellite' | 'intelligence' | 'advisories' | 'profile' | 'signin';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FarmContextType {
  profile: FarmerProfile | null;
  farm: Farm | null;
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isDemoSession: boolean;
  signInWithGoogleAuth: () => Promise<void>;
  signOutAuth: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  advisories: Advisory[];
  scans: DiseaseScan[];
  weather: WeatherData | null;
  isLoading: boolean;
  toasts: Toast[];
  t: (key: any) => string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  saveAdvisory: (advisory: Partial<Advisory>) => Promise<void>;
  toggleAdvisoryStatus: (id: string) => Promise<void>;
  deleteAdvisory: (id: string) => Promise<void>;
  addScanResult: (scan: Partial<DiseaseScan>) => Promise<void>;
  updateFarmData: (updates: Partial<Farm> & { farmer_name?: string }) => Promise<void>;
  loginDemoUser: () => Promise<void>;
  logoutUser: () => void;
  presetAiQuery: string | null;
  setPresetAiQuery: (query: string | null) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  isOnline: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [isDemoSession, setIsDemoSession] = useState<boolean>(() => {
    return localStorage.getItem('krishisaathi_demo_session') === 'true';
  });
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    const hasEntered = localStorage.getItem('krishisaathi_entered') === 'true';
    return hasEntered ? 'home' : 'landing';
  });
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [scans, setScans] = useState<DiseaseScan[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [presetAiQuery, setPresetAiQuery] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const isAuthenticated = Boolean(firebaseUser || isDemoSession);

  const t = (key: any) => getTranslation(language, key);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('krishisaathi_lang', lang);
  };

  // Online/Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Internet connection restored', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are currently offline. Local cache enabled.', 'info');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to Firebase Auth and sync with Firestore
  useEffect(() => {
    const savedLang = localStorage.getItem('krishisaathi_lang') as Language;
    if (savedLang) setLanguageState(savedLang);

    setIsAuthLoading(true);

    const unsubscribe = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      setIsLoading(true);

      if (user) {
        localStorage.setItem('krishisaathi_entered', 'true');
        setActiveTab((prev) => (prev === 'landing' || prev === 'signin' ? 'home' : prev));
        try {
          // User is authenticated with Google/Firebase
          const userFarmData = await getOrCreateUserProfile(user);
          setProfile(userFarmData.profile);
          setFarm(userFarmData.farm);

          // Fetch user's persistent records from Firestore
          const [userAdvisories, userScans, weatherRes] = await Promise.all([
            getUserAdvisories(user.uid).catch(() => []),
            getUserScans(user.uid).catch(() => []),
            api.getWeather(userFarmData.farm.district || 'Indore').catch(() => null),
          ]);

          setAdvisories(userAdvisories);
          setScans(userScans);
          if (weatherRes) setWeather(weatherRes);
          showToast(
            `${t('google_connected')}: ${user.displayName || user.email}`,
            'success'
          );
        } catch (error) {
          console.error('Error synchronizing with Firestore:', error);
          showToast('Failed to sync profile from cloud', 'error');
        } finally {
          setIsLoading(false);
          setIsAuthLoading(false);
        }
      } else {
        // Fallback to local / cached profile for immediate preview
        try {
          const [profileRes, advisoriesRes, scansRes, weatherRes] = await Promise.all([
            api.getProfile().catch(() => api.loginDemo()),
            api.getAdvisories().catch(() => []),
            api.getScans().catch(() => []),
            api.getWeather('Indore').catch(() => null),
          ]);

          if (profileRes) {
            setProfile(profileRes.profile);
            setFarm(profileRes.farm);
          }
          setAdvisories(advisoriesRes);
          setScans(scansRes);
          if (weatherRes) setWeather(weatherRes);
        } catch (err) {
          console.error('Failed initialization, falling back to local state', err);
          const demoData = await api.loginDemo();
          setProfile(demoData.profile);
          setFarm(demoData.farm);
        } finally {
          setIsLoading(false);
          setIsAuthLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogleAuth = async () => {
    try {
      showToast(t('signing_in'), 'info');
      await signInWithGoogle();
      // subscribeToAuth will handle updating the state and loading user Firestore data
    } catch (error: any) {
      console.error('Google Sign In error', error);
      showToast(error.message || 'Google Sign In failed', 'error');
    }
  };

  const signOutAuth = async () => {
    try {
      await signOutFarmer();
      showToast(t('logout'), 'info');
      localStorage.removeItem('krishisaathi_entered');
      localStorage.removeItem('krishisaathi_demo_session');
      setIsDemoSession(false);
      setFirebaseUser(null);
      const demoData = await api.loginDemo();
      setProfile(demoData.profile);
      setFarm(demoData.farm);
      setActiveTab('landing');
    } catch (error: any) {
      showToast('Error signing out', 'error');
    }
  };

  const saveAdvisory = async (newAdvisory: Partial<Advisory>) => {
    const tempId = 'adv-' + Date.now().toString(36);
    const optimistic: Advisory = {
      id: tempId,
      user_id: firebaseUser ? firebaseUser.uid : (profile?.id || 'farmer'),
      farm_id: farm?.id || 'farm-local',
      title: newAdvisory.title || 'Crop Advisory',
      title_hi: newAdvisory.title_hi,
      query: newAdvisory.query || '',
      category: newAdvisory.category || 'crop',
      summary: newAdvisory.summary || '',
      summary_hi: newAdvisory.summary_hi,
      possible_causes: newAdvisory.possible_causes || [],
      things_to_check: newAdvisory.things_to_check || [],
      immediate_action: newAdvisory.immediate_action || [],
      weather_consideration: newAdvisory.weather_consideration || '',
      prevention: newAdvisory.prevention || [],
      when_to_seek_help: newAdvisory.when_to_seek_help || '',
      confidence: newAdvisory.confidence || 0.9,
      reasoning: newAdvisory.reasoning || '',
      status: 'active',
      created_at: new Date().toISOString(),
      is_saved: true,
    };

    // Optimistic UI update
    setAdvisories((prev) => [optimistic, ...prev]);
    showToast(t('advisory_saved'), 'success');

    if (firebaseUser) {
      try {
        await saveUserAdvisory(optimistic);
      } catch (err) {
        console.warn('Saved in offline session / fallback to local API', err);
        await api.saveAdvisory(newAdvisory).catch(() => {});
      }
    } else {
      try {
        const persisted = await api.saveAdvisory(newAdvisory);
        setAdvisories((prev) => prev.map((a) => (a.id === tempId ? persisted : a)));
      } catch (e) {
        console.warn('Saved in local cache');
      }
    }
  };

  const toggleAdvisoryStatus = async (id: string) => {
    const target = advisories.find((a) => a.id === id);
    if (!target) return;
    const newStatus = target.status === 'completed' ? 'active' : 'completed';

    // Optimistic
    setAdvisories((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    if (firebaseUser) {
      try {
        await updateUserAdvisoryStatus(id, newStatus);
        showToast(newStatus === 'completed' ? 'Advisory marked as resolved' : 'Advisory reactivated', 'success');
      } catch (e) {
        showToast('Status updated in local session', 'info');
      }
    } else {
      try {
        await api.updateAdvisory(id, { status: newStatus });
        showToast(newStatus === 'completed' ? 'Advisory marked as resolved' : 'Advisory reactivated', 'success');
      } catch (e) {
        showToast('Status updated locally', 'info');
      }
    }
  };

  const deleteAdvisory = async (id: string) => {
    const previous = [...advisories];
    setAdvisories((prev) => prev.filter((a) => a.id !== id));
    showToast('Advisory removed from farm records', 'info');

    if (firebaseUser) {
      try {
        await deleteUserAdvisory(id);
      } catch (e) {
        setAdvisories(previous);
        showToast('Failed to delete advisory', 'error');
      }
    } else {
      try {
        await api.deleteAdvisory(id);
      } catch (e) {
        setAdvisories(previous);
        showToast('Failed to delete advisory', 'error');
      }
    }
  };

  const addScanResult = async (scanData: Partial<DiseaseScan>) => {
    const tempId = 'scan-' + Date.now().toString(36);
    const optimistic: DiseaseScan = {
      id: tempId,
      user_id: firebaseUser ? firebaseUser.uid : (profile?.id || 'farmer'),
      farm_id: farm?.id || 'farm-local',
      image_url: scanData.image_url || '',
      crop_name: scanData.crop_name || farm?.crop_name || 'Crop',
      possible_issue: scanData.possible_issue || 'Tissue Analysis',
      possible_issue_hi: scanData.possible_issue_hi,
      confidence: scanData.confidence || 0.9,
      severity: scanData.severity || 'medium',
      symptoms_detected: scanData.symptoms_detected || [],
      immediate_action: scanData.immediate_action || [],
      prevention: scanData.prevention || [],
      when_to_seek_help: scanData.when_to_seek_help || '',
      image_quality: scanData.image_quality || 'good',
      disclaimer: scanData.disclaimer || '',
      created_at: new Date().toISOString(),
    };

    setScans((prev) => [optimistic, ...prev]);
    showToast(t('scan_saved'), 'success');

    if (firebaseUser) {
      try {
        await saveUserScan(optimistic);
      } catch (err) {
        console.warn('Saved in offline session / fallback to local API', err);
        await api.saveScan(scanData).catch(() => {});
      }
    } else {
      try {
        const persisted = await api.saveScan(scanData);
        setScans((prev) => prev.map((s) => (s.id === tempId ? persisted : s)));
      } catch (e) {
        console.warn('Scan saved to client memory');
      }
    }
  };

  const updateFarmData = async (updates: Partial<Farm> & { farmer_name?: string }) => {
    if (!farm) return;
    const optimisticFarm = { ...farm, ...updates };
    setFarm(optimisticFarm);
    if (updates.farmer_name && profile) {
      setProfile({ ...profile, name: updates.farmer_name });
    }
    showToast('Farm parameters updated', 'success');

    if (firebaseUser) {
      try {
        await saveUserFarm(optimisticFarm);
      } catch (e) {
        console.error('Failed to sync updated farm to Firestore:', e);
      }
    }

    try {
      const res = await api.updateFarm(updates);
      if (!firebaseUser) {
        setFarm(res.farm);
        setProfile(res.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loginDemoUser = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('krishisaathi_entered', 'true');
      localStorage.setItem('krishisaathi_demo_session', 'true');
      setIsDemoSession(true);
      const data = await api.loginDemo();
      setProfile(data.profile);
      setFarm(data.farm);
      const advs = await api.getAdvisories();
      const scns = await api.getScans();
      setAdvisories(advs);
      setScans(scns);
      setActiveTab('home');
      showToast('Entered in Demo Farmer Mode', 'success');
    } catch (e) {
      showToast('Error loading farm profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    signOutAuth();
  };

  return (
    <FarmContext.Provider
      value={{
        profile,
        farm,
        firebaseUser,
        isAuthLoading,
        isAuthenticated,
        isDemoSession,
        signInWithGoogleAuth,
        signOutAuth,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        advisories,
        scans,
        weather,
        isLoading,
        toasts,
        t,
        showToast,
        saveAdvisory,
        toggleAdvisoryStatus,
        deleteAdvisory,
        addScanResult,
        updateFarmData,
        loginDemoUser,
        logoutUser,
        presetAiQuery,
        setPresetAiQuery,
        showOnboarding,
        setShowOnboarding,
        isOnline,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
};
