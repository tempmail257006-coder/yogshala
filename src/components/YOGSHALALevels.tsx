import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Flame, Trophy, ChevronRight } from "lucide-react";
import { YOGSHALA_LEVELS, LEVEL_THEME } from "../YOGSHALALevels";
import { YOGSHALA_POSES } from "../constants";
import { ASANA_CLASSIFICATION } from "../asanaClassification";
import { YOGSHALAPose } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { localizeLevel, localizePose, translateText } from "../lib/i18n";

const LEVEL_ICONS = {
  beginner: Sparkles,
  intermediate: Flame,
  advanced: Trophy,
};

const DifficultyMeter: React.FC<{ level: number; activeClass: string }> = ({ level, activeClass }) => {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-2 w-10 rounded-full ${step <= level ? activeClass : "bg-gray-200/80"}`}
        />
      ))}
    </div>
  );
};

const YOGSHALALevels: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const classification = ASANA_CLASSIFICATION.map((level) => ({
    ...localizeLevel(level as any, language),
    poses: level.poseIds
      .map((id) => YOGSHALA_POSES.find((pose) => pose.id === id))
      .filter((pose): pose is YOGSHALAPose => Boolean(pose))
      .map((pose) => localizePose(pose, language)),
  }));
  const getSummaryName = (label: string) => label.split(" (")[0].trim();

  return (
    <div className="page-shell space-y-8">
      <header className="space-y-2">
        <h1 className="text-large-title text-gray-900">{translateText("YOGSHALA Levels", language)}</h1>
        <p className="text-body text-gray-500">
          {translateText("Choose your training path and grow with structured, level-based practice.", language)}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {YOGSHALA_LEVELS.map((baseLevel, index) => {
          const level = localizeLevel(baseLevel, language);
          const theme = LEVEL_THEME[baseLevel.id];
          const Icon = LEVEL_ICONS[baseLevel.id];

          return (
            <motion.article
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-[32px] p-6 shadow-2xl bg-gradient-to-br ${theme.gradient}`}
            >
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl ${theme.glow}`} />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${theme.badge}`}>
                    Level {level.level}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                    <Icon className={`${theme.accent}`} size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{level.title}</h2>
                  <p className="text-body text-gray-600">{level.shortDescription}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-small-label text-gray-500 uppercase tracking-widest">{translateText("Difficulty", language)}</p>
                  <DifficultyMeter level={level.level} activeClass={theme.activeBar} />
                </div>

                <button
                  onClick={() => navigate(`/workspace?level=${level.id}`)}
                  className={`w-full py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 ${theme.button}`}
                >
                  {translateText("Start Training", language)}
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.article>
          );
        })}
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-small-label text-gray-400 uppercase tracking-widest">{translateText("Educational Guide", language)}</p>
          <h2 className="text-section-title text-gray-900">{translateText("Classify YOGSHALA Asanas by Difficulty", language)}</h2>
          <p className="text-body text-gray-500">
            {translateText("Explore beginner, intermediate, and advanced asanas with short explanations and benefits.", language)}
          </p>
        </div>

        <div className="space-y-6">
          {classification.map((level, index) => {
            const theme = LEVEL_THEME[level.id];
            const levelLabel = level.id.charAt(0).toUpperCase() + level.id.slice(1);

            return (
              <motion.article
                key={level.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-card p-6 border-white/60 shadow-sm space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${theme.badge}`}>
                      {levelLabel}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{level.title}</h3>
                    <p className="text-body text-gray-600">{level.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-small-label text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${theme.activeBar}`} />
                    {level.poses.length} {translateText("poses", language)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {level.poses.map((pose) => (
                    <div
                      key={pose.id}
                      className="rounded-2xl bg-white/80 border border-white/60 p-4"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-28 sm:h-28 aspect-[4/3] rounded-2xl bg-gray-100 border border-white/60 overflow-hidden">
                          <img
                            src={pose.imageUrl}
                            alt={pose.name}
                            className="absolute inset-0 w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{pose.sanskritName}</h3>
                              <p className="text-small-label text-gray-500">{pose.name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
                              {pose.difficulty}
                            </span>
                          </div>
                          <p className="text-body text-gray-600">{pose.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {pose.benefits.slice(0, 3).map((benefit) => (
                              <span
                                key={benefit}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.badge}`}
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="glass-card p-6 border-white/60 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center text-deep-purple">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-section-title text-gray-900">{translateText("Summary Table", language)}</h3>
              <p className="text-small-label text-gray-400">{translateText("Quick reference by level", language)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classification.map((level) => {
              const theme = LEVEL_THEME[level.id];
              const levelLabel = level.id.charAt(0).toUpperCase() + level.id.slice(1);
              const summary = level.poses.map((pose) => getSummaryName(pose.sanskritName)).join(", ");

              return (
                <div key={level.id} className="rounded-2xl bg-white/70 border border-white/60 p-4 space-y-3">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${theme.badge}`}>
                    {levelLabel}
                  </span>
                  <p className="text-body text-gray-600">{summary}</p>
                </div>
              );
            })}
          </div>
          <p className="text-small-label text-gray-500">
            {translateText("Use this classification to create structured practice sessions or educational material.", language)}
          </p>
        </div>
      </section>
    </div>
  );
};

export default YOGSHALALevels;

