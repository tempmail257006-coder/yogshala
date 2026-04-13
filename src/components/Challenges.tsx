import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Calendar, CheckCircle2, Lock, Award, Star, Sun, XCircle, AlertCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import PermissionWarning from './PermissionWarning';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../lib/i18n';

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isDemoMode, permissionError, updateProfile } = useAuth();
  const { language } = useLanguage();
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [shakingDay, setShakingDay] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recoveryDay, setRecoveryDay] = useState<number | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const RECOVERY_COST = 500;

  const journeyStartDate = useMemo(() => {
    let start = profile?.journeyStartAt;
    if (!start || start > Date.now()) {
      start = Date.now();
    }
    return new Date(new Date(start).toLocaleDateString('en-CA') + 'T00:00:00').getTime();
  }, [profile?.journeyStartAt]);

  const todayDate = new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00').getTime();
  const currentDayNumber = Math.max(1, Math.floor((todayDate - journeyStartDate) / 86400000) + 1);

  useEffect(() => {
    if (isDemoMode || !db || !user) {
      const fallbackCount = Math.min(30, profile?.completedSessions || 0);
      setCompletedDays(Array.from({ length: fallbackCount }, (_, i) => i + 1));
      return;
    }

    const q = query(collection(db, 'history'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const daySet = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as any;
        if (!data?.timestamp) return;
        const dayKey = new Date(data.timestamp).toLocaleDateString('en-CA');
        daySet.add(dayKey);
      });

      const completed: number[] = [];
      for (let i = 1; i <= 30; i++) {
        const targetTime = journeyStartDate + (i - 1) * 86400000;
        const targetDateString = new Date(targetTime).toLocaleDateString('en-CA');
        if (daySet.has(targetDateString)) {
          completed.push(i);
        }
      }
      setCompletedDays(completed);
    }, (error) => {
      console.error('Error fetching routine history:', error);
      const fallbackCount = Math.min(30, profile?.completedSessions || 0);
      setCompletedDays(Array.from({ length: fallbackCount }, (_, i) => i + 1));
    });

    return () => unsubscribe();
  }, [user, isDemoMode, profile?.completedSessions, journeyStartDate]);

  const lastMissedDay = useMemo(() => {
    for (let d = currentDayNumber - 1; d >= 1; d--) {
      if (!completedDays.includes(d)) return d;
    }
    return null;
  }, [currentDayNumber, completedDays]);

  const handleRecoverDay = async () => {
    if (!recoveryDay) return;
    if ((profile?.caloriesBurned || 0) < RECOVERY_COST) {
      setToastMessage(language === 'ta' ? "போதுமான ஆற்றல் இல்லை!" : "Not enough Energy!");
      setTimeout(() => setToastMessage(null), 3000);
      setRecoveryDay(null);
      return;
    }

    setIsRecovering(true);
    try {
      if (isDemoMode) {
        updateProfile({
          caloriesBurned: Math.max(0, (profile?.caloriesBurned || 0) - RECOVERY_COST),
          completedSessions: (profile?.completedSessions || 0) + 1
        });
        setCompletedDays(prev => [...prev, recoveryDay].sort((a,b) => a - b));
      } else if (user && db) {
        const targetTime = journeyStartDate + (recoveryDay - 1) * 86400000;
        await updateProfile({
          caloriesBurned: Math.max(0, (profile?.caloriesBurned || 0) - RECOVERY_COST)
        });
        
        const historyRef = doc(db, 'history', `${user.uid}_recovery_${targetTime}`);
        await setDoc(historyRef, {
          userId: user.uid,
          timestamp: targetTime,
          type: 'Recovery',
          title: language === 'ta' ? `நாள் ${recoveryDay} மீட்பு` : `Day ${recoveryDay} Recovery`,
          duration: '0m',
          calories: 0,
          poses: []
        });
      }
      setToastMessage(language === 'ta' ? `நாள் ${recoveryDay} மீட்கப்பட்டது!` : `Day ${recoveryDay} recovered!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error recovering day:", error);
      setToastMessage(language === 'ta' ? "நாளை மீட்டெடுக்க முடியவில்லை." : "Failed to recover day.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsRecovering(false);
      setRecoveryDay(null);
    }
  };

  const handleDayClick = (day: number) => {
    if (day === currentDayNumber) {
      navigate('/workspace');
    } else if (day < currentDayNumber && !completedDays.includes(day)) {
      setRecoveryDay(day);
    } else if (day > currentDayNumber) {
      setShakingDay(day);
      setTimeout(() => setShakingDay(null), 400);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="page-shell space-y-8">
      {permissionError && <PermissionWarning />}
      <header className="relative overflow-hidden px-5 sm:px-8 pb-6 sm:pb-8 rounded-[28px] sm:rounded-[32px] bg-animated-gradient text-white shadow-2xl shadow-deep-purple/20 border-4 border-white/40">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 space-y-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20">
              <Trophy size={24} className="text-white" />
            </div>
            <span className="text-small-label text-white/90 uppercase tracking-widest">{translateText("Active Journey", language)}</span>
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{translateText("30-Day YOGSHALA Flow", language)}</h1>
            <p className="text-white/80 text-body">{translateText("Transform your body and mind in one month.", language)}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-small-label font-bold">
              <span className="text-white/80">{translateText("Progress", language)}</span>
              <span className="text-white">{Math.round((completedDays.length / 30) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedDays.length / 30) * 100}%` }}
                className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-soft-pink/20 rounded-full blur-2xl" />
      </header>

      {/* Daily Routine Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-deep-purple" />
            <h2 className="text-section-title text-gray-900">{translateText("Daily Routine", language)}</h2>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-small-label text-deep-purple font-bold block">
              {translateText("Current Streak:", language)} {profile?.dailyStreak || 0}
            </span>
            {lastMissedDay !== null && (
              <span className="text-[10px] text-red-500 font-bold mt-0.5">
                {translateText(`Streak Broken on Day ${lastMissedDay}`, language)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {days.map((day) => {
            const isToday = day === currentDayNumber;
            const isCompleted = completedDays.includes(day);
            const isPast = day < currentDayNumber;
            const isFuture = day > currentDayNumber;
            
            const isMissed = isPast && !isCompleted;
            const isLocked = isFuture;
            const isAccessible = isToday;

            let cardStyle = "bg-gray-50/50 border-gray-100 text-gray-300";
            if (isCompleted) {
              cardStyle = isAccessible 
                ? "glass-card bg-emerald-50 border-emerald-400 border-2 shadow-xl shadow-emerald-500/20 text-emerald-700 cursor-pointer"
                : "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm";
            } else if (isAccessible) {
              cardStyle = "glass-card bg-white border-deep-purple border-2 shadow-xl shadow-deep-purple/10 text-deep-purple cursor-pointer";
            } else if (isMissed) {
              cardStyle = "bg-red-50/50 border-red-100 text-red-400 shadow-sm opacity-80";
            }

            return (
              <motion.div
                key={day}
                animate={shakingDay === day ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={isAccessible ? { scale: 1.05, y: -2 } : {}}
                whileTap={isAccessible ? { scale: 0.95 } : {}}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all relative overflow-hidden
                  ${cardStyle}
                `}
              >
                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Day</span>
                <span className="text-lg font-bold leading-none mt-0.5">{day}</span>
                {isCompleted && (
                  <div className="absolute top-1.5 right-1.5 text-emerald-500">
                    <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                  </div>
                )}
                {isMissed && (
                  <div className="absolute top-1.5 right-1.5 text-red-400">
                    <XCircle size={14} fill="currentColor" className="text-white" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute inset-0 bg-gray-50/40 flex items-center justify-center backdrop-blur-[1px]">
                    <Lock size={16} className="text-gray-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Milestone Badges */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 px-2">
          <Award size={20} className="text-warm-orange" />
          <h2 className="text-section-title text-gray-900">{translateText("Milestone Badges", language)}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: translateText('First Step', language), desc: translateText('Complete Day 1', language), icon: Star, color: 'text-warm-orange', bg: 'bg-warm-orange/10', unlocked: completedDays.length >= 1 },
            { label: translateText('Consistency', language), desc: translateText('7 Day Streak', language), icon: Award, color: 'text-ocean-blue', bg: 'bg-ocean-blue/10', unlocked: (profile?.dailyStreak || 0) >= 7 },
            { label: translateText('YOGSHALA Master', language), desc: translateText('Complete 30 Days', language), icon: Trophy, color: 'text-deep-purple', bg: 'bg-deep-purple/10', unlocked: completedDays.length >= 30 },
            { label: translateText('Dedicated', language), desc: translateText('10 Total Sessions', language), icon: Sun, color: 'text-soft-pink', bg: 'bg-soft-pink/10', unlocked: (profile?.completedSessions || 0) >= 10 },
          ].map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                p-5 rounded-[24px] border flex flex-col items-center text-center space-y-3 transition-all
                ${badge.unlocked 
                  ? "glass-card bg-white/60 border-white/40 shadow-sm" 
                  : "bg-gray-50/50 border-transparent opacity-40 grayscale"}
              `}
            >
              <div className={`p-3.5 rounded-2xl ${badge.bg}`}>
                <badge.icon size={28} className={badge.color} />
              </div>
              <div>
                <h4 className="text-body font-bold text-gray-900">{badge.label}</h4>
                <p className="text-small-label text-gray-500 mt-1">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recovery Modal */}
      <AnimatePresence>
        {recoveryDay !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
            onClick={() => !isRecovering && setRecoveryDay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass-card bg-white/90 p-6 sm:p-8 space-y-6 shadow-3xl flex flex-col items-center text-center rounded-[28px] sm:rounded-[32px]"
            >
              <div className="w-16 h-16 rounded-full bg-warm-orange/10 flex items-center justify-center text-warm-orange mb-2 shadow-inner">
                <Zap size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{translateText(`Recover Day ${recoveryDay}?`, language)}</h3>
              <p className="text-body text-gray-600">
                {translateText(`You missed Day ${recoveryDay}.`, language)} {translateText("You can use your Energy to restore your streak and unlock this day's progress.", language)}
              </p>
              
              <div className="w-full space-y-2">
                <div className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between border border-gray-100">
                  <span className="text-small-label text-gray-500 uppercase tracking-widest">{translateText("Cost", language)}</span>
                  <span className={`font-bold ${((profile?.caloriesBurned || 0) >= RECOVERY_COST) ? 'text-warm-orange' : 'text-red-500'}`}>
                    {RECOVERY_COST} kcal
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between border border-gray-100">
                  <span className="text-small-label text-gray-500 uppercase tracking-widest">{translateText("Your Energy", language)}</span>
                  <span className="font-bold text-gray-900">{profile?.caloriesBurned || 0} kcal</span>
                </div>
              </div>

              <div className="flex space-x-3 w-full pt-2">
                <button
                  onClick={() => setRecoveryDay(null)}
                  className="flex-1 py-4 rounded-2xl glass-card text-gray-600 font-bold hover:bg-gray-50 transition-all"
                  disabled={isRecovering}
                >
                  {translateText("Cancel", language)}
                </button>
                <button
                  onClick={handleRecoverDay}
                  disabled={isRecovering || (profile?.caloriesBurned || 0) < RECOVERY_COST}
                  className="flex-1 py-4 rounded-2xl bg-deep-purple text-white font-bold shadow-xl shadow-deep-purple/20 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  {isRecovering ? translateText('Recovering...', language) : translateText('Recover', language)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md px-4 py-3 rounded-2xl bg-gray-900/90 text-white text-sm font-bold shadow-2xl backdrop-blur-md z-50 flex items-center justify-center gap-2 text-center"
          >
            <AlertCircle size={16} className="text-warm-orange" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Challenges;
