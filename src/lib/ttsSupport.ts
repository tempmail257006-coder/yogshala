import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import type { AppLanguage } from "./i18n";
import { getLanguageLocale } from "./i18n";

export type SelectableVoice = SpeechSynthesisVoice & { voiceIndex?: number };
export type VoiceGender = "male" | "female";

const TAMIL_TTS_PROMPTED_KEY = "yogshala_tamil_tts_prompted";

const canPromptForTamilTts = () =>
  typeof window !== "undefined" &&
  Capacitor.isNativePlatform() &&
  Capacitor.getPlatform() === "android";

const wasPrompted = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(TAMIL_TTS_PROMPTED_KEY) === "1";
};

const markPrompted = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TAMIL_TTS_PROMPTED_KEY, "1");
};

export const resetTamilTtsPrompt = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TAMIL_TTS_PROMPTED_KEY);
};

export const ensureTamilTtsInstalled = async () => {
  if (!canPromptForTamilTts() || wasPrompted()) return;

  try {
    const [taIn, ta] = await Promise.all([
      TextToSpeech.isLanguageSupported({ lang: "ta-IN" }),
      TextToSpeech.isLanguageSupported({ lang: "ta" }),
    ]);

    if (taIn.supported || ta.supported) {
      return;
    }

    markPrompted();
    await TextToSpeech.openInstall();
  } catch (error) {
    console.warn("Tamil TTS install prompt failed:", error);
  }
};

const nativeLangCache = new Map<string, string>();

export const resolveNativeTtsLang = async (language: AppLanguage, preferredLang: string) => {
  if (!Capacitor.isNativePlatform()) {
    return preferredLang;
  }

  const candidates =
    language === "ta" ? ["ta-IN", "ta"] : [preferredLang, "en-US", "en"];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const cached = nativeLangCache.get(candidate);
    if (cached) {
      return cached;
    }

    try {
      const { supported } = await TextToSpeech.isLanguageSupported({ lang: candidate });
      if (supported) {
        nativeLangCache.set(candidate, candidate);
        return candidate;
      }
    } catch {
      // Ignore probe failures and keep trying the next candidate.
    }
  }

  return preferredLang;
};

const normalizeLang = (lang: string) => lang.toLowerCase().replace("_", "-");
const femaleIndicators = ["female", "zira", "susan", "linda", "heather", "sonia", "catherine", "eva"];
const maleIndicators = ["male", "david", "mark", "george", "richard", "tom", "james", "alex"];

const getLanguagePrefix = (language: AppLanguage) => (language === "ta" ? "ta" : "en");

export const isMatchingLanguageVoice = (
  voice: Pick<SelectableVoice, "lang"> | null | undefined,
  language: AppLanguage
) => Boolean(voice && normalizeLang(voice.lang).startsWith(getLanguagePrefix(language)));

export const getLanguageVoices = <T extends SelectableVoice>(voices: T[], language: AppLanguage) =>
  voices.filter((voice) => isMatchingLanguageVoice(voice, language));

const findGenderVoice = <T extends SelectableVoice>(voices: T[], gender: "male" | "female") => {
  const indicators = gender === "male" ? maleIndicators : femaleIndicators;
  return voices.find((voice) => indicators.some((indicator) => voice.name.toLowerCase().includes(indicator))) ?? null;
};

export const resolveGenderVoices = <T extends SelectableVoice>(voices: T[], language: AppLanguage) => {
  const matchingVoices = getLanguageVoices(voices, language);
  const femaleHint = findGenderVoice(matchingVoices, "female");
  const maleHint = findGenderVoice(matchingVoices, "male");

  const femaleVoice = femaleHint ?? matchingVoices[0] ?? null;
  const maleVoice =
    (maleHint && maleHint.voiceURI !== femaleVoice?.voiceURI ? maleHint : null) ??
    matchingVoices.find((voice) => voice.voiceURI !== femaleVoice?.voiceURI) ??
    null;

  return {
    matchingVoices,
    femaleVoice,
    maleVoice,
    hasDistinctGenderVoices: Boolean(femaleVoice && maleVoice && femaleVoice.voiceURI !== maleVoice.voiceURI),
  };
};

