import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Info, CheckCircle2, Trophy, AlertTriangle, ShieldCheck, Wind, Zap } from 'lucide-react';
import { YOGSHALA_POSES } from '../constants';
import { YOGSHALAPose } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { localizePose, translateText } from '../lib/i18n';

const CATEGORIES = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Meditation', 'Stretching', 'Back Pain Relief', 'Weight Loss'];

const PoseLibrary: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPose, setSelectedPose] = useState<YOGSHALAPose | null>(null);
  const localizedPoses = YOGSHALA_POSES.map((pose) => localizePose(pose, language));
  const featuredPose = localizedPoses[0];

  const filteredPoses = localizedPoses.filter(pose => {
    const matchesCategory = selectedCategory === 'All' || pose.category === selectedCategory || pose.difficulty === selectedCategory;
    const matchesSearch = pose.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         pose.sanskritName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-shell space-y-8">
      <header className="space-y-1">
        <h1 className="text-large-title text-gray-900">{translateText("Pose Library", language)}</h1>
        <p className="text-body text-gray-500">{translateText("Master every movement with precision", language)}</p>
      </header>

      {/* Featured Pose */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] shadow-2xl shadow-deep-purple/20 group cursor-pointer bg-gray-100"
        onClick={() => setSelectedPose(featuredPose)}
      >
        <div className="relative w-full overflow-hidden pt-[75%]">
          <img 
            src={featuredPose.imageUrl} 
            alt="Featured Pose" 
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-white/80 text-small-label">
              <Zap size={14} className="text-warm-orange" />
              <span>{translateText("Pose of the Day", language)}</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{featuredPose.name}</h3>
          </div>
          <div className="glass-card px-4 py-2 text-white text-xs font-bold border-white/20">
            {translateText("Learn More", language)}
          </div>
        </div>
      </motion.section>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={translateText("Search poses...", language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 glass-card bg-white/40 border-white/60 outline-none focus:ring-2 focus:ring-deep-purple transition-all shadow-sm"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all
                ${selectedCategory === cat
                  ? "bg-deep-purple text-white shadow-xl shadow-deep-purple/20"
                  : "glass-card bg-white/40 text-gray-500 border-white/60"}
              `}
            >
              {translateText(cat, language)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredPoses.map((pose, i) => (
          <motion.div
            key={pose.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedPose(pose)}
            className="group relative aspect-[4/3] rounded-[32px] overflow-hidden bg-gray-100 cursor-pointer shadow-md hover:shadow-2xl transition-all"
          >
            <img
              src={pose.imageUrl}
              alt={pose.name}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className={`
                px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block
                ${pose.difficulty === 'Beginner' ? "bg-ocean-blue text-white" :
                  pose.difficulty === 'Intermediate' ? "bg-warm-orange text-white" : "bg-deep-purple text-white"}
              `}>
                {pose.difficulty}
              </span>
              <h3 className="text-xl font-bold text-white">{pose.name}</h3>
              <p className="text-white/70 text-xs italic">{pose.sanskritName}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-2xl bg-white rounded-t-[40px] sm:rounded-[40px] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="relative w-full overflow-hidden pt-[75%] bg-gray-100 flex-shrink-0">
                <img
                  src={selectedPose.imageUrl}
                  alt={selectedPose.name}
                  className="absolute inset-0 w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedPose(null)}
                  className="absolute top-8 right-8 w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-white hover:bg-white/20 transition-all border-white/20"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="px-3 py-1 rounded-full bg-deep-purple text-white text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                    {selectedPose.difficulty}
                  </span>
                  <h2 className="text-4xl font-bold text-white">{selectedPose.name}</h2>
                  <p className="text-white/80 italic text-lg">{selectedPose.sanskritName}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                <section className="space-y-4">
                  <div className="flex items-center space-x-2 text-deep-purple">
                    <Info size={18} />
                    <h4 className="text-small-label uppercase tracking-widest font-bold">{translateText("About", language)}</h4>
                  </div>
                  <p className="text-body text-gray-600 leading-relaxed">
                    {selectedPose.description}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="space-y-6">
                    <div className="flex items-center space-x-2 text-ocean-blue">
                      <CheckCircle2 size={18} />
                      <h4 className="text-small-label uppercase tracking-widest font-bold">{translateText("Steps", language)}</h4>
                    </div>
                    <ul className="space-y-5">
                      {selectedPose.instructions.map((step, i) => (
                        <li key={i} className="flex items-start space-x-4">
                          <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-ocean-blue/10 text-ocean-blue flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-body text-gray-600">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <div className="space-y-10">
                    <section className="space-y-4">
                      <div className="flex items-center space-x-2 text-soft-pink">
                        <Wind size={18} />
                        <h4 className="text-small-label uppercase tracking-widest font-bold">{translateText("Breathing", language)}</h4>
                      </div>
                      <div className="p-5 rounded-[24px] bg-soft-pink/5 border border-soft-pink/10 text-body text-gray-600 italic">
                        {selectedPose.breathing}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center space-x-2 text-warm-orange">
                        <Trophy size={18} />
                        <h4 className="text-small-label uppercase tracking-widest font-bold">{translateText("Benefits", language)}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPose.benefits.map((benefit, i) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-warm-orange/10 text-warm-orange text-xs font-bold">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="space-y-4">
                    <div className="flex items-center space-x-2 text-red-500">
                      <AlertTriangle size={18} />
                      <h4 className="text-small-label uppercase tracking-widest font-bold">{translateText("Mistakes", language)}</h4>
                    </div>
                    <ul className="space-y-3">
                      {selectedPose.commonMistakes.map((mistake, i) => (
                        <li key={i} className="flex items-center space-x-3 text-body text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <ShieldCheck size={18} />
                      <h4 className="text-small-label uppercase tracking-widest font-bold">{translateText("Safety", language)}</h4>
                    </div>
                    <ul className="space-y-3">
                      {selectedPose.safetyTips.map((tip, i) => (
                        <li key={i} className="flex items-center space-x-3 text-body text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={() => setSelectedPose(null)}
                  className="w-full py-5 rounded-2xl bg-deep-purple text-white font-bold shadow-2xl shadow-deep-purple/20 active:scale-[0.98] transition-all"
                >
                  {translateText("Got it, thanks!", language)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PoseLibrary;

