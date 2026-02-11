import { useRef, useState, useCallback } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      videoElement.srcObject = stream;
      await videoElement.play();
      videoRef.current = videoElement;
      streamRef.current = stream;
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? '카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.'
          : '카메라를 시작할 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.'
      );
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const switchCamera = useCallback(async () => {
    if (!videoRef.current) return;
    const currentFacing = streamRef.current
      ?.getVideoTracks()[0]
      ?.getSettings().facingMode;
    const el = videoRef.current;
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacing === 'environment' ? 'user' : 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      el.srcObject = stream;
      await el.play();
      videoRef.current = el;
      streamRef.current = stream;
      setIsActive(true);
    } catch {
      setError('카메라 전환에 실패했습니다.');
    }
  }, [stop]);

  return { videoRef, isActive, error, start, stop, switchCamera };
}
