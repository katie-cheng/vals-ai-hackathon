import { useCallback, useEffect, useRef, useState } from "react";

export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

/** Speaks text with window.speechSynthesis and reports whether the voice is currently talking. */
export function useSpeech(voiceName: string) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const fallback = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!speechSupported()) return;
    const update = () => setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en")));
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);

  const stop = useCallback(() => {
    clearTimeout(fallback.current);
    if (speechSupported()) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!speechSupported()) return false;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = window.speechSynthesis.getVoices().find((v) => v.name === voiceName);
      if (voice) u.voice = voice;
      u.rate = 1;
      u.pitch = 1;
      const done = () => {
        clearTimeout(fallback.current);
        setSpeaking(false);
      };
      u.onstart = () => setSpeaking(true);
      u.onend = done;
      // A failed or missing voice still lets the visualiser run for the reply's reading time (the fallback below).
      setSpeaking(true);
      // Some browsers never fire "end" when no voice is installed; stop the visualiser after the text's reading time.
      clearTimeout(fallback.current);
      fallback.current = setTimeout(done, Math.min(30_000, 1500 + text.length * 70));
      window.speechSynthesis.speak(u);
      return true;
    },
    [voiceName],
  );

  useEffect(() => () => clearTimeout(fallback.current), []);
  return { speak, stop, speaking, voices };
}
