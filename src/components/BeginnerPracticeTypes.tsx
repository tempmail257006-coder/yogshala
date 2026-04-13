import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { YOGSHALA_LEVELS, LEVEL_THEME } from "../YOGSHALALevels";
import { useLanguage } from "../context/LanguageContext";
import { localizeLevel, localizeStyle, translateText } from "../lib/i18n";

const BeginnerPracticeTypes: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const baseLevel = YOGSHALA_LEVELS.find((item) => item.id === "beginner");
  const level = baseLevel ? localizeLevel(baseLevel, language) : null;

  if (!level) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Beginner level not found", language)}</h2>
        <button
          onClick={() => navigate("/workspace")}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Practice", language)}
        </button>
      </div>
    );
  }

  const theme = LEVEL_THEME[level.id];
  const hasStyles = level.styles.length > 0;
  const canStartPractice = hasStyles || level.poseIds.length > 0;

  return (
    <div className="page-shell space-y-8">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate("/workspace")}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-gray-500 border-white/60 shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-small-label text-gray-400 uppercase tracking-widest">{translateText("Practice Types", language)}</p>
          <h1 className="text-large-title text-gray-900">{level.title}</h1>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-[32px] p-7 shadow-2xl bg-gradient-to-br ${theme.gradient}`}
      >
        <div className={`absolute -top-14 -right-10 w-32 h-32 rounded-full blur-3xl ${theme.glow}`} />
        <div className="relative space-y-3">
          <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${theme.badge} w-fit`}>
            {translateText("Level", language)} {level.level} • {level.difficulty}
          </div>
          <p className="text-body text-gray-700">{level.shortDescription}</p>
        </div>
      </motion.section>

      {hasStyles && (
        <section className="grid grid-cols-1 gap-4">
          {level.styles.map((style, index) => {
            const localizedStyle = localizeStyle(style, language);
            return (
            <motion.button
              key={localizedStyle.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/practice/beginner/${localizedStyle.id}`)}
              className="glass-card p-5 border-white/60 shadow-sm text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{localizedStyle.name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
                  {translateText("Videos", language)}
                </span>
              </div>
              <p className="text-body text-gray-600 mt-2">{localizedStyle.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-deep-purple text-xs font-bold uppercase tracking-widest">
                <PlayCircle size={16} />
                {translateText("View Practice Videos", language)}
              </div>
            </motion.button>
            );
          })}
        </section>
      )}

      {canStartPractice && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/workspace?level=beginner")}
          className="w-full py-5 rounded-2xl bg-deep-purple text-white font-bold shadow-xl shadow-deep-purple/20"
        >
          {translateText("Start Beginner Practice", language)}
        </motion.button>
      )}
    </div>
  );
};

export default BeginnerPracticeTypes;

