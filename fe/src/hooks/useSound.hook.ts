import { useEffect, useRef, useState } from "react";

// Extend Window interface for webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Custom hook for sound management
 * Handles sound toggle and announcement playback
 */
export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Toggle sound on/off
   * Also initializes AudioContext on first enable (user gesture)
   */
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newEnabled = !prev;

      // Initialize AudioContext when enabling (user gesture)
      if (newEnabled && !audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

          // Resume AudioContext if suspended (required by browser policy)
          if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
          }
        } catch (err) {
          console.error("Error initializing AudioContext:", err);
        }
      }

      return newEnabled;
    });
  };

  /**
   * Play a beep sound
   * Uses Web Audio API for audio generation
   */
  const playSound = () => {
    if (!soundEnabled) return;

    try {
      // Initialize AudioContext if not already created
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Resume AudioContext if suspended (required by browser policy)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Configure oscillator for beep sound
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800 Hz
      oscillator.type = "sine";

      // Beep envelope
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      // Play the beep
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  /**
   * Play queue announcement
   * Uses Web Speech API for text-to-speech
   */
  const playAnnouncement = (queueNumber: string, customerName: string) => {
    if (!soundEnabled) return;

    try {
      // Check if browser supports Speech Synthesis
      if (!window.speechSynthesis) {
        console.warn("Speech Synthesis not supported in this browser");
        return;
      }

      // Play beep first
      playSound();

      // Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance();

      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      console.log({ voices });

      // Try to find Indonesian voice (priority order: Indonesia, then English, then default)
      const indonesianVoice = voices.find((voice) => voice.lang.startsWith("id"));
      const englishVoice = voices.find((voice) => voice.lang.startsWith("en"));

      // Use Indonesian voice if available, otherwise fallback to English, then default
      if (indonesianVoice) {
        utterance.voice = indonesianVoice;
        utterance.lang = "id-ID";
        utterance.text = `Nomor antrian ${queueNumber}, atas nama ${customerName}.`;
        console.log("Using Indonesian voice:", indonesianVoice.name);
      } else if (englishVoice) {
        utterance.voice = englishVoice;
        utterance.lang = "en-US";
        utterance.text = `Number ${queueNumber}, for ${customerName}.`;
        console.log("Using English voice (Indonesian not available):", englishVoice.name);
      } else {
        // Fallback: use default voice with Indonesian text
        utterance.lang = "id-ID";
        utterance.text = `Nomor antrian ${queueNumber}, atas nama ${customerName}.`;
        console.log("Using default voice");
      }

      // Adjust speech rate and pitch
      utterance.rate = 0.9;
      utterance.pitch = 1;

      // Speak the announcement
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Error playing announcement:", err);
    }
  };

  // Preload voices (required for some browsers)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Load voices immediately
      window.speechSynthesis.getVoices();

      // Some browsers need an event listener for voiceschanged
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };

      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playSound,
    playAnnouncement,
  };
}
