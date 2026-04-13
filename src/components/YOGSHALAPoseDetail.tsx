import React from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Info, CheckCircle2, Trophy, Wind, ShieldCheck } from "lucide-react";
import { YOGSHALA_LEVELS, LEVEL_THEME } from "../YOGSHALALevels";
import { YOGSHALA_POSES } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import { localizeLevel, localizePose, translateText } from "../lib/i18n";

const YOGSHALAPoseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { levelId, poseId } = useParams();
  const baseLevel = YOGSHALA_LEVELS.find((item) => item.id === levelId);
  const basePose = YOGSHALA_POSES.find((item) => item.id === poseId);
  const level = baseLevel ? localizeLevel(baseLevel, language) : null;
  const pose = basePose ? localizePose(basePose, language) : null;

  if (!level || !pose) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Pose not found", language)}</h2>
        <p className="text-body text-gray-500">{translateText("Please choose a pose from the level library.", language)}</p>
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

  return (
    <div className="page-shell space-y-8">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/levels/${level.id}`)}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-gray-500 border-white/60 shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-small-label text-gray-400 uppercase tracking-widest">{level.title}</p>
          <h1 className="text-large-title text-gray-900">{pose.name}</h1>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[32px] overflow-hidden shadow-2xl bg-gray-100"
      >
        <div className="relative w-full overflow-hidden pt-[75%]">
          {pose.videoUrl ? (
            <video
              src={pose.videoUrl}
              poster={pose.imageUrl}
              controls
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          ) : (
            <img
              src={pose.imageUrl}
              alt={pose.name}
              className="absolute inset-0 w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
            {pose.difficulty}
          </span>
          <h2 className="text-3xl font-bold text-white">{pose.name}</h2>
          <p className="text-white/80 italic">{pose.sanskritName}</p>
        </div>
      </motion.section>

      <section className="glass-card p-6 border-white/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-deep-purple">
          <Info size={18} />
          <h3 className="text-small-label uppercase tracking-widest font-bold">{translateText("About", language)}</h3>
        </div>
        <p className="text-body text-gray-600 leading-relaxed">{pose.description}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-white/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-ocean-blue">
            <CheckCircle2 size={18} />
            <h3 className="text-small-label uppercase tracking-widest font-bold">{translateText("Steps", language)}</h3>
          </div>
          <ul className="space-y-4">
            {pose.instructions.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-ocean-blue/10 text-ocean-blue flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-body text-gray-600">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-white/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-soft-pink">
              <Wind size={18} />
              <h3 className="text-small-label uppercase tracking-widest font-bold">{translateText("Breathing", language)}</h3>
            </div>
            <p className="text-body text-gray-600 italic">{pose.breathing}</p>
          </div>

          <div className="glass-card p-6 border-white/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-warm-orange">
              <Trophy size={18} />
              <h3 className="text-small-label uppercase tracking-widest font-bold">{translateText("Benefits", language)}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {pose.benefits.map((benefit) => (
                <span key={benefit} className="px-3 py-2 rounded-xl bg-warm-orange/10 text-warm-orange text-xs font-bold">
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-6 border-white/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-500">
          <ShieldCheck size={18} />
          <h3 className="text-small-label uppercase tracking-widest font-bold">{translateText("Safety Tips", language)}</h3>
        </div>
        <ul className="space-y-3">
          {pose.safetyTips.map((tip) => (
            <li key={tip} className="flex items-center gap-3 text-body text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default YOGSHALAPoseDetail;

