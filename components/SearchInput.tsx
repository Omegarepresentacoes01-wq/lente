import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// Fix for SpeechRecognition API not being in standard TS lib.
// The Web Speech API types are not included in default TypeScript DOM typings.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
}

type LocationStatus = 'idle' | 'loading' | 'success' | 'error';

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  onRequestLocation: () => void;
  locationStatus: LocationStatus;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  onRequestLocation,
  locationStatus,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  
  // Use a ref to hold the latest onSearch callback to avoid stale closures in useEffect
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);


  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSpeechSupported(true);
      const recognition: SpeechRecognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
        // When recognition ends, if we have a final transcript, perform the search.
        if (finalTranscriptRef.current) {
          onSearchRef.current(); // Use the ref to call the latest callback
          finalTranscriptRef.current = ''; // Reset for the next use.
        }
      };

      recognition.onerror = (event: any) => {
        // These are not really errors; they can happen if the user stops talking,
        // clicks the mic button to stop, or denies permission. We don't need to log them as errors.
        if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'audio-capture') {
          console.log(`Evento de reconhecimento de voz: ${event.error}`);
        } else {
          console.error('Erro no reconhecimento de voz:', event);
        }
        setIsListening(false);
        finalTranscriptRef.current = ''; // Reset on error
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // The event.results list is cumulative, so we can build the full string from it.
        for (let i = 0; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcriptPart + ' ';
            } else {
                interimTranscript += transcriptPart;
            }
        }
        
        const fullTranscript = (finalTranscript + interimTranscript).trim();
        onQueryChange(fullTranscript);

        // Store the final transcript to be used for search when recognition ends.
        if (finalTranscript) {
          finalTranscriptRef.current = finalTranscript.trim();
        }
      };

    } else {
      setIsSpeechSupported(false);
      console.warn("Reconhecimento de voz não suportado neste navegador.");
    }

    return () => {
      // Clean up on component unmount
      if (recognitionRef.current) {
        // Remove all listeners and stop recognition
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, [onQueryChange]);


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  const getLocationIcon = () => {
    switch (locationStatus) {
      case 'loading':
        return <SpinnerIcon className="w-5 h-5" />;
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case 'idle':
      default:
        return <CrosshairIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current || isLoading) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Clear previous query and transcript ref before starting a new session
      onQueryChange('');
      finalTranscriptRef.current = '';
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-lg p-2 focus-within:ring-2 focus-within:ring-[var(--color-primary-500)] transition-all duration-300">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Procure por um lugar..."
        disabled={isLoading}
        className="w-full bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 px-4 py-2 border-0 focus:outline-none focus:ring-0"
      />
      <button
        onClick={onRequestLocation}
        disabled={locationStatus === 'loading' || isLoading}
        className="flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:cursor-not-allowed rounded-full p-3 transition-colors duration-300"
        aria-label="Usar minha localização"
        title="Usar minha localização"
      >
        {getLocationIcon()}
      </button>
      <button
        onClick={handleToggleListening}
        disabled={isLoading || !isSpeechSupported}
        className="flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:cursor-not-allowed rounded-full p-3 transition-colors duration-300"
        aria-label="Usar busca por voz"
        title={isSpeechSupported ? "Usar busca por voz" : "Busca por voz não suportada neste navegador"}
      >
        <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`} />
      </button>
      <button
        onClick={onSearch}
        disabled={isLoading || !query.trim()}
        className="flex-shrink-0 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-full p-3 transition-colors duration-300"
        aria-label="Buscar"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
    </div>
  );
};