import { useState, useRef, useCallback, useEffect } from 'react';
import { LANGUAGES } from '../services/mockAI';

function chunkText(text, maxLength) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    if (currentChunk.join(' ').length + word.length + 1 > maxLength) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
    } else {
      currentChunk.push(word);
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [systemVoices, setSystemVoices] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const fallbackAudioRef = useRef(null);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    const updateVoices = () => {
      setSystemVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup active audio/TTS on unmount to prevent audio bleed bugs
  useEffect(() => {
    return () => {
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.pause();
        fallbackAudioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      synthRef.current?.cancel();
    }
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text, langCode = 'en-IN', mood = null, voiceName = null, onEnd) => {
    stopSpeaking(); // stop any currently playing narration first

    const targetLang = langCode.split('-')[0].toLowerCase();
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    
    // Check if the system has a local voice that supports this language
    const hasLocalVoice = voices.some(v => v.lang.toLowerCase().startsWith(targetLang));

    if (hasLocalVoice && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;

      // Emotion-aware voice pacing & inflection
      let rate = 0.88;
      let pitch = 1.05;
      if (mood) {
        const lowerMood = mood.toLowerCase();
        if (lowerMood.includes('celebr') || lowerMood.includes('joy')) {
          rate = 0.96;
          pitch = 1.12;
        } else if (lowerMood.includes('melan') || lowerMood.includes('sorrow')) {
          rate = 0.76;
          pitch = 0.94;
        } else if (lowerMood.includes('passionate') || lowerMood.includes('anger')) {
          rate = 0.92;
          pitch = 1.00;
        } else if (lowerMood.includes('mystical') || lowerMood.includes('mystery')) {
          rate = 0.82;
          pitch = 1.06;
        }
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;

      if (voiceName) {
        const match = voices.find(v => v.name === voiceName);
        if (match) utterance.voice = match;
      } else {
        const match = voices.find(v => v.lang.toLowerCase().startsWith(targetLang));
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    } else {
      // Fallback: Use Google Translate TTS audio stream to support all languages
      setIsSpeaking(true);
      const chunks = chunkText(text, 180);
      let currentChunk = 0;
      const audio = new Audio();
      fallbackAudioRef.current = audio;

      const playNext = () => {
        if (!fallbackAudioRef.current) return; // stopped/interrupted
        if (currentChunk >= chunks.length) {
          setIsSpeaking(false);
          onEnd?.();
          return;
        }
        const t = chunks[currentChunk];
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=${targetLang}&client=tw-ob`;
        audio.src = url;
        audio.play().catch(err => {
          console.warn("Google TTS fallback audio playback failed, falling back to Web Speech:", err);
          if (synthRef.current) {
            const fallbackUtterance = new SpeechSynthesisUtterance(t);
            fallbackUtterance.lang = langCode;
            fallbackUtterance.onend = () => {
              currentChunk++;
              playNext();
            };
            fallbackUtterance.onerror = () => {
              currentChunk++;
              playNext();
            };
            synthRef.current.speak(fallbackUtterance);
          } else {
            currentChunk++;
            playNext();
          }
        });
        currentChunk++;
      };

      audio.onerror = () => {
        console.warn("Google TTS audio stream load error, delegating to Web Speech API");
        if (synthRef.current) {
          const fallbackUtterance = new SpeechSynthesisUtterance(text);
          fallbackUtterance.lang = langCode;
          fallbackUtterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
          };
          fallbackUtterance.onerror = () => setIsSpeaking(false);
          synthRef.current.speak(fallbackUtterance);
        } else {
          setIsSpeaking(false);
        }
      };

      audio.onended = playNext;
      playNext();
    }
  }, [stopSpeaking]);

  const startListening = useCallback((langCode = 'en-IN', onResult, onEnd) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = langCode;
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
      onResult?.(t);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      onEnd?.();
    };
    recognitionRef.current.onerror = () => setIsListening(false);

    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSpeaking, isListening, transcript, speak, stopSpeaking, startListening, stopListening, systemVoices, LANGUAGES };
}

