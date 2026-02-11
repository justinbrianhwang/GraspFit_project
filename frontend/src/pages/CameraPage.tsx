import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SwitchCamera, Circle, Square, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useCamera } from '../hooks/useCamera';
import { useGripAnalysis } from '../hooks/useGripAnalysis';
import { usePracticeTimer } from '../hooks/usePracticeTimer';
import HandOverlay from '../components/camera/HandOverlay';
import GripIndicator from '../components/camera/GripIndicator';
import PracticeTimer from '../components/camera/PracticeTimer';
import Modal from '../components/common/Modal';
import './CameraPage.css';

export default function CameraPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoElRef = useRef<HTMLVideoElement>(null);
  const camera = useCamera();
  const grip = useGripAnalysis();
  const timer = usePracticeTimer();

  const [isPracticing, setIsPracticing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ w: 640, h: 480 });
  const [modelsLoading, setModelsLoading] = useState(true);

  // Warning beep state
  const wasCorrectRef = useRef<boolean | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playWarningBeep = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  // Initialize models on mount
  useEffect(() => {
    grip.initMediaPipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (grip.mpReady && grip.modelReady) {
      setModelsLoading(false);
    }
  }, [grip.mpReady, grip.modelReady]);

  // Start camera when models are ready
  useEffect(() => {
    if (!modelsLoading && videoElRef.current) {
      camera.start(videoElRef.current);
    }
    return () => {
      camera.stop();
      grip.stopAnalysis();
      grip.destroyMediaPipe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelsLoading]);

  const handleVideoResize = () => {
    if (videoElRef.current) {
      setVideoDimensions({
        w: videoElRef.current.videoWidth || 640,
        h: videoElRef.current.videoHeight || 480,
      });
    }
  };

  // Record frames for timer
  useEffect(() => {
    if (isPracticing && grip.lastResult) {
      timer.recordFrame(grip.lastResult.isCorrectGrip);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grip.lastResult, isPracticing]);

  // Warning beep on correct → incorrect transition
  useEffect(() => {
    if (!isPracticing || !grip.lastResult) return;
    const isCorrect = grip.lastResult.isCorrectGrip;
    if (wasCorrectRef.current === true && !isCorrect) {
      playWarningBeep();
    }
    wasCorrectRef.current = isCorrect;
  }, [grip.lastResult, isPracticing, playWarningBeep]);

  const handleStartPractice = () => {
    if (!videoElRef.current) return;
    setIsPracticing(true);
    timer.start();
    grip.startAnalysis(videoElRef.current);
  };

  const handleStopPractice = () => {
    setIsPracticing(false);
    wasCorrectRef.current = null;
    const session = timer.stop();
    const lastMse = grip.lastResult?.reconstructionError ?? 0;
    const lastConfidence = grip.lastResult?.confidence ?? 0;
    grip.stopAnalysis();
    if (session.totalFrames > 0) {
      setShowResult(true);
      // Save record to backend
      if (user?.id) {
        const correctRate = session.totalFrames > 0
          ? Math.round((session.correctFrames / session.totalFrames) * 100)
          : 0;
        api.saveRecord({
          userId: user.id,
          isCorrect: session.correctFrames > session.totalFrames / 2,
          mseScore: lastMse,
          confidence: lastConfidence,
          durationSeconds: session.elapsedSeconds,
          correctRate,
        }).catch(console.error);
      }
    }
  };

  const handleBack = () => {
    camera.stop();
    grip.stopAnalysis();
    grip.destroyMediaPipe();
    navigate('/');
  };

  return (
    <div className="camera-page">
      <div className="camera-header">
        <button className="cam-nav-btn" onClick={handleBack}>
          <ArrowLeft size={22} />
        </button>
        <h1>그립 분석</h1>
        {camera.isActive && (
          <button className="cam-nav-btn" onClick={camera.switchCamera}>
            <SwitchCamera size={20} />
          </button>
        )}
      </div>

      <div className="camera-container">
        {modelsLoading && (
          <div className="loading-overlay">
            <div className="loading-anim">
              <div className="loading-spinner" />
              <div className="loading-ring" />
            </div>
            <p className="loading-title">AI 모델을 불러오는 중...</p>
            <div className="loading-steps">
              <div className={`loading-step ${grip.mpReady ? 'done' : 'active'}`}>
                <div className="step-dot" />
                <span>손 인식 모델</span>
              </div>
              <div className={`loading-step ${grip.modelReady ? 'done' : grip.mpReady ? 'active' : ''}`}>
                <div className="step-dot" />
                <span>분석 모델</span>
              </div>
            </div>
          </div>
        )}

        {camera.error && (
          <div className="error-overlay">
            <p>{camera.error}</p>
          </div>
        )}

        <video
          ref={videoElRef}
          className="camera-view"
          playsInline
          muted
          onLoadedMetadata={handleVideoResize}
        />

        {/* Red overlay for incorrect grip */}
        <div
          className={`grip-feedback-overlay${
            isPracticing && grip.lastResult && !grip.lastResult.isCorrectGrip && grip.handDetected
              ? ' incorrect-active'
              : ''
          }`}
        />

        {isPracticing && (
          <HandOverlay
            landmarks={grip.rawLandmarks}
            isCorrect={grip.lastResult?.isCorrectGrip ?? false}
            videoWidth={videoDimensions.w}
            videoHeight={videoDimensions.h}
          />
        )}

        {isPracticing && (
          <>
            <div className="overlay-top-left">
              <PracticeTimer
                time={timer.formatTime()}
                correctRate={timer.correctRate}
                isActive={timer.session.isActive}
              />
            </div>
            <div className="overlay-top-right">
              <GripIndicator
                isCorrect={grip.lastResult?.isCorrectGrip ?? null}
                confidence={grip.lastResult?.confidence ?? 0}
                handDetected={grip.handDetected}
                mse={grip.lastResult?.reconstructionError}
                threshold={grip.threshold}
              />
            </div>
          </>
        )}
      </div>

      <div className="camera-controls">
        {!isPracticing ? (
          <button
            className="record-btn"
            onClick={handleStartPractice}
            disabled={modelsLoading || !camera.isActive}
          >
            <div className="record-btn-inner">
              <Circle size={32} fill="#fff" />
            </div>
          </button>
        ) : (
          <button className="record-btn recording" onClick={handleStopPractice}>
            <div className="record-btn-inner">
              <Square size={24} fill="#fff" />
            </div>
          </button>
        )}
        <span className="record-hint">
          {isPracticing ? '종료하려면 탭하세요' : modelsLoading ? '모델 로딩 중...' : '시작하려면 탭하세요'}
        </span>
      </div>

      <Modal isOpen={showResult} onClose={() => setShowResult(false)}>
        <div className="result-content">
          <div className="result-header">
            <div className="result-icon">
              <CheckCircle size={40} />
            </div>
            <h2>연습 완료!</h2>
            <p className="result-subtitle">오늘의 연습 결과를 확인하세요</p>
          </div>
          <div className="result-stats">
            <div className="result-stat">
              <div className="result-stat-icon">
                <Clock size={20} />
              </div>
              <span className="result-value">{timer.formatTime()}</span>
              <span className="result-label">연습 시간</span>
            </div>
            <div className="result-stat">
              <div className="result-stat-icon result-stat-accent">
                <BarChart3 size={20} />
              </div>
              <span className="result-value">{timer.correctRate}%</span>
              <span className="result-label">정확도</span>
            </div>
            <div className="result-stat">
              <div className="result-stat-icon result-stat-info">
                <CheckCircle size={20} />
              </div>
              <span className="result-value">{timer.session.totalFrames}</span>
              <span className="result-label">분석 횟수</span>
            </div>
          </div>
          <button
            className="btn-primary result-confirm-btn"
            onClick={() => { setShowResult(false); navigate('/'); }}
          >
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
}
