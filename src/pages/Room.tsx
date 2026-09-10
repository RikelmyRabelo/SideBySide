import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../services/socket';
import { api, fetchCsrfToken } from '../lib/api';
import { ReportModal } from '../components/room/ReportModal';
import { RatingModal } from '../components/room/RatingModal';
import { TOPICS_CATALOG, FREE_TALK_TOPIC, TopicItem } from '../data/topicsData';
import { useToast } from '../components/ui/ToastContext';

const PandaPawIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <ellipse cx="12" cy="15.8" rx="4.6" ry="3.8" />
    <circle cx="6.5" cy="9.6" r="2" />
    <circle cx="10.1" cy="6.6" r="2.1" />
    <circle cx="13.9" cy="6.6" r="2.1" />
    <circle cx="17.5" cy="9.6" r="2" />
  </svg>
);

const BambooIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 2v20" />
    <path d="M9.5 7h5" />
    <path d="M9.5 14h5" />
    <path d="M12 7c2.5-2 5.5-2 7.5 0" />
    <path d="M12 14c-2.5-2 -5.5-2 -7.5 0" />
  </svg>
);

const PandaMascotIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="5" cy="5.5" r="2.5" fill="currentColor" />
    <circle cx="19" cy="5.5" r="2.5" fill="currentColor" />
    <circle cx="12" cy="13" r="7.5" />
    <ellipse cx="9.2" cy="12" rx="1.8" ry="1.4" fill="currentColor" />
    <ellipse cx="14.8" cy="12" rx="1.8" ry="1.4" fill="currentColor" />
    <path d="M11 15.2h2" />
  </svg>
);

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

const formatSessionTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ]
};

