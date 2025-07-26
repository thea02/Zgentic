
import React, { useState, useRef, createRef, useEffect, useCallback } from 'react';
import DrawingCanvas, { DrawingCanvasRef } from './DrawingCanvas';
import { SparklesIcon, PencilIcon, MicrophoneIcon, StopCircleIcon } from './icons';

// Web Speech API type declarations to satisfy TypeScript
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}
interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface DreamMirrorProps {
  onAnalyze: (dream: string, drawingDataUrl: string) => void;
}

const DreamMirror: React.FC<DreamMirrorProps> = ({ onAnalyze }) => {
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const canvasRef = createRef<DrawingCanvasRef>();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
    }
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    setRecordingError(null);
    if (!isRetrying) { // don't clear text on retry
      setDreamText(prev => prev.trim());
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = dreamText ? dreamText.trim() + ' ' : '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + '. ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setDreamText(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
        if (!isRetrying) {
            setIsRecording(false);
            setDreamText(prev => prev.trim());
        }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'network' && retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            setIsRecording(false);
            setRecordingError(`Connection lost. Retrying... (${retryCount.current}/${MAX_RETRIES})`);
            setIsRetrying(true);
            return;
        }

        setIsRetrying(false);
        setIsRecording(false);
        retryCount.current = 0;
        
        let message = "An unexpected recording error occurred. Please try again.";
        switch (event.error) {
            case 'network':
                message = "I'm still having trouble connecting to the speech service. Please check your internet connection and try again.";
                break;
            case 'no-speech':
                message = "I didn't hear anything. Please try speaking a bit louder.";
                break;
            case 'not-allowed':
            case 'service-not-allowed':
                message = "I can't access your microphone. Please check your browser permissions to use voice input.";
                break;
            case 'audio-capture':
                message = "I can't seem to access your microphone. Please make sure it's connected and working.";
                break;
        }
        setRecordingError(message);
    };

    recognition.start();
    setIsRecording(true);
    setIsRetrying(false);
  }, [dreamText, isRetrying]);

  useEffect(() => {
    let timeoutId: number;
    if (isRetrying) {
        timeoutId = window.setTimeout(() => {
            startRecognition();
        }, 1500);
    }
    return () => {
        clearTimeout(timeoutId);
    };
  }, [isRetrying, startRecognition]);

  const handleToggleRecording = useCallback(() => {
    if (!isSpeechSupported) return;

    if (isRecording || isRetrying) {
        setIsRetrying(false);
        retryCount.current = 0;
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        } else {
            setIsRecording(false);
        }
    } else {
        retryCount.current = 0;
        startRecognition();
    }
  }, [isRecording, isRetrying, isSpeechSupported, startRecognition]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasDrawing = canvasRef.current?.hasBeenDrawnOn() ?? false;
    const hasText = dreamText.trim().length > 0;

    if (!hasText && !hasDrawing) {
        alert("Please share your dream by writing, recording, or drawing something!");
        return;
    }
    
    const drawingDataUrl = canvasRef.current?.exportAsDataURL() ?? '';
    
    // If the user has drawn something, we must have the data URL
    if (hasDrawing && !drawingDataUrl) {
      alert("Could not get the drawing data. Please try again.");
      return;
    }

    onAnalyze(dreamText, drawingDataUrl);
  };

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <style>{`
          @keyframes pulse-border {
            0%, 100% { border-color: transparent; }
            50% { border-color: var(--color-accent); }
          }
          .animate-pulse-border {
            animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
      `}</style>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-accent)]">Share Your Dream</h2>
            <p className="text-[var(--color-text-muted)] mt-1">What do you want to be? Draw, write, or speak about it!</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="dream-text" className="font-bold text-lg flex items-center gap-2"><PencilIcon className="w-5 h-5" /> Write it here:</label>
                  {isSpeechSupported && (
                     <button
                        type="button"
                        onClick={handleToggleRecording}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${isRecording || isRetrying ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                     >
                       {isRecording || isRetrying ? <StopCircleIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5" />}
                       <span>{isRetrying ? 'Retrying...' : isRecording ? 'Listening...' : 'Record'}</span>
                     </button>
                  )}
                </div>
                <textarea
                    id="dream-text"
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="e.g., I want to explore the deep ocean and find new creatures!"
                    rows={4}
                    className={`w-full p-3 rounded-lg bg-white/10 border-2 focus:ring-0 focus:outline-none transition-colors placeholder-white/50 text-white ${isRecording || isRetrying ? 'animate-pulse-border focus:border-[var(--color-accent)]' : 'border-transparent focus:border-[var(--color-accent)]'}`}
                />
                {recordingError && <p className="text-red-400 text-sm mt-1 text-center">{recordingError}</p>}
            </div>

            {/* Canvas */}
            <div className="flex flex-col gap-2">
                <label className="font-bold text-lg flex items-center gap-2"><PencilIcon className="w-5 h-5" /> Draw it here:</label>
                <DrawingCanvas ref={canvasRef} width={400} height={200} />
                 <button 
                    type="button"
                    onClick={handleClearCanvas} 
                    className="text-sm text-[var(--color-text-accent)] hover:opacity-80 self-end mt-1"
                >
                    Clear Drawing
                </button>
            </div>
        </div>
        
        <button
          type="submit"
          className="w-full mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)] font-extrabold text-lg py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
        >
          <SparklesIcon className="w-6 h-6" />
          Discover My Future!
        </button>
      </form>
    </div>
  );
};

export default DreamMirror;
