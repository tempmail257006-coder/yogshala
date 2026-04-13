import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Info, Volume2, Camera, Sparkles, X, Play, Pause } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { BEGINNER_HATHA_ITEMS, BEGINNER_IYENGAR_ITEMS } from "../beginnerPracticeData";
import { YOGSHALA_LEVELS, LEVEL_THEME } from "../YOGSHALALevels";
import { YOGSHALA_POSES } from "../constants";
import { YOGSHALAPose } from "../types";
import Webcam from "react-webcam";
import type { Pose } from "@mediapipe/pose";
import { useLanguage } from "../context/LanguageContext";
import { getLanguageLocale, localizeInstruction, localizePose, localizePracticeItem, localizeStyle, translateText } from "../lib/i18n";
import { buildSpeechStepTiming, estimateSpeechDurationSeconds, getSpeechStepIndex, isMatchingLanguageVoice, loadNativeVoices, resolveNativeTtsLang, type SelectableVoice } from "../lib/ttsSupport";
import { usePracticeBackgroundMusic } from "../hooks/usePracticeBackgroundMusic";

type PoseLandmark = { x: number; y: number; z?: number; visibility?: number };
type PoseTemplate = { id: string; name: string; features: number[] };

const LOCAL_POSE_LIBRARY = YOGSHALA_POSES.filter((pose) => pose.imageUrl?.startsWith("/images/")).map((pose) => ({
  id: pose.id,
  name: pose.name,
  src: pose.imageUrl,
}));

const POSE_ANGLE_POINTS: [number, number, number][] = [
  [11, 13, 15], // left elbow
  [12, 14, 16], // right elbow
  [13, 11, 23], // left shoulder
  [14, 12, 24], // right shoulder
  [11, 23, 25], // left hip
  [12, 24, 26], // right hip
  [23, 25, 27], // left knee
  [24, 26, 28], // right knee
];

const getAngle = (p1: PoseLandmark, p2: PoseLandmark, p3: PoseLandmark) => {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle / 180;
};

const buildPoseFeatures = (landmarks: PoseLandmark[] | undefined | null) => {
  if (!landmarks) return null;
  const features: number[] = [];
  for (const [a, b, c] of POSE_ANGLE_POINTS) {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    const p3 = landmarks[c];
    if (!p1 || !p2 || !p3) return null;
    features.push(getAngle(p1, p2, p3));
  }
  return features;
};

import { YogshalaLogoIcon } from "./YogshalaLogoIcon";