const getAvatarFallback = (name: string) => {
  const cleanName = name?.trim() || 'Estudante';
  const initial = cleanName.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=292524&color=FAF9F6&bold=true`;
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('sidebyside_user') || localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || parsed?.data || parsed;
  } catch {
    return null;
  }
};

const Room: React.FC = memo(() => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId?: string }>();
  const { showToast } = useToast();
  
  const [currentTopic, setCurrentTopic] = useState<TopicItem>(() => {
    if (topicId && TOPICS_CATALOG[topicId]) return TOPICS_CATALOG[topicId];
    return FREE_TALK_TOPIC;
  });

  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'topics' | 'chat'>('topics');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [isSearchingNextPair, setIsSearchingNextPair] = useState(true);
  const [pendingAction, setPendingAction] = useState<'exit' | 'nextPair' | null>(null);
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);

  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const [incomingFriendRequest, setIncomingFriendRequest] = useState<{ requestId: string; senderId: string; name: string; avatar: string } | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [_spokenHistory, setSpokenHistory] = useState<string[]>([]);
  const speechRecognitionRef = useRef<ISpeechRecognition | null>(null);

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isPartnerSpeaking, setIsPartnerSpeaking] = useState(false);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const [partnerAudioLevel, setPartnerAudioLevel] = useState(0);

  const [remoteCamActiveState, setRemoteCamActiveState] = useState(false);

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
  const micActiveRef = useRef(false);
  const camActiveRef = useRef(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [animStep, setAnimStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [chatMessages, setChatMessages] = useState<{ id: number; sender: 'me' | 'other'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const localUser = useMemo(() => getStoredUser(), []);
  const localUserId = useMemo(() => String(localUser?.id || localUser?._id || 'user_local'), [localUser]);
  const isInitiatorRef = useRef<boolean>(false);

  const [userAvatarUrl, setUserAvatarUrl] = useState<string>(
    localUser?.avatar || localUser?.avatarUrl || getAvatarFallback(localUser?.name || 'S')
  );

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    micActiveRef.current = micActive;
  }, [micActive]);

  useEffect(() => {
    camActiveRef.current = camActive;
  }, [camActive]);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const response = await api.get('/api/user/me');
        const data = response.data?.user || response.data?.data || response.data;
        if (data?.avatar || data?.name) {
          setUserAvatarUrl(data.avatar || getAvatarFallback(data.name || 'Estudante'));
        }
      } catch (_err: unknown) {}
    };
    fetchUserAvatar();
  }, []);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const setupAudioAnalyzer = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    } catch (_e: unknown) {}
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
      try { speechRecognitionRef.current.stop(); } catch (_e: unknown) {}
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
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      showToast('Seu navegador não suporta a Web Speech API para transcrição em tempo real.', 'error');
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

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
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
    } catch (_err: unknown) {
      setIsTranscribing(false);
    }
  }, [isTranscribing, showToast]);

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
    let timer: number | undefined;
    if (connectionStatus === 'connected' && !partnerDisconnected && !isSearchingNextPair) {
      if (!sessionStartedAtRef.current) sessionStartedAtRef.current = Date.now();
      timer = window.setInterval(() => {
        if (sessionStartedAtRef.current) setSessionElapsedSeconds(Math.floor((Date.now() - sessionStartedAtRef.current) / 1000));
      }, 1000);
    } else if (connectionStatus === 'reconnecting' || connectionStatus === 'failed' || partnerDisconnected || isSearchingNextPair) {
      sessionStartedAtRef.current = null;
    }
    
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [connectionStatus, partnerDisconnected, isSearchingNextPair, roomId]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (videoContainerRef.current?.requestFullscreen) {
          await videoContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (_err: unknown) {}
  }, []);

  const handleWebRTCOffer = useCallback(async (data: { sdp: RTCSessionDescriptionInit; senderId?: string }) => {
    if (data?.senderId && data.senderId === localUserId) return;

    const pc = peerConnectionRef.current;
    if (!pc || pc.signalingState === 'closed' || data?.sdp?.type !== 'offer') {
      if (!pc && data?.sdp) pendingOfferRef.current = data.sdp;
      return;
    }

    try {
      if (pc.signalingState !== 'stable') {
        if (!isInitiatorRef.current) {
          await pc.setLocalDescription({ type: 'rollback' } as RTCSessionDescriptionInit).catch(() => {});
        } else {
          return;
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (roomIdRef.current) {
        socket.emit('webrtc_answer', { 
          roomId: roomIdRef.current, 
          sdp: answer,
          senderId: localUserId 
        });
      }
    } catch (_err) {}
  }, [localUserId]);

  const handleWebRTCAnswer = useCallback(async (data: { sdp: RTCSessionDescriptionInit; senderId?: string }) => {
    if (data?.senderId && data.senderId === localUserId) return;

    const pc = peerConnectionRef.current;
    if (!pc || pc.signalingState === 'closed' || data?.sdp?.type !== 'answer') return;

    try {
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          if (candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
          }
        }
      }
    } catch (_err) {}
  }, [localUserId]);

  const handleWebRTCIceCandidate = useCallback(async (data: { candidate: RTCIceCandidateInit; senderId?: string }) => {
    if (data?.senderId && data.senderId === localUserId) return;

    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
      if (data?.candidate) pendingCandidates.current.push(data.candidate);
      return;
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (_err: unknown) {}
  }, [localUserId]);

  const initializeWebRTC = useCallback(async (currentRoomId: string, isInitiator: boolean) => {
    try {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const preferredAudioId = localStorage.getItem('sbs_preferred_audio_id');
      const preferredVideoId = localStorage.getItem('sbs_preferred_video_id');

      const constraints: MediaStreamConstraints = {
        audio: preferredAudioId ? { deviceId: { exact: preferredAudioId } } : true,
        video: preferredVideoId ? { deviceId: { exact: preferredVideoId } } : true,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (_fallbackErr: unknown) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      }

      stream.getAudioTracks().forEach((track) => { track.enabled = micActiveRef.current; });
      stream.getVideoTracks().forEach((track) => { track.enabled = camActiveRef.current; });

      streamRef.current = stream;
      setLocalStream(stream);
      setupAudioAnalyzer(stream);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        // Usa o objeto MediaStream nativo do navegador para não quebrar referências internas de renderização.
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else {
          setRemoteStream((prevStream) => {
            if (prevStream) {
              prevStream.addTrack(event.track);
              return prevStream;
            }
            return new MediaStream([event.track]);
          });
        }

        setConnectionStatus('connected');

        if (event.track.kind === 'audio') {
          try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const remoteAudioCtx = new AudioCtx();
            const remoteAnalyser = remoteAudioCtx.createAnalyser();
            remoteAnalyser.fftSize = 256;
            
            const audioStream = new MediaStream([event.track]);
            const remoteSource = remoteAudioCtx.createMediaStreamSource(audioStream);
            
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
          } catch (_e: unknown) {}
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc_ice_candidate', { 
            roomId: currentRoomId, 
            candidate: event.candidate,
            senderId: localUserId
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setConnectionStatus('reconnecting');
        }
      };

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_offer', { 
          roomId: currentRoomId, 
          sdp: offer,
          senderId: localUserId 
        });
      } else if (pendingOfferRef.current) {
        const offer = pendingOfferRef.current;
        pendingOfferRef.current = null;
        await handleWebRTCOffer({ sdp: offer });
      }

    } catch (_err: unknown) {
      setMediaError('Permita o uso da câmera e do microfone para conversar.');
    }
  }, [setupAudioAnalyzer, handleWebRTCOffer, localUserId]);

  useEffect(() => {
    const dispatchFindMatch = () => {
      const storedUser = getStoredUser();
      const resolvedTopicId = topicId || currentTopic?.id || 'travel';
      
      socket.emit('find_match', { 
        topicId: resolvedTopicId,
        userId: storedUser?.id,
        userName: storedUser?.name || 'Estudante',
        userAvatar: storedUser?.avatar,
        userLevel: storedUser?.level || 'B1'
      });
    };

    if (!socket.connected) {
      socket.connect();
      socket.once('connect', dispatchFindMatch);
    } else {
      dispatchFindMatch();
    }

    const handleMatchFound = async (raw: any) => {
      const resolvedRoomId = raw?.roomId || raw?.room?.id || raw?.id;
      const partner = raw?.partner || raw?.user || raw?.peer || {};
      const resolvedPartnerId = String(raw?.partnerId || partner?.id || partner?._id || 'partner_id');
      const resolvedPartnerName = raw?.partnerName || partner?.name || partner?.userName || 'Estudante';
      const resolvedPartnerAvatar = raw?.partnerAvatar || partner?.avatar || getAvatarFallback(resolvedPartnerName);

      const isInitiator = raw?.initiator !== undefined 
        ? Boolean(raw.initiator)
        : raw?.isInitiator !== undefined 
        ? Boolean(raw.isInitiator)
        : (localUserId < resolvedPartnerId);

      isInitiatorRef.current = isInitiator;

      hasRatedCurrentSessionRef.current = false;
      setRoomId(resolvedRoomId);
      roomIdRef.current = resolvedRoomId;
      setPartnerId(resolvedPartnerId);
      setPartnerName(resolvedPartnerName);
      setPartnerAvatarUrl(resolvedPartnerAvatar);
      
      setRemoteCamActiveState(false);
      setPartnerDisconnected(false);
      setIsSearchingNextPair(false);
      setFriendStatus('none');
      setIncomingFriendRequest(null);

      await initializeWebRTC(resolvedRoomId, isInitiator);

      socket.emit('camera_status', { 
        roomId: resolvedRoomId, 
        camActive: camActiveRef.current,
        senderId: localUserId 
      });
    };

    const handlePartnerLeft = () => {
      const state = sessionStateRef.current;
      if (state.isSearching || !roomIdRef.current || hasRatedCurrentSessionRef.current) return;
      
      hasRatedCurrentSessionRef.current = true;
      setIsConfirmExitOpen(false); 

      completedSessionRef.current = {
        roomId: roomIdRef.current,
        partnerId: state.partnerId,
        partnerName: state.partnerName,
        partnerAvatarUrl: state.partnerAvatarUrl,
        duration: state.duration,
      };

      stopMediaStream();
      setPendingAction('nextPair');
      showToast('O seu parceiro encerrou a chamada.', 'info');
      setIsRatingOpen(true);
    };

    const handleCameraStatus = (data: { camActive: boolean; senderId?: string }) => {
      if (data?.senderId && data.senderId === localUserId) return;
      setRemoteCamActiveState(data.camActive);
    };

    const handleFriendRequestReceived = (data: { requestId: string; senderId: string; name: string; avatar: string }) => {
      setIncomingFriendRequest(data);
    };

    const handleFriendRequestAccepted = () => {
      setFriendStatus('friends');
      showToast('Seu pedido de amizade foi aceito!', 'success');
    };
    
    const handleChatMessage = (data: { text: string; id: number }) => {
      setChatMessages((prev) => [...prev, { id: data.id, sender: 'other', text: data.text }]);
    };

    socket.off('match_found');
    socket.off('matched');
    socket.off('match-found');
    socket.off('room_joined');
    socket.off('partner_found');
    socket.off('partner_left');
    socket.off('camera_status');
    socket.off('friend_request_received');
    socket.off('friend_request_accepted');
    socket.off('friend_accepted');
    socket.off('webrtc_offer');
    socket.off('webrtc_answer');
    socket.off('webrtc_ice_candidate');
    socket.off('chat_message');

    socket.on('match_found', handleMatchFound);
    socket.on('matched', handleMatchFound);
    socket.on('match-found', handleMatchFound);
    socket.on('room_joined', handleMatchFound);
    socket.on('partner_found', handleMatchFound);

    socket.on('partner_left', handlePartnerLeft);
    socket.on('camera_status', handleCameraStatus);
    socket.on('friend_request_received', handleFriendRequestReceived);
    socket.on('friend_request_accepted', handleFriendRequestAccepted);
    socket.on('friend_accepted', handleFriendRequestAccepted);
    socket.on('webrtc_offer', handleWebRTCOffer);
    socket.on('webrtc_answer', handleWebRTCAnswer);
    socket.on('webrtc_ice_candidate', handleWebRTCIceCandidate);
    socket.on('chat_message', handleChatMessage);

    return () => {
      stopMediaStream();
      socket.off('match_found', handleMatchFound);
      socket.off('matched', handleMatchFound);
      socket.off('match-found', handleMatchFound);
      socket.off('room_joined', handleMatchFound);
      socket.off('partner_found', handleMatchFound);
      socket.off('partner_left', handlePartnerLeft);
      socket.off('camera_status', handleCameraStatus);
      socket.off('friend_request_received', handleFriendRequestReceived);
      socket.off('friend_request_accepted', handleFriendRequestAccepted);
      socket.off('friend_accepted', handleFriendRequestAccepted);
      socket.off('webrtc_offer', handleWebRTCOffer);
      socket.off('webrtc_answer', handleWebRTCAnswer);
      socket.off('webrtc_ice_candidate', handleWebRTCIceCandidate);
      socket.off('chat_message', handleChatMessage);
    };
  }, [topicId, handleWebRTCOffer, handleWebRTCAnswer, handleWebRTCIceCandidate, initializeWebRTC, stopMediaStream, showToast, localUserId]);

  const handleSendFriendRequest = useCallback(async () => {
    if (!partnerId || friendStatus !== 'none') return;
    try {
      const response = await api.post('/api/friends/request', { targetUserId: partnerId });
      if (response.data?.requestId || response.data?.message) {
        setFriendStatus('pending');
        showToast('Solicitação de amizade enviada com sucesso!', 'success');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      showToast(errorObj.response?.data?.error || errorObj.message || 'Erro ao enviar solicitação de amizade', 'error');
    }
  }, [partnerId, friendStatus, showToast]);

  const handleAcceptOrRejectFriend = useCallback(async (action: 'accept' | 'reject') => {
    if (!incomingFriendRequest) return;
    try {
      const response = await api.post('/api/friends/accept', {
        requestId: incomingFriendRequest.requestId,
        senderId: incomingFriendRequest.senderId,
        action
      });

      if (response.data) {
        if (action === 'accept') {
          showToast(`Você e ${incomingFriendRequest.name} agora são amigos!`, 'success');
          setFriendStatus('friends');
        } else {
          showToast('Solicitação de amizade recusada.', 'info');
        }
      } else {
        showToast('Erro ao processar a solicitação.', 'error');
      }
    } catch (_err: unknown) {
      showToast('Erro de conexão ao responder solicitação.', 'error');
    } finally {
      setIncomingFriendRequest(null);
    }
  }, [incomingFriendRequest, showToast]);

  const toggleMicrophone = useCallback(() => {
    const nextState = !micActive;
    
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => { track.enabled = nextState; });
    }
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => { track.enabled = nextState; });
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.enabled = nextState;
        }
      });
    }
    setMicActive(nextState);
  }, [micActive, localStream]);

  const toggleCamera = useCallback(() => {
    const nextCamState = !camActive;
    
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => { 
        track.enabled = nextCamState; 
      });
    }
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = nextCamState;
      });
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track && sender.track.kind === 'video') {
          sender.track.enabled = nextCamState;
        }
      });
    }

    setCamActive(nextCamState);

    if (roomIdRef.current) {
      socket.emit('camera_status', { 
        roomId: roomIdRef.current, 
        camActive: nextCamState,
        senderId: localUserId 
      });
    }
  }, [camActive, localStream, localUserId]);

  const handleConfirmReport = useCallback(async (reason: string) => {
    setIsReportOpen(false);
    try {
      await api.post('/api/room/report', { 
        reportedUserId: partnerId, 
        reason,
        sessionDuration: sessionElapsedSeconds,
        messageCount: chatMessages.length,
        roomId: roomIdRef.current
      });
    } catch (_err: unknown) {}
    
    if (roomIdRef.current) {
      socket.emit('leave_room', { roomId: roomIdRef.current });
      roomIdRef.current = null;
    }

    if (!hasRatedCurrentSessionRef.current) {
      hasRatedCurrentSessionRef.current = true;
      completedSessionRef.current = {
        roomId: roomIdRef.current,
        partnerId,
        partnerName,
        partnerAvatarUrl,
        duration: sessionElapsedSeconds,
      };

      setPendingAction('nextPair');
      setIsRatingOpen(true);
    }
  }, [partnerId, sessionElapsedSeconds, chatMessages.length, partnerName, partnerAvatarUrl]);

  const handleEndCall = useCallback(() => {
    if (isSearchingNextPair) {
      socket.emit('cancel_match');
      stopMediaStream();
      setPendingAction('exit');
      
      completedSessionRef.current = { roomId: null, partnerId: null, partnerName: 'Estudante', partnerAvatarUrl: getAvatarFallback('Estudante'), duration: 0 };
      navigate('/dashboard');
    } else {
      setIsConfirmExitOpen(true);
    }
  }, [isSearchingNextPair, stopMediaStream, navigate]);

  const handleConfirmExit = useCallback(() => {
    if (roomIdRef.current) {
      socket.emit('leave_room', { roomId: roomIdRef.current });
      roomIdRef.current = null;
    }
    
    if (!hasRatedCurrentSessionRef.current) {
      hasRatedCurrentSessionRef.current = true;
      completedSessionRef.current = {
        roomId: roomIdRef.current,
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
  }, [partnerId, partnerName, partnerAvatarUrl, sessionElapsedSeconds, stopMediaStream]);

  const handleNextPair = useCallback(() => {
    if (roomIdRef.current) {
      socket.emit('leave_room', { roomId: roomIdRef.current });
      roomIdRef.current = null;
    }

    if (!hasRatedCurrentSessionRef.current) {
      hasRatedCurrentSessionRef.current = true;
      completedSessionRef.current = {
        roomId: roomIdRef.current,
        partnerId,
        partnerName,
        partnerAvatarUrl,
        duration: sessionElapsedSeconds,
      };
      setPendingAction('nextPair');
      setIsRatingOpen(true);
    }
  }, [partnerId, partnerName, partnerAvatarUrl, sessionElapsedSeconds]);

  const triggerSearchNextPair = useCallback(() => {
    stopMediaStream();
    setPartnerDisconnected(false);
    setConnectionStatus('reconnecting');
    setChatMessages([]);
    setIsSearchingNextPair(true);
    setSessionElapsedSeconds(0);
    setCurrentTopic(topicId && TOPICS_CATALOG[topicId] ? TOPICS_CATALOG[topicId] : FREE_TALK_TOPIC);
    setIncomingFriendRequest(null);
    setFriendStatus('none');
    setRemoteCamActiveState(false);
    
    const storedUser = getStoredUser();
    const resolvedTopicId = topicId || currentTopic?.id || 'travel';
    socket.emit('find_match', { 
      topicId: resolvedTopicId,
      userId: storedUser?.id,
      userName: storedUser?.name || 'Estudante',
      userAvatar: storedUser?.avatar,
      userLevel: storedUser?.level || 'B1'
    });
  }, [stopMediaStream, topicId, currentTopic]);

  const handleRatingSubmit = useCallback(async (data: { partnerRating?: number; platformRating: number; comment: string }) => {
    setIsRatingOpen(false);

    const sessionContext = completedSessionRef.current;
    const targetRoomId = sessionContext.roomId || `session_${Date.now()}`;
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
    } catch (_err: unknown) {}

    completedSessionRef.current = { roomId: null, partnerId: null, partnerName: 'Estudante', partnerAvatarUrl: getAvatarFallback('Estudante'), duration: 0 };
    
    if (pendingAction === 'exit') navigate('/dashboard');
    else triggerSearchNextPair();
  }, [partnerId, partnerName, partnerAvatarUrl, sessionElapsedSeconds, currentTopic, pendingAction, navigate, triggerSearchNextPair]);

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

    socket.emit('chat_message', { roomId: roomIdRef.current, text: trimmed });

    setChatMessages((prev) => [...prev, { id: Date.now(), sender: 'me', text: trimmed }]);
    setChatInput('');
  }, [chatInput]);

  const formattedTimer = useMemo(() => formatSessionTimer(sessionElapsedSeconds), [sessionElapsedSeconds]);

  const isRemoteVideoActive = useMemo(() => {
    return Boolean(remoteStream && remoteCamActiveState);
  }, [remoteStream, remoteCamActiveState]);

  const isLocalVideoActive = useMemo(() => {
    return Boolean(localStream && camActive);
  }, [localStream, camActive]);

  // VÍDEO REMOTO: Apenas atribui quando a stream chega. Ocultação é visual via div.
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (videoEl && remoteStream) {
      if (videoEl.srcObject !== remoteStream) {
        videoEl.srcObject = remoteStream;
        videoEl.play().catch(() => {});
      }
    }
  }, [remoteStream]);

  // VÍDEO LOCAL: Apenas atribui quando a stream chega.
  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (videoEl && localStream) {
      if (videoEl.srcObject !== localStream) {
        videoEl.srcObject = localStream;
        videoEl.play().catch(() => {});
      }
    }
  }, [localStream]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans h-screen overflow-hidden relative selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      
      <style>{`
        @keyframes radarPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.12); }
        }
        @keyframes orbitPaw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .anim-radar {
          animation: radarPulse 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .anim-orbit {
          animation: orbitPaw 9s linear infinite;
        }
      `}</style>

      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] ring-2 ring-emerald-500/20 transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: `${followerPos.x}px`, top: `${followerPos.y}px`, opacity: cursorOpacity }}
      />

      {!isFullscreen && (
        <header className="bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E5E4] px-6 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            <button type="button" onClick={handleEndCall} className="flex items-center gap-3 cursor-pointer group text-left outline-none shrink-0" title="Voltar ao Dashboard">
              <img src="/images/logo.png" alt="SideBySide" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3" />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase leading-none font-sans">SIDEBYSIDE</span>
                <span className="font-mono text-[9px] font-bold tracking-widest text-[#78716C] uppercase mt-0.5 flex items-center gap-1.5">
                  <BambooIcon className="w-3 h-3 text-emerald-600" />
                  <span>PRACTICE ROOM</span>
                </span>
              </div>
            </button>
            
            {!isSearchingNextPair && (
              <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#E7E5E4] px-3 py-1 rounded-xl font-mono text-xs font-bold text-[#1C1917] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{formattedTimer}</span>
              </div>
            )}
          </div>
          
          <div className="bg-[#FAF9F6] border border-[#E7E5E4] px-4 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider text-[#1C1917] hidden sm:flex items-center gap-2 shadow-2xs">
            <span className="bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded flex items-center gap-1.5">
              <PandaPawIcon className="w-3 h-3 text-emerald-400" /> ACTIVE
            </span>
            <span className="truncate max-w-[200px] md:max-w-md">TOPIC: <strong className="text-emerald-700">{currentTopic.title}</strong></span>
          </div>

          <button type="button" onClick={handleEndCall} className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:-translate-y-0.5 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-2xs cursor-pointer active:scale-95">
            {isSearchingNextPair ? 'CANCELAR BUSCA' : 'ENCERRAR SESSÃO'}
          </button>
        </header>
      )}

      {mediaError && !isFullscreen && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center justify-between z-40">
          <span className="flex items-center gap-2"><svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> AVISO: {mediaError}</span>
          <div className="flex items-center gap-3">
            <button type="button" className="px-3 py-1 bg-[#1C1917] text-[#FAF9F6] rounded-lg shadow-2xs cursor-pointer">USAR APENAS ÁUDIO</button>
            <button type="button" className="underline text-amber-900 hover:text-amber-700 cursor-pointer">TENTAR NOVAMENTE</button>
          </div>
        </div>
      )}

      <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'p-0' : 'p-4 gap-4'}`}>
        <div ref={videoContainerRef} className={`flex-1 bg-[#1C1917] relative flex flex-col justify-between overflow-hidden ${isFullscreen ? 'rounded-none border-none' : `rounded-3xl border border-[#292524] transition-all duration-300 ${isPartnerSpeaking ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'shadow-2xl'}`}`}>
          
          {connectionStatus === 'connected' && !isSearchingNextPair && !partnerDisconnected && (
            <div className="absolute top-5 right-5 z-20 flex items-center gap-3 bg-[#1C1917]/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-white/10 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ESTÁVEL</span>
              <div className="flex items-center gap-1.5 bg-[#292524] px-2 py-1 rounded-lg border border-white/5">
                <span className="text-[#A8A29E] text-[8px]">VOL</span>
                <div className="w-10 h-1 bg-[#57534E] rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-75" style={{ width: `${partnerAudioLevel}%` }} />
                </div>
              </div>
            </div>
          )}

          {incomingFriendRequest && (
            <div className="absolute top-5 left-5 z-50 bg-[#FFFFFF] border-2 border-[#1C1917] p-4 rounded-3xl shadow-[4px_4px_0px_0px_#1C1917] flex flex-col gap-3 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#E7E5E4] shrink-0">
                  <img src={incomingFriendRequest.avatar} alt={incomingFriendRequest.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-mono text-[9px] font-bold uppercase text-[#78716C] tracking-widest flex items-center gap-1"><PandaPawIcon className="w-3 h-3 text-[#1C1917]"/> NOVA CONEXÃO</span>
                  <span className="text-xs font-black uppercase text-[#1C1917]">{incomingFriendRequest.name} quer ser seu amigo!</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => handleAcceptOrRejectFriend('reject')} className="flex-1 py-2 bg-[#FAF9F6] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer">RECUSAR</button>
                <button type="button" onClick={() => handleAcceptOrRejectFriend('accept')} className="flex-1 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer">ACEITAR</button>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="absolute top-5 left-5 z-20 bg-[#1C1917]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl max-w-md flex flex-col gap-1.5 text-left">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-[#FAF9F6] uppercase">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                IA_TRANSCRIPT
              </div>
              <p className="text-xs text-[#D6D3D1] font-medium italic">
                "{currentTranscript || 'Ouvindo sua voz...'}"
              </p>
            </div>
          )}

          {connectionStatus === 'reconnecting' && !isSearchingNextPair && !partnerDisconnected && (
            <div className="absolute top-5 right-5 z-20 flex items-center gap-2 bg-[#292524]/90 backdrop-blur-md px-3.5 py-2 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest text-amber-500 border border-amber-500/30 shadow-2xl animate-in fade-in duration-300">
              <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <span>RECONECTANDO...</span>
            </div>
          )}

          {isSearchingNextPair ? (
            <div className="absolute inset-0 bg-[#FFFFFF] z-50 flex items-center justify-center p-4 rounded-3xl">
              <div className="flex flex-col items-center gap-8 text-center max-w-md">
                
                <div className="relative flex items-center justify-center w-40 h-40">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 anim-radar" />
                  <div className="absolute -inset-4 rounded-full border border-emerald-400/10 anim-radar" style={{ animationDelay: '1s' }} />

                  <div className="absolute inset-0 rounded-full anim-orbit pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-emerald-600">
                      <PandaPawIcon className="w-5 h-5" />
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-[#1C1917]">
                      <PandaPawIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-3xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-center justify-center p-3 shadow-md z-10">
                    <img src="/images/logo.png" alt="SideBySide" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <BambooIcon className="w-3.5 h-3.5 text-emerald-700" />
                    DOIS PANDAS LADO A LADO
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[#1C1917]">Procurando Par...</h2>
                  <p className="font-mono text-[11px] text-[#78716C] uppercase bg-[#FAF9F6] px-3 py-1.5 rounded-lg border border-[#E7E5E4]">
                    TÓPICO: <strong className="text-[#1C1917]">{currentTopic.title}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#1C1917] flex items-center justify-center overflow-hidden">
              
              {/* VÍDEO SEMPRE RENDERIZADO */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover transition-all duration-500 ${connectionStatus === 'reconnecting' ? 'opacity-40 grayscale-[50%] blur-sm' : 'opacity-100'}`} 
              />
              
              {/* OVERLAY SOBREPOSTO (CÂMERA DESATIVADA) */}
              {!isRemoteVideoActive && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110 transition-all duration-700" style={{ backgroundImage: `url(${partnerAvatarUrl})` }}></div>
                  <div className="absolute inset-0 bg-[#1C1917]/50"></div>
                  
                  <div className="relative z-20 flex flex-col items-center justify-center gap-8">
                    <div className="relative">
                      {isPartnerSpeaking && <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-2xl animate-pulse"></div>}
                      <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-[#292524] shadow-2xl relative z-10 bg-[#292524]">
                        <img src={partnerAvatarUrl} alt="Foto do Parceiro" className="w-full h-full object-cover" />
                      </div>
                      {isPartnerSpeaking && (
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full border-4 border-[#1C1917] flex items-center justify-center z-20 animate-bounce shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#FAF9F6] bg-[#292524]/80 backdrop-blur-md border border-[#57534E] px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
                      <svg className="w-4 h-4 fill-none stroke-emerald-500 stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>
                      CÂMERA DESATIVADA
                    </span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-6 left-6 bg-[#1C1917]/70 backdrop-blur-md px-5 py-2.5 rounded-2xl font-mono text-[11px] font-bold text-[#FAF9F6] uppercase tracking-wider z-30 flex items-center gap-3 shadow-xl border border-white/10">
                <span>{partnerName}</span>
                {isPartnerSpeaking && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />}
              </div>
            </div>
          )}

          <div className={`absolute bottom-6 right-6 left-auto top-auto z-40 w-56 h-40 rounded-3xl overflow-hidden bg-[#292524] shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 ${isUserSpeaking ? 'ring-4 ring-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)] transform -translate-y-1' : 'border-2 border-[#57534E]'}`}>
            
            {/* VÍDEO LOCAL SEMPRE RENDERIZADO */}
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform -scale-x-100" 
            />
            
            {/* OVERLAY SOBREPOSTO LOCAL */}
            {!isLocalVideoActive && (
              <div className="absolute inset-0 bg-[#292524] flex flex-col items-center justify-center z-10">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#57534E] shadow-xl mb-3 relative bg-[#1C1917]">
                  <img src={userAvatarUrl} alt="Sua Foto" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#1C1917]/80 backdrop-blur-md px-3 py-2 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider text-[#FAF9F6] border border-white/10 z-20 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span>VOCÊ {!micActive && <span className="text-red-400 ml-1">(MUDO)</span>}</span>
                {isUserSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
              <div className="w-full h-1 bg-[#292524] rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-75" style={{ width: `${userAudioLevel}%` }} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#FFFFFF] border border-[#E7E5E4] p-2.5 rounded-3xl flex items-center gap-2.5 shadow-2xl">
            <button type="button" onClick={toggleMicrophone} title="Microfone" className={`p-3.5 rounded-2xl transition-all cursor-pointer ${micActive ? 'bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] hover:border-[#1C1917]' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}>
              {micActive ? <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /></svg> : <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>}
            </button>
            <button type="button" onClick={toggleCamera} title="Câmera" className={`p-3.5 rounded-2xl transition-all cursor-pointer ${camActive ? 'bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] hover:border-[#1C1917]' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}>
              {camActive ? <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg> : <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>}
            </button>
            <button type="button" onClick={toggleSpeechTranscription} title="IA Transcrição" className={`p-3.5 rounded-2xl transition-all border cursor-pointer ${isTranscribing ? 'bg-emerald-50 border-emerald-300 text-emerald-700 animate-pulse' : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#1C1917] hover:border-[#1C1917]'}`}>
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /></svg>
            </button>
            <button type="button" onClick={toggleFullscreen} title="Tela Cheia" className="p-3.5 bg-[#FAF9F6] border border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917] rounded-2xl transition-all cursor-pointer">
              {isFullscreen ? <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4.5 4.5m0 0H9m-4.5 0V9m10.5 0l4.5-4.5m0 0H15m4.5 0V9M9 15l-4.5 4.5m0 0H9m-4.5 0v-4.5m10.5 4.5l4.5 4.5m0 0H15m4.5 0v-4.5" /></svg> : <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>}
            </button>
            
            {!isSearchingNextPair && (
              <>
                <div className="w-px h-8 bg-[#E7E5E4] mx-1" />
                
                <button
                  type="button"
                  onClick={handleSendFriendRequest}
                  disabled={friendStatus !== 'none' || !partnerId}
                  className={`p-3.5 rounded-2xl transition-all border font-mono text-[10px] font-bold flex items-center gap-2 tracking-widest ${
                    friendStatus === 'friends'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 cursor-default'
                      : friendStatus === 'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 cursor-default'
                      : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#1C1917] hover:border-[#1C1917] cursor-pointer'
                  }`}
                >
                  {friendStatus === 'friends' ? (
                    <><PandaPawIcon className="w-5 h-5" /><span className="hidden sm:inline">AMIGOS</span></>
                  ) : friendStatus === 'pending' ? (
                    <><svg className="w-5 h-5 fill-none stroke-current stroke-2 animate-pulse" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" /></svg><span className="hidden sm:inline">PENDENTE</span></>
                  ) : (
                    <><PandaPawIcon className="w-5 h-5" /><span className="hidden sm:inline">ADICIONAR AMIGO</span></>
                  )}
                </button>

                <button type="button" title="Reportar Problema" onClick={() => setIsReportOpen(true)} className="p-3.5 bg-[#FAF9F6] border border-[#E7E5E4] text-red-600 hover:border-red-200 hover:bg-red-50 rounded-2xl transition-all cursor-pointer">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-1.385a1.125 1.125 0 011.008 0L10.5 15l3.722-1.861a1.125 1.125 0 011.008 0L19.5 15V4.5l-4.27-2.135a1.125 1.125 0 00-1.008 0L10.5 4.23 6.778 2.369a1.125 1.125 0 00-1.008 0L3 3.75V15z" /></svg>
                </button>
                <button type="button" title="Pular para o próximo parceiro" onClick={handleNextPair} className="px-6 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-2xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-[#1C1917]">
                  <BambooIcon className="w-4 h-4 text-emerald-400" />
                  <span>PRÓXIMO PAR</span>
                </button>
              </>
            )}
          </div>

          <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} onConfirm={handleConfirmReport} />
          {isRatingOpen && (
            <RatingModal isOpen={isRatingOpen} onClose={handleRatingClose} onSubmit={handleRatingSubmit} partnerName={completedSessionRef.current.partnerName} />
          )}

          {isConfirmExitOpen && (
            <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
              <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 text-center animate-in fade-in zoom-in-95 duration-150">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                  <PandaMascotIcon className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-3 py-1 rounded-lg w-fit mx-auto border border-[#1C1917]">SAÍDA DA SESSÃO</span>
                  <h3 className="text-xl font-black uppercase text-[#1C1917] mt-1">Tem certeza que deseja sair?</h3>
                  <p className="text-xs text-[#57534E] font-medium leading-relaxed">A conexão ao vivo com seu par atual será perdida e vocês deixarão de aprender lado a lado.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <button type="button" onClick={() => setIsConfirmExitOpen(false)} className="w-full py-3.5 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E7E5E4] transition-all shadow-2xs cursor-pointer active:scale-95">CONTINUAR NA SALA</button>
                  <button type="button" onClick={handleConfirmExit} className="w-full py-3.5 bg-red-600 text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl border-2 border-[#1C1917] hover:bg-red-700 transition-all shadow-2xs cursor-pointer active:scale-95">SIM, ENCERRAR</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <aside className="w-[340px] bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl flex flex-col overflow-hidden shrink-0 shadow-sm hidden md:flex">
            
            <div className="grid grid-cols-2 bg-[#FAF9F6] p-1.5 border-b border-[#E7E5E4] font-mono text-[10px] font-bold uppercase tracking-widest">
              <button type="button" onClick={() => setActiveTab('topics')} className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'topics' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'}`}>
                <BambooIcon className="w-3.5 h-3.5" /> GUIA DE TÓPICOS
              </button>
              <button type="button" onClick={() => setActiveTab('chat')} className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'}`}>
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> CHAT ({chatMessages.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {activeTab === 'topics' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col pb-3 border-b border-[#E7E5E4]">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#78716C] flex items-center gap-1"><PandaPawIcon className="w-2.5 h-2.5" /> LINHA NARRATIVA</span>
                    <h3 className="text-sm font-black uppercase text-[#1C1917] mt-1">{currentTopic.title}</h3>
                  </div>

                  {currentTopic.steps.map((step) => (
                    <div key={step.stepNumber} className="bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-2xl flex flex-col gap-2.5 hover:border-[#1C1917] transition-all group">
                      <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#57534E] flex items-center gap-1.5"><BambooIcon className="w-3 h-3 text-emerald-600"/> {step.stageTitle}</span>
                        <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#FAF9F6] text-[10px] font-black flex items-center justify-center border border-[#1C1917] shadow-2xs group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-colors">{step.stepNumber}</span>
                      </div>
                      <p className="text-xs font-bold text-[#1C1917] leading-relaxed">"{step.question}"</p>
                      
                      <div className="flex flex-col gap-1.5 pt-2">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#78716C]">FRASE DE TRANSICAO:</span>
                        <span className="text-[11px] font-semibold text-[#57534E] italic bg-[#FFFFFF] p-2 rounded-xl border border-[#E7E5E4]">"{step.transitionPhrase}"</span>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-1">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#78716C]">VOCAB LOGGED:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {step.keywords.map((word, idx) => (
                            <span key={idx} className="font-mono text-[9px] font-bold text-[#1C1917] bg-[#E7E5E4] px-2 py-0.5 rounded-md uppercase tracking-wider">{word}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
                    {chatMessages.length === 0 ? (
                      <div className="flex h-full flex-col gap-2 items-center justify-center text-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#78716C] border border-dashed border-[#E7E5E4] rounded-2xl p-6 bg-[#FAF9F6]">
                        <PandaMascotIcon className="w-8 h-8 text-[#D6D3D1]" />
                        <span>NENHUMA MENSAGEM</span>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div key={message.id} className={`p-3 rounded-2xl text-xs flex flex-col gap-1 shadow-2xs ${message.sender === 'me' ? 'bg-[#1C1917] text-[#FAF9F6] self-end rounded-tr-sm border border-[#1C1917]' : 'bg-[#FAF9F6] text-[#1C1917] border border-[#E7E5E4] self-start rounded-tl-sm'}`}>
                          <span className={`font-mono text-[9px] font-bold uppercase tracking-wider opacity-70`}>{message.sender === 'me' ? 'VOCÊ' : partnerName}</span>
                          <span className="font-medium leading-relaxed">{message.text}</span>
                        </div>
                      ))  
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2 bg-[#FAF9F6] p-1.5 rounded-2xl border border-[#E7E5E4] shadow-2xs focus-within:border-[#1C1917] transition-colors">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent px-3 py-2 font-mono text-[11px] font-bold text-[#1C1917] outline-none placeholder-[#A8A29E]" />
                    <button type="submit" className="bg-[#1C1917] hover:bg-[#292524] px-4 py-2 rounded-xl font-mono text-[10px] font-bold text-[#FAF9F6] cursor-pointer active:scale-95 transition-transform flex items-center justify-center">
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                    </button>
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