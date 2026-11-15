export type Quality = "low" | "medium" | "high";
export type ControlScheme = "keyboard" | "touch";

export interface QualitySettings {
  pixelRatio: number;
  shadows: boolean;
  antialias: boolean;
  trees: number;
  far: number;
}

export const QUALITY: Record<Quality, QualitySettings> = {
  low: { pixelRatio: 1, shadows: false, antialias: false, trees: 12, far: 75 },
  medium: { pixelRatio: 1.5, shadows: false, antialias: true, trees: 22, far: 110 },
  high: { pixelRatio: 2, shadows: true, antialias: true, trees: 34, far: 160 },
};

export const QUALITY_LABEL: Record<Quality, string> = { low: "Low", medium: "Medium", high: "High" };

export interface Device {
  touch: boolean;
  small: boolean;
  cores: number;
  memory: number | null;
  gpu: string;
  software: boolean;
  quality: Quality;
  controls: ControlScheme;
  reason: string;
}

function gpuName(): string {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return "no WebGL";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return "unknown";
  }
}

let cached: Device | null = null;

/** Picks controls and graphics quality from what the browser reports about the device. */
export function detectDevice(): Device {
  if (cached) return cached;
  const touch = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  const small = Math.min(innerWidth, innerHeight) < 600;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
  const gpu = gpuName();
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gpu);
  let quality: Quality = "medium";
  let reason = "a typical laptop or desktop";
  if (software) (quality = "low"), (reason = "graphics are drawn without a GPU");
  else if (touch && small) (quality = "low"), (reason = "a phone");
  else if (touch) (quality = "medium"), (reason = "a tablet");
  else if (cores >= 8 && (memory === null || memory >= 8)) (quality = "high"), (reason = "a computer with a capable GPU");
  if (memory !== null && memory <= 2) (quality = "low"), (reason = "a device with little memory");
  cached = { touch, small, cores, memory, gpu, software, quality, controls: touch ? "touch" : "keyboard", reason };
  return cached;
}
