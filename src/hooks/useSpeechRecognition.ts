import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
  languageCode?: string;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (message: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export function useSpeechRecognition({
  languageCode = 'en-US',
  onInterimTranscript,
  onFinalTranscript,
  onError,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Feature detect — window.SpeechRecognition or webkit prefix
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const getSpeechRecognitionClass = (): typeof SpeechRecognition | null => {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
  };

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass) {
      onError?.("Voice recognition isn't available in this browser. Please try Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = languageCode;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          onFinalTranscript?.(text);
        } else {
          onInterimTranscript?.(text);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      const friendlyMessages: Record<string, string> = {
        'no-speech': "I didn't catch anything — please try again.",
        'audio-capture': "Microphone access is needed. Please allow it and try again.",
        'not-allowed': "Microphone permission was denied. Please enable it in your browser settings.",
        'network': "A network issue occurred. Please check your connection.",
        'aborted': '',
      };
      const msg = friendlyMessages[event.error] ?? "Something went wrong. Let's try again.";
      if (msg) onError?.(msg);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [languageCode, onInterimTranscript, onFinalTranscript, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
