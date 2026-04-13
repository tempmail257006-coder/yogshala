import { useEffect, useCallback, useRef } from 'react';

interface VoiceCommandOptions {
  onStart?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onReset?: () => void;
  onAdjustTimer?: (seconds: number) => void;
  enabled: boolean;
}

export const useVoiceCommands = ({
  onStart,
  onPause,
  onNext,
  onPrev,
  onReset,
  onAdjustTimer,
  enabled
}: VoiceCommandOptions) => {
  const recognitionRef = useRef<any>(null);

  const setupRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();

      if (command.includes('start') || command.includes('begin') || command.includes('play')) {
        onStart?.();
      } else if (command.includes('pause') || command.includes('stop') || command.includes('hold')) {
        onPause?.();
      } else if (command.includes('next')) {
        onNext?.();
      } else if (command.includes('previous') || command.includes('back')) {
        onPrev?.();
      } else if (command.includes('reset') || command.includes('restart')) {
        onReset?.();
      } else if (command.includes('add') && (command.includes('seconds') || command.includes('second'))) {
        const match = command.match(/\d+/);
        if (match) {
          onAdjustTimer?.(parseInt(match[0]));
        } else if (command.includes('thirty') || command.includes('30')) {
          onAdjustTimer?.(30);
        }
      } else if (command.includes('more time')) {
        onAdjustTimer?.(30);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'no-speech') {
        // Just restart if it timed out
        try {
          recognition.stop();
        } catch (e) {}
      }
    };

    recognition.onend = () => {
      if (enabled) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
  }, [onStart, onPause, onNext, onPrev, onReset, onAdjustTimer, enabled]);

  useEffect(() => {
    setupRecognition();
    const recognition = recognitionRef.current;

    if (enabled && recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [enabled, setupRecognition]);
};
