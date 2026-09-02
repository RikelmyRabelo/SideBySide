import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { ReportModal } from '../components/room/ReportModal';
import { RatingModal } from '../components/room/RatingModal';
import { TOPICS_CATALOG, FREE_TALK_TOPIC, TopicItem } from '../data/topicsData';
import { useToast } from '../components/ui/ToastContext';

const formatSessionTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
};

const getAvatarFallback = (name: string) => {
  const cleanName = name?.trim() || 'Estudante';
  const initial = cleanName.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=292524&color=FAF9F6&bold=true`;
};

const Room: React.FC = memo(() => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId?: string }>();
  const { showToast } = useToast();
  
  const [currentTopic, setCurrentTopic] = useState<TopicItem>(() => {
    if (topicId && TOPICS_CATALOG[topicId]) return TOPICS_CATALOG[topicId];
    return FREE_TALK_TOPIC;
  });

  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'topics' | 'chat'>('topics');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [isSearchingNextPair, setIsSearchingNextPair] = useState(true);
  const [pendingAction, setPendingAction] = useState<'exit' | 'nextPair' | null>(null);
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);

  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [incomingFriendRequest, setIncomingFriendRequest] = useState<{ requestId: string; senderId: string; name: string; avatar: string } | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [spokenHistory, setSpokenHistory] = useState<string[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isPartnerSpeaking, setIsPartnerSpeaking] = useState(false);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const [partnerAudioLevel, setPartnerAudioLevel] = useState(0);

  const [remoteCamActiveState, setRemoteCamActiveState] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameAudioRef = useRef<number | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'failed'>('connected');
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const sessionStartedAtRef = useRef<number | null>(null);
  
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('Estudante');
  const [partnerAvatarUrl, setPartnerAvatarUrl] = useState<string>(getAvatarFallback('Estudante'));
  const [roomId, setRoomId] = useState<string | null>(null);

  const completedSessionRef = useRef<{ roomId: string | null; partnerId: string | null; partnerName: string; partnerAvatarUrl: string; duration: number }>({
    roomId: null,
    partnerId: null,
    partnerName: 'Estudante',
    partnerAvatarUrl: getAvatarFallback('Estudante'),
    duration: 0,
  });

  const hasRatedCurrentSessionRef = useRef<boolean>(false);

  const sessionStateRef = useRef({
    isSearching: true,
    partnerId: null as string | null,
    partnerName: 'Estudante',
    partnerAvatarUrl: getAvatarFallback('Estudante'),
    duration: 0
  });

  useEffect(() => {
    sessionStateRef.current = {
      isSearching: isSearchingNextPair,
      partnerId,
      partnerName,
      partnerAvatarUrl,
      duration: sessionElapsedSeconds
    };
  }, [isSearchingNextPair, partnerId, partnerName, partnerAvatarUrl, sessionElapsedSeconds]);

  const roomIdRef = useRef<string | null>(null);
  const micActiveRef = useRef(micActive);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [animStep, setAnimStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [chatMessages, setChatMessages] = useState<{ id: number; sender: 'me' | 'other'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [userAvatarUrl, setUserAvatarUrl] = useState<string>(getAvatarFallback('S'));

  useEffect(() => {
    micActiveRef.current = micActive;
  }, [micActive]);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const response = await api.get('/api/user/me');
        const data = response.data;
        setUserAvatarUrl(data.avatar || getAvatarFallback(data.name || 'Estudante'));
      } catch (err) {}
    };
    fetchUserAvatar();
  }, []);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  const setupAudioAnalyzer = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;
        const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));

        setUserAudioLevel(normalizedLevel);
        setIsUserSpeaking(average > 12 && micActiveRef.current);
        animationFrameAudioRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (e) {}
  }, []);

  const stopMediaStream = useCallback(() => {
    if (animationFrameAudioRef.current) {
      cancelAnimationFrame(animationFrameAudioRef.current);
      animationFrameAudioRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      speechRecognitionRef.current = null;
      setIsTranscribing(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    setLocalStream(null);
    setRemoteStream(null);
    pendingCandidates.current = [];
    pendingOfferRef.current = null;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  const toggleSpeechTranscription = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Seu navegador não suporta a Web Speech API para transcrição em tempo real.');
      return;
    }

    if (isTranscribing && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsTranscribing(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsTranscribing(true);

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
          else interimText += event.results[i][0].transcript;
        }

        if (finalText.trim()) {
          setCurrentTranscript(finalText.trim());
          setSpokenHistory((prev) => [...prev, finalText.trim()]);
        } else if (interimText.trim()) {
          setCurrentTranscript(interimText.trim());
        }
      };

      recognition.onerror = () => setIsTranscribing(false);
      recognition.onend = () => setIsTranscribing(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsTranscribing(false);
    }
  }, [isTranscribing]);

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
    let interval: ReturnType<typeof setInterval> | undefined;
    if (connectionStatus === 'connected' && !partnerDisconnected && !isSearchingNextPair) {
      if (!sessionStartedAtRef.current) sessionStartedAtRef.current = Date.now();
      const timer = window.setInterval(() => {
        if (sessionStartedAtRef.current) setSessionElapsedSeconds(Math.floor((Date.now() - sessionStartedAtRef.current) / 1000));
      }, 1000);
      return () => window.clearInterval(timer);
    }
    if (connectionStatus === 'reconnecting' || connectionStatus === 'failed' || partnerDisconnected || isSearchingNextPair) {
      sessionStartedAtRef.current = null;
    }
    return undefined;
  }, [connectionStatus, partnerDisconnected, isSearchingNextPair]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (videoContainerRef.current) await videoContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setIsFullscreen(!document.fullscreenElement);
    } catch (err) {}
  }, []);

  const initializeWebRTC = useCallback(async (socket: Socket, currentRoomId: string, isInitiator: boolean) => {
    try {
      const preferredAudioId = localStorage.getItem('sbs_preferred_audio_id');
      const preferredVideoId = localStorage.getItem('sbs_preferred_video_id');

      const constraints: MediaStreamConstraints = {
        audio: preferredAudioId ? { deviceId: { exact: preferredAudioId } } : true,
        video: preferredVideoId ? { deviceId: { exact: preferredVideoId } } : true,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (fallbackErr) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      }

      streamRef.current = stream;
      setLocalStream(stream);
      setupAudioAnalyzer(stream);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const incomingStream = event.streams[0];
          setRemoteStream(incomingStream);
          setConnectionStatus('connected');

          const videoTrack = incomingStream.getVideoTracks()[0];
          if (videoTrack) {
            setRemoteCamActiveState(!videoTrack.muted && videoTrack.enabled);
            videoTrack.onmute = () => setRemoteCamActiveState(false);
            videoTrack.onunmute = () => setRemoteCamActiveState(true);
          }

          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const remoteAudioCtx = new AudioCtx();
            const remoteAnalyser = remoteAudioCtx.createAnalyser();
            remoteAnalyser.fftSize = 256;
            const remoteSource = remoteAudioCtx.createMediaStreamSource(incomingStream);
            remoteSource.connect(remoteAnalyser);
            const remoteArray = new Uint8Array(remoteAnalyser.frequencyBinCount);

            const checkRemoteAudio = () => {
              remoteAnalyser.getByteFrequencyData(remoteArray);
              let rSum = 0;
              for (let i = 0; i < remoteArray.length; i++) rSum += remoteArray[i];
              const rAvg = rSum / remoteArray.length;
              const rNormalized = Math.min(100, Math.round((rAvg / 128) * 100));

              setPartnerAudioLevel(rNormalized);
              setIsPartnerSpeaking(rAvg > 10);
              requestAnimationFrame(checkRemoteAudio);
            };
            checkRemoteAudio();
          } catch (e) {}
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) socket.emit('webrtc_ice_candidate', { roomId: currentRoomId, candidate: event.candidate });
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') setConnectionStatus('reconnecting');
      };

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_offer', { roomId: currentRoomId, sdp: pc.localDescription });
      } else if (pendingOfferRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        pendingOfferRef.current = null;
        
        while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc_answer', { roomId: currentRoomId, sdp: pc.localDescription });
      }

    } catch (err: any) {
      setMediaError('Permita o uso da câmera e do microfone para conversar.');
    }
  }, [setupAudioAnalyzer]);

  useEffect(() => {
    const baseURL = api.defaults.baseURL || 'http://localhost:3000';
    const newSocket = io(baseURL, { withCredentials: true });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      newSocket.emit('find_match', { topicId: topicId || null });
    });

    newSocket.on('match_found', async (data: { roomId: string; partnerId: string; partnerName?: string; partnerAvatar?: string; initiator: boolean }) => {
      hasRatedCurrentSessionRef.current = false;
      setRoomId(data.roomId);
      roomIdRef.current = data.roomId;
      setPartnerId(data.partnerId);
      
      const resolvedPartnerName = data.partnerName || 'Estudante';
      setPartnerName(resolvedPartnerName);
      setPartnerAvatarUrl(data.partnerAvatar || getAvatarFallback(resolvedPartnerName));
      
      setPartnerDisconnected(false);
      setIsSearchingNextPair(false);
      setFriendRequestSent(false);
      setIncomingFriendRequest(null);
      await initializeWebRTC(newSocket, data.roomId, data.initiator);
    });

    newSocket.on('partner_left', () => {
      const state = sessionStateRef.current;
      
      if (state.isSearching || !roomIdRef.current || hasRatedCurrentSessionRef.current) return;
      
      hasRatedCurrentSessionRef.current = true;
      setIsConfirmExitOpen(false); 

      completedSessionRef.current = {
        roomId: roomIdRef.current || roomId,
        partnerId: state.partnerId,
        partnerName: state.partnerName,
        partnerAvatarUrl: state.partnerAvatarUrl,
        duration: state.duration,
      };

      stopMediaStream();
      setPendingAction('nextPair');
      showToast('O seu parceiro encerrou a chamada.', 'info');
      setIsRatingOpen(true);
    });

    newSocket.on('camera_status', (data: { camActive: boolean }) => {
      setRemoteCamActiveState(data.camActive);
    });

    newSocket.on('friend_request_received', (data: { requestId: string; senderId: string; name: string; avatar: string }) => {
      setIncomingFriendRequest(data);
    });

    newSocket.on('webrtc_offer', async (data: { sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) {
        pendingOfferRef.current = data.sdp;
        return;
      }
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      newSocket.emit('webrtc_answer', { roomId: roomIdRef.current, sdp: pc.localDescription });
    });

    newSocket.on('webrtc_answer', async (data: { sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    newSocket.on('webrtc_ice_candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
        pendingCandidates.current.push(data.candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {}
    });

    newSocket.on('chat_message', (data: { text: string; id: number }) => {
      setChatMessages((prev) => [...prev, { id: data.id, sender: 'other', text: data.text }]);
    });

    return () => {
      stopMediaStream();
      newSocket.disconnect();
    };
  }, [topicId, initializeWebRTC, stopMediaStream, showToast]);

  const handleSendFriendRequest = useCallback(async () => {
    if (!partnerId || friendRequestSent) return;
    try {
      const response = await api.post('/api/friends/request', { targetUserId: partnerId });
      if (response.status === 200 || response.status === 201) {
        setFriendRequestSent(true);
        showToast('Solicitação de amizade enviada com sucesso!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao enviar solicitação de amizade', 'error');
    }
  }, [partnerId, friendRequestSent, showToast]);

  const handleAcceptOrRejectFriend = useCallback(async (action: 'accept' | 'reject') => {
    if (!incomingFriendRequest) return;
    try {
      const response = await api.post('/api/friends/accept', {
        requestId: incomingFriendRequest.requestId,
        senderId: incomingFriendRequest.senderId,
        action
      });

      if (response.status === 200) {
        if (action === 'accept') {
          showToast(`Você e ${incomingFriendRequest.name} agora são amigos! 🤝`, 'success');
          setFriendRequestSent(true);
        } else {
          showToast('Solicitação de amizade recusada.', 'info');
        }
      } else {
        showToast('Erro ao processar a solicitação.', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão ao responder solicitação.', 'error');
    } finally {
      setIncomingFriendRequest(null);
    }
  }, [incomingFriendRequest, showToast]);

  const toggleMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => { track.enabled = !micActive; });
    }
    setMicActive(!micActive);
  }, [micActive]);

  const toggleCamera = useCallback(() => {
    const nextCamState = !camActive;
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => { 
        track.enabled = nextCamState; 
      });
    }
    setCamActive(nextCamState);

    if (socketRef.current && roomIdRef.current) {
      socketRef.current.emit('camera_status', { roomId: roomIdRef.current, camActive: nextCamState });
    }
  }, [camActive]);

  const handleConfirmReport = useCallback(async (reason: string) => {
    setIsReportOpen(false);
    try {
      await api.post('/api/room/report', { 
        reportedUserId: partnerId, 
        reason,
        sessionDuration: sessionElapsedSeconds,
        messageCount: chatMessages.length,
        roomId
      });
    } catch (err) {}
    
    if (socketRef.current && roomIdRef.current) {
      socketRef.current.emit('leave_room', { roomId: roomIdRef.current });
      roomIdRef.current = null;
    }

    if (!hasRatedCurrentSessionRef.current) {
      hasRatedCurrentSessionRef.current = true;
      completedSessionRef.current = {
        roomId,
        partnerId,
        partnerName,
        partnerAvatarUrl,
        duration: sessionElapsedSeconds,
      };

      setPendingAction('nextPair');
      setIsRatingOpen(true);
    }
  }, [partnerId, sessionElapsedSeconds, chatMessages.length, roomId, partnerName, partnerAvatarUrl]);

  const handleEndCall = useCallback(() => {
    if (isSearchingNextPair) {
      if (socketRef.current) socketRef.current.emit('cancel_match');
      stopMediaStream();
      setPendingAction('exit');
      
      completedSessionRef.current = { roomId: null, partnerId: null, partnerName: 'Estudante', partnerAvatarUrl: getAvatarFallback('Estudante'), duration: 0 };
      navigate('/dashboard');
    } else {
      setIsConfirmExitOpen(true);
    }
  }, [isSearchingNextPair, stopMediaStream, navigate]);

  const handleConfirmExit = useCallback(() => {
    if (socketRef.current && roomIdRef.current) {
      socketRef.current.emit('leave_room', { roomId: roomIdRef.current });
      roomIdRef.current = null;
    }
    
    if (!hasRatedCurrentSessionRef.current) {
      hasRatedCurrentSessionRef.current = true;
      completedSessionRef.current = {
        roomId,
        partnerId,
        partnerName,
        partnerAvatarUrl,
        duration: sessionElapsedSeconds,
      };
    }
    
    stopMediaStream();
    setIsConfirmExitOpen(false);
    setPendingAction('exit');
    setIsRatingOpen(true);
  }, [roomId, partnerId, partnerName, partnerAvatarUrl, sessionElapsedSeconds, stopMediaStream]);

  const handleNextPair = useCallback(() => {
    if (socketRef.current && roomIdRef.current) {
      socketRef.current.emit('leave_room', { roomId: roomIdRef.current });
      roomIdRef.current = null;
    }

    if (!hasRatedCurrentSessionRef.current) {
      hasRatedCurrentSessionRef.current = true;
      completedSessionRef.current = {
        roomId,
        partnerId,
        partnerName,
        partnerAvatarUrl,
        duration: sessionElapsedSeconds,
      };
      setPendingAction('nextPair');
      setIsRatingOpen(true);
    }
  }, [roomId, partnerId, partnerName, partnerAvatarUrl, sessionElapsedSeconds]);

  const triggerSearchNextPair = useCallback(() => {
    stopMediaStream();
    setPartnerDisconnected(false);
    setConnectionStatus('reconnecting');
    setChatMessages([]);
    setIsSearchingNextPair(true);
    setSessionElapsedSeconds(0);
    setCurrentTopic(topicId && TOPICS_CATALOG[topicId] ? TOPICS_CATALOG[topicId] : FREE_TALK_TOPIC);
    setIncomingFriendRequest(null);
    
    if (socketRef.current) {
      socketRef.current.emit('find_match', { topicId: topicId || null });
    }
  }, [stopMediaStream, topicId]);

  const handleRatingSubmit = useCallback(async (data: { partnerRating?: number; platformRating: number; comment: string }) => {
    setIsRatingOpen(false);

    const sessionContext = completedSessionRef.current;
    const targetRoomId = sessionContext.roomId || roomId || `session_${Date.now()}`;
    const targetPartnerId = sessionContext.partnerId || partnerId;
    const targetPartnerName = sessionContext.partnerName || partnerName;
    const targetPartnerAvatar = sessionContext.partnerAvatarUrl || partnerAvatarUrl;
    const targetDurationSec = sessionContext.duration || sessionElapsedSeconds;

    try {
      await api.post('/api/room/rate', {
        ...data,
        sessionId: targetRoomId,
        partnerId: targetPartnerId,
        partnerName: targetPartnerName,
        partnerAvatar: targetPartnerAvatar,
        duration: `${Math.floor(targetDurationSec / 60)} min`,
        topic: currentTopic.title,
        vocabLearned: currentTopic.vocabPreview || ['Vocabulary', 'Conversation', 'Fluency']
      });
    } catch (err) {}

    completedSessionRef.current = { roomId: null, partnerId: null, partnerName: 'Estudante', partnerAvatarUrl: getAvatarFallback('Estudante'), duration: 0 };
    
    if (pendingAction === 'exit') navigate('/dashboard');
    else triggerSearchNextPair();
  }, [roomId, partnerId, partnerName, partnerAvatarUrl, sessionElapsedSeconds, currentTopic, pendingAction, navigate, triggerSearchNextPair]);

  const handleRatingClose = useCallback(() => {
    setIsRatingOpen(false);
    completedSessionRef.current = { roomId: null, partnerId: null, partnerName: 'Estudante', partnerAvatarUrl: getAvatarFallback('Estudante'), duration: 0 };
    if (pendingAction === 'exit') navigate('/dashboard');
    else triggerSearchNextPair();
  }, [pendingAction, navigate, triggerSearchNextPair]);

  const handleSendMessage = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !roomIdRef.current) return;

    if (socketRef.current) {
      socketRef.current.emit('chat_message', { roomId: roomIdRef.current, text: trimmed });
    }

    setChatMessages((prev) => [...prev, { id: Date.now(), sender: 'me', text: trimmed }]);
    setChatInput('');
  }, [chatInput]);

  const formattedTimer = useMemo(() => formatSessionTimer(sessionElapsedSeconds), [sessionElapsedSeconds]);

  const isRemoteVideoActive = useMemo(() => {
    if (!remoteStream || !remoteCamActiveState) return false;
    const videoTracks = remoteStream.getVideoTracks();
    return videoTracks.length > 0 && videoTracks.some(track => track.enabled && track.readyState === 'live');
  }, [remoteStream, remoteCamActiveState]);

  const isLocalVideoActive = useMemo(() => {
    if (!localStream || !camActive) return false;
    const videoTracks = localStream.getVideoTracks();
    return videoTracks.length > 0 && videoTracks.some(track => track.enabled && track.readyState === 'live');
  }, [localStream, camActive]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      if (isRemoteVideoActive && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [isRemoteVideoActive, remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (isLocalVideoActive && localStream) {
        localVideoRef.current.srcObject = localStream;
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [isLocalVideoActive, localStream]);

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
            
            {!isSearchingNextPair && (
              <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#E7E5E4] px-3 py-1 rounded-xl text-xs font-black text-[#1C1917] uppercase">
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" /></svg>
                <span>{formattedTimer}</span>
              </div>
            )}
          </div>
          
          <div className="bg-[#FAF9F6] border border-[#E7E5E4] px-4 py-1.5 rounded-xl text-xs font-black uppercase text-[#1C1917] flex items-center gap-2 hidden sm:flex">
            <span className="text-[10px] bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">Prática Ativa</span>
            <span className="truncate max-w-[200px] md:max-w-md">Conversando sobre: <strong className="text-emerald-700">{currentTopic.title}</strong></span>
          </div>

          <button type="button" onClick={handleEndCall} className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm">
            {isSearchingNextPair ? 'Cancelar Busca' : 'Encerrar e Sair'}
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

      <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'p-0' : 'p-4 gap-4'}`}>
        <div ref={videoContainerRef} className={`flex-1 bg-[#FFFFFF] relative flex flex-col justify-between overflow-hidden ${isFullscreen ? 'rounded-none border-none' : `rounded-2xl border-2 transition-all duration-300 ${isPartnerSpeaking ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-[#E7E5E4] shadow-sm'}`}`}>
          {connectionStatus === 'connected' && !isSearchingNextPair && !partnerDisconnected && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-[#FFFFFF]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase text-emerald-700 border border-[#E7E5E4] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conexão Excelente</span>
              
              <div className="flex items-center gap-1 bg-[#F5F5F4] px-2 py-0.5 rounded-lg border border-[#E7E5E4]">
                <span className="text-[9px] text-[#78716C]">Vol:</span>
                <div className="w-12 h-1.5 bg-[#E7E5E4] rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-75" style={{ width: `${partnerAudioLevel}%` }} />
                </div>
              </div>
            </div>
          )}

          {incomingFriendRequest && (
            <div className="absolute top-4 left-4 z-50 bg-[#1C1917] text-[#FAF9F6] border-2 border-[#FAF9F6] p-4 rounded-2xl shadow-2xl flex flex-col gap-3 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#292524] border border-[#57534E] shrink-0">
                  <img src={incomingFriendRequest.avatar} alt={incomingFriendRequest.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase text-[#A8A29E] tracking-wider">Solicitação de Amizade</span>
                  <span className="text-xs font-black uppercase text-[#FAF9F6]">{incomingFriendRequest.name} quer ser seu amigo!</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAcceptOrRejectFriend('reject')}
                  className="flex-1 py-2 bg-[#292524] hover:bg-[#383230] text-[#FAF9F6] text-[10px] font-black uppercase rounded-xl transition-all border border-[#57534E]"
                >
                  Recusar
                </button>
                <button
                  type="button"
                  onClick={() => handleAcceptOrRejectFriend('accept')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-sm"
                >
                  Aceitar
                </button>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="absolute top-4 left-4 z-20 bg-[#1C1917]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#FAF9F6]/20 shadow-md max-w-md flex flex-col gap-1 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-black tracking-widest text-[#FAF9F6] uppercase">IA Transcription (Web Speech API)</span>
              </div>
              <p className="text-xs text-[#FAF9F6] font-medium italic">
                "{currentTranscript || 'Ouvindo sua voz...'}"
              </p>
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
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover transition-opacity duration-300 ${connectionStatus === 'reconnecting' ? 'opacity-40 grayscale-[50%]' : 'opacity-100'} ${!isRemoteVideoActive ? 'hidden' : 'block'}`} 
              />
              
              {!isRemoteVideoActive && (
                <div className="absolute inset-0 bg-[#1C1917] flex flex-col items-center justify-center z-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#292524] shadow-2xl mb-6">
                    <img src={partnerAvatarUrl} alt="Foto do Parceiro" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-[#FAF9F6] bg-[#292524] border border-[#57534E] px-4 py-2 rounded-full shadow-sm">
                    Câmera Desativada
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 left-6 bg-[#1C1917]/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-black text-[#FAF9F6] uppercase z-10 flex items-center gap-3 shadow-md">
                <span>{partnerName}</span>
                {isPartnerSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </div>
            </div>
          )}

          <div className={`absolute bottom-5 right-6 left-auto top-auto z-40 w-48 h-32 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${isUserSpeaking ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-[#FFFFFF]'}`}>
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transform -scale-x-100 ${isLocalVideoActive ? 'block' : 'hidden'}`} 
            />
            
            {!isLocalVideoActive && (
              <div className="absolute inset-0 bg-[#1C1917] flex flex-col items-center justify-center z-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#57534E] shadow-xl mb-1">
                  <img src={userAvatarUrl} alt="Sua Foto" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="absolute bottom-2 left-2 right-2 bg-[#1C1917]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-[#FAF9F6] z-10 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span>Você {!micActive && '(Mudo)'}</span>
                {isUserSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <div className="w-full h-1 bg-[#292524] rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-75" style={{ width: `${userAudioLevel}%` }} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#FFFFFF] border border-[#E7E5E4] p-2 rounded-2xl flex items-center gap-3 shadow-lg">
            <button type="button" onClick={toggleMicrophone} className={`p-3 rounded-xl transition-all border ${micActive ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {micActive ? <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /></svg> : <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>}
            </button>
            <button type="button" onClick={toggleCamera} className={`p-3 rounded-xl transition-all border ${camActive ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {camActive ? <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg> : <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>}
            </button>
            <button type="button" onClick={toggleSpeechTranscription} title="Alternar Transcrição de Voz" className={`p-3 rounded-xl transition-all border ${isTranscribing ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse' : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#1C1917] hover:bg-[#F5F5F4]'}`}>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /></svg>
            </button>
            <button type="button" onClick={toggleFullscreen} className="p-3 bg-[#FAF9F6] border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#1C1917] rounded-xl transition-all">
              {isFullscreen ? <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4.5 4.5m0 0H9m-4.5 0V9m10.5 0l4.5-4.5m0 0H15m4.5 0V9M9 15l-4.5 4.5m0 0H9m-4.5 0v-4.5m10.5 4.5l4.5 4.5m0 0H15m4.5 0v-4.5" /></svg> : <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>}
            </button>
            
            {!isSearchingNextPair && (
              <>
                <div className="w-px h-6 bg-[#E7E5E4]" />
                
                <button
                  type="button"
                  onClick={handleSendFriendRequest}
                  disabled={friendRequestSent || !partnerId}
                  className={`p-3 rounded-xl transition-all border text-xs font-bold flex items-center gap-1.5 ${
                    friendRequestSent
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                      : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#1C1917] hover:bg-[#F5F5F4]'
                  }`}
                  title={friendRequestSent ? 'Solicitação enviada' : 'Adicionar amigo'}
                >
                  {friendRequestSent ? (
                    <>
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      <span className="hidden sm:inline">Enviado</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                      <span className="hidden sm:inline">Adicionar Amigo</span>
                    </>
                  )}
                </button>

                <button type="button" onClick={() => setIsReportOpen(true)} className="p-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl transition-all text-xs font-bold">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-1.385a1.125 1.125 0 011.008 0L10.5 15l3.722-1.861a1.125 1.125 0 011.008 0L19.5 15V4.5l-4.27-2.135a1.125 1.125 0 00-1.008 0L10.5 4.23 6.778 2.369a1.125 1.125 0 00-1.008 0L3 3.75V15z" /></svg>
                </button>
                <button type="button" onClick={handleNextPair} className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm pointer-events-auto">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M12 11.25v6m0 0l-3-3m3 3l3-3" /></svg>
                  <span>PRÓXIMO PAR</span>
                </button>
              </>
            )}
          </div>

          <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} onConfirm={handleConfirmReport} />
          
          {isRatingOpen && (
            <RatingModal 
              isOpen={isRatingOpen} 
              onClose={handleRatingClose} 
              onSubmit={handleRatingSubmit} 
              partnerName={completedSessionRef.current.partnerName} 
            />
          )}

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
                  <button type="button" onClick={() => setIsConfirmExitOpen(false)} className="flex-1 py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-xs font-black uppercase rounded-xl hover:bg-[#F5F5F4] transition-all shadow-sm">Continuar na Sala</button>
                  <button type="button" onClick={handleConfirmExit} className="flex-1 py-3 bg-red-600 text-white text-xs font-black uppercase rounded-xl border-2 border-[#1C1917] hover:bg-red-700 transition-all shadow-sm">Sim, Sair</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <aside className="w-80 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm hidden md:flex">
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
                          <span className="font-black text-[10px] uppercase">{message.sender === 'me' ? 'Você' : partnerName}: </span>
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
export default Room;