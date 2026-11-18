import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/+esm";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js/+esm";
import { RGBELoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/RGBELoader.js/+esm";

const WAITLIST_SUPPORT_EMAIL = "support@kirokuapp.com";
const WAITLIST_ENDPOINT = `https://formsubmit.co/ajax/${WAITLIST_SUPPORT_EMAIL}`;
const WAITLIST_STORAGE_KEY = "kiroku_waitlist_v1";
const MODEL_PATH = "/models/iphone-17-pro.glb";
const HDRI_PATH = "/hdri/studio_small_03_256.hdr";
const FLAT_FRAME_PATH = "/components/iphone17-3d-flat.webp";

const HERO_ROTATE_INTERVAL_MS = 3500;

const HERO_SLIDES = [
  {
    src: "/screenshots/anime-reels-evangelion.jpeg",
    pose: { rotationX: -0.34, rotationY: 0.31, rotationZ: 0.09885163292860177 },
  },
  {
    src: "/screenshots/find-friends-taste-matches.jpeg",
    pose: { rotationX: -0.26, rotationY: 0.16, rotationZ: 0.045 },
  },
  {
    src: "/screenshots/taste-compatibility-match.jpeg",
    pose: { rotationX: -0.3, rotationY: -0.24, rotationZ: -0.07 },
  },
  {
    src: "/screenshots/friend-profile-taste-match.jpeg",
    pose: { rotationX: -0.22, rotationY: 0.24, rotationZ: 0.065 },
  },
];

const HERO_POSE = HERO_SLIDES[0].pose;

const STORY_BEATS = [
  {
    src: "/screenshots/taste-compatibility-match.jpeg",
    pose: { rotationX: 0, rotationY: -0.3, rotationZ: 0 },
    scale: 1,
    focus: "full",
    transition: "tilt",
  },
  {
    src: "/screenshots/discovery-trending-anime-manga.jpeg",
    pose: { rotationX: -0.34, rotationY: 0.31, rotationZ: 0.09885163292860177 },
    scale: 1,
    focus: "top",
    transition: "flip",
  },
  {
    src: "/screenshots/anime-details-tracking.jpeg",
    pose: { rotationX: 0, rotationY: -0.3, rotationZ: 0 },
    scale: 1,
    focus: "center",
    transition: "tilt",
  },
  {
    src: "/screenshots/create-shared-list.jpeg",
    pose: { rotationX: -0.04, rotationY: 0.08, rotationZ: 0 },
    scale: 1,
    focus: "full",
    transition: "flip",
  },
  {
    src: "/screenshots/profile-favorite-characters.jpeg",
    pose: { rotationX: 0, rotationY: -0.3, rotationZ: 0 },
    scale: 1,
    focus: "bottom",
    transition: "tilt",
  },
];

const IPHONE_SCREEN_QUAD = { width: 0.06754, height: 0.14566, radius: 0.011 };
const IPHONE_BASE_SCALE = 7.2;
const WEBSITE_DEVICE_SCENE_SCALE = 1.12;
const DEVICE_STILL_CAMERA = { position: [0, 0.08, 3.35], fov: 24 };
const FINISH_BLACK = { metal: "#48484b", glassTint: "#38383a" };

const FLAT_GEOMETRY = {
  frameSrc: FLAT_FRAME_PATH,
  frameWidth: 1311,
  frameHeight: 2708,
  screen: { x: 46, y: 40, width: 1214, height: 2627, radius: 100 },
  modelHeightRatio: 720 / 1290,
};

const SWAY_DEFAULTS = {
  rotationX: 0.04,
  rotationY: -0.32,
  pointerX: 0.16,
  pointerY: 0.3,
  swayX: 0.02,
  swayY: 0.05,
  speed: 0.7,
  scale: WEBSITE_DEVICE_SCENE_SCALE,
};

const STORY_BEAT_LENGTH = 1.2;
const STORY_TRANSITION_SPAN = 0.6;
const FOCUS_OFFSETS = { full: 0, top: 0.27, center: 0.04, bottom: -0.27 };

let webglSupportCached = null;
function supportsWebGL() {
  if (webglSupportCached !== null) return webglSupportCached;
  try {
    const canvas = document.createElement("canvas");
    const ctx =
      canvas.getContext("webgl2", { powerPreference: "high-performance" }) ||
      canvas.getContext("webgl", { powerPreference: "high-performance" });
    if (!ctx) {
      webglSupportCached = false;
      return false;
    }
    ctx.getExtension("WEBGL_lose_context")?.loseContext();
    webglSupportCached = true;
    return true;
  } catch {
    webglSupportCached = false;
    return false;
  }
}

class DeviceStoryDriver {
  constructor(initialPose) {
    this.target = {
      rotationX: initialPose?.rotationX ?? 0,
      rotationY: initialPose?.rotationY ?? 0,
      rotationZ: initialPose?.rotationZ ?? 0,
      x: 0,
      y: 0,
      scale: 1,
    };
    this.listeners = new Set();
  }

  set(next) {
    const t = this.target;
    if (
      t.rotationX !== next.rotationX ||
      t.rotationY !== next.rotationY ||
      t.rotationZ !== next.rotationZ ||
      t.x !== next.x ||
      t.y !== next.y ||
      t.scale !== next.scale
    ) {
      this.target = { ...next };
      this.listeners.forEach((fn) => fn());
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

// --- Status Bar Cleaner (replaces device clock with crisp 9:41 and full signal/battery) ---
function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function sampleStatusBox(data, w, h, range, notch) {
  const x0 = Math.max(0, Math.round(range.x0 * w));
  const x1 = Math.min(w - 1, Math.round(range.x1 * w));
  const y0 = Math.round(0.012 * w);
  const y1 = Math.min(h - 1, Math.round(0.115 * w));
  if (x1 <= x0 || y1 <= y0) return null;

  const pad = Math.round(0.02 * w);
  const isNotch = (x) => notch !== null && x >= notch.left - pad && x <= notch.right + pad;
  const bins = new Map();
  let total = 0;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isNotch(x)) continue;
      const idx = (y * w + x) * 4;
      const key = ((data[idx] >> 4) << 8) | ((data[idx + 1] >> 4) << 4) | (data[idx + 2] >> 4);
      bins.set(key, (bins.get(key) ?? 0) + 1);
      total++;
    }
  }
  if (total === 0) return null;

  let bestKey = -1;
  let bestCount = 0;
  for (const [k, c] of bins) {
    if (c > bestCount) {
      bestKey = k;
      bestCount = c;
    }
  }

  const qr = ((bestKey >> 8) << 4) + 8;
  const qg = (((bestKey >> 4) & 15) << 4) + 8;
  const qb = ((bestKey & 15) << 4) + 8;

  let sr = 0, sg = 0, sb = 0, sc = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isNotch(x)) continue;
      const idx = (y * w + x) * 4;
      if (Math.abs(data[idx] - qr) <= 24 && Math.abs(data[idx + 1] - qg) <= 24 && Math.abs(data[idx + 2] - qb) <= 24) {
        sr += data[idx];
        sg += data[idx + 1];
        sb += data[idx + 2];
        sc++;
      }
    }
  }
  if (sc / total < 0.5) return null;

  const mr = Math.round(sr / sc);
  const mg = Math.round(sg / sc);
  const mb = Math.round(sb / sc);
  const rowHits = new Uint16Array(h);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isNotch(x)) continue;
      const idx = (y * w + x) * 4;
      if (Math.max(Math.abs(data[idx] - mr), Math.abs(data[idx + 1] - mg), Math.abs(data[idx + 2] - mb)) > 48) {
        rowHits[y]++;
      }
    }
  }

  let maxRow = 0;
  for (let y = y0; y <= y1; y++) {
    if (rowHits[y] > maxRow) maxRow = rowHits[y];
  }
  if (maxRow < 2) return null;

  const thresh = Math.max(2, Math.ceil(0.35 * maxRow));
  let bestStart = -1, bestEnd = -1, runStart = -1;
  for (let y = y0; y <= y1 + 1; y++) {
    const hit = y <= y1 && rowHits[y] >= thresh;
    if (hit && runStart === -1) runStart = y;
    if (!hit && runStart !== -1) {
      if (bestStart === -1 || y - runStart > bestEnd - bestStart + 1) {
        bestStart = runStart;
        bestEnd = y - 1;
      }
      runStart = -1;
    }
  }
  if (bestStart === -1) return null;

  const colHits = new Uint16Array(w);
  let inkSum = 0, inkCount = 0;
  for (let y = bestStart; y <= bestEnd; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isNotch(x)) continue;
      const idx = (y * w + x) * 4;
      if (Math.max(Math.abs(data[idx] - mr), Math.abs(data[idx + 1] - mg), Math.abs(data[idx + 2] - mb)) > 48) {
        colHits[x]++;
        inkSum += luma(data[idx], data[idx + 1], data[idx + 2]);
        inkCount++;
      }
    }
  }

  let cStart = -1, cEnd = -1;
  for (let x = x0; x <= x1; x++) {
    if (colHits[x] >= 2) {
      if (cStart === -1) cStart = x;
      cEnd = x;
    }
  }
  if (cStart === -1) return null;

  return {
    fill: { r: mr, g: mg, b: mb, luminance: luma(mr, mg, mb) / 255 },
    inkLuminance: inkCount > 0 ? inkSum / inkCount / 255 : 0,
    box: { x0: cStart / w, x1: (cEnd + 1) / w, y0: bestStart / w, y1: (bestEnd + 1) / w },
  };
}

