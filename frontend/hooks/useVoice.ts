import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useVoice() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Unlock AudioContext on first user gesture — required for mobile autoplay policy
  const unlockAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  };

  const startProcessingTimeout = () => {
    processingTimeoutRef.current = setTimeout(() => {
      setError('Request timed out. Please try again.');
      stopProcessing();
    }, 60000);
  };

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

    const socket = io(wsUrl, {
      transports: ['polling', 'websocket'],
      extraHeaders: { 'ngrok-skip-browser-warning': 'true' },
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', (err) => console.error('Connection error:', err));

    socket.on('ai_response', (data: { response_text: string; audio_base64: string }) => {
      setMessages(prev => [...prev, { role: 'ai', text: data.response_text }]);
      stopProcessing();

      // Decode base64 and play via Web Audio API — works on mobile without autoplay restrictions
      // because it runs in the context of the socket event which follows a user gesture
      try {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const audioData = atob(data.audio_base64);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }

        ctx.decodeAudioData(audioArray.buffer, (buffer) => {
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        }, (err) => {
          console.error('Audio decode error:', err);
          const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
          audio.play().catch(e => console.error('Audio play fallback error:', e));
        });
      } catch (err) {
        console.error('Audio setup error:', err);
      }
    });

    socket.on('error', (data: { message: string }) => {
      setError(data?.message || 'Server error');
      stopProcessing();
    });

    return () => {
      socket.disconnect();
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  const startRecording = async () => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server. Please refresh.');
      return;
    }
    if (isProcessing) return;
    setError(null);
    unlockAudio(); // unlock AudioContext on user gesture

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        if (audioBlob.size < 500) {
          setError('Recording too short. Please speak for at least 1 second.');
          stopProcessing();
          return;
        }

        try {
          const formData = new FormData();
          const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
          formData.append('audio', audioBlob, `recording.${ext}`);

          const sttRes = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          if (!sttRes.ok) {
            const errText = await sttRes.text();
            throw new Error(`STT failed: ${errText}`);
          }

          const { transcript } = await sttRes.json();
          setMessages(prev => [...prev, { role: 'user', text: transcript }]);
          socketRef.current?.emit('transcript', { text: transcript });

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Transcription failed');
          stopProcessing();
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);

    } catch (err) {
      console.error('Microphone error:', err);
      setError('Microphone not available. Please allow mic access and try again.');
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    setIsRecording(false);
    setIsProcessing(true);
    startProcessingTimeout();
    recorder.requestData();
    recorder.stop();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return { isConnected, isRecording, isProcessing, error, messages, toggleRecording };
}
