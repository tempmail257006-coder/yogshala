import { useEffect, useRef } from "react";

const PRACTICE_BACKGROUND_MUSIC = "/audio/practice-background.mp4";
const PRACTICE_BACKGROUND_VOLUME = 0.32;
const FADE_STEP = 0.02;
const FADE_INTERVAL_MS = 80;

export const usePracticeBackgroundMusic = (isPlaying: boolean, isSpeechPriority = false) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof Audio === "undefined") {
      return;
    }

    const audio = new Audio(PRACTICE_BACKGROUND_MUSIC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audio.autoplay = false;
    audio.muted = false;
    audio.defaultMuted = false;
    audio.setAttribute("playsinline", "true");
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    return () => {
      if (fadeIntervalRef.current) {
        window.clearInterval(fadeIntervalRef.current);
      }
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetVolume = isPlaying ? PRACTICE_BACKGROUND_VOLUME : 0;

    if (fadeIntervalRef.current) {
      window.clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (isPlaying && audio.paused) {
      void audio.play().catch((error) => {
        console.warn("Background music playback failed:", error);
      });
    }

    fadeIntervalRef.current = window.setInterval(() => {
      const currentVolume = audio.volume;
      const difference = targetVolume - currentVolume;

      if (Math.abs(difference) <= FADE_STEP) {
        audio.volume = targetVolume;
        if (!isPlaying) {
          audio.pause();
        }
        if (fadeIntervalRef.current) {
          window.clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        return;
      }

      audio.volume = Math.max(0, Math.min(1, currentVolume + Math.sign(difference) * FADE_STEP));
    }, FADE_INTERVAL_MS);

    return () => {
      if (fadeIntervalRef.current) {
        window.clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, [isPlaying, isSpeechPriority]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        audio.pause();
        return;
      }

      if (isPlaying && audio.paused) {
        void audio.play().catch((error) => {
          console.warn("Background music resume failed:", error);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);
};
