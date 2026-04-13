import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfiguredSafe } from '../firebase';
import { UserProfile } from '../types';
import { LANGUAGE_STORAGE_KEY, PENDING_NAME_STORAGE_KEY } from '../lib/i18n';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  permissionError: boolean;
  setDemoMode: (val: boolean) => void;
  refreshProfile: () => Promise<void>;
  saveWorkout: (workout: any) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DAY_MS = 24 * 60 * 60 * 1000;
const getDayKey = (date: Date) => date.toLocaleDateString('en-CA');
const getStoredLanguage = (): 'en' | 'ta' => {
  if (typeof window === 'undefined') return 'en';
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'ta' ? 'ta' : 'en';
};
const getPendingName = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(PENDING_NAME_STORAGE_KEY) || '';
};
const clearPendingName = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_NAME_STORAGE_KEY);
};
const getFallbackNameFromEmail = (email?: string | null) => {
  if (!email) return 'User';
  const localPart = email.split('@')[0]?.trim();
  return localPart || 'User';
};
const getPreferredAccountName = (authUser?: User | null, storedName?: string | null) => {
  const authName = authUser?.displayName?.trim();
  if (authName) return authName;

  const pendingName = getPendingName().trim();
  if (pendingName) return pendingName;

  const cleanStoredName = storedName?.trim();
  if (cleanStoredName && cleanStoredName.toLowerCase() !== 'user') return cleanStoredName;

  return getFallbackNameFromEmail(authUser?.email);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const fetchProfile = async (uid: string) => {
    if (isDemoMode) {
      const todayKey = getDayKey(new Date());
      setProfile({
        uid: 'demo-user',
        name: 'Demo YOGSHALA',
        email: 'demo@pranaflow.ai',
        language: getStoredLanguage(),
        YOGSHALALevel: 'Intermediate',
        fitnessGoal: 'Flexibility',
        dailyStreak: 5,
        completedSessions: 12,
        totalMeditationTime: 45,
        caloriesBurned: 1250,
        dailyYOGSHALAGoal: 30,
        todayYOGSHALATime: 15,
        lastActive: todayKey,
        journeyStartAt: Date.now() - (DAY_MS * 5),
      });
      return;
    }
    if (!db) return;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const existingProfile = docSnap.data() as UserProfile;
        const preferredName = getPreferredAccountName(user, existingProfile.name);
        const nextProfile =
          existingProfile.name !== preferredName
            ? { ...existingProfile, name: preferredName }
            : existingProfile;

        if (existingProfile.name !== preferredName) {
          try {
            await setDoc(docRef, { name: preferredName }, { merge: true });
          } catch (e) {
            console.warn('Could not sync profile name to account name.', e);
          }
        }

        setProfile(nextProfile);
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile: UserProfile = {
          uid,
          name: getPreferredAccountName(user),
          email: user?.email || '',
          language: getStoredLanguage(),
          YOGSHALALevel: 'Beginner',
          fitnessGoal: 'Flexibility',
          dailyStreak: 0,
          completedSessions: 0,
          totalMeditationTime: 0,
          caloriesBurned: 0,
          dailyYOGSHALAGoal: 30,
          todayYOGSHALATime: 0,
          journeyStartAt: Date.now() + DAY_MS,
        };
        try {
          await setDoc(docRef, defaultProfile);
          clearPendingName();
        } catch (e) {
          console.warn("Could not save initial profile to Firestore, using local state.");
        }
        setProfile(defaultProfile);
      }
      setPermissionError(false);
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setPermissionError(true);
        // Fallback to a local profile
        setProfile({
          uid,
          name: getPreferredAccountName(user),
          email: user?.email || '',
          language: getStoredLanguage(),
          YOGSHALALevel: 'Beginner',
          fitnessGoal: 'Flexibility',
          dailyStreak: 0,
          completedSessions: 0,
          totalMeditationTime: 0,
          caloriesBurned: 0,
          dailyYOGSHALAGoal: 30,
          todayYOGSHALATime: 0,
          journeyStartAt: Date.now() + DAY_MS,
        });
      } else {
        console.error("Firestore Error:", err);
      }
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (isDemoMode) {
      setProfile(prev => prev ? { ...prev, ...data } : null);
      return;
    }
    if (!db || !user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, data, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null); // Optimistic update
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setPermissionError(true);
        setProfile(prev => prev ? { ...prev, ...data } : null);
      } else {
        console.error("Update Profile Error:", err);
      }
    }
  };

  const saveWorkout = async (workout: any) => {
    if (isDemoMode || !db || !user) {
      return;
    }

    try {
      const historyRef = doc(db, 'history', `${user.uid}_${Date.now()}`);
      await setDoc(historyRef, {
        ...workout,
        userId: user.uid,
        timestamp: Date.now(),
      });
      
      // Update profile stats
      const profileRef = doc(db, 'users', user.uid);
      const calories = typeof workout.calories === 'string' 
        ? parseInt(workout.calories.replace(/[^0-9]/g, '')) || 0
        : workout.calories || 0;
      
      const durationMatch = workout.duration.match(/(\d+)m/);
      const minutes = durationMatch ? parseInt(durationMatch[1]) : 0;

      const now = new Date();
      const todayKey = getDayKey(now);
      const yesterdayKey = getDayKey(new Date(now.getTime() - DAY_MS));
      const previousLastActive = profile?.lastActive;
      const previousStreak = profile?.dailyStreak || 0;
      const isSameDay = previousLastActive === todayKey;
      const isYesterday = previousLastActive === yesterdayKey;
      const nextStreak = isSameDay ? previousStreak : isYesterday ? Math.max(1, previousStreak + 1) : 1;
      const baseTodayMinutes = isSameDay ? (profile?.todayYOGSHALATime || 0) : 0;
      const updatedTodayMinutes = baseTodayMinutes + minutes;

      await setDoc(profileRef, {
        ...profile,
        completedSessions: (profile?.completedSessions || 0) + 1,
        caloriesBurned: (profile?.caloriesBurned || 0) + calories,
        todayYOGSHALATime: updatedTodayMinutes,
        dailyStreak: nextStreak,
        lastActive: todayKey,
        journeyStartAt: profile?.journeyStartAt ?? Date.now(),
      }, { merge: true });
      
      await fetchProfile(user.uid);
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setPermissionError(true);
        console.warn("Permission denied: Workout saved to local session only.");
      } else {
        console.error("Save Workout Error:", err);
      }
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      setUser({ uid: 'demo-user', email: 'demo@pranaflow.ai', displayName: 'Demo YOGSHALA' } as any);
      fetchProfile('demo-user');
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
        clearPendingName();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isConfigured: isFirebaseConfiguredSafe, 
      isDemoMode,
      permissionError,
      setDemoMode: setIsDemoMode,
      refreshProfile,
      saveWorkout,
      updateProfile
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
