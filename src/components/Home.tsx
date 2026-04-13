import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Play, Quote, Zap, ChevronRight, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { profile } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [quoteIndex] = useState(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  const currentDayNumber = useMemo(() => {
    if (!profile?.journeyStartAt) return 1;
    const start = profile.journeyStartAt > Date.now() ? Date.now() : profile.journeyStartAt;
    const journeyStartDate = new Date(new Date(start).toLocaleDateString('en-CA') + 'T00:00:00').getTime();
    const todayDate = new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00').getTime();
    return Math.max(1, Math.floor((todayDate - journeyStartDate) / 86400000) + 1);
  }, [profile?.journeyStartAt]);

  const stats = [
    { label: t('streak', language), value: `${profile?.dailyStreak || 0}d`, icon: Award, color: 'text-warm-orange', bg: 'bg-warm-orange/10' },
    { label: t('energy', language), value: `${profile?.caloriesBurned || 0} kcal`, icon: Zap, color: 'text-soft-pink', bg: 'bg-soft-pink/10' },
  ];

  return (
    <div className="page-shell space-y-8">
      <header className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-large-title text-gray-900">{t('namaste', language)}, {profile?.name?.split(' ')[0]}</h1>
          <p className="text-body text-gray-500">{t('wellnessJourneyContinues', language)}</p>
        </motion.div>
      </header>

      {/* Today's Session Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] bg-animated-gradient text-white shadow-2xl shadow-deep-purple/20 group"
      >
        <div className="relative z-10 space-y-6 sm:space-y-8">
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-xl w-fit px-4 py-1.5 rounded-full border border-white/20">
            <Zap size={14} className="text-white" />
            <span className="text-small-label text-white uppercase tracking-widest">{t('recommendedForYou', language)}</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              {language === 'ta'
                ? `நாள் ${currentDayNumber}: ${profile?.YOGSHALALevel === 'Advanced' ? 'மேம்பட்ட சக்தி ஓட்டம்' : profile?.YOGSHALALevel === 'Intermediate' ? 'இடைநிலை மைய ஓட்டம்' : 'காலை ஆற்றல் ஓட்டம்'}`
                : `Day ${currentDayNumber}: ${profile?.YOGSHALALevel === 'Advanced' ? 'Advanced Power Flow' : profile?.YOGSHALALevel === 'Intermediate' ? 'Intermediate Core Flow' : 'Morning Energy Flow'}`}
            </h2>
            <p className="text-white/80 text-body max-w-sm">
              {language === 'ta'
                ? `உங்கள் ${profile?.fitnessGoal || 'நலன்'} இலக்குகளை ஆதரிக்கும் தனிப்பயன் தொடர்.`
                : `A tailored sequence to support your ${profile?.fitnessGoal?.toLowerCase() || 'wellness'} goals.`}
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/workspace?level=${profile?.YOGSHALALevel?.toLowerCase() || 'beginner'}`)}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white text-deep-purple px-6 sm:px-10 py-4 sm:py-5 rounded-[20px] sm:rounded-[24px] font-bold shadow-2xl transition-all"
          >
            <Play size={20} fill="currentColor" />
            <span>{t('startNow', language)}</span>
          </motion.button>
        </div>
        
        {/* Abstract shapes for visual flair */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-soft-pink/20 rounded-full blur-2xl" />
      </motion.section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass-card p-5 flex flex-col items-center text-center space-y-3 border-white/60 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="space-y-0.5">
              <p className="text-small-label text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Daily Wisdom */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-8 border-deep-purple/10 bg-white/40 shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-soft-pink/10 flex items-center justify-center text-soft-pink">
            <Quote size={20} />
          </div>
          <h3 className="text-section-title text-gray-900">{t('dailyWisdom', language)}</h3>
        </div>
        <p className="text-body text-gray-600 italic leading-relaxed text-lg">
          "{MOTIVATIONAL_QUOTES[quoteIndex]}"
        </p>
      </motion.section>

      {/* Quick Actions */}
      <section className="space-y-6">
        <h3 className="text-section-title text-gray-900 px-2">{t('quickStart', language)}</h3>
        <div className="grid grid-cols-1 gap-4">
          {[
            { title: t('yogshalaLevels', language), icon: Sparkles, color: 'bg-deep-purple', path: '/levels' },
          ].map((action, i) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="glass-card p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 group border-white/40 shadow-sm"
            >
              <div className="flex items-center space-x-4 sm:space-x-5 min-w-0">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] ${action.color} flex items-center justify-center text-white shadow-xl`}>
                  <action.icon size={28} />
                </div>
                <span className="text-body font-bold text-gray-800 text-base sm:text-lg break-words">{action.title}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-deep-purple group-hover:text-white transition-all shadow-sm">
                <ChevronRight size={20} />
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