export const loadNativeVoices = async (language: AppLanguage) => {
  if (!Capacitor.isNativePlatform()) {
    return [] as SelectableVoice[];
  }

  try {
    const { voices } = await TextToSpeech.getSupportedVoices();
    return getLanguageVoices(
      voices.map((voice, index) => ({
        ...voice,
        voiceIndex: index,
      })),
      language
    );
  } catch (error) {
    console.warn("Failed to load native voices:", error);
    return [] as SelectableVoice[];
  }
};

export const getGenderVoiceStyle = (gender: VoiceGender) =>
  gender === "male"
    ? { pitch: 0.82, rate: 0.9 }
    : { pitch: 1.06, rate: 0.95 };

const getVoicePreviewText = (language: AppLanguage) =>
  language === "ta"
    ? "இது தமிழ் குரல் சோதனை. படிப்படியான வழிகாட்டி இப்போது சரியாக வாசிக்கப்பட வேண்டும்."
    : "This is an English voice test. The step-by-step guide should now read clearly.";

export const playVoicePreview = async (language: AppLanguage) => {
  const text = getVoicePreviewText(language);
  const preferredLang = getLanguageLocale(language);

  if (language === "ta") {
    await ensureTamilTtsInstalled();
  }

  if (Capacitor.isNativePlatform()) {
    const nativeLang = await resolveNativeTtsLang(language, preferredLang);
    await TextToSpeech.speak({
      text,
      lang: nativeLang,
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
    });
    return;
  }

  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return;
  }

  const normalizeLang = (lang: string) => lang.toLowerCase().replace("_", "-");
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice =
    voices.find((voice) => normalizeLang(voice.lang).startsWith(language === "ta" ? "ta" : "en")) ?? null;

  window.speechSynthesis.cancel();
  utterance.lang = matchingVoice?.lang ?? preferredLang;
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

export const estimateSpeechDurationSeconds = (text: string, language: AppLanguage) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return 0;

  const words = normalized.split(" ").filter(Boolean).length;
  const letters = normalized.replace(/\s+/g, "").length;
  const wordsPerMinute = language === "ta" ? 95 : 130;
  const charsPerSecond = language === "ta" ? 8.5 : 12;
  const wordSeconds = (words / wordsPerMinute) * 60;
  const charSeconds = letters / charsPerSecond;

  return Math.max(4, Math.ceil(Math.max(wordSeconds, charSeconds) + 1.5));
};

export const buildSpeechStepTiming = (
  steps: string[],
  language: AppLanguage,
  minimumTotalDuration = 0
) => {
  const estimatedDurations = steps.map((step) => estimateSpeechDurationSeconds(step, language));
  const estimatedTotal = estimatedDurations.reduce((sum, value) => sum + value, 0);
  const totalDuration = Math.max(Math.ceil(minimumTotalDuration), estimatedTotal);

  if (estimatedDurations.length === 0) {
    return { totalDuration, stepDurations: [] as number[] };
  }

  if (estimatedTotal === 0) {
    const evenDuration = Math.max(1, Math.floor(totalDuration / estimatedDurations.length));
    const stepDurations = estimatedDurations.map(() => evenDuration);
    stepDurations[stepDurations.length - 1] += totalDuration - (evenDuration * estimatedDurations.length);
    return { totalDuration, stepDurations };
  }

  const scale = totalDuration / estimatedTotal;
  const scaledDurations = estimatedDurations.map((duration) => duration * scale);
  const baseDurations = scaledDurations.map((duration) => Math.max(1, Math.floor(duration)));
  let remainder = totalDuration - baseDurations.reduce((sum, value) => sum + value, 0);

  const fractions = scaledDurations
    .map((duration, index) => ({ index, fraction: duration - Math.floor(duration) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remainder; i += 1) {
    const target = fractions[i % fractions.length];
    baseDurations[target.index] += 1;
  }

  return { totalDuration, stepDurations: baseDurations };
};

export const getSpeechStepIndex = (elapsedSeconds: number, stepDurations: number[]) => {
  if (stepDurations.length === 0) return 0;

  let cumulative = 0;
  for (let i = 0; i < stepDurations.length; i += 1) {
    cumulative += stepDurations[i];
    if (elapsedSeconds < cumulative) {
      return i;
    }
  }

  return stepDurations.length - 1;
};
