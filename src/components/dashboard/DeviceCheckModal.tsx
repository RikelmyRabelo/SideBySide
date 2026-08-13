import React, { useState, useEffect, useRef } from 'react';

interface DeviceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaMode: 'video' | 'audio';
}

export const DeviceCheckModal: React.FC<DeviceCheckModalProps> = ({
  isOpen,
  onClose,
  mediaMode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopTracks();
      return;
    }

    const initDevices = async () => {
      try {
        setPermissionError(null);
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');

        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);

        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }
        if (videoInputs.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(videoInputs[0].deviceId);
        }

        await startMediaStream();
      } catch (err) {
        setPermissionError('Não foi possível acessar a câmera ou o microfone. Verifique as permissões do seu navegador.');
      }
    };

    initDevices();

    return () => {
      stopTracks();
    };
  }, [isOpen, selectedAudioDevice, selectedVideoDevice, mediaMode]);

  const startMediaStream = async () => {
    stopTracks();

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        video: mediaMode === 'video' ? (selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true) : false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current && mediaMode === 'video') {
        videoRef.current.srcObject = mediaStream;
      }

      setupAudioAnalyser(mediaStream);
    } catch (err) {
      setPermissionError('Erro ao carregar os periféricos selecionados.');
    }
  };

  const setupAudioAnalyser = (mediaStream: MediaStream) => {
    const audioTrack = mediaStream.getAudioTracks()[0];
    if (!audioTrack) return;

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(mediaStream);

    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 64;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateAudioLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
      }
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  };

  const stopTracks = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setAudioLevel(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">
              CHECAGEM PRÉVIA
            </span>
            <h2 className="text-base font-black uppercase text-[#1C1917]">
              Teste de Mídia & Periféricos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
          >
            ✕
          </button>
        </div>

        {permissionError ? (
          <div className="bg-red-50 border-2 border-red-600 p-4 rounded-2xl text-xs font-bold text-red-600 text-center">
            {permissionError}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Visualização de Vídeo ou Ícone de Áudio */}
            <div className="relative w-full h-52 bg-[#1C1917] rounded-2xl overflow-hidden border-2 border-[#1C1917] flex items-center justify-center">
              {mediaMode === 'video' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#FAF9F6]">
                  <svg className="w-12 h-12 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" />
                  </svg>
                  <span className="text-xs font-black uppercase tracking-widest">Modo Apenas Áudio</span>
                </div>
              )}

              {/* Status do Dispositivo */}
              <div className="absolute top-3 left-3 bg-[#1C1917]/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-[#FAF9F6]/20 flex items-center gap-2 text-[10px] font-black uppercase text-[#FAF9F6]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Dispositivos Prontos
              </div>
            </div>

            {/* Medidor de Áudio */}
            <div className="bg-[#FAF9F6] border-2 border-[#E7E5E4] p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-black text-[#1C1917] uppercase">
                <span>Nível do Microfone</span>
                <span>{audioLevel}%</span>
              </div>
              <div className="w-full h-3 bg-[#E7E5E4] rounded-full overflow-hidden border border-[#1C1917] p-0.5 flex gap-1">
                {Array.from({ length: 15 }).map((_, idx) => {
                  const threshold = (idx + 1) * 6.6;
                  const isActive = audioLevel >= threshold;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 h-full rounded-sm transition-colors ${
                        isActive
                          ? idx > 11
                            ? 'bg-red-500'
                            : idx > 8
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : 'bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Seletores de Periféricos */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-[#78716C]">Microfone</label>
                <select
                  value={selectedAudioDevice}
                  onChange={(e) => setSelectedAudioDevice(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                >
                  {audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microfone (${d.deviceId.slice(0, 5)}...)`}
                    </option>
                  ))}
                </select>
              </div>

              {mediaMode === 'video' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-[#78716C]">Câmera</label>
                  <select
                    value={selectedVideoDevice}
                    onChange={(e) => setSelectedVideoDevice(e.target.value)}
                    className="px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    {videoDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Câmera (${d.deviceId.slice(0, 5)}...)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão Concluir */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#292524] transition-all"
        >
          Confirmar Dispositivos
        </button>
      </div>
    </div>
  );
};