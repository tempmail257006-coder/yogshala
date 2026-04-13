import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, Play, PlayCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { YOGSHALA_LEVELS, LEVEL_THEME } from "../YOGSHALALevels";
import { YOGSHALA_POSES } from "../constants";
import { YOGSHALAPose } from "../types";
import { BEGINNER_HATHA_ITEMS, BEGINNER_IYENGAR_ITEMS } from "../beginnerPracticeData";
import { useLanguage } from "../context/LanguageContext";
import { localizeLevel, localizePose, localizePracticeItem, localizeStyle, translateText } from "../lib/i18n";

const STYLE_POSE_MAP: Record<string, string[]> = {
  restorative: ["balasana", "setu_bandhasana"],
  vinyasa: ["adho_mukha_svanasana", "virabhadrasana_1", "virabhadrasana_2"],
};

const BeginnerPracticeVideos: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { styleId } = useParams();
  const baseLevel = YOGSHALA_LEVELS.find((item) => item.id === "beginner");
  const level = baseLevel ? localizeLevel(baseLevel, language) : null;
  const baseStyle = baseLevel?.styles.find((item) => item.id === styleId);
  const style = baseStyle ? localizeStyle(baseStyle, language) : null;

  if (!level || !style) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Style not found", language)}</h2>
        <p className="text-body text-gray-500">{translateText("Please choose a valid beginner practice type.", language)}</p>
        <button
          onClick={() => navigate("/practice/beginner")}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Practice Types", language)}
        </button>
      </div>
    );
  }

  const theme = LEVEL_THEME[level.id];
  const poseIds = STYLE_POSE_MAP[style.id] ?? level.poseIds;
  const poses = poseIds
    .map((id) => YOGSHALA_POSES.find((pose) => pose.id === id))
    .filter(Boolean)
    .map((pose) => localizePose(pose as YOGSHALAPose, language)) as YOGSHALAPose[];
  const hathaItems = BEGINNER_HATHA_ITEMS.map((item) => localizePracticeItem(item, language));
  const iyengarItems = BEGINNER_IYENGAR_ITEMS.map((item) => localizePracticeItem(item, language));

  return (
    <div className="page-shell space-y-8">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate("/practice/beginner")}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-gray-500 border-white/60 shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-small-label text-gray-400 uppercase tracking-widest">{translateText("Beginner Practice", language)}</p>
          <h1 className="text-large-title text-gray-900">{style.name}</h1>
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
            {level.title} • {style.name}
          </div>
          <p className="text-body text-gray-700">{style.description}</p>
        </div>
      </motion.section>

      {style.id === "hatha" ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-section-title text-gray-900">{translateText("Hatha Practice", language)}</h3>
            <span className="text-small-label text-gray-400">{hathaItems.length} {translateText("items", language)}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {hathaItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/practice/beginner/hatha/${item.id}`)}
                className="glass-card p-5 border-white/60 shadow-sm text-left"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
                    {translateText("Videos", language)}
                  </span>
                </div>
                <p className="text-body text-gray-600 mt-2">{item.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-deep-purple text-xs font-bold uppercase tracking-widest">
                  <PlayCircle size={16} />
                  {translateText("View Practice Videos", language)}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      ) : style.id === "iyengar" ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-section-title text-gray-900">{translateText("Iyengar Practice", language)}</h3>
            <span className="text-small-label text-gray-400">{iyengarItems.length} {translateText("items", language)}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {iyengarItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/practice/beginner/iyengar/${item.id}`)}
                className="glass-card p-5 border-white/60 shadow-sm text-left"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
                    {translateText("Videos", language)}
                  </span>
                </div>
                <p className="text-body text-gray-600 mt-2">{item.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-deep-purple text-xs font-bold uppercase tracking-widest">
                  <PlayCircle size={16} />
                  {translateText("View Practice Videos", language)}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-section-title text-gray-900">{translateText("Practice Videos", language)}</h3>
            <span className="text-small-label text-gray-400">{poses.length} {translateText("videos", language)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {poses.map((pose, index) => (
              <motion.button
                key={pose.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => navigate(`/practice/beginner/${style.id}/${pose.id}`)}
                className="group relative rounded-[28px] overflow-hidden text-left shadow-xl hover:shadow-2xl transition-all bg-gray-100"
              >
                <div className="relative w-full overflow-hidden pt-[75%]">
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
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                      <Play size={12} /> {translateText("Video", language)}
                    </span>
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

export default BeginnerPracticeVideos;

