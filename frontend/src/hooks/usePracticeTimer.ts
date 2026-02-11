import { useState, useRef, useCallback, useEffect } from 'react';
import type { PracticeSession } from '../types';

export function usePracticeTimer() {
  const [session, setSession] = useState<PracticeSession>({
    startTime: 0,
    elapsedSeconds: 0,
    correctFrames: 0,
    totalFrames: 0,
    isActive: false,
  });

  const intervalRef = useRef<number>(0);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const start = useCallback(() => {
    const now = Date.now();
    setSession({
      startTime: now,
      elapsedSeconds: 0,
      correctFrames: 0,
      totalFrames: 0,
      isActive: true,
    });

    intervalRef.current = window.setInterval(() => {
      setSession((prev) => ({
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - now) / 1000),
      }));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setSession((prev) => ({ ...prev, isActive: false }));
    return sessionRef.current;
  }, []);

  const recordFrame = useCallback((isCorrect: boolean) => {
    setSession((prev) => ({
      ...prev,
      totalFrames: prev.totalFrames + 1,
      correctFrames: prev.correctFrames + (isCorrect ? 1 : 0),
    }));
  }, []);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    session,
    start,
    stop,
    recordFrame,
    formatTime: () => formatTime(session.elapsedSeconds),
    correctRate:
      session.totalFrames > 0
        ? Math.round((session.correctFrames / session.totalFrames) * 100)
        : 0,
  };
}
