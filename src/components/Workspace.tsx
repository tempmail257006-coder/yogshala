import { Play, Pause, RotateCcw, Camera, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Info, X, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Webcam from 'react-webcam';
import type { Pose } from '@mediapipe/pose';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { useAuth } from '../context/AuthContext';
import { YOGSHALA_POSES } from '../constants';
import { YOGSHALA_LEVELS, LEVEL_THEME } from '../YOGSHALALevels';
import { YOGSHALALevel } from '../types';
import PermissionWarning from './PermissionWarning';
import { useLanguage } from '../context/LanguageContext';
import { getLanguageLocale, localizeInstruction, localizeLevel, localizePose, translateText } from '../lib/i18n';
import { buildSpeechStepTiming, estimateSpeechDurationSeconds, getSpeechStepIndex, isMatchingLanguageVoice, loadNativeVoices, resolveNativeTtsLang, type SelectableVoice } from '../lib/ttsSupport';
import { usePracticeBackgroundMusic } from '../hooks/usePracticeBackgroundMusic';
import { YogshalaLogoIcon } from './YogshalaLogoIcon';

type PoseLandmark = { x: number; y: number; z?: number; visibility?: number };
type PoseTemplate = { id: string; name: string; features: number[] };

const LOCAL_POSE_LIBRARY = YOGSHALA_POSES.filter((pose) => pose.imageUrl && !pose.imageUrl.startsWith("https://")).map((pose) => ({
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

const Workspace: React.FC = () => {
  const { saveWorkout, permissionError, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedLevelId, setSelectedLevelId] = useState<YOGSHALALevel["id"] | null>(null);
  const [showLevelPicker, setShowLevelPicker] = useState(true);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [poseFeedback, setPoseFeedback] = useState<string | null>(null);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [detectedPoseName, setDetectedPoseName] = useState<string | null>(null);
  const [detectedConfidence, setDetectedConfidence] = useState(0);
  const [poseTemplates, setPoseTemplates] = useState<PoseTemplate[]>([]);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [completedPoses, setCompletedPoses] = useState<{ poseId: string, name: string, duration: number }[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [instructionStep, setInstructionStep] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSpeechPriority, setIsSpeechPriority] = useState(false);

  const [availableVoices, setAvailableVoices] = useState<SelectableVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [preferredLang, setPreferredLang] = useState(getLanguageLocale(language));

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechPriorityTimeoutRef = useRef<number | null>(null);
  const isNative = Capacitor.isNativePlatform();
  const canUseSpeech =
    isNative ||
    (typeof window !== "undefined" &&
      "speechSynthesis"in window &&
      typeof SpeechSynthesisUtterance !== "undefined");
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

      const selectedVoice = selectedVoiceURI ? voices.find(v => v.voiceURI === selectedVoiceURI) : null;
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
        const defaultVoice = voices.find(v => isMatchingLanguageVoice(v, language)) ?? null;
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

  const speak = async (text: string) => {
    if (!isVoiceEnabled || !canUseSpeech) return;
    
    const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
    const resolvedVoice = isMatchingLanguageVoice(selectedVoice, language) ? selectedVoice : null;
    const lang = resolvedVoice ? resolvedVoice.lang : preferredLang;

    if (isNative) {
      prioritizeSpeech(text);
      const nativeLang = await resolveNativeTtsLang(language, lang);
      TextToSpeech.speak({
        text,
        lang: nativeLang,
        rate: 0.92,
        pitch: 1,
        volume: 0.7,
        voice: typeof resolvedVoice?.voiceIndex === 'number' ? resolvedVoice.voiceIndex : undefined,
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

  const selectedLevel = useMemo(() => {
    const level = YOGSHALA_LEVELS.find((item) => item.id === selectedLevelId) || null;
    return level ? localizeLevel(level, language) : null;
  }, [selectedLevelId, language]);

  const selectedLevelPoses = useMemo(() => {
    if (!selectedLevel) return [];
    return selectedLevel.poseIds
      .map((id) => YOGSHALA_POSES.find((pose) => pose.id === id))
      .filter(Boolean)
      .map((pose) => localizePose(pose as typeof YOGSHALA_POSES[number], language)) as typeof YOGSHALA_POSES;
  }, [selectedLevel, language]);

  const practicePoses = selectedLevel ? selectedLevelPoses : [];
  const currentPose = practicePoses[currentPoseIndex];
  const poseSpeechTimings = useMemo(
    () =>
      practicePoses.map((pose) => buildSpeechStepTiming(
        pose.instructions.map((step) => localizeInstruction(step, language)),
        language,
        pose.duration
      )),
    [practicePoses, language]
  );
  const currentPoseTiming = poseSpeechTimings[currentPoseIndex] ?? { totalDuration: currentPose?.duration ?? 0, stepDurations: [] as number[] };
  const currentPoseDuration = currentPoseTiming.totalDuration;
  usePracticeBackgroundMusic(isActive && !isFinished && Boolean(currentPose), isSpeechPriority);
  const webcamRef = useRef<Webcam>(null);
  const poseRef = useRef<Pose | null>(null);
  const poseTemplatesRef = useRef<PoseTemplate[]>([]);
  const templateLoadingRef = useRef(false);
  const templateErrorRef = useRef<string | null>(null);

  const mapProfileLevel = (level?: string | null): YOGSHALALevel["id"] | null => {
    if (!level) return null;
    const normalized = level.toLowerCase();
    if (normalized.startsWith("beginner")) return "beginner";
    if (normalized.startsWith("intermediate")) return "intermediate";
    if (normalized.startsWith("advanced")) return "advanced";
    return null;
  };

  useEffect(() => {
    setShowLevelPicker(true);
  }, []);

  useEffect(() => {
    if (selectedLevelId) return;
    const fromProfile = mapProfileLevel(profile?.YOGSHALALevel);
    if (fromProfile) {
      setSelectedLevelId(fromProfile);
    }
    setShowLevelPicker(true);
  }, [profile?.YOGSHALALevel, selectedLevelId]);

  useEffect(() => {
    const levelParam = searchParams.get("level");
    if (!levelParam || selectedLevelId) return;
    const normalized = levelParam.toLowerCase();
    if (normalized === "beginner" || normalized === "intermediate" || normalized === "advanced") {
      setSelectedLevelId(normalized as YOGSHALALevel["id"]);
      setShowLevelPicker(false);
    }
  }, [searchParams, selectedLevelId]);

  useEffect(() => {
    if (!selectedLevel || selectedLevelPoses.length === 0) return;
    setCurrentPoseIndex(0);
    setTimeLeft(poseSpeechTimings[0]?.totalDuration ?? selectedLevelPoses[0].duration);
    setIsActive(false);
    setIsFinished(false);
    setCompletedPoses([]);
    setInstructionStep(0);
  }, [selectedLevel, selectedLevelPoses, poseSpeechTimings]);

  useEffect(() => {
    setInstructionStep(0);
  }, [currentPoseIndex, selectedLevelId]);

  const recordPose = useCallback((index: number, timeRemaining: number) => {
    const pose = practicePoses[index];
    const totalDuration = poseSpeechTimings[index]?.totalDuration ?? pose?.duration ?? 0;
    if (!pose) return;
    const timeSpent = totalDuration - timeRemaining;
    if (timeSpent > 0) {
      setCompletedPoses(prev => [...prev, {
        poseId: pose.id,
        name: pose.name,
        duration: timeSpent
      }]);
    }
  }, [practicePoses, poseSpeechTimings]);

  const handleNext = useCallback(() => {
    if (currentPoseIndex < practicePoses.length - 1) {
      recordPose(currentPoseIndex, timeLeft);
      setCurrentPoseIndex(prev => prev + 1);
      setTimeLeft(poseSpeechTimings[currentPoseIndex + 1]?.totalDuration ?? practicePoses[currentPoseIndex + 1].duration);
      setIsActive(false);
      setInstructionStep(0);
    }
  }, [currentPoseIndex, practicePoses, poseSpeechTimings, recordPose, timeLeft]);

  const handlePrev = useCallback(() => {
    if (currentPoseIndex > 0) {
      recordPose(currentPoseIndex, timeLeft);
      setCurrentPoseIndex(prev => prev - 1);
      setTimeLeft(poseSpeechTimings[currentPoseIndex - 1]?.totalDuration ?? practicePoses[currentPoseIndex - 1].duration);
      setIsActive(false);
      setInstructionStep(0);
    }
  }, [currentPoseIndex, practicePoses, poseSpeechTimings, recordPose, timeLeft]);

  const handleReset = useCallback(() => {
    setTimeLeft(currentPoseDuration);
    setIsActive(false);
  }, [currentPoseDuration]);

  const handleAdjustTimer = useCallback((seconds: number) => {
    setTimeLeft(prev => prev + seconds);
  }, []);

  const handleSelectLevel = useCallback((levelId: YOGSHALALevel["id"]) => {
    setSelectedLevelId(levelId);
    setShowLevelPicker(false);
  }, []);

  useEffect(() => {
    if (!currentPose) return;

    const currentStepText = localizeInstruction(currentPose.instructions[instructionStep], language);

    if (isActive) {
      if (isVoiceEnabled && currentStepText) {
        speak(currentStepText);
      }
    } else if (canUseSpeech) {
      if (isNative) {
        TextToSpeech.stop().catch(() => undefined);
      } else {
        window.speechSynthesis.cancel();
      }
    }
  }, [isActive, instructionStep, isVoiceEnabled, currentPose, canUseSpeech, isNative, language]);

  useEffect(() => {
    if (!canUseSpeech) {
      setIsVoiceEnabled(false);
    }
  }, [canUseSpeech]);

  useEffect(() => {
    if (showCamera) {
      setCameraError(null);
    }
  }, [showCamera]);

  useEffect(() => {
    if (!showCamera) {
      setDetectedPoseName(null);
      setDetectedConfidence(0);
    }
  }, [showCamera]);

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
      const { Pose } = await import('@mediapipe/pose');
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
    if (showCamera) {
      loadPoseTemplates();
    }
  }, [showCamera, loadPoseTemplates]);


  useEffect(() => {
    if (isActive && currentPose && currentPose.instructions.length > 0) {
      const steps = currentPose.instructions;
      const elapsedSeconds = Math.max(0, currentPoseDuration - timeLeft);
      const currentStep = getSpeechStepIndex(elapsedSeconds, currentPoseTiming.stepDurations);
      
      if (currentStep < steps.length) {
        setInstructionStep(currentStep);
      }
    }
  }, [timeLeft, isActive, currentPose, currentPoseDuration, currentPoseTiming.stepDurations]);



  useEffect(() => {
    if (practicePoses.length === 0) return;
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (currentPoseIndex === practicePoses.length - 1) {
        setIsFinished(true);
      } else {
        handleNext();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentPoseIndex, handleNext, practicePoses.length]);

  const handleFinish = async () => {
    if (!currentPose) return;
    const lastPoseTimeSpent = currentPoseDuration - timeLeft;
    const finalPoses = [...completedPoses];
    if (lastPoseTimeSpent > 0) {
      finalPoses.push({
        poseId: currentPose.id,
        name: currentPose.name,
        duration: lastPoseTimeSpent
      });
    }

    const totalSeconds = finalPoses.reduce((acc, p) => acc + p.duration, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    await saveWorkout({
      title: selectedLevel ? `YOGSHALA Practice · ${selectedLevel.title}` : 'YOGSHALA Practice',
      date: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: `${minutes}m ${seconds}s`,
      calories: `${Math.round(totalSeconds * 0.15)} kcal`,
      type: 'Routine',
      poses: finalPoses
    });
    navigate('/history');
  };

  useEffect(() => {
    if (!currentPose || !showCamera) return;

    let isMounted = true;
    let camera: { start?: () => void; stop?: () => void } | null = null;

    const initPose = async () => {
      try {
        const [{ Pose }, cameraUtils] = await Promise.all([
          import('@mediapipe/pose'),
          import('@mediapipe/camera_utils'),
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
          if (results.poseLandmarks) {
            const landmarks = results.poseLandmarks as PoseLandmark[];
            let isCorrect = false;
            let feedback = translateText("Analyzing pose...", language);
            let currentConfidence = 0;

            const liveFeatures = buildPoseFeatures(landmarks);
            const templates = poseTemplatesRef.current;
            if (templateLoadingRef.current) {
              setDetectedPoseName(translateText("Loading pose library...", language));
              setDetectedConfidence(0);
              feedback = translateText("Loading pose library...", language);
            } else if (templateErrorRef.current) {
              setDetectedPoseName(translateText("Pose library unavailable", language));
              setDetectedConfidence(0);
              feedback = translateText("Pose library unavailable.", language);
            } else if (!liveFeatures || templates.length === 0) {
              setDetectedPoseName(translateText("Pose not recognized", language));
              setDetectedConfidence(0);
              feedback = translateText("Pose not recognized.", language);
            } else {
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
              const isRecognized = matchScore >= 0.7;
              const displayName = bestTemplate
                ? (isRecognized ? bestTemplate.name : `${translateText("Likely", language)} ${bestTemplate.name}`)
                : translateText("Pose not recognized", language);
              setDetectedPoseName(displayName);
              setDetectedConfidence(confidenceScore);
              currentConfidence = confidenceScore;

              const expectedTemplate = templates.find((template) => template.id === currentPose.id) ?? null;
              if (!expectedTemplate) {
                isCorrect = false;
                feedback = language === "ta"
                  ? "இந்த ஆசனத்திற்கு கேமரா கண்டறிதல் கிடைக்கவில்லை."
                  : "Camera detection isn't available for this pose.";
              } else if (!bestTemplate || !isRecognized) {
                isCorrect = false;
                feedback = language === "ta"
                  ? `${expectedTemplate.name} ஆசனத்தைப் போலச் செய்ய முயற்சிக்கவும்.`
                  : `Try to match ${expectedTemplate.name}.`;
              } else {
                isCorrect = bestTemplate.id === expectedTemplate.id;
                feedback = isCorrect
                  ? (language === "ta" ? `சரியான ஆசனம்: ${expectedTemplate.name}.` : `Correct pose: ${expectedTemplate.name}.`)
                  : (language === "ta"
                      ? `${bestTemplate.name} கண்டறியப்பட்டது. ${expectedTemplate.name} ஆசனத்தை முயற்சிக்கவும்.`
                      : `Detected ${bestTemplate.name}. Try ${expectedTemplate.name}.`);
              }
            }

            setIsPoseCorrect(isCorrect);
            setPoseFeedback(feedback);
            setConfidence(Math.round(currentConfidence));
          }
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
        setIsPoseCorrect(false);
        setPoseFeedback(translateText("Camera/pose tracking isn't supported on this device.", language));
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
  }, [showCamera, currentPose, language]);

  if (showLevelPicker || !selectedLevel || practicePoses.length === 0 || !currentPose) {
    return (
      <div className="page-shell space-y-8">
        {permissionError && <PermissionWarning />}

        <header className="flex items-start sm:items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (selectedLevelId) {
                setShowLevelPicker(false);
              } else {
                navigate(-1);
              }
            }}
            className="w-12 h-12 glass-card flex items-center justify-center text-gray-600"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <div>
            <h1 className="text-large-title text-gray-900">{translateText("Practice Levels", language)}</h1>
            <p className="text-body text-gray-500">{translateText("Select your level to begin practice", language)}</p>
          </div>
        </header>

        <div className="space-y-4">
          {YOGSHALA_LEVELS.map((level) => {
            const localizedLevel = localizeLevel(level, language);
            const theme = LEVEL_THEME[level.id];
            const isSelected = selectedLevelId === level.id;
            return (
              <motion.button
                key={level.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectLevel(level.id)}
                className={`w-full text-left rounded-[24px] p-4 sm:p-5 border shadow-sm bg-gradient-to-br ${theme.gradient} ${
                  isSelected ? "border-deep-purple/40" : "border-white/60"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
                    {translateText("Level", language)} {localizedLevel.level}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-widest ${theme.accent}`}>
                    {localizedLevel.difficulty}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mt-3">{localizedLevel.title}</h4>
                <p className="text-body text-gray-600 mt-2">{localizedLevel.shortDescription}</p>
              </motion.button>
            );
          })}
        </div>

      </div>
    );
  }

  return (
    <div className="page-shell flex flex-col space-y-6">
      {permissionError && <PermissionWarning />}
      
      <header className="flex flex-wrap items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-12 h-12 glass-card flex items-center justify-center text-gray-600"
        >
          <ChevronLeft size={24} />
        </motion.button>
        
        <div className="ml-auto flex items-center justify-end flex-wrap gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowLevelPicker(true)}
            className="px-3 py-2 rounded-full glass-card text-[10px] font-bold uppercase tracking-widest text-deep-purple text-center"
          >
            {selectedLevel ? `${translateText("Level", language)} ${selectedLevel.level}` : translateText("Select Level", language)}
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isVoiceEnabled ? "bg-ocean-blue text-white shadow-lg shadow-ocean-blue/30" : "glass-card text-gray-400"
            }`}
          >
            <Volume2 size={20} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowCamera(!showCamera);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              showCamera ? "bg-warm-orange text-white shadow-lg shadow-warm-orange/30" : "glass-card text-gray-400"
            }`}
          >
            <Camera size={20} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/chat', { state: { initialQuery: `I'm currently practicing ${currentPose.name}. Can you give me some tips for this pose?`, currentPose: currentPose.name } })}
            className="w-10 h-10 rounded-full flex items-center justify-center glass-card shadow-lg shadow-deep-purple/10 p-0 overflow-hidden"
          >
            <YogshalaLogoIcon size={20} className="w-full h-full" />
          </motion.button>
        </div>
      </header>

      {/* Center Area: Video / Camera / Image */}
      <motion.div 
        layout
        className="relative aspect-[4/3] w-full rounded-[24px] sm:rounded-[32px] overflow-hidden glass-card shadow-2xl border-white/40 bg-black/5"
      >
        <AnimatePresence mode="wait">
          {showCamera ? (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
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
              {cameraError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                  <div className="mx-6 rounded-2xl bg-white/90 px-5 py-4 text-center text-sm font-semibold text-gray-800 shadow-xl">
                    {cameraError}
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-auto z-10">
                <AnimatePresence>
                  {poseFeedback && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`px-3 sm:px-4 py-3 rounded-2xl glass-card flex items-start sm:items-center space-x-3 max-w-full sm:max-w-md ${
                        isPoseCorrect ? "text-green-600" : "text-warm-orange"
                      }`}
                    >
                      {isPoseCorrect ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      <div className="flex flex-col">
                        {detectedPoseName && (
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {translateText("Detected:", language)} {detectedPoseName}
                            {detectedConfidence > 0 ? ` (${detectedConfidence}%)` : ""}
                          </span>
                        )}
                        <span className="text-sm font-bold">{poseFeedback}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${confidence}%` }}
                              className={`h-full ${confidence > 80 ? "bg-green-500" : "bg-warm-orange"}`}
                            />
                          </div>
                          <span className="text-[10px] font-bold">{confidence}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : currentPose ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full bg-gray-100"
            >
              <img
                src={currentPose.imageUrl}
                alt={currentPose.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Pose Info & Timer */}
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end">
          <div className="space-y-1">
            <h3 className="text-large-title text-gray-900">{currentPose.name}</h3>
            <p className="text-body text-deep-purple font-medium italic">{currentPose.sanskritName}</p>
          </div>
          <div className="glass-card w-fit px-5 sm:px-6 py-3 border-deep-purple/20">
            <span className="text-2xl sm:text-3xl font-bold text-deep-purple tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Instructions Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-section-title text-gray-900">{translateText("Step-by-step Guide", language)}</h4>
            <button onClick={() => setShowInstructions(true)} className="text-deep-purple">
              <Info size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-body text-gray-600">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-deep-purple/10 text-deep-purple flex items-center justify-center text-xs font-bold">
                {instructionStep + 1}
              </span>
              <span>{currentPose.instructions[instructionStep]}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-small-label text-gray-400">
                {translateText("Step", language)} {instructionStep + 1} {translateText("of", language)} {currentPose.instructions.length}
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Controls */}
      <div className="pb-24">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={currentPoseIndex === 0}
            className="w-12 h-12 sm:w-14 sm:h-14 glass-card flex items-center justify-center text-gray-400 disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div className="flex-1 min-w-0 flex items-center justify-center gap-4 sm:gap-6 relative z-10">
            {isFinished ? (
              <motion.button 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleFinish}
                className="w-full max-w-sm px-6 sm:px-10 py-4 sm:py-5 rounded-3xl bg-green-500 text-white font-bold shadow-xl shadow-green-500/30 flex items-center justify-center space-x-3 text-sm sm:text-base"
              >
                <CheckCircle2 size={24} />
                <span>{translateText("Finish Session", language)}</span>
              </motion.button>
            ) : (
              <>
                <motion.button 
                  whileHover={{ rotate: -45 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleReset}
                  className="w-12 h-12 sm:w-14 sm:h-14 glass-card flex items-center justify-center text-gray-400"
                >
                  <RotateCcw size={24} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsActive(!isActive)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-animated-gradient text-white flex items-center justify-center shadow-2xl shadow-deep-purple/30"
                >
                  {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </motion.button>
              </>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={currentPoseIndex === practicePoses.length - 1}
            className="w-12 h-12 sm:w-14 sm:h-14 glass-card flex items-center justify-center text-gray-400 disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </div>

      {/* Full Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="w-full max-w-md glass-card bg-white/90 p-6 sm:p-8 space-y-6 shadow-3xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-large-title text-gray-900">{currentPose.name}</h3>
                  <p className="text-body text-deep-purple italic">{currentPose.sanskritName}</p>
                </div>
                <button onClick={() => setShowInstructions(false)} className="text-gray-400">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                <section className="space-y-3">
                  <h4 className="text-section-title text-gray-900">{translateText("Instructions", language)}</h4>
                  <ul className="space-y-4">
                    {currentPose.instructions.map((step, i) => (
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

      </AnimatePresence>
    </div>
  );
};

export default Workspace;
