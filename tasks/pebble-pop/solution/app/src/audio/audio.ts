import { getSave } from "../state/store.ts";

export type Sfx = "drop" | "match" | "combo" | "booster" | "button" | "thaw" | "complete" | "fail";

const SFX: Sfx[] = ["drop", "match", "combo", "booster", "button", "thaw", "complete", "fail"];

/** Web Audio playback. The context is created on the first user gesture, as browsers require. */
class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private loading: Promise<void> | null = null;

  unlock() {
    if (this.ctx) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.loading = Promise.all([...SFX, "music-woodland"].map((n) => this.fetch(n))).then(() => this.syncMusic());
  }

  private async fetch(name: string) {
    try {
      const res = await fetch(`/audio/${name}.wav`);
      const data = await res.arrayBuffer();
      this.buffers.set(name, await this.ctx!.decodeAudioData(data));
    } catch {
      /* a missing sound must never break play */
    }
  }

  play(name: Sfx, volume = 0.8) {
    if (!getSave().settings.sound || !this.ctx) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    src.buffer = buffer;
    src.connect(gain).connect(this.ctx.destination);
    src.start();
  }

  syncMusic() {
    const on = getSave().settings.music;
    if (!this.ctx) return;
    if (on && !this.musicSource) {
      const buffer = this.buffers.get("music-woodland");
      if (!buffer) return;
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.gain.linearRampToValueAtTime(0.45, this.ctx.currentTime + 1.5);
      this.musicSource = this.ctx.createBufferSource();
      this.musicSource.buffer = buffer;
      this.musicSource.loop = true;
      this.musicSource.connect(this.musicGain).connect(this.ctx.destination);
      this.musicSource.start();
    } else if (!on && this.musicSource) {
      this.musicSource.stop();
      this.musicSource.disconnect();
      this.musicSource = null;
    }
  }

  vibrate(pattern: number | number[]) {
    if (getSave().settings.vibration && "vibrate" in navigator) navigator.vibrate(pattern);
  }

  get ready() {
    return this.loading;
  }
}

export const audio = new AudioManager();
