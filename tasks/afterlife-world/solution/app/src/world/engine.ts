import * as THREE from "three";
import { MOTES, MOTE_RESPAWN_MS, PLOTS, placeAt } from "../server/catalog";
import type { PeerState } from "../server/bus";
import { QUALITY, type Quality } from "../client/device";

export interface Input {
  keys: Set<string>;
  move: { x: number; y: number };
  look: { x: number; y: number };
  jump: boolean;
}

export interface EngineEvents {
  onMove: (x: number, z: number, ry: number, y: number) => void;
  onGather: (moteId: string) => void;
  onPlace: (place: string) => void;
  onFps: (fps: number, quality: Quality) => void;
}

interface Avatar {
  group: THREE.Group;
  body: THREE.Mesh;
  target: THREE.Vector3;
  ry: number;
  y: number;
}

const ISLAND = 40;
const SKY = 0x1d2733;

const mat = (color: number, extra: THREE.MeshLambertMaterialParameters = {}) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra });

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function makeAvatar(color: string): Avatar {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 8), mat(new THREE.Color(color).getHex()));
  body.position.y = 0.75;
  body.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), mat(0xe8dfcf));
  head.position.y = 1.72;
  head.castShadow = true;
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf2c27a }));
  lamp.position.set(0.42, 1.1, 0.25);
  group.add(body, head, lamp);
  return { group, body, target: new THREE.Vector3(), ry: 0, y: 0 };
}