function getCleanedStatusBarCanvas(img) {
  const pw = img.naturalWidth || img.width;
  const ph = img.naturalHeight || img.height;
  if (!pw || !ph || pw < 320) return null;
  const ratio = ph / pw;
  if (ratio < 2 || ratio > 2.35) return null;

  const sampleW = 384;
  const sampleH = Math.round(65.28);
  const probe = document.createElement("canvas");
  probe.width = sampleW;
  probe.height = sampleH;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  if (!pctx) return null;

  pctx.drawImage(img, 0, 0, pw, 0.17 * pw, 0, 0, sampleW, sampleH);
  const { data } = pctx.getImageData(0, 0, sampleW, sampleH);

  let notch = null;
  for (const frac of [0.04, 0.055, 0.07]) {
    const ry = Math.min(Math.max(Math.round(sampleW * frac), 0), sampleH - 1);
    const pxLum = (x) => {
      const idx = (sampleW * ry + x) * 4;
      return luma(data[idx], data[idx + 1], data[idx + 2]);
    };
    const mid = Math.floor(sampleW / 2);
    if (pxLum(mid) >= 55) continue;
    let l = mid, r = mid;
    while (l > 0 && pxLum(l - 1) < 55) l--;
    while (r < sampleW - 1 && pxLum(r + 1) < 55) r++;
    if (!notch || r - l > notch.right - notch.left) {
      notch = { left: l, right: r };
    }
  }
  if (notch) {
    const nw = (notch.right - notch.left + 1) / sampleW;
    if (nw < 0.18 || nw > 0.45) notch = null;
  }

  const leftBox = sampleStatusBox(data, sampleW, sampleH, { x0: 0.02, x1: 0.35 }, notch);
  const rightBox = sampleStatusBox(data, sampleW, sampleH, { x0: 0.65, x1: 0.98 }, notch);
  if (!leftBox || !rightBox) return null;

  const bw = (b) => b.x1 - b.x0;
  const bh = (b) => b.y1 - b.y0;
  if (
    bw(leftBox.box) < 0.04 || bw(leftBox.box) > 0.3 ||
    bh(leftBox.box) < 0.015 || bh(leftBox.box) > 0.1 ||
    bw(rightBox.box) < 0.05 || bw(rightBox.box) > 0.4 ||
    bh(rightBox.box) < 0.015 || bh(rightBox.box) > 0.1 ||
    rightBox.box.x1 < 0.78
  ) {
    return null;
  }

  const out = document.createElement("canvas");
  out.width = pw;
  out.height = ph;
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, pw, ph);

  const erase = (b, fill) => {
    ctx.fillStyle = `rgb(${fill.r}, ${fill.g}, ${fill.b})`;
    const x = Math.max(0, (b.x0 - 0.012) * pw);
    const y = Math.max(0, (b.y0 - 0.012) * pw);
    ctx.fillRect(x, y, (b.x1 + 0.012) * pw - x, (b.y1 + 0.012) * pw - y);
  };
  erase(leftBox.box, leftBox.fill);
  erase(rightBox.box, rightBox.fill);

  const pickInk = (b) =>
    b.inkLuminance >= 0.6 ? "#ffffff" : b.inkLuminance <= 0.4 || b.fill.luminance > 0.55 ? "#000000" : "#ffffff";

  const fontSize = Math.min(Math.max(1.4 * bh(leftBox.box) * pw, 0.032 * pw), 0.06 * pw);
  const tx = ((leftBox.box.x0 + leftBox.box.x1) / 2) * pw;
  const ty = ((leftBox.box.y0 + leftBox.box.y1) / 2) * pw;
  ctx.fillStyle = pickInk(leftBox);
  ctx.font = `600 ${fontSize.toFixed(1)}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("9:41", tx, ty);

  const baseScale = pw / 393;
  const s = Math.min(Math.max((bh(rightBox.box) * pw) / 13, 0.9 * baseScale), 1.1 * baseScale);
  const ink = pickInk(rightBox);
  const rx = rightBox.box.x1 * pw;
  const cy = ((leftBox.box.y0 + leftBox.box.y1) / 2) * pw;

  // Battery
  const batW = 24.5 * s;
  const batH = 13 * s;
  const batX = rx - 2.3 * s - batW;
  const batY = cy - batH / 2;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.15 * s;
  ctx.beginPath();
  ctx.roundRect(batX, batY, batW, batH, 4.2 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(batX + batW + 0.2 * s, cy, 2.3 * s, -0.5 * Math.PI, 0.5 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
  const pad = 2 * s;
  ctx.beginPath();
  ctx.roundRect(batX + pad, batY + pad, batW - 2 * pad, batH - 2 * pad, 2.4 * s);
  ctx.fill();

  // Wi-Fi
  const wx = rx - 42.25 * s;
  const wy = cy + 4.55 * s;
  const a0 = (-140 * Math.PI) / 180;
  const a1 = (-40 * Math.PI) / 180;
  ctx.lineCap = "round";
  ctx.lineWidth = 2.8 * s;
  for (const r of [5.7, 9.6]) {
    ctx.beginPath();
    ctx.arc(wx, wy, r * s, a0, a1);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(wx, wy, 1.9 * s, 0, 2 * Math.PI);
  ctx.fill();

  // Cellular signal bars
  const barW = 3 * s;
  const barGap = 2.4 * s;
  const barHeights = [4.6, 7.2, 9.7, 12.2].map((v) => v * s);
  const barBottom = cy + 6.1 * s;
  const sigRight = wx - 15.45 * s;
  for (let i = 0; i < 4; i++) {
    const bx = sigRight - (4 - i) * barW - (3 - i) * barGap;
    ctx.beginPath();
    ctx.roundRect(bx, barBottom - barHeights[i], barW, barHeights[i], s);
    ctx.fill();
  }

  return out;
}

// --- Shared Screenshot Loading & Caching ---
const imageCache = new Map();
const textureCache = new Map();
const cleanedUrlCache = new Map();

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

async function getCleanDataUrl(src) {
  if (cleanedUrlCache.has(src)) return cleanedUrlCache.get(src);
  try {
    const img = await loadImage(src);
    const cleaned = getCleanedStatusBarCanvas(img);
    const url = cleaned ? cleaned.toDataURL("image/jpeg", 0.92) : src;
    cleanedUrlCache.set(src, url);
    return url;
  } catch {
    return src;
  }
}

async function getScreenTexture(src) {
  if (textureCache.has(src)) return textureCache.get(src);
  const promise = loadImage(src).then((img) => {
    const cleaned = getCleanedStatusBarCanvas(img);
    const tex = cleaned ? new THREE.CanvasTexture(cleaned) : new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  });
  textureCache.set(src, promise);
  return promise;
}

// --- Shared 3D Model + HDRI Loader ---
let shared3DAssetsPromise = null;
function loadShared3DAssets() {
  if (shared3DAssetsPromise) return shared3DAssetsPromise;
  const gltfLoader = new GLTFLoader();
  const rgbeLoader = new RGBELoader();
  shared3DAssetsPromise = Promise.all([
    gltfLoader.loadAsync(MODEL_PATH),
    rgbeLoader.loadAsync(HDRI_PATH),
  ]).then(([gltf, hdrTexture]) => {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    return { gltf, hdrTexture };
  });
  return shared3DAssetsPromise;
}

function createRoundedRectShape(width, height, radius) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2 + radius, -height / 2);
  s.lineTo(width / 2 - radius, -height / 2);
  s.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
  s.lineTo(width / 2, height / 2 - radius);
  s.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
  s.lineTo(-width / 2 + radius, height / 2);
  s.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
  s.lineTo(-width / 2, -height / 2 + radius);
  s.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
  return s;
}

function createScreenGeometry() {
  const { width, height, radius } = IPHONE_SCREEN_QUAD;
  const geom = new THREE.ShapeGeometry(createRoundedRectShape(width, height, radius), 24);
  const pos = geom.attributes.position.array;
  const uv = geom.attributes.uv.array;
  for (let i = 0, j = 0; i < pos.length; i += 3, j += 2) {
    uv[j] = 1 - (pos[i] + width / 2) / width;
    uv[j + 1] = (pos[i + 1] + height / 2) / height;
  }
  geom.attributes.uv.needsUpdate = true;
  return geom;
}

function createBezelGeometry() {
  const outer = createRoundedRectShape(0.0697, 0.1475, 0.015);
  const hole = createRoundedRectShape(0.0675402, 0.1456582, 0.0132);
  outer.holes.push(hole);
  return new THREE.ShapeGeometry(outer, 24);
}

function createDynamicIslandGeometry() {
  return new THREE.ShapeGeometry(createRoundedRectShape(0.0192, 0.0056, 0.0032), 24);
}

function applyIPhoneMaterials(modelRoot) {
  const camFront = modelRoot.getObjectByName("Camera front");
  if (camFront) camFront.visible = true;
  ["Sphere001", "Sphere001_1"].forEach((name) => {
    const obj = modelRoot.getObjectByName(name);
    if (obj) obj.visible = false;
  });

  modelRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const isArray = Array.isArray(obj.material);
    const mats = (isArray ? obj.material : [obj.material]).map((mat) => {
      if (!mat) return mat;
      const name = mat.name;
      if (name === "Lens" || name === "Sapphire miror" || name === "Camera filter" || name === "Mirror filter") {
        const isFilter = name === "Camera filter" || name === "Mirror filter";
        return new THREE.MeshPhysicalMaterial({
          name,
          color: isFilter ? "#090a0c" : "#020305",
          transparent: name === "Lens" || name === "Sapphire miror",
          opacity: name === "Lens" ? 0.82 : name === "Sapphire miror" ? 0.9 : 1,
          roughness: isFilter ? 0.28 : 0.04,
          metalness: isFilter ? 0.08 : 0,
          transmission: isFilter ? 0 : 0.18,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
        });
      }
      if (name === "Plastic LED" || name === "LED") {
        const isPlastic = name === "Plastic LED";
        return new THREE.MeshPhysicalMaterial({
          name,
          color: "#f5f3ee",
          emissive: new THREE.Color("#fffaf0"),
          emissiveIntensity: 0.08,
          transparent: true,
          opacity: isPlastic ? 0.8 : 1,
          roughness: 0.12,
          metalness: 0,
          transmission: isPlastic ? 0.48 : 0,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
        });
      }
      if (name === "Glass") {
        return new THREE.MeshPhysicalMaterial({
          name,
          color: "#ffffff",
          transparent: true,
          opacity: 0.018,
          roughness: 0.015,
          metalness: 0,
          transmission: 0,
          thickness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
        });
      }
      if (name === "Display") {
        return new THREE.MeshBasicMaterial({ name, color: "#030406", toneMapped: false });
      }
      if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
      const cloned = mat.clone();
      switch (name) {
        case "Frame":
          cloned.color = new THREE.Color("#0a0a0d");
          cloned.metalness = 0.55;
          cloned.roughness = 0.28;
          break;
        case "Aluminum":
          cloned.color = new THREE.Color(FINISH_BLACK.metal);
          break;
        case "Tint back glass":
        case "Frosted glass":
          cloned.color = new THREE.Color(FINISH_BLACK.glassTint);
          break;
        case "Metal Screw":
          cloned.color = new THREE.Color("#2a2c30");
          cloned.metalness = 0.85;
          cloned.roughness = 0.32;
          break;
        case "Plastic antena":
          cloned.color = new THREE.Color(FINISH_BLACK.metal);
          cloned.metalness = 0.1;
          cloned.roughness = 0.4;
          break;
        case "Plastic USB port":
          cloned.color = new THREE.Color("#1a1a1c");
          cloned.metalness = 0;
          cloned.roughness = 0.6;
          break;
      }
      return cloned;
    });
    obj.material = isArray ? mats : mats[0];
  });
}

// --- 2D Flat Device Fallback ---
function mountFlatDevice2D({ container, mediaSrc, basePose, scale, driver }) {
  container.innerHTML = "";
  const host = document.createElement("div");
  host.className = "alf-flat-device-host";

  const device = document.createElement("div");
  device.className = "alf-flat-device";
  device.style.display = "none";

  const screenImg = document.createElement("img");
  screenImg.className = "alf-flat-device-screen";
  screenImg.alt = "";
  screenImg.draggable = false;
  const s = FLAT_GEOMETRY.screen;
  screenImg.style.left = `${(s.x / FLAT_GEOMETRY.frameWidth) * 100}%`;
  screenImg.style.top = `${(s.y / FLAT_GEOMETRY.frameHeight) * 100}%`;
  screenImg.style.width = `${(s.width / FLAT_GEOMETRY.frameWidth) * 100}%`;
  screenImg.style.height = `${(s.height / FLAT_GEOMETRY.frameHeight) * 100}%`;
  screenImg.style.borderRadius = `${(s.radius / s.width) * 100}% / ${(s.radius / s.height) * 100}%`;

  const frameImg = document.createElement("img");
  frameImg.className = "alf-flat-device-frame";
  frameImg.src = FLAT_GEOMETRY.frameSrc;
  frameImg.alt = "";
  frameImg.draggable = false;

  device.appendChild(screenImg);
  device.appendChild(frameImg);
  host.appendChild(device);
  container.appendChild(host);

  let hostWidth = 0;
  let currentSrc = mediaSrc;
  let currentScale = typeof scale === "function" ? scale() : scale;

  const setMedia = async (src) => {
    currentSrc = src;
    const cleanedUrl = await getCleanDataUrl(src);
    if (currentSrc === src) {
      screenImg.src = cleanedUrl;
    }
  };
  setMedia(mediaSrc);

  const updateBox = () => {
    currentScale = typeof scale === "function" ? scale() : scale;
    if (hostWidth <= 0) {
      device.style.display = "none";
      return;
    }
    const pose = driver ? driver.target : basePose;
    const storyScale = driver ? pose.scale : 1;
    const h = WEBSITE_DEVICE_SCENE_SCALE * (hostWidth * FLAT_GEOMETRY.modelHeightRatio) * 1.84 * currentScale * storyScale;
    const w = h * (FLAT_GEOMETRY.frameWidth / FLAT_GEOMETRY.frameHeight);
    const factor = h / (1.05 * Math.max(0.001, storyScale));
    const ox = (driver ? pose.x : 0) * factor;
    const oy = -(driver ? pose.y : 0) * factor;
    const rz = driver ? pose.rotationZ : basePose?.rotationZ ?? 0;

    device.style.display = "block";
    device.style.width = `${w}px`;
    device.style.height = `${h}px`;
    device.style.transform = `translate(-50%, -50%) translate(${ox}px, ${oy}px) rotate(${-rz}rad)`;
  };

  const ro = new ResizeObserver(() => {
    hostWidth = host.clientWidth;
    updateBox();
  });
  ro.observe(host);
  driver?.subscribe(updateBox);

  return {
    setMedia,
    refreshLayout: updateBox,
  };
}

// --- 3D iPhone Device Canvas Controller ---
function mountDeviceCanvas({
  container,
  mediaSrc,
  preloadSrcs = [],
  basePose,
  getScale,
  bleedX = 0,
  bleedY = 0,
  maxDpr = 1.5,
  driver = null,
}) {
  if (!supportsWebGL()) {
    return mountFlatDevice2D({ container, mediaSrc, basePose, scale: getScale, driver });
  }

  let activeFallback = null;
  let currentSrc = mediaSrc;
  const bleedWrap = document.createElement("div");
  bleedWrap.className = "alf-canvas-bleed";
  bleedWrap.style.inset = `${-(100 * bleedY)}% ${-(100 * bleedX)}%`;
  container.appendChild(bleedWrap);

  const canvas = document.createElement("canvas");
  bleedWrap.appendChild(canvas);

  let renderer = null;
  let scene = null;
  let camera = null;
  let outerGroup = null;
  let deviceGroup = null;
  let screenMat = null;
  let isVisible = true;
  let rafId = 0;
  let animRunning = false;

  const baseRotX = basePose?.rotationX ?? SWAY_DEFAULTS.rotationX;
  const baseRotY = basePose?.rotationY ?? SWAY_DEFAULTS.rotationY;
  const baseRotZ = basePose?.rotationZ ?? 0;

  const currentPose = {
    x: 0,
    y: 0,
    rotationX: baseRotX,
    rotationY: baseRotY,
    rotationZ: baseRotZ,
    scale: 1,
  };
  const desiredRot = { x: baseRotX, y: baseRotY };
  let pointerOffset = null;
  const startTime = performance.now();
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const renderFrame = () => {
    if (!renderer || !scene || !camera) return;
    if (outerGroup) {
      const b = typeof getScale === "function" ? getScale() : getScale;
      outerGroup.scale.setScalar((SWAY_DEFAULTS.scale * b) / (1 + 2 * bleedY));
    }
    if (deviceGroup) {
      deviceGroup.position.x = currentPose.x;
      deviceGroup.position.y = currentPose.y;
      deviceGroup.rotation.x = currentPose.rotationX;
      deviceGroup.rotation.y = currentPose.rotationY;
      deviceGroup.rotation.z = currentPose.rotationZ;
      deviceGroup.scale.setScalar(IPHONE_BASE_SCALE * currentPose.scale);
    }
    renderer.render(scene, camera);
  };

  const stepAnimation = (now) => {
    rafId = 0;
    if (!isVisible) {
      animRunning = false;
      return;
    }

    const elapsed = (now - startTime) / 1000;
    const reduced = reducedMotionQuery.matches;
    const swayY = reduced ? 0 : Math.sin(elapsed * SWAY_DEFAULTS.speed) * SWAY_DEFAULTS.swayY;
    const swayX = reduced ? 0 : Math.cos(elapsed * SWAY_DEFAULTS.speed * 0.72) * SWAY_DEFAULTS.swayX;

    const drv = driver?.target;
    const targetRotX = drv ? drv.rotationX : baseRotX;
    const targetRotY = drv ? drv.rotationY : baseRotY;
    const ptrScale = drv ? 0.35 : 1;

    desiredRot.y = targetRotY + (pointerOffset ? pointerOffset.x * SWAY_DEFAULTS.pointerY * ptrScale : 0) + swayY;
    desiredRot.x = targetRotX + (pointerOffset ? pointerOffset.y * SWAY_DEFAULTS.pointerX * ptrScale : 0) + swayX;

    const lerp = drv ? 0.11 : 0.075;
    const dy = desiredRot.y - currentPose.rotationY;
    const dx = desiredRot.x - currentPose.rotationX;
    currentPose.rotationY += dy * lerp;
    currentPose.rotationX += dx * lerp;

    let dz = 0, dpx = 0, dpy = 0, ds = 0;
    if (drv) {
      dz = drv.rotationZ - currentPose.rotationZ;
      dpx = drv.x - currentPose.x;
      dpy = drv.y - currentPose.y;
      ds = drv.scale - currentPose.scale;
      currentPose.rotationZ += dz * lerp;
      currentPose.x += dpx * lerp;
      currentPose.y += dpy * lerp;
      currentPose.scale += ds * lerp;
    }

    renderFrame();

    const settled =
      Math.abs(dy) < 5e-4 &&
      Math.abs(dx) < 5e-4 &&
      Math.abs(dz) < 5e-4 &&
      Math.abs(dpx) < 5e-4 &&
      Math.abs(dpy) < 5e-4 &&
      Math.abs(ds) < 5e-4;

    if (reduced && settled && !pointerOffset) {
      animRunning = false;
      return;
    }
    rafId = requestAnimationFrame(stepAnimation);
  };

  const kickAnimation = () => {
    if (!animRunning && isVisible) {
      animRunning = true;
      rafId = requestAnimationFrame(stepAnimation);
    }
  };

  const siteEl = container.closest(".alf-site") || container;
  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    pointerOffset = {
      x: Math.max(-1, Math.min(1, 2 * ((e.clientX - cx) / Math.max(rect.width, 1)))),
      y: Math.max(-1, Math.min(1, 2 * ((e.clientY - cy) / Math.max(rect.height, 1)))),
    };
    kickAnimation();
  };
  const onPointerLeave = () => {
    pointerOffset = null;
    kickAnimation();
  };

  siteEl.addEventListener("pointermove", onPointerMove, { passive: true });
  siteEl.addEventListener("pointerleave", onPointerLeave);
  driver?.subscribe(kickAnimation);
  reducedMotionQuery.addEventListener("change", kickAnimation);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = !!entry?.isIntersecting;
        if (isVisible) kickAnimation();
      },
      { threshold: 0.05 }
    );
    io.observe(container);
  }

  // Preload all story textures in background
  for (const s of preloadSrcs) {
    getScreenTexture(s).catch(() => {});
  }

  const updateSize = () => {
    if (!renderer || !camera) return;
    const w = bleedWrap.clientWidth;
    const h = bleedWrap.clientHeight;
    if (w <= 0 || h <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, typeof maxDpr === "function" ? maxDpr() : maxDpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderFrame();
  };

  const setMedia = async (src) => {
    currentSrc = src;
    if (activeFallback) return activeFallback.setMedia(src);
    try {
      const tex = await getScreenTexture(src);
      if (currentSrc === src && screenMat) {
        screenMat.map = tex;
        screenMat.needsUpdate = true;
        renderFrame();
      }
    } catch {
      // ignore failed single frame
    }
  };

  // Initialize Three.js WebGL scene
  Promise.all([loadShared3DAssets(), getScreenTexture(mediaSrc)])
    .then(([{ gltf, hdrTexture }, initialTex]) => {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(DEVICE_STILL_CAMERA.fov, 1, 0.1, 1000);
        camera.position.set(...DEVICE_STILL_CAMERA.position);

        // Shared Studio Lighting + PMREM Environment
        scene.add(new THREE.AmbientLight(0xffffff, 1.1));
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
        keyLight.position.set(4, 6, 5);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.95);
        rimLight.position.set(-4, 2, -4);
        scene.add(rimLight);

        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const envRT = pmrem.fromEquirectangular(hdrTexture);
        scene.environment = envRT.texture;
        pmrem.dispose();

        outerGroup = new THREE.Group();
        scene.add(outerGroup);

        deviceGroup = new THREE.Group();
        deviceGroup.scale.setScalar(IPHONE_BASE_SCALE);
        outerGroup.add(deviceGroup);

        const clonedModel = gltf.scene.clone(true);
        applyIPhoneMaterials(clonedModel);
        deviceGroup.add(clonedModel);

        screenMat = new THREE.MeshBasicMaterial({
          map: initialTex,
          toneMapped: false,
          depthTest: false,
          depthWrite: false,
        });
        const screenMesh = new THREE.Mesh(createScreenGeometry(), screenMat);
        screenMesh.position.set(0, 0, 0.00378);
        screenMesh.rotation.set(0, 0, Math.PI);
        screenMesh.renderOrder = 11;
        deviceGroup.add(screenMesh);

        const bezelMesh = new THREE.Mesh(
          createBezelGeometry(),
          new THREE.MeshBasicMaterial({
            color: "#030406",
            toneMapped: false,
            depthTest: false,
            depthWrite: false,
          })
        );
        bezelMesh.position.set(0, 0, 0.00379);
        bezelMesh.rotation.set(0, 0, Math.PI);
        bezelMesh.renderOrder = 12;
        deviceGroup.add(bezelMesh);

        const islandMesh = new THREE.Mesh(
          createDynamicIslandGeometry(),
          new THREE.MeshBasicMaterial({
            color: "#030406",
            toneMapped: false,
            depthTest: false,
            depthWrite: false,
          })
        );
        islandMesh.position.set(0, 0.0678, 0.00395);
        islandMesh.renderOrder = 13;
        deviceGroup.add(islandMesh);

        if (currentSrc !== mediaSrc) {
          setMedia(currentSrc);
        }

        const ro = new ResizeObserver(updateSize);
        ro.observe(bleedWrap);
        updateSize();
        renderer.compile(scene, camera);
        renderFrame();
        kickAnimation();
      } catch (err) {
        console.warn("3D device initialization failed, using 2D fallback", err);
        activeFallback = mountFlatDevice2D({
          container,
          mediaSrc: currentSrc,
          basePose,
          scale: getScale,
          driver,
        });
      }
    })
    .catch((err) => {
      console.warn("Failed to load 3D device assets, using 2D fallback", err);
      activeFallback = mountFlatDevice2D({
        container,
        mediaSrc: currentSrc,
        basePose,
        scale: getScale,
        driver,
      });
    });

  return {
    setMedia,
    refreshLayout: () => {
      if (activeFallback) activeFallback.refreshLayout();
      else updateSize();
    },
  };
}

// --- Scroll-Driven Story Section (.alf-story) ---
function computeFlipAccumulation(beats, index) {
  let acc = 0;
  for (let i = 1; i <= index; i++) {
    if (beats[i].transition === "flip") {
      acc += (beats[i - 1].pose.rotationY <= beats[i].pose.rotationY ? 1 : -1) * Math.PI * 2;
    }
  }
  return acc;
}

function getBeatTransform(beat) {
  const scale = (beat.focus === "full" ? 1 : 1.6) * beat.scale;
  return {
    y: -(1.05 * FOCUS_OFFSETS[beat.focus]) * scale,
    scale,
  };
}

function computeStoryFrame(progress, beats, reducedMotion) {
  const last = beats.length - 1;
  const clamped = Math.max(0, Math.min(beats.length - 1e-6, progress));
  const idx = Math.min(last, Math.floor(clamped));
  const frac = clamped - idx;
  const cur = beats[idx];
  const prev = idx > 0 ? beats[idx - 1] : null;
  const span = prev ? Math.min(1, frac / STORY_TRANSITION_SPAN) : 1;
  const ease = span < 0.5 ? 4 * span * span * span : 1 - Math.pow(-2 * span + 2, 3) / 2;

  if (!prev || reducedMotion) {
    const chosen = !prev || span >= 0.5 ? cur : prev;
    const chosenIdx = chosen === cur ? idx : idx - 1;
    const tf = getBeatTransform(chosen);
    return {
      target: {
        ...chosen.pose,
        rotationY: chosen.pose.rotationY + computeFlipAccumulation(beats, chosenIdx),
        x: 0,
        y: tf.y,
        scale: tf.scale,
      },
      mediaIndex: chosenIdx,
      activeIndex: chosenIdx,
    };
  }

  const tfPrev = getBeatTransform(prev);
  const tfCur = getBeatTransform(cur);
  const isFlip = cur.transition === "flip";
  const prevRotY = prev.pose.rotationY + computeFlipAccumulation(beats, idx - 1);
  const curRotY = cur.pose.rotationY + computeFlipAccumulation(beats, idx);
  const rotY = prevRotY + (curRotY - prevRotY) * ease;
  const dip = 1 - (isFlip ? 0.14 : 0.06) * Math.sin(Math.PI * span);
  const mediaIndex = (isFlip ? Math.abs(rotY - prevRotY) >= Math.PI / 2 : span >= 0.5) ? idx : idx - 1;

  return {
    target: {
      rotationX: prev.pose.rotationX + (cur.pose.rotationX - prev.pose.rotationX) * ease,
      rotationY: rotY,
      rotationZ: prev.pose.rotationZ + (cur.pose.rotationZ - prev.pose.rotationZ) * ease,
      x: 0,
      y: tfPrev.y + (tfCur.y - tfPrev.y) * ease,
      scale: (tfPrev.scale + (tfCur.scale - tfPrev.scale) * ease) * dip,
    },
    mediaIndex,
    activeIndex: span >= 0.35 ? idx : idx - 1,
  };
}

function getStoryLandings(count) {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 0 : i + STORY_TRANSITION_SPAN + 0.1));
}

function pickStoryLanding(progress, delta, landings) {
  if (landings.length === 0 || delta === 0) return null;
  const first = landings[0];
  const last = landings[landings.length - 1];
  if (delta > 0) {
    const next = landings.find((l) => l > progress + 0.02);
    return next === undefined || progress + delta < first - 0.02 ? null : next;
  }
  const prev = [...landings].reverse().find((l) => l < progress - 0.02);
  return prev === undefined || progress + delta > last + 0.02 ? null : prev;
}

function initStorySection(isMobileFn) {
  const storyEl = document.querySelector(".alf-story");
  const deviceMount = document.getElementById("alf-story-device-canvas");
  if (!storyEl || !deviceMount) return;

  const siteEl = storyEl.closest(".alf-site");
  const navEl = siteEl?.querySelector(".alf-nav") ?? null;
  const deviceWrap = storyEl.querySelector(".alf-story-device");
  const railDots = Array.from(storyEl.querySelectorAll(".alf-story-rail li"));
  const panels = Array.from(storyEl.querySelectorAll(".alf-story-panel"));

  const driver = new DeviceStoryDriver(STORY_BEATS[0].pose);
  const controller = mountDeviceCanvas({
    container: deviceMount,
    mediaSrc: STORY_BEATS[0].src,
    preloadSrcs: STORY_BEATS.map((b) => b.src),
    basePose: STORY_BEATS[0].pose,
    getScale: () => (isMobileFn() ? 0.9 : 1.05),
    bleedX: 0.7,
    bleedY: 0.35,
    maxDpr: () => (isMobileFn() ? 1.25 : 1.5),
    driver,
  });

  let beatHeight = 1;
  let storyTop = 0;
  let prevStageH = -1;
  let prevNavH = -1;
  let currentMediaIdx = 0;
  let currentActiveIdx = 0;
  let rafScroll = 0;

  const setActivePanel = (idx) => {
    currentActiveIdx = idx;
    railDots.forEach((dot, i) => dot.classList.toggle("is-active", i === idx));
    panels.forEach((panel, i) => {
      const active = i === idx;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });
  };

  const getProgress = () => (storyTop - storyEl.getBoundingClientRect().top) / beatHeight;

  const updateStory = () => {
    rafScroll = 0;
    const winH = window.innerHeight;
    const navH = navEl?.offsetHeight ?? 0;
    const availH = Math.max(1, winH - navH);
    const desktopWidth = (siteEl?.clientWidth ?? 0) > 760;
    const stageH =
      desktopWidth && deviceWrap && deviceWrap.clientWidth > 0
        ? Math.min(availH, Math.max(360, deviceWrap.clientWidth))
        : availH;

    beatHeight = STORY_BEAT_LENGTH * stageH;
    storyTop = navH + Math.max(0, availH - stageH) / 2;
    storyEl.style.setProperty("--alf-story-top", `${storyTop}px`);

    const bleed = Math.min(Math.max(0, availH - stageH) / 2, 0.35 * stageH);
    storyEl.style.setProperty("--alf-story-device-bleed", `${bleed}px`);

    if (stageH !== prevStageH || navH !== prevNavH) {
      prevStageH = stageH;
      prevNavH = navH;
      storyEl.style.setProperty("--alf-stage-h", `${stageH}px`);
      storyEl.style.setProperty("--alf-beat-h", `${beatHeight}px`);
      storyEl.style.setProperty("--alf-tail-h", `${beatHeight * (STORY_TRANSITION_SPAN + 0.3)}px`);
      storyEl.style.setProperty("--alf-nav-h", `${navH}px`);
    }

    const rect = storyEl.getBoundingClientRect();
    storyEl.toggleAttribute("data-compact-landscape", rect.width >= 500 && availH <= 440 && rect.width > availH);
    if (deviceWrap) {
      storyEl.style.setProperty("--alf-device-width", `${deviceWrap.clientWidth}px`);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = computeStoryFrame(getProgress(), STORY_BEATS, reduced);
    driver.set(frame.target);

    if (frame.mediaIndex !== currentMediaIdx) {
      currentMediaIdx = frame.mediaIndex;
      controller.setMedia(STORY_BEATS[frame.mediaIndex].src);
    }
    if (frame.activeIndex !== currentActiveIdx) {
      setActivePanel(frame.activeIndex);
    }
  };

  const scheduleUpdate = () => {
    if (!rafScroll) rafScroll = requestAnimationFrame(updateStory);
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  const ro = new ResizeObserver(scheduleUpdate);
  ro.observe(storyEl);
  if (navEl) ro.observe(navEl);
  if (deviceWrap) ro.observe(deviceWrap);
  updateStory();

  // Beat-snapping glide controller (wheel, touch, keyboard, dot click)
  const landings = getStoryLandings(STORY_BEATS.length);
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let mode = "idle";
  let glideRaf = 0;
  let settleTimer = 0;
  let settleUntil = 0;
  let lastWheelDelta = 0;
  let queuedDir = 0;
  let touchState = null;

  const endSettle = () => {
    window.clearTimeout(settleTimer);
    if (mode === "settling") mode = "idle";
  };
  const armSettle = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(endSettle, 180);
  };

  const glideToLanding = (targetLanding) => {
    if (beatHeight <= 0) return false;
    const curProgress = getProgress();
    const curScrollY = window.scrollY;
    const targetScrollY = Math.round(curScrollY + (targetLanding - curProgress) * beatHeight);
    cancelAnimationFrame(glideRaf);
    window.clearTimeout(settleTimer);
    queuedDir = 0;

    const finishGlide = () => {
      mode = "settling";
      settleUntil = performance.now() + 2000;
      armSettle();
      if (queuedDir) {
        const dir = queuedDir;
        queuedDir = 0;
        triggerStep(dir, 1);
      }
    };

    if (reducedMotionQuery.matches || targetScrollY === curScrollY) {
      window.scrollTo({ top: targetScrollY, behavior: "instant" });
      finishGlide();
      return true;
    }

    mode = "gliding";
    const diff = targetScrollY - curScrollY;
    const duration = Math.min(950, Math.max(550, 420 + 0.6 * Math.abs(diff)));
    const start = performance.now();
    let expectedY = curScrollY;

    const tick = (now) => {
      if (Math.abs(window.scrollY - expectedY) > 2) {
        mode = "idle";
        queuedDir = 0;
        return;
      }
      const t = Math.min(1, (now - start) / duration);
      expectedY = Math.round(curScrollY + diff * (1 - Math.pow(1 - t, 3)));
      window.scrollTo({ top: expectedY, behavior: "instant" });
      if (t < 1) {
        glideRaf = requestAnimationFrame(tick);
      } else {
        finishGlide();
      }
    };
    glideRaf = requestAnimationFrame(tick);
    return true;
  };

  const triggerStep = (sign, amount) => {
    if (beatHeight <= 0) return false;
    const curProgress = getProgress();
    const nextLanding = pickStoryLanding(curProgress, (Math.sign(sign) * Math.max(1, Math.abs(amount))) / beatHeight, landings);
    if (nextLanding === null) return false;
    return glideToLanding(nextLanding);
  };

  railDots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      endSettle();
      glideToLanding(landings[idx]);
    });
  });

  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dy =
        e.deltaMode === 1
          ? 16 * e.deltaY
          : e.deltaMode === 2
          ? e.deltaY * window.innerHeight
          : e.deltaY;
      if (dy === 0) return;

      const mag = Math.abs(dy);
      const isImpulse = mag > 8 && mag > 1.5 * lastWheelDelta;
      lastWheelDelta = mag;

      if (mode === "gliding") {
        e.preventDefault();
        if (isImpulse) queuedDir = Math.sign(dy);
        return;
      }
      if (mode === "settling") {
        if (performance.now() < settleUntil && !isImpulse) {
          e.preventDefault();
          armSettle();
          return;
        }
        endSettle();
      }
      if (triggerStep(dy, dy)) e.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener(
    "touchstart",
    (e) => {
      touchState = e.touches.length === 1 ? { y: e.touches[0].clientY, owned: false, decided: false } : null;
      if (mode === "settling") endSettle();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (mode === "gliding" || touchState?.owned) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (!touchState || touchState.decided || e.touches.length !== 1) return;
      const dy = touchState.y - e.touches[0].clientY;
      if (Math.abs(dy) < 4) return;
      touchState.decided = true;
      if (e.cancelable && triggerStep(dy, dy)) {
        touchState.owned = true;
        e.preventDefault();
      }
    },
    { passive: false }
  );

  const clearTouch = () => {
    touchState = null;
  };
  window.addEventListener("touchend", clearTouch);
  window.addEventListener("touchcancel", clearTouch);

  const downKeys = new Set(["ArrowDown", "PageDown", " ", "Spacebar"]);
  const upKeys = new Set(["ArrowUp", "PageUp"]);
  window.addEventListener("keydown", (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const t = e.target;
    if (t && t.tagName && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A|VIDEO)$/.test(t.tagName))) {
      return;
    }
    const isDown = downKeys.has(e.key) && !(e.key === " " && e.shiftKey);
    const isUp = upKeys.has(e.key) || (e.key === " " && e.shiftKey);
    if (!isDown && !isUp) return;

    if (mode === "gliding") {
      e.preventDefault();
      queuedDir = isDown ? 1 : -1;
      return;
    }
    endSettle();
    const step = e.key.startsWith("Arrow") ? 40 : window.innerHeight * 0.85;
    if (triggerStep(isDown ? 1 : -1, isDown ? step : -step)) {
      e.preventDefault();
    }
  });
}

// --- Hero 3D Device, Auto-Cycling Slides & Mobile Scroll Driver ---
function initHeroSection(isMobileFn) {
  const heroSection = document.getElementById("hero");
  const heroCanvasMount = document.getElementById("alf-hero-device-canvas");
  if (!heroSection || !heroCanvasMount) return;

  let activeSlideIdx = 0;
  const heroDriver = new DeviceStoryDriver(HERO_SLIDES[0].pose);

  const controller = mountDeviceCanvas({
    container: heroCanvasMount,
    mediaSrc: HERO_SLIDES[0].src,
    preloadSrcs: HERO_SLIDES.map((s) => s.src),
    basePose: HERO_SLIDES[0].pose,
    getScale: () => (isMobileFn() ? 1 : 1.3),
    bleedX: 0.25,
    bleedY: 0.35,
    maxDpr: () => (isMobileFn() ? 1.25 : 1.5),
    driver: heroDriver,
  });

  // Also drive slide tilt + mobile scroll pose + nav CTA muted behavior
  const navBtn = document.getElementById("alf-download-btn");
  const navBtnLabel = navBtn?.querySelector("span");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let rafHero = 0;
  let heroVisible = true;

  const applyHeroDriver = () => {
    const mobile = isMobileFn();
    const slidePose = HERO_SLIDES[activeSlideIdx].pose;
    const rect = heroSection.getBoundingClientRect();

    if (mobile) {
      const p = Math.min(1, Math.max(0, -rect.top) / Math.max(1, rect.height));
      const c = reducedMotionQuery.matches ? 0 : p;
      heroDriver.set({
        rotationX: slidePose.rotationX - 0.12 * c,
        rotationY: slidePose.rotationY + 0.45 * c,
        rotationZ: slidePose.rotationZ,
        x: 0,
        y: 0.22 * c,
        scale: 1 + 0.06 * c,
      });
    } else {
      heroDriver.set({
        ...slidePose,
        x: 0,
        y: 0,
        scale: 1,
      });
    }
  };

  const updateHeroScroll = () => {
    rafHero = 0;
    const mobile = isMobileFn();
    if (navBtnLabel) {
      navBtnLabel.textContent = mobile ? "Join Waitlist" : "Join Waitlist";
    }
    const rect = heroSection.getBoundingClientRect();
    const heroBadgesVisible = rect.bottom > 120;
    if (navBtn) {
      const muted = mobile && heroBadgesVisible;
      navBtn.classList.toggle("alf-nav-cta-muted", muted);
      navBtn.setAttribute("aria-hidden", muted ? "true" : "false");
      navBtn.tabIndex = muted ? -1 : 0;
    }

    applyHeroDriver();
    controller.refreshLayout();
  };

  const scheduleHero = () => {
    if (!rafHero) rafHero = requestAnimationFrame(updateHeroScroll);
  };

  window.addEventListener("scroll", scheduleHero, { passive: true });
  window.addEventListener("resize", scheduleHero);
  updateHeroScroll();

  if ("IntersectionObserver" in window) {
    const heroIo = new IntersectionObserver(
      ([entry]) => {
        heroVisible = !!entry?.isIntersecting;
      },
      { threshold: 0.1 }
    );
    heroIo.observe(heroSection);
  }

  window.setInterval(() => {
    if (!heroVisible || document.hidden || reducedMotionQuery.matches) return;
    activeSlideIdx = (activeSlideIdx + 1) % HERO_SLIDES.length;
    const slide = HERO_SLIDES[activeSlideIdx];
    controller.setMedia(slide.src);
    applyHeroDriver();
  }, HERO_ROTATE_INTERVAL_MS);
}

// --- Infinite Auto-Scrolling & Draggable Showcase Marquee ---
function initMarquee() {
  const viewport = document.querySelector(".alf-marquee-viewport");
  const track = viewport?.querySelector(".alf-marquee");
  if (!viewport || !track) return;

  const items = track.children;
  const halfCount = Math.floor(items.length / 2);
  if (halfCount <= 0) return;

  let halfWidth = 0;
  const measure = () => {
    const first = items[0];
    const secondHalfStart = items[halfCount];
    halfWidth = first && secondHalfStart ? secondHalfStart.offsetLeft - first.offsetLeft : 0;
  };
  const ro = new ResizeObserver(measure);
  ro.observe(track);
  measure();

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hovered = false;
  let dragState = null;
  let visible = false;
  let running = false;
  let raf = 0;
  let lastTs = performance.now();
  let pos = viewport.scrollLeft;

  const loop = (now) => {
    if (!visible) {
      running = false;
      return;
    }
    const dt = Math.min((now - lastTs) / 1000, 0.1);
    lastTs = now;
    if (halfWidth > 0) {
      if (Math.abs(viewport.scrollLeft - pos) > 1) {
        pos = viewport.scrollLeft;
      }
      if (!hovered && !dragState && !reducedQuery.matches) {
        pos += 28 * dt;
      }
      if (pos >= halfWidth) pos -= halfWidth;
      else if (pos <= 0) pos += halfWidth;
      viewport.scrollLeft = pos;
    }
    raf = requestAnimationFrame(loop);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    if (visible && !running) {
      running = true;
      lastTs = performance.now();
      raf = requestAnimationFrame(loop);
    }
  });
  io.observe(viewport);

  viewport.addEventListener("pointerenter", () => {
    hovered = true;
  });
  viewport.addEventListener("pointerleave", () => {
    hovered = false;
  });
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") {
      dragState = { pointerId: e.pointerId, lastX: e.clientX };
      viewport.setPointerCapture?.(e.pointerId);
    }
  });
  viewport.addEventListener("pointermove", (e) => {
    if (dragState && dragState.pointerId === e.pointerId) {
      viewport.scrollLeft -= e.clientX - dragState.lastX;
      pos = viewport.scrollLeft;
      dragState.lastX = e.clientX;
    }
  });
  const endDrag = () => {
    dragState = null;
  };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
}

// --- Waitlist Modal ---
function initDownloadModal() {
  const openBtn = document.getElementById("alf-download-btn");
  const overlay = document.getElementById("alf-download-modal");
  if (!openBtn || !overlay) return;

  const closeBtn = overlay.querySelector(".alf-download-close");
  const dialog = overlay.querySelector(".alf-download-modal");
  const emailInput = overlay.querySelector(".alf-waitlist-input");
  let prevOverflow = "";

  const openModal = () => {
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.hidden = false;
    requestAnimationFrame(() => emailInput?.focus());
  };

  const closeModal = () => {
    overlay.hidden = true;
    document.body.style.overflow = prevOverflow;
  };

  openBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal();
  });
  closeBtn?.addEventListener("click", closeModal);
  overlay.addEventListener("mousedown", closeModal);
  dialog?.addEventListener("mousedown", (e) => e.stopPropagation());
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });
}

// --- Zero-Backend Waitlist Forms (Hero, CTA, Modal) ---
function initWaitlistForms() {
  const forms = Array.from(document.querySelectorAll(".alf-waitlist-form"));
  if (forms.length === 0) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const setStatus = (statusEl, state, message, fallbackMailto) => {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.dataset.state = state;
    statusEl.textContent = message;
    if (fallbackMailto) {
      statusEl.appendChild(document.createTextNode(" "));
      const link = document.createElement("a");
      link.href = fallbackMailto;
      link.textContent = WAITLIST_SUPPORT_EMAIL;
      statusEl.appendChild(link);
      statusEl.appendChild(document.createTextNode("."));
    }
  };

  const saveLocalWaitlist = (entry) => {
    try {
      const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(list) ? list.filter((item) => item?.email !== entry.email) : [];
      next.push(entry);
      window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors in private browsing
    }
  };

  forms.forEach((form) => {
    const emailInput = form.querySelector(".alf-waitlist-input");
    const honeyInput = form.querySelector('input[name="_honey"]');
    const submitBtn = form.querySelector(".alf-waitlist-submit");
    const submitLabel = submitBtn?.querySelector("span");
    const statusEl = form.querySelector(".alf-waitlist-status");
    const defaultBtnText = submitLabel?.textContent || "Notify Me";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.dataset.submitting === "true") return;

      const email = (emailInput?.value || "").trim().toLowerCase();
      const platform = form.querySelector('input[name="platform"]:checked')?.value || "ios";
      const source = form.dataset.waitlistSource || "landing";

      if (honeyInput && honeyInput.value.trim() !== "") {
        setStatus(statusEl, "success", "You're on the waitlist! We'll notify you when Kiroku launches.");
        form.reset();
        return;
      }

      if (!emailRegex.test(email)) {
        setStatus(statusEl, "error", "Please enter a valid email address.");
        emailInput?.focus();
        return;
      }

      form.dataset.submitting = "true";
      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = "Sending...";
      if (statusEl) {
        statusEl.hidden = true;
        delete statusEl.dataset.state;
      }

      const submittedAt = new Date().toISOString();
      const payload = {
        email,
        platform,
        source,
        submitted_at: submittedAt,
        _subject: `New Kiroku Waitlist Signup (${platform.toUpperCase()})`,
        _template: "table",
        _captcha: "false",
      };

      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || data?.success === false || data?.success === "false") {
          throw new Error(data?.message || `Request failed with status ${res.status}`);
        }

        saveLocalWaitlist({ email, platform, source, submitted_at: submittedAt });
        setStatus(statusEl, "success", "You're on the waitlist! We'll notify you when Kiroku launches.");
        if (emailInput) emailInput.value = "";
      } catch {
        const subject = encodeURIComponent(`Kiroku Waitlist Signup (${platform.toUpperCase()})`);
        const body = encodeURIComponent(
          `Hi Kiroku team,\n\nPlease add me to the Kiroku launch waitlist.\n\nEmail: ${email}\nPlatform: ${platform}\nSource: ${source}\nSubmitted: ${submittedAt}\n`
        );
        const mailtoUrl = `mailto:${WAITLIST_SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
        const mailLink = document.createElement("a");
        mailLink.href = mailtoUrl;
        mailLink.click();

        setStatus(
          statusEl,
          "error",
          "Could not reach the signup service automatically. Your email app has been prepared, or send directly to",
          mailtoUrl
        );
      } finally {
        delete form.dataset.submitting;
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = defaultBtnText;
      }
    });
  });
}

// --- Scroll Reveal Animations ---
function initScrollReveal() {
  const site = document.querySelector(".alf-site");
  const reveals = Array.from(document.querySelectorAll(".alf-reveal"));
  if (!site || reveals.length === 0) return;

  site.setAttribute("data-motion", "on");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  reveals.forEach((el) => io.observe(el));
}

// --- Boot ---
const mobileMediaQuery = window.matchMedia("(max-width: 760px)");
const isMobile = () => mobileMediaQuery.matches;

initScrollReveal();
initHeroSection(isMobile);
initStorySection(isMobile);
initMarquee();
initDownloadModal();
initWaitlistForms();
