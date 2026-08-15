import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useMediaStream } from '../../hooks/useMediaStream';
export const DeviceCheckModal = ({ isOpen, onClose, mediaMode, }) => {
    const videoRef = useRef(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [audioDevices, setAudioDevices] = useState([]);
    const [videoDevices, setVideoDevices] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState('');
    const [selectedVideo, setSelectedVideo] = useState('');
    const { stream, error, stopStream } = useMediaStream({
        enabled: isOpen,
        video: mediaMode === 'video',
        audio: true,
        audioDeviceId: selectedAudio,
        videoDeviceId: selectedVideo,
    });
    const audioContextRef = useRef(null);
    const animationFrameRef = useRef(null);
    useEffect(() => {
        if (stream && videoRef.current && mediaMode === 'video') {
            videoRef.current.srcObject = stream;
        }
        if (stream) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                setAudioDevices(devices.filter((d) => d.kind === 'audioinput'));
                setVideoDevices(devices.filter((d) => d.kind === 'videoinput'));
            });
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    audioContextRef.current = new AudioCtx();
                    const analyser = audioContextRef.current.createAnalyser();
                    const source = audioContextRef.current.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.fftSize = 64;
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    const updateAudioLevel = () => {
                        analyser.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
                        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
                    };
                    updateAudioLevel();
                }
                catch {
                    // Fallback silencioso para AudioContext
                }
            }
        }
        return () => {
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => { });
            }
        };
    }, [stream, mediaMode]);
    const handleClose = () => {
        stopStream();
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#78716C]", children: "CHECAGEM PR\u00C9VIA" }), _jsx("h2", { className: "text-base font-black uppercase text-[#1C1917]", children: "Teste de M\u00EDdia & Perif\u00E9ricos" })] }), _jsx("button", { type: "button", onClick: handleClose, className: "text-sm font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), error ? (_jsx("div", { className: "bg-red-50 border-2 border-red-600 p-4 rounded-2xl text-xs font-bold text-red-600 text-center", children: error })) : (_jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { className: "relative w-full h-52 bg-[#1C1917] rounded-2xl overflow-hidden border-2 border-[#1C1917] flex items-center justify-center", children: [mediaMode === 'video' ? (_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full h-full object-cover -scale-x-100" })) : (_jsxs("div", { className: "flex flex-col items-center gap-2 text-[#FAF9F6]", children: [_jsx("svg", { className: "w-12 h-12 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" }) }), _jsx("span", { className: "text-xs font-black uppercase tracking-widest", children: "Modo Apenas \u00C1udio" })] })), stream && (_jsxs("div", { className: "absolute top-3 left-3 bg-[#1C1917]/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-[#FAF9F6]/20 flex items-center gap-2 text-[10px] font-black uppercase text-[#FAF9F6]", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), "Dispositivos Prontos"] }))] }), _jsxs("div", { className: "bg-[#FAF9F6] border-2 border-[#E7E5E4] p-4 rounded-2xl flex flex-col gap-2", children: [_jsxs("div", { className: "flex justify-between items-center text-xs font-black text-[#1C1917] uppercase", children: [_jsx("span", { children: "N\u00EDvel do Microfone" }), _jsxs("span", { children: [audioLevel, "%"] })] }), _jsx("div", { className: "w-full h-3 bg-[#E7E5E4] rounded-full overflow-hidden border border-[#1C1917] p-0.5 flex gap-1", children: Array.from({ length: 15 }).map((_, idx) => (_jsx("div", { className: `flex-1 h-full rounded-sm transition-colors ${audioLevel >= (idx + 1) * 6.6
                                            ? idx > 11 ? 'bg-red-500' : idx > 8 ? 'bg-amber-500' : 'bg-emerald-500'
                                            : 'bg-transparent'}` }, idx))) })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [audioDevices.length > 0 && (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-[10px] font-black uppercase text-[#78716C]", children: "Microfone" }), _jsx("select", { value: selectedAudio, onChange: (e) => setSelectedAudio(e.target.value), className: "px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]", children: audioDevices.map((d) => (_jsx("option", { value: d.deviceId, children: d.label || `Microfone (${d.deviceId.slice(0, 5)}...)` }, d.deviceId))) })] })), mediaMode === 'video' && videoDevices.length > 0 && (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-[10px] font-black uppercase text-[#78716C]", children: "C\u00E2mera" }), _jsx("select", { value: selectedVideo, onChange: (e) => setSelectedVideo(e.target.value), className: "px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]", children: videoDevices.map((d) => (_jsx("option", { value: d.deviceId, children: d.label || `Câmera (${d.deviceId.slice(0, 5)}...)` }, d.deviceId))) })] }))] })] })), _jsx("button", { type: "button", onClick: handleClose, className: "w-full py-3.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#292524] transition-all", children: "Confirmar Dispositivos" })] }) }));
};