const BeginnerPracticeItemDetail: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { styleId, itemId } = useParams();
  const baseLevel = YOGSHALA_LEVELS.find((item) => item.id === "beginner");
  const level = baseLevel;
  const [instructionStep, setInstructionStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeechPriority, setIsSpeechPriority] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SelectableVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [preferredLang, setPreferredLang] = useState(getLanguageLocale(language));
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechPriorityTimeoutRef = useRef<number | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const poseRef = useRef<Pose | null>(null);
  const [detectedPoseName, setDetectedPoseName] = useState<string | null>(null);
  const [detectedConfidence, setDetectedConfidence] = useState(0);
  const [poseTemplates, setPoseTemplates] = useState<PoseTemplate[]>([]);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const poseTemplatesRef = useRef<PoseTemplate[]>([]);
  const templateLoadingRef = useRef(false);
  const templateErrorRef = useRef<string | null>(null);
  const isNative = Capacitor.isNativePlatform();
  const canUseSpeech =
    isNative ||
    (typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined");
  const theme = level ? LEVEL_THEME[level.id] : LEVEL_THEME.beginner;
  const styleItems =
    styleId === "hatha"
      ? BEGINNER_HATHA_ITEMS
      : styleId === "iyengar"
        ? BEGINNER_IYENGAR_ITEMS
        : null;
  const baseItem = styleItems ? styleItems.find((entry) => entry.id === itemId) ?? null : null;
  const item = baseItem ? localizePracticeItem(baseItem, language) : null;
  const baseStyle = baseLevel?.styles.find((entry) => entry.id === styleId);
  const style = baseStyle ? localizeStyle(baseStyle, language) : null;

  useEffect(() => {
    setInstructionStep(0);
    setShowInstructions(false);
    setIsTimerActive(false);
  }, [itemId, styleId]);

  useEffect(() => {
    return () => {
      if (isNative) {
        void TextToSpeech.stop().catch(() => undefined);
      } else if (canUseSpeech) {
        window.speechSynthesis.cancel();
      }
    };
  }, [canUseSpeech, isNative]);

  useEffect(() => {
    poseTemplatesRef.current = poseTemplates;
  }, [poseTemplates]);

  useEffect(() => {
    templateLoadingRef.current = isTemplateLoading;
  }, [isTemplateLoading]);

  useEffect(() => {
    templateErrorRef.current = templateError;
  }, [templateError]);

  const loadPoseTemplates = useCallback(async () => {
    if (isTemplateLoading || poseTemplatesRef.current.length > 0) return;
    templateLoadingRef.current = true;
    setIsTemplateLoading(true);
    setTemplateError(null);
    try {
      const { Pose } = await import("@mediapipe/pose");
      const templatePose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      templatePose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const templates: PoseTemplate[] = [];

      for (const pose of LOCAL_POSE_LIBRARY) {
        const landmarks = await new Promise<PoseLandmark[] | null>((resolve) => {
          const img = new Image();
          img.onload = async () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

              let resolved = false;
              templatePose.onResults((results) => {
                if (resolved) return;
                resolved = true;
                resolve((results.poseLandmarks as PoseLandmark[] | undefined) ?? null);
              });
              await templatePose.send({ image: canvas });
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = pose.src;
        });

        const features = buildPoseFeatures(landmarks);
        if (features) {
          templates.push({ id: pose.id, name: pose.name, features });
        }
      }

      if (typeof templatePose.close === "function") {
        templatePose.close();
      }

      setPoseTemplates(templates);
      if (templates.length === 0) {
        setTemplateError(translateText("Pose library couldn't be loaded.", language));
      }
    } catch (err) {
      console.error("Template loading failed:", err);
      setTemplateError(translateText("Pose library couldn't be loaded.", language));
    } finally {
      setIsTemplateLoading(false);
      templateLoadingRef.current = false;
    }
  }, [isTemplateLoading, language]);

  useEffect(() => {
    if (!canUseSpeech) return;

    if (isNative) {
      void loadNativeVoices(language).then((voices) => {
        setAvailableVoices(voices);
      });
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices() as SelectableVoice[];
      setAvailableVoices(voices);
      if (voices.length === 0) return;
      const selectedVoice = selectedVoiceURI ? voices.find((v) => v.voiceURI === selectedVoiceURI) : null;
      const hasSelected = Boolean(selectedVoice);
      if (selectedVoiceURI && !hasSelected) {
        setSelectedVoiceURI(null);
      }
      if (selectedVoice) {
        if (!isMatchingLanguageVoice(selectedVoice, language)) {
          setSelectedVoiceURI(null);
          setPreferredLang(getLanguageLocale(language));
        }
      }
      if (!hasSelected) {
        const defaultVoice = voices.find((voice) => isMatchingLanguageVoice(voice, language)) ?? null;
        if (defaultVoice) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
          setPreferredLang(defaultVoice.lang);
        } else {
          setSelectedVoiceURI(null);
          setPreferredLang(getLanguageLocale(language));
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [canUseSpeech, isNative, language, selectedVoiceURI]);

  useEffect(() => {
    setPreferredLang(getLanguageLocale(language));
  }, [language]);

  const clearSpeechPriority = useCallback(() => {
    if (speechPriorityTimeoutRef.current) {
      window.clearTimeout(speechPriorityTimeoutRef.current);
      speechPriorityTimeoutRef.current = null;
    }
    setIsSpeechPriority(false);
  }, []);

  const prioritizeSpeech = useCallback((text: string) => {
    if (speechPriorityTimeoutRef.current) {
      window.clearTimeout(speechPriorityTimeoutRef.current);
    }
    setIsSpeechPriority(true);
    speechPriorityTimeoutRef.current = window.setTimeout(() => {
      setIsSpeechPriority(false);
      speechPriorityTimeoutRef.current = null;
    }, (estimateSpeechDurationSeconds(text, language) * 1000) + 400);
  }, [language]);

  useEffect(() => () => {
    clearSpeechPriority();
  }, [clearSpeechPriority]);

  if (!level || !styleId) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Practice item not found", language)}</h2>
        <button
          onClick={() => navigate("/practice/beginner")}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Practice Types", language)}
        </button>
      </div>
    );
  }

  const directPose = itemId ? YOGSHALA_POSES.find((entry) => entry.id === itemId) : null;
  const localizedDirectPose = directPose ? localizePose(directPose, language) : null;

  if (styleId === "hatha" && !item && !directPose) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Practice item not found", language)}</h2>
        <button
          onClick={() => navigate("/practice/beginner/hatha")}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Hatha Practice", language)}
        </button>
      </div>
    );
  }

  if (styleId === "iyengar" && !item) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Practice item not found", language)}</h2>
        <button
          onClick={() => navigate("/practice/beginner/iyengar")}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Iyengar Practice", language)}
        </button>
      </div>
    );
  }

  const formatDuration = (seconds?: number) => {
    const total = Math.max(0, seconds ?? 0);
    const minutes = Math.floor(total / 60);
    const remaining = total % 60;
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  };

  const renderCollection = () => {
    if (!item || item.type !== "collection") return null;
    const poses = item.poseIds
      .map((id) => YOGSHALA_POSES.find((pose) => pose.id === id))
      .filter(Boolean)
      .map((pose) => localizePose(pose as YOGSHALAPose, language)) as YOGSHALAPose[];

    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-section-title text-gray-900">{translateText("Practice Library", language)}</h3>
          <span className="text-small-label text-gray-400">{poses.length} {translateText("poses", language)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {poses.map((pose, index) => (
            <motion.button
              key={pose.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => navigate(`/practice/beginner/hatha/${pose.id}`)}
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                    {translateText("Guided steps", language)}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white">{pose.name}</h4>
                <p className="text-white/70 text-xs">{pose.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    );
  };

  const pose =
    styleId === "hatha"
      ? item && item.type === "pose"
        ? (() => {
            const matchedPose = YOGSHALA_POSES.find((entry) => entry.id === item.poseId);
            return matchedPose ? localizePose(matchedPose, language) : null;
          })()
        : localizedDirectPose
      : styleId === "iyengar"
        ? null
        : localizedDirectPose;
  const isSinglePractice =
    styleId === "hatha"
      ? Boolean((item && (item.type === "pose" || item.type === "custom")) || (!item && directPose))
      : styleId === "iyengar"
        ? Boolean(item && item.type === "custom")
        : Boolean(directPose);
  const isCustom = item?.type === "custom";
  const customItem = isCustom ? item : null;
  const title = pose ? pose.name : item?.title ?? translateText("Practice Flow", language);
  const subtitle = pose ? pose.sanskritName : customItem?.subtitle;
  const description = pose ? pose.description : item?.description ?? "";
  const steps = pose ? pose.instructions : customItem?.steps ?? [];
  const spokenSteps = (pose ? pose.instructions : customItem?.steps ?? []).map((step) => localizeInstruction(step, language));
  const baseDurationSeconds = pose ? pose.duration : customItem?.durationSeconds ?? 30;
  const speechTiming = useMemo(
    () => buildSpeechStepTiming(spokenSteps, language, baseDurationSeconds),
    [spokenSteps, language, baseDurationSeconds]
  );
  const durationSeconds = speechTiming.totalDuration;
  const stepDurations = speechTiming.stepDurations;
  usePracticeBackgroundMusic(isTimerActive && Boolean(item || pose), isSpeechPriority);

  const selectedVoice = useMemo(
    () => availableVoices.find((voice) => voice.voiceURI === selectedVoiceURI) ?? null,
    [availableVoices, selectedVoiceURI]
  );

  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!isTimerActive) return;
    if (timeLeft <= 0) {
      setIsTimerActive(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handleToggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(durationSeconds);
    }
    const newIsTimerActive = !isTimerActive;
    setIsTimerActive(newIsTimerActive);
    if (newIsTimerActive) {
      speak(currentStepText);
    } else if (isNative) {
      void TextToSpeech.stop().catch(() => undefined);
    } else if (canUseSpeech) {
      window.speechSynthesis.cancel();
    }
  };

  const handleReset = () => {
    setTimeLeft(durationSeconds);
    setIsTimerActive(false);
    setInstructionStep(0);
  };

  const speak = async (text: string) => {
    if (!isVoiceEnabled || !canUseSpeech || !text) return;
    const resolvedVoice = isMatchingLanguageVoice(selectedVoice, language) ? selectedVoice : null;
    const lang = await resolveNativeTtsLang(language, resolvedVoice ? resolvedVoice.lang : preferredLang);

    if (isNative) {
      prioritizeSpeech(text);
      await TextToSpeech.speak({
        text,
        lang,
        rate: 0.92,
        pitch: 1,
        volume: 0.7,
        voice: typeof resolvedVoice?.voiceIndex === "number" ? resolvedVoice.voiceIndex : undefined,
      }).catch((err) => {
        console.warn("Native TTS failed:", err);
      });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => prioritizeSpeech(text);
    utterance.onend = clearSpeechPriority;
    utterance.onerror = clearSpeechPriority;
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 0.7;
    utterance.lang = lang;
    if (resolvedVoice) {
      utterance.voice = resolvedVoice;
    }
    window.speechSynthesis.speak(utterance);
    speechRef.current = utterance;
  };

  const currentStepText = spokenSteps[instructionStep] ?? "";

  useEffect(() => {
    if (!isVoiceEnabled || !currentStepText || !isTimerActive) return;
    speak(currentStepText);
  }, [instructionStep, isVoiceEnabled, currentStepText, isTimerActive]);

  useEffect(() => {
    if (isTimerActive && steps.length > 0) {
      const elapsedSeconds = Math.max(0, durationSeconds - timeLeft);
      const currentStep = getSpeechStepIndex(elapsedSeconds, stepDurations);
      
      if (currentStep < steps.length) {
        setInstructionStep(currentStep);
      }
    }
  }, [timeLeft, isTimerActive, durationSeconds, stepDurations, steps.length]);

  useEffect(() => {
    if (!canUseSpeech) return;
    if (!isVoiceEnabled) {
      if (isNative) {
        void TextToSpeech.stop().catch(() => undefined);
      } else {
        window.speechSynthesis.cancel();
      }
    }
  }, [isVoiceEnabled, canUseSpeech, isNative]);

  useEffect(() => {
    if (showCamera) {
      loadPoseTemplates();
    } else {
      setDetectedPoseName(null);
      setDetectedConfidence(0);
    }
  }, [showCamera, loadPoseTemplates]);

  useEffect(() => {
    if (!showCamera) return;

    let isMounted = true;
    let camera: { start?: () => void; stop?: () => void } | null = null;

    const initPose = async () => {
      try {
        const [{ Pose }, cameraUtils] = await Promise.all([
          import("@mediapipe/pose"),
          import("@mediapipe/camera_utils"),
        ]);

        if (!isMounted) return;

        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!results.poseLandmarks) return;
          const landmarks = results.poseLandmarks as PoseLandmark[];
          const liveFeatures = buildPoseFeatures(landmarks);
          const templates = poseTemplatesRef.current;

          if (templateLoadingRef.current) {
            setDetectedPoseName(translateText("Loading pose library...", language));
            setDetectedConfidence(0);
            return;
          }
          if (templateErrorRef.current) {
            setDetectedPoseName(translateText("Pose library unavailable", language));
            setDetectedConfidence(0);
            return;
          }
          if (!liveFeatures || templates.length === 0) {
            setDetectedPoseName(translateText("Pose not recognized", language));
            setDetectedConfidence(0);
            return;
          }

          let bestScore = -Infinity;
          let bestTemplate: PoseTemplate | null = null;
          for (const template of templates) {
            let diffSum = 0;
            for (let i = 0; i < liveFeatures.length; i++) {
              diffSum += Math.abs(liveFeatures[i] - template.features[i]);
            }
            const diff = diffSum / liveFeatures.length;
            const score = 1 - diff;
            if (score > bestScore) {
              bestScore = score;
              bestTemplate = template;
            }
          }

          const matchScore = Math.max(0, Math.min(1, bestScore));
          const confidenceScore = Math.round(matchScore * 100);
          const isRecognized = matchScore >= 0.6;
          const displayName = bestTemplate
            ? isRecognized
              ? bestTemplate.name
              : `${translateText("Likely", language)} ${bestTemplate.name}`
            : translateText("Pose not recognized", language);
          setDetectedPoseName(displayName);
          setDetectedConfidence(confidenceScore);
        });

        poseRef.current = pose;
        if (webcamRef.current?.video) {
          camera = new cameraUtils.Camera(webcamRef.current.video, {
            onFrame: async () => {
              if (webcamRef.current?.video) {
                await pose.send({ image: webcamRef.current.video });
              }
            },
            width: 640,
            height: 480,
          });
          camera.start?.();
        }
      } catch (err) {
        console.error("Pose initialization failed:", err);
        setDetectedPoseName(translateText("Pose tracking isn't supported.", language));
        setDetectedConfidence(0);
      }
    };

    initPose();

    return () => {
      isMounted = false;
      if (camera?.stop) {
        camera.stop();
      }
      if (poseRef.current && typeof poseRef.current.close === "function") {
        poseRef.current.close();
      }
    };
  }, [showCamera, language]);
  if (styleId === "hatha" && item?.type === "collection") {
    return (
      <div className="page-shell space-y-8">
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate("/practice/beginner/hatha")}
            className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-gray-500 border-white/60 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-small-label text-gray-400 uppercase tracking-widest">{style?.name ?? translateText("Hatha Practice", language)}</p>
            <h1 className="text-large-title text-gray-900">{item.title}</h1>
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
              {level.title} • {item.title}
            </div>
            <p className="text-body text-gray-700">{item.description}</p>
          </div>
        </motion.section>

        {renderCollection()}
      </div>
    );
  }

  if (styleId === "hatha" && item?.type === "pose" && !pose) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Practice item not found", language)}</h2>
        <button
          onClick={() => navigate("/practice/beginner/hatha")}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Hatha Practice", language)}
        </button>
      </div>
    );
  }

  if (!isSinglePractice) {
    return (
      <div className="page-shell flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{translateText("Practice item not found", language)}</h2>
        <button
          onClick={() => navigate(`/practice/beginner/${styleId}`)}
          className="px-6 py-3 rounded-2xl bg-deep-purple text-white font-bold shadow-lg"
        >
          {translateText("Back to Practice Library", language)}
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <header className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/practice/beginner/${styleId}`)}
          className="w-12 h-12 glass-card flex items-center justify-center text-gray-600"
        >
          <ChevronLeft size={24} />
        </motion.button>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-2 rounded-full glass-card text-[10px] font-bold uppercase tracking-widest text-deep-purple">
            {translateText("Level", language)} {level.level}
          </span>
          <button
            onClick={() => setIsVoiceEnabled((prev) => !prev)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isVoiceEnabled ? "bg-ocean-blue text-white shadow-lg shadow-ocean-blue/30" : "glass-card text-gray-400"
            }`}
          >
            <Volume2 size={20} />
          </button>
          <button
            onClick={() => {
              setShowCamera((prev) => !prev);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              showCamera ? "bg-warm-orange text-white shadow-lg shadow-warm-orange/30" : "glass-card text-gray-400"
            }`}
          >
            <Camera size={20} />
          </button>
          <button
            onClick={() => navigate("/chat", { state: { initialQuery: `I'm practicing ${title}. Can you give me some tips?`, currentPose: title } })}
            className="w-10 h-10 rounded-full flex items-center justify-center glass-card shadow-lg shadow-deep-purple/10 p-0 overflow-hidden"
          >
            <YogshalaLogoIcon size={20} className="w-full h-full" />
          </button>
        </div>
      </header>

      <motion.div
        layout
        className="relative aspect-[4/3] w-full rounded-[32px] overflow-hidden glass-card shadow-2xl border-white/40 bg-black/5"
      >
        {showCamera ? (
          <div className="relative w-full h-full">
            <Webcam
              ref={webcamRef}
              className="w-full h-full object-cover"
              mirrored
              audio={false}
              videoConstraints={{ facingMode: "user" }}
              disablePictureInPicture={true}
              forceScreenshotSourceSize={true}
              imageSmoothing={true}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              onUserMedia={() => setCameraError(null)}
              onUserMediaError={() => setCameraError(translateText("Camera permission denied or not supported on this device.", language))}
            />
            {detectedPoseName && (
              <div className="absolute top-4 left-4 px-4 py-3 rounded-2xl glass-card text-gray-800 shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {translateText("Detected:", language)} {detectedPoseName}
                  {detectedConfidence > 0 ? ` (${detectedConfidence}%)` : ""}
                </span>
              </div>
            )}
          </div>
        ) : pose ? (
          <img
            src={pose.imageUrl}
            alt={pose.name}
            className="w-full h-full object-contain bg-gray-100"
            referrerPolicy="no-referrer"
          />
        ) : null}
      </motion.div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-large-title text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-body text-deep-purple font-medium italic">{subtitle}</p>
            )}
          </div>
          <div className="glass-card px-4 py-3 border-deep-purple/20 flex items-center gap-3">
            <span className="text-3xl font-bold text-deep-purple tabular-nums">
              {formatDuration(timeLeft)}
            </span>
            <button
              onClick={handleToggleTimer}
              className="w-10 h-10 rounded-full bg-deep-purple text-white flex items-center justify-center shadow-lg shadow-deep-purple/30"
            >
              {isTimerActive ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-section-title text-gray-900">{translateText("Step-by-step Guide", language)}</h4>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowInstructions(true)} className="text-deep-purple">
                <Info size={20} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-body text-gray-600">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-deep-purple/10 text-deep-purple flex items-center justify-center text-xs font-bold">
                {instructionStep + 1}
              </span>
              <span>{steps[instructionStep]}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-small-label text-gray-400">
                {translateText("Step", language)} {instructionStep + 1} {translateText("of", language)} {steps.length}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-white/60 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-deep-purple">
            <Info size={18} />
            <h3 className="text-small-label uppercase tracking-widest font-bold">{translateText("About", language)}</h3>
          </div>
          <p className="text-body text-gray-600 leading-relaxed">{description}</p>
        </motion.section>
      </div>

      {showInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            className="w-full max-w-md glass-card bg-white/90 p-8 space-y-6 shadow-3xl"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-large-title text-gray-900">{title}</h3>
                {subtitle && <p className="text-body text-deep-purple italic">{subtitle}</p>}
              </div>
              <button onClick={() => setShowInstructions(false)} className="text-gray-400">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
              <section className="space-y-3">
                <h4 className="text-section-title text-gray-900">{translateText("Instructions", language)}</h4>
                <ul className="space-y-4">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start space-x-4 text-body text-gray-600">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-deep-purple/10 text-deep-purple flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInstructions(false)}
              className="w-full py-5 rounded-2xl bg-deep-purple text-white font-bold shadow-xl shadow-deep-purple/20"
            >
              {translateText("Got it", language)}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BeginnerPracticeItemDetail;

