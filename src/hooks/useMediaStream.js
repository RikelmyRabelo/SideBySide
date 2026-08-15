import { useState, useEffect, useRef, useCallback } from 'react';
export const useMediaStream = ({ enabled, video, audio, audioDeviceId, videoDeviceId, }) => {
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const streamRef = useRef(null);
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
                const constraints = {
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
            }
            catch (err) {
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
