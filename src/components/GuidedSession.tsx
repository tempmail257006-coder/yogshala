import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, ChevronLeft, CheckCircle2, Volume2, VolumeX, Zap, Wind, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { YOGSHALA_POSES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { useLanguage } from '../context/LanguageContext';
import { buildLocalizedPoseIntro, getLanguageLocale, localizeInstruction } from '../lib/i18n';
import { estimateSpeechDurationSeconds, resolveNativeTtsLang } from '../lib/ttsSupport';
import { usePracticeBackgroundMusic } from '../hooks/usePracticeBackgroundMusic';


const SESSIONS = {
  'warm-up': {
    title: 'Morning Warm-up',
    description: 'Gentle movements to wake up your body.',
    poses: ['sukhasana', 'bitilasana_marjaryasana', 'balasana', 'tadasana'],
    icon: Zap,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  'full-flow': {
    title: 'Full Body Flow',
    description: 'A complete practice for strength and flexibility.',
    poses: ['tadasana', 'vrikshasana', 'adho_mukha_svanasana', 'bhujangasana', 'setu_bandhasana', 'paschimottanasana', 'balasana'],
    icon: Zap,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  'cool-down': {
    title: 'Evening Cool-down',
    description: 'Relaxing poses to prepare for rest.',
    poses: ['balasana', 'paschimottanasana', 'baddha_konasana', 'sukhasana'],
    icon: Moon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  }
};

const GuidedSession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveWorkout } = useAuth();
  const { language } = useLanguage();
  const queryParams = new URLSearchParams(location.search);
  const sessionType = (queryParams.get('type') as keyof typeof SESSIONS) || 'warm-up';
  const session = SESSIONS[sessionType];

  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeechPriority, setIsSpeechPriority] = useState(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [preferredLang, setPreferredLang] = useState(getLanguageLocale(language));
  const [preferredGender, setPreferredGender] = useState<"male" | "female">("female");
  const [useSystemVoice, setUseSystemVoice] = useState(false);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechPriorityTimeoutRef = useRef<number | null>(null);
  const isNative = Capacitor.isNativePlatform();
  const canUseSpeech =
    isNative ||
    (typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined");
  const normalizeLang = (lang: string) => lang.toLowerCase().replace("_", "-");
  const femaleIndicators = ['female', 'zira', 'susan', 'linda', 'heather', 'sonia', 'catherine', 'eva'];
  const maleIndicators = ['male', 'david', 'mark', 'george', 'richard', 'tom'];
  const findGenderVoice = (voices: SpeechSynthesisVoice[], gender: "male" | "female") => {
    const indicators = gender === "male" ? maleIndicators : femaleIndicators;
    return voices.find((voice) => indicators.some((ind) => voice.name.toLowerCase().includes(ind))) ?? null;
  };
  const isMatchingLanguageVoice = (voice: SpeechSynthesisVoice | null | undefined) =>
    Boolean(voice && normalizeLang(voice.lang).startsWith(language === 'ta' ? 'ta' : 'en'));

  useEffect(() => {
    if (!canUseSpeech || isNative) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length === 0) return;

      const selectedVoice = selectedVoiceURI ? voices.find(v => v.voiceURI === selectedVoiceURI) : null;
      const hasSelected = Boolean(selectedVoice);
      if (selectedVoiceURI && !hasSelected) {
        setSelectedVoiceURI(null);
      }
      if (selectedVoice) {
        const selectedLang = normalizeLang(selectedVoice.lang);
        if (!selectedLang.startsWith(language === 'ta' ? 'ta' : 'en')) {
          setSelectedVoiceURI(null);
          setPreferredLang(getLanguageLocale(language));
        }
      }
      if (!hasSelected) {
        const matchingVoices = voices.filter(v => normalizeLang(v.lang).startsWith(language === 'ta' ? 'ta' : 'en'));
        const genderVoice = findGenderVoice(matchingVoices, preferredGender);
        const defaultVoice = genderVoice || matchingVoices[0] || null;
        if (defaultVoice) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
          setPreferredLang(defaultVoice.lang);
          setUseSystemVoice(false);
        } else {
          setSelectedVoiceURI(null);
          setPreferredLang(getLanguageLocale(language));
          setUseSystemVoice(false);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [canUseSpeech, isNative, language, preferredGender, selectedVoiceURI, useSystemVoice]);

  useEffect(() => {
    setPreferredLang(getLanguageLocale(language));
  }, [language]);

  const sessionPoses = session.poses.map(id => YOGSHALA_POSES.find(p => p.id === id)).filter(Boolean);
  const currentPose = sessionPoses[currentPoseIndex];
  usePracticeBackgroundMusic(isActive && !isFinished && Boolean(currentPose), isSpeechPriority);

  const prioritizeSpeech = (text: string) => {
    if (speechPriorityTimeoutRef.current) {
      window.clearTimeout(speechPriorityTimeoutRef.current);
    }
    setIsSpeechPriority(true);
    speechPriorityTimeoutRef.current = window.setTimeout(() => {
      setIsSpeechPriority(false);
      speechPriorityTimeoutRef.current = null;
    }, (estimateSpeechDurationSeconds(text, language) * 1000) + 400);
  };

  const clearSpeechPriority = () => {
    if (speechPriorityTimeoutRef.current) {
      window.clearTimeout(speechPriorityTimeoutRef.current);
      speechPriorityTimeoutRef.current = null;
    }
    setIsSpeechPriority(false);
  };

  useEffect(() => () => {
    clearSpeechPriority();
  }, []);

  useEffect(() => {
    if (currentPose) {
      setTimeLeft(currentPose.duration);
    }
  }, [currentPoseIndex]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (currentPoseIndex < sessionPoses.length - 1) {
        setCurrentPoseIndex(prev => prev + 1);
      } else {
        setIsActive(false);
        setIsFinished(true);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const speak = async (text: string) => {
    if (isMuted || !canUseSpeech) return;
    
    const selectedVoice = useSystemVoice
      ? null
      : availableVoices.find(v => v.voiceURI === selectedVoiceURI);
    const resolvedVoice = isMatchingLanguageVoice(selectedVoice) ? selectedVoice : null;
    const lang = resolvedVoice ? resolvedVoice.lang : preferredLang;

    if (isNative) {
      prioritizeSpeech(text);
      const nativeLang = await resolveNativeTtsLang(language, lang);
      TextToSpeech.speak({ text, lang: nativeLang, rate: 0.9, pitch: 1.0, volume: 0.7 }).catch((err) => {
        console.warn("Native TTS failed:", err);
      });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => prioritizeSpeech(text);
    utterance.onend = clearSpeechPriority;
    utterance.onerror = clearSpeechPriority;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.7;
    utterance.lang = lang;

    if (resolvedVoice) {
      utterance.voice = resolvedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
    speechRef.current = utterance;
  };

  useEffect(() => {
    if (isActive && currentPose) {
      speak(buildLocalizedPoseIntro(currentPose, language));
    }
  }, [isActive, currentPoseIndex, language]);

  const handleFinish = async () => {
    const totalDuration = sessionPoses.reduce((acc, p) => acc + (p?.duration || 0), 0);
    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;

    await saveWorkout({
      title: session.title,
      date: new Date().toLocaleString(),
      duration: `${minutes}m ${seconds}s`,
      calories: `${Math.round(totalDuration * 0.15)} kcal`,
      type: 'Guided',
      poses: sessionPoses.map(p => ({ poseId: p!.id, name: p!.name, duration: p!.duration }))
    });
    navigate('/history');
  };

  if (!currentPose) return null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-slate-950 pt-[env(safe-area-inset-top,0px)] pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]">
      <header className="p-4 sm:p-6 flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="text-center flex-1">
          <h2 className="font-bold text-slate-900 dark:text-white">{session.title}</h2>
          <p className="text-xs text-slate-500">Pose {currentPoseIndex + 1} of {sessionPoses.length}</p>
        </div>
        <div className="w-12 flex justify-end">
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="relative aspect-[4/3] rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-100">
          <img src={currentPose.imageUrl} alt={currentPose.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-black text-white break-words">{currentPose.name}</h3>
            <p className="text-primary font-bold italic">{currentPose.sanskritName}</p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200 dark:text-slate-800"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={553}
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 553 - (553 * (timeLeft / currentPose.duration)) }}
                className="text-primary"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums">
                {timeLeft}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seconds</span>
            </div>
          </div>

          <div className="w-full p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Wind size={18} className="text-primary" />
              <span>Breathing</span>
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              {currentPose.breathing}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 sm:gap-8">
          <button 
            onClick={() => setTimeLeft(currentPose.duration)}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
          >
            <RotateCcw size={24} />
          </button>

          <div className="flex-1 flex items-center justify-center">
            {isFinished ? (
              <button 
                onClick={handleFinish}
                className="w-full max-w-sm px-6 sm:px-12 py-4 sm:py-5 rounded-[2rem] bg-green-500 text-white font-bold shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center space-x-3 text-sm sm:text-lg"
              >
                <CheckCircle2 size={26} />
                <span>Complete Session</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsActive(!isActive)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 active:scale-95 transition-all"
              >
                {isActive ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" className="ml-1" />}
              </button>
            )}
          </div>

          <div className="w-12 sm:w-14" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default GuidedSession;
