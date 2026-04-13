import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Layout, History, User, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { YogshalaLogoIcon } from './YogshalaLogoIcon';

const AppLayout: React.FC = () => {
  const { language, t } = useLanguage();
  const navItems = [
    { icon: Home, label: t('home', language), path: '/' },
    { icon: Layout, label: t('practice', language), path: '/workspace' },
    { icon: YogshalaLogoIcon, label: t('aiChat', language), path: '/chat' },
    { icon: Trophy, label: t('goals', language), path: '/challenges' },
    { icon: User, label: t('profile', language), path: '/profile' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100 px-0 sm:px-4 lg:px-6">
      <main className="mobile-container bg-soft-gradient shadow-2xl">
        {/* Global Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-deep-purple/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -60, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 -right-40 w-[700px] h-[700px] bg-ocean-blue/10 rounded-full blur-[140px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              x: [0, 40, 0],
              y: [0, 60, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-60 left-1/4 w-[800px] h-[800px] bg-soft-pink/10 rounded-full blur-[160px]"
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <Outlet />
        </div>

        <nav className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-[min(92vw,960px)] z-50 sm:w-[calc(100%-2rem)]">
          <div className="glass-card px-2 py-2 sm:px-4 sm:py-3 flex justify-around items-center shadow-2xl border-white/60 bg-white/40 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px]">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex min-w-0 flex-1 flex-col items-center justify-center p-2 sm:p-3 group"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-deep-purple/10 rounded-2xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative">
                      <item.icon 
                        size={22} 
                        className={`transition-all duration-500 ${
                          isActive 
                            ? "text-deep-purple scale-110 drop-shadow-[0_0_12px_rgba(106,17,203,0.4)]" 
                            : "text-gray-400 group-hover:text-gray-600 group-hover:scale-110"
                        }`} 
                      />
                      {isActive && (
                        <motion.div 
                          layoutId="nav-dot"
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-deep-purple rounded-full"
                        />
                      )}
                    </div>
                    <span className={`mt-1 max-w-full truncate text-center text-[9px] sm:text-[10px] font-bold transition-all duration-500 tracking-[0.18em] uppercase ${
                      isActive ? "text-deep-purple opacity-100" : "text-gray-400 opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                    }`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
};

export default AppLayout;
