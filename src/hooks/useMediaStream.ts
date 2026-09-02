import { useState, useEffect, useRef, useCallback } from 'react';

interface UseMediaStreamOptions {
  enabled: boolean;
  video: boolean;
  audio: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
}

export const useMediaStream = ({
  enabled,
  video,
  audio,
  audioDeviceId,
  videoDeviceId,
}: UseMediaStreamOptions) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        streamRef.current?.removeTrack(track);
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopStream();
      return;
    }

    let isMounted = true;

    const startStream = async () => {
      stopStream();
      setError(null);

      try {
        const constraints: MediaStreamConstraints = {
          audio: audioDeviceId ? { deviceId: { ideal: audioDeviceId } } : audio,
          video: video ? (videoDeviceId ? { deviceId: { ideal: videoDeviceId } } : true) : false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isMounted) {
          newStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = newStream;
        setStream(newStream);
      } catch (_err) {
        if (isMounted) {
          setError('Não foi possível acessar a câmera ou microfone.');
        }
      }
    };

    startStream();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [enabled, video, audio, audioDeviceId, videoDeviceId, stopStream]);

  return { stream, error, stopStream };
};