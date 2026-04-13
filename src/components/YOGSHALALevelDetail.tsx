import React from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Sparkles, CheckCircle2, Play, Image as ImageIcon } from "lucide-react";
import { YOGSHALA_LEVELS, LEVEL_THEME } from "../YOGSHALALevels";
import { YOGSHALA_POSES } from "../constants";
import { YOGSHALAPose } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { localizeLevel, localizePose, translateText } from "../lib/i18n";

const YOGSHALALevelDetail: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { levelId } = useParams();
  const baseLevel = YOGSHALA_LEVELS.find((item) => item.id === levelId);
  const level = baseLevel ? localizeLevel(baseLevel, language) : null;

  if (!level) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Level not found", language)}</h2>
        <p className="text-body text-gray-500">{translateText("Please choose a valid training level.", language)}</p>
        <button
          onClick={() => navigate("/levels")}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Levels", language)}
        </button>
      </div>
    );
  }

  const theme = LEVEL_THEME[level.id];
  const poses = level.poseIds
    .map((id) => YOGSHALA_POSES.find((pose) => pose.id === id))
    .filter(Boolean)
    .map((pose) => localizePose(pose as YOGSHALAPose, language)) as YOGSHALAPose[];
  const hasFocusAreas = level.focusAreas.length > 0;
  const hasStyles = level.styles.length > 0;
  const hasPoses = poses.length > 0;

  return (
    <div className="page-shell space-y-10">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate("/levels")}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-gray-500 border-white/60 shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-small-label text-gray-400 uppercase tracking-widest">{translateText("YOGSHALA Levels", language)}</p>
          <h1 className="text-large-title text-gray-900">{level.title}</h1>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-[32px] p-7 shadow-2xl bg-gradient-to-br ${theme.gradient}`}
      >
        <div className={`absolute -top-14 -right-10 w-32 h-32 rounded-full blur-3xl ${theme.glow}`} />
        <div className="relative space-y-5">
          <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${theme.badge} w-fit`}>
            Level {level.level} • {level.difficulty}
          </div>
          <p className="text-body text-gray-700">{level.description}</p>
          {hasFocusAreas && (
            <div className="flex flex-wrap gap-2">
              {level.focusAreas.map((focus) => (
                <span key={focus} className="px-4 py-2 rounded-2xl bg-white/70 text-xs font-bold text-gray-600">
                  {focus}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {level.galleryImages?.length ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center ${theme.accent}`}>
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="text-section-title text-gray-900">{translateText("Practice Gallery", language)}</h3>
              <p className="text-small-label text-gray-400">{translateText("Photos you added for this level", language)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {level.galleryImages.map((image, index) => (
              <motion.div
                key={image + index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                className="overflow-hidden rounded-2xl shadow-lg border border-white/60 glass-card"
              >
                <div className="relative w-full overflow-hidden pt-[75%] bg-gray-100">
                  <img
                    src={image}
                    alt={`${level.title} preview ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {hasStyles && (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center ${theme.accent}`}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-section-title text-gray-900">{translateText("YOGSHALA Styles", language)}</h3>
              <p className="text-small-label text-gray-400">{translateText("Pick a style to match your mood", language)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {level.styles.map((style, index) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-card p-5 border-white/60 shadow-sm"
              >
                <h4 className="text-lg font-bold text-gray-900">{style.name}</h4>
                <p className="text-body text-gray-600 mt-2">{style.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {hasPoses && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-deep-purple/10 flex items-center justify-center text-deep-purple">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-section-title text-gray-900">{translateText("Pose Library", language)}</h3>
            </div>
            <span className="text-small-label text-gray-400">{poses.length} {translateText("poses", language)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {poses.map((pose, index) => (
              <motion.button
                key={pose.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => navigate(`/levels/${level.id}/pose/${pose.id}`)}
                className="group relative rounded-[28px] overflow-hidden text-left shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="relative w-full overflow-hidden pt-[75%] bg-gray-100">
                  <img
                    src={pose.imageUrl}
                    alt={pose.name}
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-5 left-5 right-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
                      {pose.difficulty}
                    </span>
                    {pose.videoUrl && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                        <Play size={12} /> {translateText("Video", language)}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-white">{pose.name}</h4>
                  <p className="text-white/70 text-xs">{pose.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default YOGSHALALevelDetail;

