import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Edit2, Shield, ChevronRight, Target, Award, X, Trophy, Star, Volume2, Languages } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import PermissionWarning from './PermissionWarning';
import { playVoicePreview } from '../lib/ttsSupport';

const Profile: React.FC = () => {
  const { profile, permissionError, updateProfile, isDemoMode, setDemoMode } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editGoal, setEditGoal] = useState(profile?.fitnessGoal || 'Flexibility');
  const [editLevel, setEditLevel] = useState(profile?.YOGSHALALevel || 'Beginner');
  const [editDailyGoal, setEditDailyGoal] = useState(profile?.dailyYOGSHALAGoal || 30);
  const [editLanguage, setEditLanguage] = useState(profile?.language || language);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditGoal(profile.fitnessGoal);
      setEditLevel(profile.YOGSHALALevel);
      setEditDailyGoal(profile.dailyYOGSHALAGoal);
      setEditLanguage(profile.language || language);
    }
  }, [language, profile]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: editName,
        fitnessGoal: editGoal as any,
        YOGSHALALevel: editLevel as any,
        dailyYOGSHALAGoal: Number(editDailyGoal),
        language: editLanguage as any,
      });
      await setLanguage(editLanguage as 'en' | 'ta');
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const loadReminderSettings = () => {
    if (typeof window === 'undefined') {
      return { enabled: false, selectedTime: '06:00', times: [] as string[] };
    }

    try {
      const saved = window.localStorage.getItem('YOGSHALA_REMINDER_SETTINGS');
      if (!saved) return { enabled: false, selectedTime: '06:00', times: [] as string[] };
      const parsed = JSON.parse(saved) as { enabled?: boolean; selectedTime?: string; times?: string[] };

      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
        selectedTime: typeof parsed.selectedTime === 'string' && parsed.selectedTime.length === 5 ? parsed.selectedTime : '06:00',
        times: Array.isArray(parsed.times)
        ? Array.from(new Set(parsed.times.filter((t) => typeof t === 'string' && t.length === 5))).sort()
        : [],
      };
    } catch (error) {
      console.warn('Failed to load reminder settings', error);
      return { enabled: false, selectedTime: '06:00', times: [] as string[] };
    }
  };

  const reminderSettings = loadReminderSettings();
  const reminderPresetTimes = ['06:00', '07:30', '12:00', '18:00', '20:00'];

  const formatTimeTo12Hour = (time: string) => {
    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);
    const minute = minuteText.padStart(2, '0');
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12.toString().padStart(2, '0')}:${minute} ${suffix}`;
  };

  const parseTimeFrom12Hour = (hour12: number, minute: string, period: 'AM' | 'PM') => {
    const baseHour = hour12 % 12;
    const hour24 = period === 'PM' ? baseHour + 12 : baseHour;
    return `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const [showReminders, setShowReminders] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(reminderSettings.enabled);
  const [reminderTime, setReminderTime] = useState(reminderSettings.selectedTime);
  const [reminderTimes, setReminderTimes] = useState<string[]>(reminderSettings.times);
  const [reminderStatus, setReminderStatus] = useState('');
  const reminderTimeoutIds = useRef<number[]>([]);
  const [flexibilityScore, setFlexibilityScore] = useState<{ level: string; value: number } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [isVoicePreviewRunning, setIsVoicePreviewRunning] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'YOGSHALA_REMINDER_SETTINGS',
      JSON.stringify({ enabled: reminderEnabled, selectedTime: reminderTime, times: reminderTimes })
    );
  }, [reminderEnabled, reminderTime, reminderTimes]);

  const wellnessMetrics = useMemo(() => {
    const dailyStreak = profile?.dailyStreak || 0;
    const completedSessions = profile?.completedSessions || 0;
    const todayKey = new Date().toLocaleDateString('en-CA');
    const todayMinutes = profile?.lastActive === todayKey ? (profile?.todayYOGSHALATime || 0) : 0;
    const dailyGoal = profile?.dailyYOGSHALAGoal || 30;

    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    const goalRatio = dailyGoal > 0 ? Math.min(1, todayMinutes / dailyGoal) : 0;
    const sessionBonus = Math.min(completedSessions, 30) * 2;
    const streakBonus = Math.min(dailyStreak, 30) * 1.5;
    const usageScore = clamp(Math.round(todayMinutes * 3 + sessionBonus + streakBonus));
    const consistency = clamp(Math.round(20 + (dailyStreak * 6) + (completedSessions * 1.8) + (goalRatio * 20)));
    const flexibility = clamp(Math.round(15 + usageScore * 0.5 + (sessionBonus * 0.45) + (streakBonus * 0.3)));
    const overall = clamp(Math.round((consistency * 0.55) + (flexibility * 0.45)));
    const level = flexibility >= 75 ? 'Advanced' : flexibility >= 45 ? 'Intermediate' : 'Beginner';

    return { consistency, flexibility, overall, level };
  }, [
    profile?.dailyStreak,
    profile?.completedSessions,
    profile?.todayYOGSHALATime,
    profile?.lastActive,
    profile?.dailyYOGSHALAGoal,
  ]);

  const handleLogout = async () => {
    if (isDemoMode) {
      setDemoMode(false);
      navigate('/auth');
      return;
    }
    if (!auth || !auth.currentUser) {
      navigate('/auth');
      return;
    }
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (e) {
      console.error(e);
    }
  };

  const startFlexibilityTest = () => {
    setIsTesting(true);
    setTestProgress(0);
    setFlexibilityScore(null);
    const finalScore = {
      level: wellnessMetrics.level,
      value: wellnessMetrics.flexibility,
    };
    const interval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTestProgress(100);
          setFlexibilityScore(finalScore);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleTestVoice = async () => {
    if (isVoicePreviewRunning) return;

    setIsVoicePreviewRunning(true);
    try {
      await playVoicePreview(language);
    } catch (error) {
      console.warn('Voice preview failed:', error);
    } finally {
      window.setTimeout(() => {
        setIsVoicePreviewRunning(false);
      }, 1200);
    }
  };

  const handleQuickLanguageChange = async (nextLanguage: 'en' | 'ta') => {
    try {
      setShowLanguagePicker(false);
      await setLanguage(nextLanguage);
      setEditLanguage(nextLanguage);
      if (profile?.language !== nextLanguage) {
        await updateProfile({ language: nextLanguage });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isNativeNotificationSupported = Capacitor.isNativePlatform();
  const isNotificationSupported = isNativeNotificationSupported || (typeof Notification !== 'undefined' && 'requestPermission' in Notification);

  const requestNotificationPermission = async () => {
    if (!isNotificationSupported) {
      setReminderStatus('Notifications are not supported in this environment.');
      return false;
    }

    if (isNativeNotificationSupported) {
      let permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        permission = await LocalNotifications.requestPermissions();
      }
      if (permission.display !== 'granted') {
        setReminderStatus('Please enable notifications to receive reminder alerts.');
        return false;
      }
      await LocalNotifications.createChannel({
        id: 'yogshala-reminders',
        name: 'YOGSHALA Reminders',
        description: 'Daily YOGSHALA practice reminders.',
        importance: 5,
        visibility: 1,
      });
      return true;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      setReminderStatus('Please enable notifications to receive reminder alerts.');
      return false;
    }

    return true;
  };

  const triggerReminder = async (label: string) => {
    if (!isNativeNotificationSupported && isNotificationSupported && Notification.permission === 'granted') {
      const title = 'YOGSHALA Reminder';
      const options = {
        body: `Time for your ${label} yoga practice.`,
        silent: false,
        icon: '/images/yogshala-logo.jpg'
      };
      try {
        if (typeof ServiceWorkerRegistration !== 'undefined' && 'serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.showNotification) {
            await reg.showNotification(title, options);
            return;
          }
        }
        new Notification(title, options);
      } catch (error) {
        console.warn('Web notification failed:', error);
      }
    }
  };

  const getNextReminderDate = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  };

  const scheduleWebReminder = (label: string, time: string) => {
    const scheduleNext = () => {
      const nextTarget = getNextReminderDate(time);
      const delay = nextTarget.getTime() - Date.now();
      const timeoutId = window.setTimeout(() => {
        triggerReminder(label);
        scheduleNext();
      }, delay);
      reminderTimeoutIds.current.push(timeoutId);
    };

    scheduleNext();
  };

  const clearScheduledReminders = async () => {
    if (isNativeNotificationSupported) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications?.length) {
          await LocalNotifications.cancel({
            notifications: pending.notifications.map((notification) => ({ id: notification.id })),
          });
        }
      } catch (error) {
        console.warn('Failed to clear scheduled local notifications', error);
      }
    }

    reminderTimeoutIds.current.forEach((id) => window.clearTimeout(id));
    reminderTimeoutIds.current = [];
  };

  useEffect(() => {
    return () => {
      void clearScheduledReminders();
    };
  }, []);

  const scheduleReminder = async (label: string, time: string, id: number) => {
    if (!time) return;

    const [hours, minutes] = time.split(':').map(Number);

    if (isNativeNotificationSupported) {
      const targetDate = getNextReminderDate(time);

      const attemptSchedule = async (allowWhileIdle: boolean) => {
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title: 'YOGSHALA Reminder',
              body: `Time for your ${label} yoga practice.`,
              schedule: { at: targetDate, repeats: true, every: 'day', allowWhileIdle },
              channelId: 'yogshala-reminders',
            },
          ],
        });
      };

      try {
        await attemptSchedule(true);
      } catch (error) {
        console.warn('Exact alarm scheduling failed (likely Android 12+ permission). Falling back to inexact:', error);
        try {
          await attemptSchedule(false);
        } catch (fallbackError) {
          console.error('Local notification fallback schedule failed:', fallbackError);
        }
      }
      return;
    }

    scheduleWebReminder(label, time);
  };

  useEffect(() => {
    const reschedule = async () => {
      await clearScheduledReminders();

      if (!reminderEnabled || !reminderTimes.length || !isNotificationSupported) {
        return;
      }

      if (isNativeNotificationSupported) {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          return;
        }
        await LocalNotifications.createChannel({
          id: 'yogshala-reminders',
          name: 'YOGSHALA Reminders',
          description: 'Daily YOGSHALA practice reminders.',
        importance: 5,
        visibility: 1,
        });
      } else if (Notification.permission !== 'granted') {
        return;
      }

      await Promise.all(reminderTimes.map((time, index) => scheduleReminder('daily yoga practice', time, 1000 + index)));
    };

    void reschedule();
  }, [reminderEnabled, reminderTimes, isNotificationSupported, isNativeNotificationSupported]);

  const addReminderTime = (time: string) => {
    if (!reminderEnabled) return;
    setReminderTimes((prev) => {
      const next = Array.from(new Set([...prev, time]));
      next.sort();
      if (next.length === prev.length) {
        setReminderStatus(`${formatTimeTo12Hour(time)} is already added.`);
        return prev;
      }
      setReminderStatus(`Added ${formatTimeTo12Hour(time)} to your daily reminders.`);
      return next;
    });
  };

  const removeReminderTime = (time: string) => {
    setReminderTimes((prev) => prev.filter((existing) => existing !== time));
    setReminderStatus(`Removed ${formatTimeTo12Hour(time)} from your reminders.`);
  };

  const handleSaveReminders = async () => {
    setReminderStatus('Saving reminder settings...');
    await clearScheduledReminders();

    if (!reminderEnabled) {
      setReminderStatus(`Reminder disabled. ${reminderTimes.length} reminder(s) are saved and can be enabled later.`);
      setShowReminders(false);
      return;
    }

    const effectiveReminderTimes = reminderTimes.length
      ? reminderTimes
      : [reminderTime];
    if (!reminderTimes.length) {
      setReminderTimes(effectiveReminderTimes);
    }

    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      setReminderStatus(`Reminder times (${effectiveReminderTimes.length}) are saved, but notifications are blocked. Please enable notifications to receive alerts.`);
      return;
    }

    await Promise.all(effectiveReminderTimes.map((time, index) => scheduleReminder('daily yoga practice', time, 1000 + index)));

    const reminderHint = isNativeNotificationSupported
      ? 'You will get daily alerts even when the app is closed.'
      : 'Web reminders appear while the app is open in your browser.';
    setReminderStatus(`Saved ${effectiveReminderTimes.length} reminder(s): ${effectiveReminderTimes.map(formatTimeTo12Hour).join(', ')}. ${reminderHint}`);
    setShowReminders(false);
  };

  const menuSections = [
    {
      title: t('practiceSection', language),
      items: [
        { icon: Trophy, label: t('myJourney', language), color: 'text-warm-orange', bg: 'bg-warm-orange/10', onClick: () => navigate('/challenges') },
        { icon: Target, label: t('flexibilityTest', language), color: 'text-soft-pink', bg: 'bg-soft-pink/10', onClick: startFlexibilityTest },
      ]
    },
    {
      title: t('preferences', language),
      items: [
        { icon: Languages, label: `${t('chooseLanguage', language)} · ${language === 'ta' ? t('tamil', language) : t('english', language)}`, color: 'text-deep-purple', bg: 'bg-deep-purple/10', onClick: () => setShowLanguagePicker(true) },
        { icon: Edit2, label: t('editProfile', language), color: 'text-deep-purple', bg: 'bg-deep-purple/10', onClick: () => setIsEditing(true) },
        { icon: Bell, label: t('smartReminders', language), color: 'text-warm-orange', bg: 'bg-warm-orange/10', onClick: () => setShowReminders(!showReminders) },
        { icon: Volume2, label: isVoicePreviewRunning ? t('testingVoice', language) : t('testVoice', language), color: 'text-emerald-600', bg: 'bg-emerald-500/10', onClick: handleTestVoice },
      ]
    },
    {
      title: t('support', language),
      items: [
        { icon: Shield, label: 'Privacy Policy', color: 'text-ocean-blue', bg: 'bg-ocean-blue/10', onClick: () => navigate('/privacy-policy') },
        { icon: LogOut, label: 'Delete My Account', color: 'text-red-600', bg: 'bg-red-500/10', onClick: () => navigate('/delete-account') },
      ]
    }
  ];

  return (
    <div className="page-shell space-y-8">
      {permissionError && <PermissionWarning />}
      
      <header className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-28 h-28 rounded-[32px] bg-animated-gradient flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-deep-purple/20 border-4 border-white/40"
          >
            {profile?.name?.[0] || 'U'}
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-deep-purple shadow-lg border-white/60"
          >
            <Edit2 size={18} />
          </motion.button>
        </div>
        <div>
          <h1 className="text-large-title text-gray-900">{profile?.name}</h1>
          <p className="text-body text-gray-500">{profile?.email}</p>
        </div>
      </header>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 space-y-6 border-deep-purple/20 shadow-2xl">
              <h3 className="text-section-title text-gray-900">{t('editProfile', language)}</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-small-label text-gray-400 uppercase tracking-widest">{t('fullName', language)}</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-4 rounded-2xl glass-card bg-white/50 border-white/40 outline-none focus:ring-2 focus:ring-deep-purple transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-small-label text-gray-400 uppercase tracking-widest">{t('goal', language)}</label>
                    <select 
                      value={editGoal}
                      onChange={(e) => setEditGoal(e.target.value as any)}
                      className="w-full p-4 rounded-2xl glass-card bg-white/50 border-white/40 outline-none focus:ring-2 focus:ring-deep-purple transition-all"
                    >
                      <option value="Flexibility">Flexibility</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Stress Relief">Stress Relief</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-small-label text-gray-400 uppercase tracking-widest">{t('level', language)}</label>
                    <select 
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value as any)}
                      className="w-full p-4 rounded-2xl glass-card bg-white/50 border-white/40 outline-none focus:ring-2 focus:ring-deep-purple transition-all"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-small-label text-gray-400 uppercase tracking-widest">{t('language', language)}</label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value as any)}
                    className="w-full p-4 rounded-2xl glass-card bg-white/50 border-white/40 outline-none focus:ring-2 focus:ring-deep-purple transition-all"
                  >
                    <option value="en">{t('english', language)}</option>
                    <option value="ta">{t('tamil', language)}</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-2xl glass-card text-gray-500 font-bold"
                  >
                    {t('cancel', language)}
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl bg-deep-purple text-white font-bold shadow-xl shadow-deep-purple/20 disabled:opacity-50"
                  >
                    {saving ? t('saving', language) : t('save', language)}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Sections */}
      <div className="space-y-8">
        {menuSections.map((section, sectionIdx) => (
          <div key={section.title} className="space-y-4">
            <h3 className="px-4 text-small-label text-gray-400 uppercase tracking-widest">{section.title}</h3>
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (sectionIdx * 0.1) + (i * 0.05) }}
                  onClick={(item as any).onClick}
                  className="w-full p-5 glass-card flex items-center justify-between hover:bg-white/60 transition-all active:scale-[0.98] border-white/40 shadow-sm"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg}`}>
                      <item.icon size={20} className={item.color} />
                    </div>
                    <span className="text-body font-semibold text-gray-700 text-left break-words">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showLanguagePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 px-4 py-6"
            onClick={() => setShowLanguagePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 sm:p-8 rounded-3xl w-[min(92vw,24rem)] space-y-4 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-section-title text-gray-900">{t('chooseLanguage', language)}</h3>
                <button onClick={() => setShowLanguagePicker(false)} className="p-2 rounded-full hover:bg-gray-200">
                  <X size={20} />
                </button>
              </div>
              <button
                onClick={() => void handleQuickLanguageChange('en')}
                className={`w-full rounded-2xl px-5 py-4 text-left border transition-all ${
                  language === 'en'
                    ? 'bg-deep-purple text-white border-deep-purple'
                    : 'glass-card bg-white/60 border-white/60 text-gray-900'
                }`}
              >
                <div className="font-bold">{t('english', language)}</div>
                <div className={`text-sm ${language === 'en' ? 'text-white/80' : 'text-gray-500'}`}>English</div>
              </button>
              <button
                onClick={() => void handleQuickLanguageChange('ta')}
                className={`w-full rounded-2xl px-5 py-4 text-left border transition-all ${
                  language === 'ta'
                    ? 'bg-deep-purple text-white border-deep-purple'
                    : 'glass-card bg-white/60 border-white/60 text-gray-900'
                }`}
              >
                <div className="font-bold">{t('tamil', language)}</div>
                <div className={`text-sm ${language === 'ta' ? 'text-white/80' : 'text-gray-500'}`}>தமிழ்</div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {(isTesting || flexibilityScore) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 px-4 py-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 sm:p-8 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto flex flex-col text-center"
            >
              <h3 className="text-section-title text-gray-900 mb-4">{t('flexibilityTest', language)}</h3>
              {flexibilityScore ? (
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-3">Flexibility test complete</p>
                  <div className="grid gap-3 mb-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-4 text-left border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-2">Wellness Score</p>
                      <p className="text-3xl font-bold text-deep-purple">{wellnessMetrics.overall}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 text-left border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-2">Consistency</p>
                      <p className="text-3xl font-bold text-slate-900">{wellnessMetrics.consistency}%</p>
                    </div>
                  </div>
                  <p className="text-body text-gray-600 mb-2">{t('yourScore', language)}</p>
                  <p className="text-large-title font-bold text-deep-purple mb-1">{flexibilityScore.level}</p>
                  <p className="text-small-label text-gray-500 mb-4">{flexibilityScore.value}/100</p>
                  <button
                    onClick={() => {
                      setIsTesting(false);
                      setFlexibilityScore(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-deep-purple text-white font-bold"
                  >
                    {t('done', language)}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-body text-gray-600 mb-4">Analyzing your flexibility based on your recent yoga practice activity...</p>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${testProgress}%` }}
                      className="h-full bg-deep-purple"
                    />
                  </div>
                  <p className="text-small-label text-gray-500 mt-2">{testProgress}%</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full p-5 rounded-[24px] glass-card bg-soft-pink/10 text-soft-pink flex items-center justify-center space-x-2 font-bold border-soft-pink/20"
      >
        <LogOut size={20} />
        <span>{t('logout', language)}</span>
      </motion.button>

      <AnimatePresence>
        {showReminders && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 px-3 sm:px-4 py-4 sm:py-6"
            onClick={() => setShowReminders(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-4 sm:p-8 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-section-title text-gray-900">{t('smartReminders', language)}</h3>
                  <p className="text-body text-gray-600 mt-2">{t('setReminders', language)}</p>
                </div>
                <button onClick={() => setShowReminders(false)} className="p-2 rounded-full hover:bg-gray-200">
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-3xl bg-white/90 p-4 sm:p-5 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-slate-900">Daily Reminder</p>
                    <p className="text-sm text-slate-500">Choose a time to receive one daily practice reminder.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">Enable reminder</span>
                    <label className="switch" aria-label="Enable reminder">
                      <input
                        type="checkbox"
                        checked={reminderEnabled}
                        onChange={() => setReminderEnabled((value) => !value)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-500">Reminder time</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      disabled={!reminderEnabled}
                      value={((Number(reminderTime.split(':')[0]) % 12) || 12).toString().padStart(2, '0')}
                      onChange={(e) => {
                        const hour12 = Number(e.target.value);
                        const period = Number(reminderTime.split(':')[0]) >= 12 ? 'PM' : 'AM';
                        setReminderTime(parseTimeFrom12Hour(hour12, reminderTime.split(':')[1] || '00', period));
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-deep-purple focus:ring-2 focus:ring-deep-purple/15"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const hour = i + 1;
                        return (
                          <option key={hour} value={hour.toString().padStart(2, '0')}>
                            {hour.toString().padStart(2, '0')}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      disabled={!reminderEnabled}
                      value={reminderTime.split(':')[1] || '00'}
                      onChange={(e) => {
                        const period = Number(reminderTime.split(':')[0]) >= 12 ? 'PM' : 'AM';
                        const hour12 = (Number(reminderTime.split(':')[0]) % 12) || 12;
                        setReminderTime(parseTimeFrom12Hour(hour12, e.target.value.padStart(2, '0'), period));
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-deep-purple focus:ring-2 focus:ring-deep-purple/15"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      disabled={!reminderEnabled}
                      value={Number(reminderTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                      onChange={(e) => {
                        const hour12 = (Number(reminderTime.split(':')[0]) % 12) || 12;
                        setReminderTime(parseTimeFrom12Hour(hour12, reminderTime.split(':')[1] || '00', e.target.value as 'AM' | 'PM'));
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-deep-purple focus:ring-2 focus:ring-deep-purple/15"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {reminderPresetTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={!reminderEnabled}
                        onClick={() => addReminderTime(time)}
                        className={`rounded-2xl border px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition ${
                          reminderTimes.includes(time) ? 'border-deep-purple bg-deep-purple/10 text-deep-purple' : 'border-slate-200 bg-white text-slate-700 hover:border-deep-purple hover:bg-deep-purple/5'
                        }`}
                      >
                        {formatTimeTo12Hour(time)}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={!reminderEnabled}
                      onClick={() => addReminderTime(reminderTime)}
                      className="w-full rounded-2xl bg-deep-purple px-4 py-3 text-white text-sm font-semibold shadow-sm hover:bg-deep-purple/90 disabled:opacity-50"
                    >
                      Add {formatTimeTo12Hour(reminderTime)} as reminder
                    </button>
                    <p className="text-xs text-slate-500">Choose hour, minute, and AM/PM, then add the selected time.</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved reminder details</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="rounded-full bg-white px-3 py-2 border border-slate-200">Sound: System default</span>
                    <span className="rounded-full bg-white px-3 py-2 border border-slate-200">Enabled: {reminderEnabled ? 'Yes' : 'No'}</span>
                    <span className="rounded-full bg-white px-3 py-2 border border-slate-200">Reminders set: {reminderTimes.length}</span>
                  </div>
                  {reminderTimes.length > 0 ? (
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">Reminder times</p>
                      <div className="flex flex-wrap gap-2">
                        {reminderTimes.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => removeReminderTime(time)}
                            className="rounded-full bg-white px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm"
                          >
                            {formatTimeTo12Hour(time)} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No reminder times added yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSaveReminders}
                  className="w-full rounded-3xl bg-deep-purple px-5 py-4 text-white font-semibold shadow-xl shadow-deep-purple/20 hover:bg-deep-purple/90"
                >
                  Save reminder settings
                </button>
                {reminderStatus && <p className="text-sm text-slate-600 break-words">{reminderStatus}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-small-label text-gray-400">YOGSHALA v1.0.0 • Made with Love</p>
    </div>
  );
};

export default Profile;
