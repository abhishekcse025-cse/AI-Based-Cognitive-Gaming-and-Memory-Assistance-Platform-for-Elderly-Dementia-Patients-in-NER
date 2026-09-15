import React, { createContext, useCallback, useContext, useState } from 'react';
import type { MiraSessionState, MiraState } from '../types/types';
import { useMiraVoiceState } from '../hooks/useMiraVoiceState';

// ─── Context Shape ──────────────────────────────────────────────────────────

interface MiraContextValue {
  session: MiraSessionState;
  activate: () => void;
  dismiss: () => void;
  togglePanel: () => void;
  setResponseText: (text: string) => void;
  setErrorMessage: (msg: string) => void;
  reset: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const INITIAL_SESSION: MiraSessionState = {
  state: 'idle',
  transcript: null,
  responseText: null,
  errorMessage: null,
  isPanelExpanded: false,
};

// ─── Context ─────────────────────────────────────────────────────────────────

const MiraContext = createContext<MiraContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function MiraContextProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MiraSessionState>(INITIAL_SESSION);

  const { startListening, stopListening } = useMiraVoiceState({
    onTranscript: useCallback((transcript: string) => {
      setSession(prev => ({ ...prev, transcript, state: 'processing' }));
    }, []),
    onStateChange: useCallback((state: MiraState) => {
      setSession(prev => ({ ...prev, state }));
    }, []),
    onError: useCallback((msg: string) => {
      setSession(prev => ({
        ...prev,
        state: 'error',
        errorMessage: msg,
      }));
    }, []),
  });

  const activate = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isPanelExpanded: true,
      state: 'listening',
      transcript: null,
      responseText: null,
      errorMessage: null,
    }));
    startListening();
  }, [startListening]);

  const dismiss = useCallback(() => {
    stopListening();
    setSession(prev => ({
      ...prev,
      isPanelExpanded: false,
      state: 'idle',
    }));
  }, [stopListening]);

  const togglePanel = useCallback(() => {
    setSession(prev => ({ ...prev, isPanelExpanded: !prev.isPanelExpanded }));
  }, []);

  const setResponseText = useCallback((responseText: string) => {
    setSession(prev => ({ ...prev, responseText, state: 'speaking' }));
  }, []);

  const setErrorMessage = useCallback((errorMessage: string) => {
    setSession(prev => ({ ...prev, errorMessage, state: 'error' }));
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setSession(INITIAL_SESSION);
  }, [stopListening]);

  return (
    <MiraContext.Provider
      value={{ session, activate, dismiss, togglePanel, setResponseText, setErrorMessage, reset }}
    >
      {children}
    </MiraContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMira(): MiraContextValue {
  const ctx = useContext(MiraContext);
  if (!ctx) {
    throw new Error('useMira must be used within MiraContextProvider');
  }
  return ctx;
}
