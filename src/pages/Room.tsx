import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client'; // Cliente do Socket.io
import { ReportModal } from '../components/room/ReportModal';
import { RatingModal } from '../components/room/RatingModal';
import { TOPICS_CATALOG, getRandomTopic, TopicItem } from '../data/topicsData';
import { useRoomStatus } from '../hooks/useRoomStatus';

const formatSessionTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

// Configuração dos servidores STUN do Google (ajudam a achar os IPs públicos para o WebRTC)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
};

export const Room: React.FC = memo(() => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId?: string }>();
  
  const { status: roomStatus, loading: roomStatusLoading } = useRoomStatus();

  const [currentTopic, setCurrentTopic] = useState<TopicItem>(() => {
    if (topicId && TOPICS_CATALOG[topicId]) return TOPICS_CATALOG[topicId];
    return getRandomTopic();
  });

  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'topics' | 'chat'>('topics');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchingNextPair, setIsSearchingNextPair] = useState(false);
  const [pendingAction, setPendingAction] = useState<'exit' | 'nextPair' | null>(null);

  // SBS-105: Estado para controle de desconexão do parceiro
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'failed'>('connected');
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const sessionStartedAtRef = useRef<number | null>(null);
  
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const [animStep, setAnimStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [chatMessages, setChatMessages] = useState<{ id: number; sender: 'me' | 'other'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [userAvatarUrl, setUserAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');

  // Referências cruciais para o WebRTC e Socket
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  // SBS-104: Função centralizada para limpeza rigorosa do hardware (Câmera e Microfone)
  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopMediaStream();
    };
  }, [stopMediaStream]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const padding = 40;
      setCursorOpacity(e.clientX < padding || e.clientY < padding || e.clientX > window.innerWidth - padding || e.clientY > window.innerHeight - padding ? 0 : 1);
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', () => setCursorOpacity(0));
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', () => setCursorOpacity(0));
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const updateFollower = () => {
      setFollowerPos((prev) => ({ x: prev.x + (mousePos.x - prev.x) * 0.12, y: prev.y + (mousePos.y - prev.y) * 0.12 }));
      animationFrameId = requestAnimationFrame(updateFollower);
    };
    animationFrameId = requestAnimationFrame(updateFollower);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isSearchingNextPair) {
      setAnimStep(1);
      interval = setInterval(() => setAnimStep((prev) => (prev === 4 ? 0 : ((prev + 1) as 0 | 1 | 2 | 3 | 4))), 550);
    } else {
      setAnimStep(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSearchingNextPair]);

  useEffect(() => {
    if (connectionStatus === 'connected' && !partnerDisconnected) {
      if (!sessionStartedAtRef.current) sessionStartedAtRef.current = Date.now();
      const timer = window.setInterval(() => {
        if (sessionStartedAtRef.current) setSessionElapsedSeconds(Math.floor((Date.now() - sessionStartedAtRef.current) / 1000));
      }, 1000);
      return () => window.clearInterval(timer);
    }
    if (connectionStatus === 'reconnecting' || connectionStatus === 'failed' || partnerDisconnected) {
      sessionStartedAtRef.current = null;
    }
    return undefined;
  }, [connectionStatus, partnerDisconnected]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (videoContainerRef.current) await videoContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setIsFullscreen(!document.fullscreenElement);
    } catch (err) {
      console.error('Erro ao alternar modo tela cheia:', err);
    }
  }, []);

  /* =======================================================
     LÓGICA PRINCIPAL WEBRTC + SOCKET.IO (SINALIZAÇÃO P2P)
  ======================================================== */
  const initializeWebRTC = useCallback(async (socket: Socket, currentRoomId: string, isInitiator: boolean) => {
    try {
      // 1. Pega a câmera e o microfone do usuário
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // 2. Cria a conexão WebRTC
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // 3. Adiciona as faixas de áudio e vídeo à conexão
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // 4. Quando o vídeo do parceiro chegar, coloca no player principal
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionStatus('connected');
        }
      };

      // 5. Escuta e envia os "Caminhos de Rede" (ICE Candidates)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc_ice_candidate', { roomId: currentRoomId, candidate: event.candidate });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') setConnectionStatus('reconnecting');
      };

      // 6. Se for quem inicia a ligação, cria a Oferta e manda pro outro
      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_offer', { roomId: currentRoomId, sdp: pc.localDescription });
      }

    } catch (err: any) {
      setMediaError('Permita o uso da câmera e do microfone para conversar.');
      console.error('Erro no WebRTC:', err);
    }
  }, []);

  useEffect(() => {
    if (roomStatusLoading) return;

    // Conecta ao Socket.io
    const newSocket = io('http://localhost:3000', { withCredentials: true });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      // Assim que conecta, verifica se já tínhamos uma sala, se não, entra na fila
      if (roomStatus?.hasActiveSession) {
        newSocket.emit('join_room', { roomId: roomStatus.sessionId });
      } else {
        newSocket.emit('find_match');
      }
    });

    // Evento disparado pelo backend quando a sala é formada
    newSocket.on('match_found', async (data: { roomId: string; partnerId: string; initiator: boolean }) => {
      setRoomId(data.roomId);
      setPartnerId(data.partnerId);
      setPartnerDisconnected(false);
      setIsSearchingNextPair(false);
      
      // Inicia a dança do WebRTC
      await initializeWebRTC(newSocket, data.roomId, data.initiator);
    });

    // SBS-105: Escuta a queda abrupta ou fechamento de aba do parceiro
    newSocket.on('partner_left', () => {
      setPartnerDisconnected(true);
      stopMediaStream();
    });

    // Escutando Oferta de Vídeo
    newSocket.on('webrtc_offer', async (data: { sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      newSocket.emit('webrtc_answer', { roomId: roomId, sdp: pc.localDescription });
    });

    // Escutando Resposta de Vídeo
    newSocket.on('webrtc_answer', async (data: { sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    // Escutando Candidatos de Rede
    newSocket.on('webrtc_ice_candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    // Escutando Chat de Texto
    newSocket.on('chat_message', (data: { text: string; id: number }) => {
      setChatMessages((prev) => [...prev, { id: data.id, sender: 'other', text: data.text }]);
    });

    return () => {
      stopMediaStream();
      newSocket.disconnect();
    };
  }, [roomStatusLoading, roomStatus, initializeWebRTC, roomId, stopMediaStream]);
  /* ======================================================= */

  const toggleMicrophone = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => { track.enabled = !micActive; });
    }
    setMicActive(!micActive);
  }, [micActive]);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => { track.enabled = !camActive; });
    }
    setCamActive(!camActive);
  }, [camActive]);

  const handleConfirmReport = useCallback(async (reason: string) => {
    setIsReportOpen(false);
    try {
      await fetch('http://localhost:3000/api/room/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportedUserId: partnerId, reason })
      });
    } catch (err) {}
    setPendingAction('nextPair');
    setIsRatingOpen(true);
  }, [partnerId]);

  const handleEndCall = useCallback(() => setIsConfirmExitOpen(true), []);

  const handleConfirmExit = useCallback(() => {
    stopMediaStream(); // SBS-104: Encerra streams ao sair da sala
    setIsConfirmExitOpen(false);
    setPendingAction('exit');
    setIsRatingOpen(true);
  }, [stopMediaStream]);

  const handleNextPair = useCallback(() => {
    setPendingAction('nextPair');
    setIsRatingOpen(true);
  }, []);

  const triggerSearchNextPair = useCallback(() => {
    stopMediaStream(); // SBS-104: Encerra streams atuais antes de buscar novo par
    setPartnerDisconnected(false);
    setConnectionStatus('reconnecting');
    setChatMessages([]);
    setIsSearchingNextPair(true);
    setCurrentTopic(getRandomTopic());
    
    // Pede um novo match pro Socket.io
    if (socketRef.current) {
      socketRef.current.emit('find_match');
    }
  }, [stopMediaStream]);

  const handleRatingSubmit = useCallback(async (data: { partnerRating: number; platformRating: number; comment: string }) => {
    setIsRatingOpen(false);
    try {
      await fetch('http://localhost:3000/api/room/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (partnerId && !partnerDisconnected) {
        const averageRating = (data.partnerRating + data.platformRating) / 2;
        await fetch('http://localhost:3000/api/room/quality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ partnerId, duration: sessionElapsedSeconds, messages: chatMessages.length, rating: Math.round(averageRating) })
        });
        if (averageRating >= 4) {
          await fetch('http://localhost:3000/api/room/want-to-talk-again', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ partnerId })
          });
        }
      }
    } catch (err) {}
    
    if (pendingAction === 'exit') navigate('/dashboard');
    else triggerSearchNextPair();
  }, [partnerId, partnerDisconnected, sessionElapsedSeconds, chatMessages.length, pendingAction, navigate, triggerSearchNextPair]);

  const handleRatingClose = useCallback(() => {
    setIsRatingOpen(false);
    if (pendingAction === 'exit') navigate('/dashboard');
    else triggerSearchNextPair();
  }, [pendingAction, navigate, triggerSearchNextPair]);

  // Enviar chat via Socket.io
  const handleSendMessage = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    if (socketRef.current && roomId) {
      socketRef.current.emit('chat_message', { roomId, text: trimmed });
    }

    setChatMessages((prev) => [...prev, { id: Date.now(), sender: 'me', text: trimmed }]);
    setChatInput('');
  }, [chatInput, roomId]);

  const formattedTimer = useMemo(() => formatSessionTimer(sessionElapsedSeconds), [sessionElapsedSeconds]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans h-screen overflow-hidden relative selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: `${followerPos.x}px`, top: `${followerPos.y}px`, opacity: cursorOpacity }}
      />

      {!isFullscreen && (
        <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleEndCall}>
              <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">S</div>
              <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
            </div>
            <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#E7E5E4] px-3 py-1 rounded-xl text-xs font-black text-[#1C1917] uppercase">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" /></svg>
              <span>{formattedTimer}</span>
            </div>
          </div>
          <div className="bg-[#FAF9F6] border border-[#E7E5E4] px-4 py-1.5 rounded-xl text-xs font-black uppercase text-[#1C1917] flex items-center gap-2">
            <span className="text-[10px] bg-[#E7E5E4] px-2 py-0.5 rounded text-[#78716C]">{currentTopic.category}</span>
            <span>{currentTopic.title}</span>
          </div>
          <button type="button" onClick={handleEndCall} className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
            Encerrar e Sair
          </button>
        </header>
      )}

      {mediaError && !isFullscreen && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-6 py-2.5 text-xs font-bold flex items-center justify-between z-40">
          <span>⚠️ {mediaError}</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => {}} className="px-3 py-1 bg-[#1C1917] text-[#FAF9F6] rounded-lg text-[10px] font-black uppercase">Usar Apenas Áudio</button>
            <button type="button" onClick={() => {}} className="underline uppercase tracking-wider text-[10px] text-amber-900">Tentar Novamente</button>
          </div>
        </div>
      )}

      {/* SBS-105: Overlay de aviso quando o parceiro se desconecta */}
      {partnerDisconnected && (
        <div className="fixed inset-0 bg-[#1C1917]/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit mx-auto">
                PARCEIRO DESCONECTADO
              </span>
              <h3 className="text-lg font-black uppercase text-[#1C1917]">
                Seu par saiu da chamada
              </h3>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">
                A conexão foi encerrada porque o outro participante fechou a aba ou perdeu a conexão. Deseja procurar um novo par ou retornar ao painel?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-xs font-black uppercase rounded-xl hover:bg-[#F5F5F4] transition-all"
              >
                Voltar ao Painel
              </button>
              <button
                type="button"
                onClick={triggerSearchNextPair}
                className="flex-1 py-3 bg-[#1C1917] text-[#FAF9F6] text-xs font-black uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all shadow-sm"
              >
                Procurar Novo Par
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'p-0' : 'p-4 gap-4'}`}>
        <div ref={videoContainerRef} className={`flex-1 bg-[#FFFFFF] relative flex flex-col justify-between overflow-hidden ${isFullscreen ? 'rounded-none border-none' : 'rounded-2xl border border-[#E7E5E4] shadow-sm'}`}>
          {connectionStatus === 'connected' && !isSearchingNextPair && !partnerDisconnected && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#FFFFFF]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-emerald-700 border border-[#E7E5E4] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conexão Excelente</span>
            </div>
          )}

          {connectionStatus === 'reconnecting' && !isSearchingNextPair && !partnerDisconnected && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-amber-50/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-amber-700 border border-amber-200 shadow-sm animate-in fade-in duration-300">
              <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <span>Reconectando...</span>
            </div>
          )}

          {isSearchingNextPair ? (
            <div className="absolute inset-0 bg-[#1C1917] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-3 mb-8 h-20 min-w-[380px]">
                <span className={`text-4xl sm:text-6xl font-black uppercase text-[#FAF9F6] tracking-tighter transition-all duration-300 ${animStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>Side</span>
                <div className="relative flex h-16 w-12 items-center justify-center transition-all duration-500">
                  <div className={`flex flex-col items-center justify-center leading-none text-[#A8A29E] transition-all duration-500 ${animStep >= 3 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-2 scale-75'}`} style={{ transform: 'rotate(-12deg) skewX(-8deg)' }}>
                    <span className="text-3xl sm:text-5xl font-black tracking-tight leading-none">B</span>
                    <span className="text-3xl sm:text-5xl font-black tracking-tight leading-none -mt-1">Y</span>
                  </div>
                </div>
                <span className={`text-4xl sm:text-6xl font-black uppercase text-[#FAF9F6] tracking-tighter transition-all duration-500 ${animStep >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>SIDE</span>
              </div>
              <div className="flex flex-col gap-3 max-w-sm">
                <span className="text-[10px] font-black tracking-widest text-[#1C1917] uppercase bg-[#FAF9F6] px-3 py-1 rounded-lg w-fit mx-auto border-2 border-[#FAF9F6]">MANTENDO TÓPICO: {currentTopic.title}</span>
                <h2 className="text-xl font-black uppercase tracking-tight text-[#FAF9F6]">Procurando novo conversante...</h2>
              </div>
              <div className="w-48 h-1.5 bg-[#FAF9F6]/20 rounded-full overflow-hidden mt-8"><div className="h-full bg-[#FAF9F6] rounded-full animate-pulse w-2/3 mx-auto" /></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#F5F5F4] flex items-center justify-center">
              <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity duration-300 ${connectionStatus === 'reconnecting' ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}`} />
              <div className="absolute bottom-4 left-6 bg-[#1C1917]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-[#FAF9F6] uppercase z-10">
                Parceiro de Prática
              </div>
            </div>
          )}

          <div className="absolute bottom-5 right-6 left-auto top-auto z-40 w-44 h-28 rounded-2xl overflow-hidden border-2 border-[#FFFFFF] shadow-2xl bg-[#1C1917]">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform -scale-x-100 ${camActive ? 'block' : 'hidden'}`} />
            {!camActive && (
              <div className="w-full h-full bg-[#1C1917] flex flex-col items-center justify-center relative overflow-hidden">
                <img src={userAvatarUrl} alt="Sua Foto" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 bg-[#1C1917]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-black uppercase text-[#FAF9F6] z-10">Você {!micActive && '(Mudo)'}</div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#FFFFFF] border border-[#E7E5E4] p-2 rounded-2xl flex items-center gap-3 shadow-lg">
            <button type="button" onClick={toggleMicrophone} className={`p-3 rounded-xl transition-all border ${micActive ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {micActive ? <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /></svg> : <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>}
            </button>
            <button type="button" onClick={toggleCamera} className={`p-3 rounded-xl transition-all border ${camActive ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {camActive ? <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg> : <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>}
            </button>
            <button type="button" onClick={toggleFullscreen} className="p-3 bg-[#FAF9F6] border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#1C1917] rounded-xl transition-all">
              {isFullscreen ? <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4.5 4.5m0 0H9m-4.5 0V9m10.5 0l4.5-4.5m0 0H15m4.5 0V9M9 15l-4.5 4.5m0 0H9m-4.5 0v-4.5m10.5 4.5l4.5 4.5m0 0H15m4.5 0v-4.5" /></svg> : <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>}
            </button>
            <div className="w-px h-6 bg-[#E7E5E4]" />
            <button type="button" onClick={() => setIsReportOpen(true)} className="p-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl transition-all text-xs font-bold">
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-1.385a1.125 1.125 0 011.008 0L10.5 15l3.722-1.861a1.125 1.125 0 011.008 0L19.5 15V4.5l-4.27-2.135a1.125 1.125 0 00-1.008 0L10.5 4.23 6.778 2.369a1.125 1.125 0 00-1.008 0L3 3.75V15z" /></svg>
            </button>
            <button type="button" onClick={handleNextPair} className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm pointer-events-auto">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M12 11.25v6m0 0l-3-3m3 3l3-3" /></svg>
              <span>PRÓXIMO PAR</span>
            </button>
          </div>

          <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} onConfirm={handleConfirmReport} />
          <RatingModal isOpen={isRatingOpen} onClose={handleRatingClose} onSubmit={handleRatingSubmit} partnerName="Estudante" />

          {isConfirmExitOpen && (
            <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
              <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-5 text-center animate-in fade-in zoom-in-95 duration-150">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-7 h-7 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit mx-auto">SAÍDA DA SESSÃO</span>
                  <h3 className="text-base font-black uppercase text-[#1C1917]">Tem certeza que deseja sair?</h3>
                  <p className="text-xs text-[#57534E] font-medium leading-relaxed">Sua chamada de vídeo ativa será encerrada e você perderá a conexão com o seu par atual.</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setIsConfirmExitOpen(false)} className="flex-1 py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-xs font-black uppercase rounded-xl hover:bg-[#F5F5F4] transition-all">Continuar na Sala</button>
                  <button type="button" onClick={handleConfirmExit} className="flex-1 py-3 bg-red-600 text-white text-xs font-black uppercase rounded-xl border-2 border-[#1C1917] hover:bg-red-700 transition-all shadow-sm">Sim, Sair</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <aside className="w-80 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm">
            <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 border-b border-[#E7E5E4] text-xs font-black uppercase tracking-wider">
              <button type="button" onClick={() => setActiveTab('topics')} className={`py-2.5 rounded-lg transition-all ${activeTab === 'topics' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'}`}>Guia de Tópicos</button>
              <button type="button" onClick={() => setActiveTab('chat')} className={`py-2.5 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'}`}>Chat ({chatMessages.length})</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {activeTab === 'topics' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col pb-2 border-b border-[#E7E5E4]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">LINHA NARRATIVA CONECTADA</span>
                    <h3 className="text-xs font-black uppercase text-[#1C1917]">{currentTopic.title}</h3>
                  </div>

                  {currentTopic.steps.map((step) => (
                    <div key={step.stepNumber} className="bg-[#FAF9F6] border border-[#E7E5E4] p-3.5 rounded-xl flex flex-col gap-2 relative group hover:border-[#1C1917] transition-all">
                      <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#1C1917]">{step.stageTitle}</span>
                        <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#FAF9F6] text-[9px] font-black flex items-center justify-center">{step.stepNumber}</span>
                      </div>
                      <p className="text-xs font-bold text-[#1C1917] leading-snug">"{step.question}"</p>
                      <div className="flex flex-col gap-1 pt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#78716C]">Frase de transição:</span>
                        <span className="text-[10px] font-semibold text-[#57534E] italic bg-[#FFFFFF] p-1.5 rounded border border-[#E7E5E4]">{step.transitionPhrase}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {step.keywords.map((word, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-[#1C1917] bg-[#E7E5E4] px-2 py-0.5 rounded uppercase">{word}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between gap-3">
                  <div className="flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
                    {chatMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center text-[11px] font-bold uppercase tracking-wide text-[#78716C] border border-dashed border-[#E7E5E4] rounded-xl p-4">
                        Nenhuma mensagem ainda.
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div key={message.id} className={`p-2.5 rounded-xl text-xs ${message.sender === 'me' ? 'bg-[#1C1917] text-[#FAF9F6] self-end' : 'bg-[#FAF9F6] text-[#1C1917] border border-[#E7E5E4]'}`}>
                          <span className="font-black text-[10px] uppercase">{message.sender === 'me' ? 'Você' : 'Parceiro'}: </span>
                          <span className="font-medium">{message.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Digite uma mensagem..." className="flex-1 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]" />
                    <button type="submit" className="bg-[#1C1917] hover:bg-[#292524] px-3 py-2 rounded-xl text-xs font-bold text-[#FAF9F6]">➔</button>
                  </form>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
});

Room.displayName = 'Room';