export class Engine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private me: Avatar;
  private peers = new Map<string, Avatar>();
  private motes = new Map<string, THREE.Mesh>();
  private houses = new Map<string, THREE.Group>();
  private trees = new THREE.Group();
  private sun: THREE.DirectionalLight;
  private yaw = 0;
  private pitch = 0.32;
  private zoom = 9;
  private vy = 0;
  private y = 0;
  private place = "";
  private frames = 0;
  private fpsAt = performance.now();
  private slowSpells = 0;
  private sent = Date.now();
  private raf = 0;
  private drag: { id: number; x: number; y: number } | null = null;
  private collected: Record<string, number> = {};
  private tagLayer: HTMLElement;
  private tags = new Map<string, HTMLElement>();
  quality: Quality;
  auto: boolean;
  position = new THREE.Vector3(0, 0, 6);
  heading = 0;

  constructor(private canvas: HTMLCanvasElement, tagLayer: HTMLElement, quality: Quality, auto: boolean, private input: Input, private events: EngineEvents) {
    this.tagLayer = tagLayer;
    this.quality = quality;
    this.auto = auto;
    const q = QUALITY[quality];
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: q.antialias, powerPreference: "high-performance" });
    this.renderer.setClearColor(SKY);
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, q.far);
    this.scene.fog = new THREE.Fog(SKY, q.far * 0.45, q.far);
    this.scene.add(new THREE.HemisphereLight(0x9fb3c8, 0x2e3328, 1.4));
    this.sun = new THREE.DirectionalLight(0xffe2b8, 1.6);
    this.sun.position.set(-30, 40, 20);
    this.sun.shadow.mapSize.set(1024, 1024);
    Object.assign(this.sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45 });
    this.scene.add(this.sun);
    this.build();
    this.me = makeAvatar("#7d8a96");
    this.scene.add(this.me.group);
    this.applyQuality(quality);
    this.bindPointer();
    this.resize();
    this.loop();
  }

  private build() {
    const s = this.scene;
    const water = new THREE.Mesh(new THREE.CircleGeometry(220, 48), new THREE.MeshLambertMaterial({ color: 0x24434d }));
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1.2;
    s.add(water);
    const island = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND + 1, ISLAND - 5, 4, 28), mat(0x55664a));
    island.position.y = -2;
    island.receiveShadow = true;
    s.add(island);
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 0.1, 32), mat(0x8c8579));
    plaza.position.y = 0.05;
    plaza.receiveShadow = true;
    s.add(plaza);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(10, 0.12, 4, 48), mat(0x6c665c));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    s.add(ring);
    const path = (x: number, z: number, w: number, d: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), mat(0x7c7468));
      m.position.set(x, 0.04, z);
      m.receiveShadow = true;
      s.add(m);
    };
    path(16, 0, 14, 3);
    path(0, -16, 3, 12);
    path(0, 22, 3, 16);
    path(-17, 10, 14, 2.5);
    // Lantern tree at the centre of the plaza.
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 6, 7), mat(0x5b4636));
    trunk.position.y = 3;
    trunk.castShadow = true;
    s.add(trunk);
    const glow = new THREE.MeshBasicMaterial({ color: 0xf0bd6c });
    const r = rng(7);
    for (let i = 0; i < 18; i++) {
      const a = r() * Math.PI * 2;
      const d = 1.2 + r() * 2.6;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + r() * 0.6, 0), mat(0x3f5a3c));
      crown.position.set(Math.cos(a) * d * 0.7, 6 + r() * 1.8, Math.sin(a) * d * 0.7);
      crown.castShadow = true;
      s.add(crown);
      if (i % 2 === 0) {
        const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.28), glow);
        lantern.position.set(Math.cos(a) * d, 4.6 + r() * 1.4, Math.sin(a) * d);
        s.add(lantern);
      }
    }
    const light = new THREE.PointLight(0xf0bd6c, 30, 22, 1.6);
    light.position.set(0, 5, 0);
    s.add(light);
    // Market Row stalls.
    const canopy = [0xb5654a, 0x5f8f8b, 0xc9a45c];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 1.6), mat(0x6e5541));
      counter.position.y = 0.5;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 2.6), mat(canopy[i]));
      roof.position.y = 2.6;
      roof.rotation.x = -0.12;
      for (const [px, pz] of [[-1.7, -1.1], [1.7, -1.1], [-1.7, 1.1], [1.7, 1.1]]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 0.14), mat(0x4a3a2d));
        post.position.set(px, 1.3, pz);
        g.add(post);
      }
      g.add(counter, roof);
      g.position.set(17 + i * 5, 0, i % 2 ? 4.5 : -4.5);
      g.rotation.y = i % 2 ? Math.PI : 0;
      g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
      s.add(g);
    }
    // Plots on the hillside and the shore.
    for (const p of PLOTS) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.12, 6), mat(0x6f7a5b));
      base.position.set(p.x, 0.06, p.z);
      base.receiveShadow = true;
      s.add(base);
      for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.2), mat(0x5b4636));
        post.position.set(p.x + dx, 0.45, p.z + dz);
        s.add(post);
      }
    }
    // The old pier.
    const pier = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 16), mat(0x6e5541));
    pier.position.set(0, 0.0, 39);
    pier.receiveShadow = true;
    s.add(pier);
    for (let i = 0; i < 4; i++)
      for (const side of [-2, 2]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.4, 6), mat(0x4a3a2d));
        leg.position.set(side, -1, 32 + i * 4.6);
        s.add(leg);
      }
    // Gatherable lights.
    const moteMat = new THREE.MeshBasicMaterial({ color: 0xf5d79a });
    for (const m of MOTES) {
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), moteMat);
      mesh.position.set(m.x, 1.2, m.z);
      s.add(mesh);
      this.motes.set(m.id, mesh);
    }
    s.add(this.trees);
  }

  private plantTrees(count: number) {
    this.trees.clear();
    const r = rng(42);
    let planted = 0;
    for (let i = 0; planted < count && i < 400; i++) {
      const a = r() * Math.PI * 2;
      const d = 14 + r() * 24;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const nearPlot = PLOTS.some((p) => Math.abs(p.x - x) < 5 && Math.abs(p.z - z) < 5);
      const onPath = (Math.abs(z) < 3 && x > 8) || (Math.abs(x) < 3 && Math.abs(z) > 8) || (x > 13 && Math.abs(z) < 8);
      const nearMote = MOTES.some((m) => Math.hypot(m.x - x, m.z - z) < 2.5);
      if (nearPlot || onPath || nearMote) continue;
      const h = 2.5 + r() * 2.5;
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, h * 0.4, 5), mat(0x4f3e30));
      trunk.position.y = h * 0.2;
      const top = new THREE.Mesh(new THREE.ConeGeometry(h * 0.35, h * 0.8, 6), mat(r() > 0.5 ? 0x3e5b40 : 0x4b6844));
      top.position.y = h * 0.75;
      top.castShadow = trunk.castShadow = true;
      g.add(trunk, top);
      g.position.set(x, 0, z);
      this.trees.add(g);
      planted++;
    }
  }

  applyQuality(q: Quality) {
    this.quality = q;
    const cfg = QUALITY[q];
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, cfg.pixelRatio));
    this.renderer.shadowMap.enabled = cfg.shadows;
    this.sun.castShadow = cfg.shadows;
    this.camera.far = cfg.far;
    this.camera.updateProjectionMatrix();
    (this.scene.fog as THREE.Fog).near = cfg.far * 0.45;
    (this.scene.fog as THREE.Fog).far = cfg.far;
    this.plantTrees(cfg.trees);
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m) m.needsUpdate = true;
    });
    this.resize();
  }

  setCloak(color: string) {
    (this.me.body.material as THREE.MeshLambertMaterial).color.set(color);
  }

  setPosition(x: number, z: number, ry: number) {
    this.position.set(x, 0, z);
    this.heading = ry;
    this.yaw = ry;
  }

  setCollected(c: Record<string, number>) {
    this.collected = c;
  }

  setHouses(owners: Record<string, { cloak: string; displayName: string } | null>) {
    for (const p of PLOTS) {
      const owner = owners[p.id];
      const existing = this.houses.get(p.id);
      if (!owner) {
        if (existing) this.scene.remove(existing), this.houses.delete(p.id);
        continue;
      }
      if (existing) continue;
      const g = new THREE.Group();
      const walls = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 3), mat(0xcfc3ad));
      walls.position.y = 1.2;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3, 1.6, 4), mat(new THREE.Color(owner.cloak).getHex()));
      roof.position.y = 3.2;
      roof.rotation.y = Math.PI / 4;
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.05), mat(0x4a3a2d));
      door.position.set(0, 0.7, 1.53);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.22), new THREE.MeshBasicMaterial({ color: 0xf0bd6c }));
      lamp.position.set(0.8, 1.7, 1.6);
      g.add(walls, roof, door, lamp);
      g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
      g.position.set(p.x, 0, p.z);
      g.rotation.y = Math.atan2(-p.x, -p.z) + Math.PI;
      this.scene.add(g);
      this.houses.set(p.id, g);
    }
  }

  setPeers(peers: PeerState[]) {
    const live = new Set(peers.map((p) => p.tab));
    for (const [tab, av] of this.peers)
      if (!live.has(tab)) {
        this.scene.remove(av.group);
        this.peers.delete(tab);
        this.tags.get(tab)?.remove();
        this.tags.delete(tab);
      }
    for (const p of peers) {
      let av = this.peers.get(p.tab);
      if (!av) {
        av = makeAvatar(p.cloak);
        av.group.position.set(p.x, p.y, p.z);
        this.scene.add(av.group);
        this.peers.set(p.tab, av);
        const tag = document.createElement("span");
        tag.className = "nametag";
        this.tagLayer.appendChild(tag);
        this.tags.set(p.tab, tag);
      }
      (av.body.material as THREE.MeshLambertMaterial).color.set(p.cloak);
      av.target.set(p.x, p.y, p.z);
      av.ry = p.ry;
      this.tags.get(p.tab)!.textContent = p.name;
    }
  }

  private bindPointer() {
    const c = this.canvas;
    c.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener("pointermove", (e) => {
      if (!this.drag || e.pointerId !== this.drag.id) return;
      this.yaw -= (e.clientX - this.drag.x) * 0.005;
      this.pitch = THREE.MathUtils.clamp(this.pitch + (e.clientY - this.drag.y) * 0.004, 0.05, 1.2);
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
    });
    const end = () => (this.drag = null);
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", end);
    c.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.zoom = THREE.MathUtils.clamp(this.zoom + e.deltaY * 0.01, 4, 18);
    }, { passive: false });
  }

  resize() {
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private step(dt: number) {
    const k = this.input.keys;
    const lookRate = 2.4;
    this.yaw -= this.input.look.x * lookRate * dt;
    this.pitch = THREE.MathUtils.clamp(this.pitch + this.input.look.y * 1.4 * dt, 0.05, 1.2);
    if (k.has("KeyQ")) this.yaw += lookRate * dt;
    if (k.has("KeyE")) this.yaw -= lookRate * dt;
    let fx = (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) - (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0) + this.input.move.x;
    let fz = (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) - (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0) + this.input.move.y;
    const len = Math.hypot(fx, fz);
    if (len > 1) (fx /= len), (fz /= len);
    const run = k.has("ShiftLeft") || k.has("ShiftRight") || Math.hypot(this.input.move.x, this.input.move.y) > 0.92;
    const speed = run ? 9 : 4.5;
    if (len > 0.05) {
      const sin = Math.sin(this.yaw);
      const cos = Math.cos(this.yaw);
      const dx = (-sin * fz + cos * fx) * speed * dt;
      const dz = (-cos * fz - sin * fx) * speed * dt;
      const nx = this.position.x + dx;
      const nz = this.position.z + dz;
      const pier = Math.abs(nx) <= 2.2 && nz >= 30 && nz <= 46.5;
      if (Math.hypot(nx, nz) <= ISLAND - 1.5 || pier) this.position.set(nx, 0, nz);
      this.heading = Math.atan2(dx, dz);
    }
    if ((k.has("Space") || this.input.jump) && this.y <= 0.001) this.vy = 6.5;
    this.vy -= 18 * dt;
    this.y = Math.max(0, this.y + this.vy * dt);
    if (this.y === 0) this.vy = Math.max(0, this.vy);

    const g = this.me.group;
    g.position.set(this.position.x, this.y, this.position.z);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, this.heading, 0.25);
    const dist = this.zoom;
    this.camera.position.set(
      this.position.x + Math.sin(this.yaw) * Math.cos(this.pitch) * dist,
      this.y + 1.6 + Math.sin(this.pitch) * dist,
      this.position.z + Math.cos(this.yaw) * Math.cos(this.pitch) * dist,
    );
    this.camera.lookAt(this.position.x, this.y + 1.5, this.position.z);

    const now = Date.now();
    const t = performance.now() / 1000;
    for (const m of MOTES) {
      const mesh = this.motes.get(m.id)!;
      const away = now - (this.collected[m.id] ?? 0) < MOTE_RESPAWN_MS;
      mesh.visible = !away;
      if (away) continue;
      mesh.position.y = 1.2 + Math.sin(t * 1.5 + m.x) * 0.15;
      mesh.rotation.y = t;
      if (Math.hypot(m.x - this.position.x, m.z - this.position.z) < 1.6) {
        this.collected = { ...this.collected, [m.id]: now };
        this.events.onGather(m.id);
      }
    }
    for (const av of this.peers.values()) {
      av.group.position.lerp(av.target, 0.2);
      av.group.rotation.y = THREE.MathUtils.lerp(av.group.rotation.y, av.ry, 0.2);
    }
    const place = placeAt(this.position.x, this.position.z);
    if (place !== this.place) (this.place = place), this.events.onPlace(place);
    if (now - this.sent > 200) {
      this.sent = now;
      this.events.onMove(this.position.x, this.position.z, this.heading, this.y);
    }
  }

  private placeTags() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const v = new THREE.Vector3();
    for (const [tab, av] of this.peers) {
      const tag = this.tags.get(tab)!;
      v.set(av.group.position.x, av.group.position.y + 2.4, av.group.position.z).project(this.camera);
      const shown = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      tag.style.display = shown ? "" : "none";
      if (shown) tag.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -100%)`;
    }
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.step(dt);
    this.renderer.render(this.scene, this.camera);
    this.placeTags();
    this.frames++;
    const now = performance.now();
    if (now - this.fpsAt >= 2000) {
      const fps = Math.round((this.frames * 1000) / (now - this.fpsAt));
      this.frames = 0;
      this.fpsAt = now;
      // In automatic mode, two slow readings in a row step the quality down.
      if (this.auto && fps < 24 && this.quality !== "low") {
        if (++this.slowSpells >= 2) {
          this.applyQuality(this.quality === "high" ? "medium" : "low");
          this.slowSpells = 0;
        }
      } else this.slowSpells = 0;
      this.events.onFps(fps, this.quality);
    }
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.tags.forEach((t) => t.remove());
    this.renderer.dispose();
  }
}
