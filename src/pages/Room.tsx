import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportModal } from '../components/room/ReportModal';
import { RatingModal } from '../components/room/RatingModal';
import { TOPICS_CATALOG, getRandomTopic, TopicItem } from '../data/topicsData';

export const Room: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId?: string }>();

  // Carrega o tópico dinâmico com base na rota ou sorteia se for 'random'/indefinido
  const [currentTopic, setCurrentTopic] = useState<TopicItem>(() => {
    if (topicId && TOPICS_CATALOG[topicId]) {
      return TOPICS_CATALOG[topicId];
    }
    return getRandomTopic();
  });

  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'topics' | 'chat'>('topics');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchingNextPair, setIsSearchingNextPair] = useState(false);
  const [pendingAction, setPendingAction] = useState<'exit' | 'nextPair' | null>(null);

  // Estados de Tolerância a Falhas e Conexão WebRTC
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'failed'>('connected');
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Estado das etapas da animação
  const [animStep, setAnimStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Avatar do usuário
  const userAvatarUrl =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  // Referência para o container de vídeo e WebRTC
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Estado de Cursor Neutro
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      const padding = 40;
      const isNearEdge =
        e.clientX < padding ||
        e.clientY < padding ||
        e.clientX > window.innerWidth - padding ||
        e.clientY > window.innerHeight - padding;

      setCursorOpacity(isNearEdge ? 0 : 1);
    };

    const handleMouseLeave = () => setCursorOpacity(0);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const updateFollower = () => {
      setFollowerPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.12,
          y: prev.y + dy * 0.12,
        };
      });
      animationFrameId = requestAnimationFrame(updateFollower);
    };

    animationFrameId = requestAnimationFrame(updateFollower);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // Loop contínuo de animação com morphing de barra para o "B" do BY
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isSearchingNextPair) {
      setAnimStep(1);

      interval = setInterval(() => {
        setAnimStep((prev) => {
          if (prev === 4) return 0;
          return (prev + 1) as 0 | 1 | 2 | 3 | 4;
        });
      }, 550);
    } else {
      setAnimStep(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearchingNextPair]);

  // Sincroniza estado de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (videoContainerRef.current) {
          await videoContainerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Erro ao alternar modo tela cheia:', err);
    }
  };

  // Fallback e Restart de ICE Candidates
  const handleIceFallback = async (pc: RTCPeerConnection) => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionStatus('failed');
      return;
    }
    reconnectAttempts.current += 1;

    try {
      // Padrão moderno de fallback WebRTC para oscilação de rede sem derrubar a chamada
      if (typeof pc.restartIce === 'function') {
        pc.restartIce();
      }

      /* 
        Aqui seria disparada a re-criação da oferta via Signaling Server.
        Exemplo:
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        socket.emit('renegotiate', { offer });
      */

      // Simulação de recuperação da rede após oscilação (para UI)
      setTimeout(() => {
        if (peerConnectionRef.current && peerConnectionRef.current.iceConnectionState !== 'connected') {
          setConnectionStatus('connected');
          reconnectAttempts.current = 0;
        }
      }, 4000);
    } catch (err) {
      console.error('Falha no ICE Restart:', err);
    }
  };

  // Inicialização de Mídia e WebRTC conectado ao Backend
  const startMedia = async (videoConstraint = true) => {
    try {
      setMediaError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: true,
      });

      streamRef.current = userStream;
      if (localVideoRef.current && videoConstraint) {
        localVideoRef.current.srcObject = userStream;
      }
      setCamActive(videoConstraint);
      setMicActive(true);

      // Configuração básica do RTCPeerConnection para WebRTC com servidor STUN público
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      userStream.getTracks().forEach(track => {
        pc.addTrack(track, userStream);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Escuta as mudanças de estado da rede
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (state === 'disconnected' || state === 'failed') {
          setConnectionStatus('reconnecting');
          handleIceFallback(pc);
        } else if (state === 'connected' || state === 'completed') {
          setConnectionStatus('connected');
          reconnectAttempts.current = 0;
        }
      };

      peerConnectionRef.current = pc;
    } catch (err: any) {
      console.error('Erro ao acessar dispositivos de mídia:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMediaError('Acesso bloqueado. Verifique as permissões de câmera/microfone no navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMediaError('Nenhuma câmera ou microfone detectado no dispositivo.');
      } else {
        setMediaError('Não foi possível inicializar a câmera/microfone.');
      }
    }
  };

  useEffect(() => {
    startMedia(true);

    // Comunicação com o Backend via API de Salas/Sessão
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/api/room/join', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topicId: currentTopic.id })
    }).catch(err => console.error('Erro ao registrar entrada na sala:', err));

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const toggleMicrophone = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !camActive;
      });
    }
    setCamActive(!camActive);
  };

  const handleConfirmReport = async (reason: string) => {
    setIsReportOpen(false);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/room/report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
    } catch (err) {
      console.error('Erro ao enviar denúncia', err);
    }
    setPendingAction('nextPair');
    setIsRatingOpen(true);
  };

  const handleEndCall = () => {
    setPendingAction('exit');
    setIsRatingOpen(true);
  };

  const handleNextPair = () => {
    setPendingAction('nextPair');
    setIsRatingOpen(true);
  };

  const handleRatingSubmit = async (data: { partnerRating: number; platformRating: number; comment: string }) => {
    setIsRatingOpen(false);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/room/rate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Erro ao enviar avaliação', err);
    }
    
    if (pendingAction === 'exit') {
      navigate('/dashboard');
    } else {
      triggerSearchNextPair();
    }
  };

  const handleRatingClose = () => {
    setIsRatingOpen(false);
    if (pendingAction === 'exit') {
      navigate('/dashboard');
    } else {
      triggerSearchNextPair();
    }
  };

  const triggerSearchNextPair = () => {
    setIsSearchingNextPair(true);
    setCurrentTopic(getRandomTopic());
    setTimeout(() => {
      setIsSearchingNextPair(false);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans h-screen overflow-hidden relative selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      {!isFullscreen && (
        <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleEndCall}>
              <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
                S
              </div>
              <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#E7E5E4] px-3 py-1 rounded-xl text-xs font-black text-[#1C1917] uppercase">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
              </svg>
              <span>12:45</span>
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#E7E5E4] px-4 py-1.5 rounded-xl text-xs font-black uppercase text-[#1C1917] flex items-center gap-2">
            <span className="text-[10px] bg-[#E7E5E4] px-2 py-0.5 rounded text-[#78716C]">
              {currentTopic.category}
            </span>
            <span>{currentTopic.title}</span>
          </div>

          <button
            type="button"
            onClick={handleEndCall}
            className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Encerrar e Sair
          </button>
        </header>
      )}

      {mediaError && !isFullscreen && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-6 py-2.5 text-xs font-bold flex items-center justify-between z-40">
          <span>⚠️ {mediaError}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => startMedia(false)}
              className="px-3 py-1 bg-[#1C1917] text-[#FAF9F6] rounded-lg text-[10px] font-black uppercase"
            >
              Usar Apenas Áudio
            </button>
            <button
              type="button"
              onClick={() => startMedia(true)}
              className="underline uppercase tracking-wider text-[10px] text-amber-900"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'p-0' : 'p-4 gap-4'}`}>
        <div
          ref={videoContainerRef}
          className={`flex-1 bg-[#FFFFFF] relative flex flex-col justify-between overflow-hidden ${
            isFullscreen ? 'rounded-none border-none' : 'rounded-2xl border border-[#E7E5E4] shadow-sm'
          }`}
        >
          {/* Badge de Status de Conexão WebRTC Dinâmico */}
          {connectionStatus === 'connected' && !isSearchingNextPair && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#FFFFFF]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-emerald-700 border border-[#E7E5E4] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conexão Excelente</span>
            </div>
          )}

          {connectionStatus === 'reconnecting' && !isSearchingNextPair && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-amber-50/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-amber-700 border border-amber-200 shadow-sm animate-in fade-in duration-300">
              <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <span>Reconectando...</span>
            </div>
          )}

          {connectionStatus === 'failed' && !isSearchingNextPair && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-red-50/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-red-700 border border-red-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Conexão Perdida</span>
            </div>
          )}

          {/* Overlay de Reconexão para Oscilações Graves */}
          {connectionStatus === 'reconnecting' && !isSearchingNextPair && (
            <div className="absolute inset-0 bg-[#1C1917]/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-[#E7E5E4]">
                <div className="w-12 h-12 rounded-full border-4 border-[#F5F5F4] border-t-amber-500 animate-spin" />
                <h3 className="text-sm font-black uppercase text-[#1C1917] mt-2">Oscilação de Rede</h3>
                <p className="text-xs text-[#57534E] font-medium max-w-xs">
                  Sua internet oscilou. Não saia da sala, estamos restaurando a comunicação com seu par...
                </p>
              </div>
            </div>
          )}

          {isSearchingNextPair ? (
            <div className="absolute inset-0 bg-[#1C1917] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-3 mb-8 h-20 min-w-[380px]">
                <span
                  className={`text-4xl sm:text-6xl font-black uppercase text-[#FAF9F6] tracking-tighter transition-all duration-300 ${
                    animStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                  }`}
                >
                  Side
                </span>

                <span
                  className={`text-4xl sm:text-6xl font-black text-[#FAF9F6] transition-all duration-300 ${
                    animStep >= 2 ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                  }`}
                >
                  |
                </span>

                <div className="relative inline-flex items-center">
                  <span
                    className={`text-4xl sm:text-6xl font-black text-[#A8A29E] transition-all duration-400 absolute left-0 ${
                      animStep === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-x-0'
                    }`}
                  >
                    |
                  </span>

                  <span
                    className={`text-3xl sm:text-5xl font-black text-[#A8A29E] uppercase tracking-wider transition-all duration-500 origin-left ${
                      animStep >= 3
                        ? 'opacity-100 translate-x-0 scale-x-100'
                        : 'opacity-0 translate-x-2 scale-x-0'
                    }`}
                  >
                    BY
                  </span>
                </div>

                <span
                  className={`text-4xl sm:text-6xl font-black uppercase text-[#FAF9F6] tracking-tighter transition-all duration-500 ${
                    animStep >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                  }`}
                >
                  SIDE
                </span>
              </div>

              <div className="flex flex-col gap-3 max-w-sm">
                <span className="text-[10px] font-black tracking-widest text-[#1C1917] uppercase bg-[#FAF9F6] px-3 py-1 rounded-lg w-fit mx-auto border-2 border-[#FAF9F6]">
                  MANTENDO TÓPICO: {currentTopic.title}
                </span>
                <h2 className="text-xl font-black uppercase tracking-tight text-[#FAF9F6]">
                  Procurando novo conversante...
                </h2>
                <p className="text-xs text-[#A8A29E] font-medium leading-relaxed">
                  Conectando você a outro parceiro disponível no mesmo nível de fluência.
                </p>
              </div>

              <div className="w-48 h-1.5 bg-[#FAF9F6]/20 rounded-full overflow-hidden mt-8">
                <div className="h-full bg-[#FAF9F6] rounded-full animate-pulse w-2/3 mx-auto" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#F5F5F4] flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${connectionStatus === 'reconnecting' ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}`}
              />
              <div className="absolute bottom-4 left-6 bg-[#1C1917]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-[#FAF9F6] uppercase z-10">
                Alex (Espanha)
              </div>
            </div>
          )}

          <div className="absolute bottom-5 right-6 left-auto top-auto z-40 w-44 h-28 rounded-2xl overflow-hidden border-2 border-[#FFFFFF] shadow-2xl bg-[#1C1917]">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                camActive ? 'block' : 'hidden'
              }`}
            />

            {!camActive && (
              <div className="w-full h-full bg-[#1C1917] flex flex-col items-center justify-center relative overflow-hidden">
                <img
                  src={userAvatarUrl}
                  alt="Sua Foto de Perfil"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
              </div>
            )}

            <div className="absolute bottom-1.5 left-2 bg-[#1C1917]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-black uppercase text-[#FAF9F6] z-10">
              Você {!micActive && '(Mudo)'}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#FFFFFF] border border-[#E7E5E4] p-2 rounded-2xl flex items-center gap-3 shadow-lg">
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`p-3 rounded-xl transition-all border ${
                micActive 
                  ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' 
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
              title={micActive ? "Desativar Microfone" : "Ativar Microfone"}
            >
              {micActive ? (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3 rounded-xl transition-all border ${
                camActive 
                  ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' 
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
              title={camActive ? "Desativar Câmera" : "Ativar Câmera"}
            >
              {camActive ? (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-3 bg-[#FAF9F6] border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#1C1917] rounded-xl transition-all"
              title={isFullscreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4.5 4.5m0 0H9m-4.5 0V9m10.5 0l4.5-4.5m0 0H15m4.5 0V9M9 15l-4.5 4.5m0 0H9m-4.5 0v-4.5m10.5 4.5l4.5 4.5m0 0H15m4.5 0v-4.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>

            <div className="w-px h-6 bg-[#E7E5E4]" />

            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="p-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl transition-all text-xs font-bold"
              title="Denunciar Parceiro"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-1.385a1.125 1.125 0 011.008 0L10.5 15l3.722-1.861a1.125 1.125 0 011.008 0L19.5 15V4.5l-4.27-2.135a1.125 1.125 0 00-1.008 0L10.5 4.23 6.778 2.369a1.125 1.125 0 00-1.008 0L3 3.75V15z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNextPair}
              className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M12 11.25v6m0 0l-3-3m3 3l3-3" />
              </svg>
              <span>PRÓXIMO PAR</span>
            </button>
          </div>
        </div>

        {!isFullscreen && (
          <aside className="w-80 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm">
            <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 border-b border-[#E7E5E4] text-xs font-black uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('topics')}
                className={`py-2.5 rounded-lg transition-all ${
                  activeTab === 'topics' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
                }`}
              >
                Guia de Tópicos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`py-2.5 rounded-lg transition-all ${
                  activeTab === 'chat' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
                }`}
              >
                Chat (2)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {activeTab === 'topics' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col pb-2 border-b border-[#E7E5E4]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">
                      LINHA NARRATIVA CONECTADA
                    </span>
                    <h3 className="text-xs font-black uppercase text-[#1C1917]">
                      {currentTopic.title}
                    </h3>
                  </div>

                  {currentTopic.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="bg-[#FAF9F6] border border-[#E7E5E4] p-3.5 rounded-xl flex flex-col gap-2 relative group hover:border-[#1C1917] transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#1C1917]">
                          {step.stageTitle}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#FAF9F6] text-[9px] font-black flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#1C1917] leading-snug">
                        "{step.question}"
                      </p>

                      <div className="flex flex-col gap-1 pt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#78716C]">
                          Frase de transição:
                        </span>
                        <span className="text-[10px] font-semibold text-[#57534E] italic bg-[#FFFFFF] p-1.5 rounded border border-[#E7E5E4]">
                          {step.transitionPhrase}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {step.keywords.map((word, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold text-[#1C1917] bg-[#E7E5E4] px-2 py-0.5 rounded uppercase"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E7E5E4] text-xs">
                      <span className="font-black text-[#1C1917] text-[10px] uppercase">Alex: </span>
                      <span className="text-[#57534E] font-medium">Hi! How is it going?</span>
                    </div>
                    <div className="bg-[#1C1917] p-2.5 rounded-xl text-xs self-end text-[#FAF9F6]">
                      <span className="font-black text-[#FAF9F6] text-[10px] uppercase">Você: </span>
                      <span className="font-medium">Hey! All good, ready to practice!</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite uma mensagem..."
                      className="flex-1 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                    />
                    <button type="button" className="bg-[#1C1917] hover:bg-[#292524] px-3 py-2 rounded-xl text-xs font-bold text-[#FAF9F6]">
                      ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onConfirm={handleConfirmReport}
      />

      <RatingModal
        isOpen={isRatingOpen}
        onClose={handleRatingClose}
        onSubmit={handleRatingSubmit}
        partnerName="Alex (Espanha)"
      />
    </div>
  );
};