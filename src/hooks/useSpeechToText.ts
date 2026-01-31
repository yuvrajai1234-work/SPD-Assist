import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSpeechToText(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsListening(false);
    setIsConnecting(false);
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    chunksRef.current = [];

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (chunksRef.current.length === 0) return;

        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        
        // Use Web Speech API for transcription as a fallback
        // since ElevenLabs realtime STT requires WebSocket setup
        try {
          // Try using the browser's SpeechRecognition API
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // Already handled by SpeechRecognition
          }
        } catch (err) {
          console.error("Transcription error:", err);
        }
      };

      // Use Web Speech API for real-time transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          stopListening();
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setError(event.error);
          stopListening();
        };

        recognition.onend = () => {
          stopListening();
        };

        recognition.start();
        setIsListening(true);
        setIsConnecting(false);
      } else {
        throw new Error("Speech recognition not supported in this browser");
      }

    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError(err instanceof Error ? err.message : "Failed to start listening");
      stopListening();
    }
  }, [onTranscript, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    startListening,
    stopListening,
    isListening,
    isConnecting,
    error,
  };
}
