// /src/hooks/useRecordUploadQR.js
import { useCallback, useRef, useState } from "react";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Handles:
 *  - Rendering a hostRef area into a <canvas> as a short video
 *  - Flips the background horizontally (like preview)
 *  - Draws stickers with object-fit: contain
 *  - HiDPI canvas for crisp video
 *  - Uploads to Firebase Storage
 *  - Navigates to /qr with the download URL
 *
 * Params:
 *  - hostRef: React ref to the container you want to record (required)
 *  - photos: string[] slideshow frames (required)
 *  - getCurrentIndex: () => number (required)
 *  - getInVideoStickers: () => [{ src, videoPos: {x,y} }] (required)
 *  - stickerSize: px for sticker square box (default 120)
 *  - storage: Firebase Storage instance (required)
 *  - navigate: react-router navigate fn (required)
 *  - fps: number (default 30)
 *  - durationMs: number (default 2000)
 *  - borderRadiusPx: number (default 50)
 */
export default function useRecordUploadQR({
  hostRef,
  photos,
  getCurrentIndex,
  getInVideoStickers,
  stickerSize = 120,
  storage,
  navigate,
  fps = 30,
  durationMs = 2000,
  borderRadiusPx = 50,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  // --- image cache ---
  const imgCacheRef = useRef(new Map());
  const loadImage = useCallback(async (src) => {
    const cache = imgCacheRef.current;
    if (cache.has(src)) return cache.get(src);

    const img = new Image();
    img.crossOrigin = "anonymous";

    const p = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

    img.src = src;
    await p;
    cache.set(src, img);
    return img;
  }, []);

  const preloadAll = useCallback(async () => {
    const tasks = [];
    for (const p of photos) tasks.push(loadImage(p));
    const cur = getInVideoStickers ? getInVideoStickers() : [];
    for (const s of cur) tasks.push(loadImage(s.src));
    await Promise.allSettled(tasks);
  }, [photos, loadImage, getInVideoStickers]);

  const clipRoundedRect = useCallback((ctx, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(w - radius, 0);
    ctx.quadraticCurveTo(w, 0, w, radius);
    ctx.lineTo(w, h - radius);
    ctx.quadraticCurveTo(w, h, w - radius, h);
    ctx.lineTo(radius, h);
    ctx.quadraticCurveTo(0, h, 0, h - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
  }, []);

  const pickBestMimeType = useCallback(() => {
    const types = [
      "video/mp4;codecs=h264",
      "video/mp4;codecs=avc1.42E01E",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    for (const t of types) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  }, []);

  const recordOnce = useCallback(async () => {
    const host = hostRef?.current;
    if (!host) return null;

    setIsRecording(true);
    try {
      await preloadAll();

      const rect = host.getBoundingClientRect();
      const cssW = Math.max(2, Math.floor(rect.width));
      const cssH = Math.max(2, Math.floor(rect.height));

      // HiDPI canvas
      const dpr = window.devicePixelRatio || 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) throw new Error("2D context not available");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";

      const stream = canvas.captureStream(fps);
      const mimeType = pickBestMimeType();
      const chunks = [];
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunks.push(e.data);
      };

      const renderFrame = async () => {
        const width = cssW;
        const height = cssH;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        clipRoundedRect(ctx, width, height, borderRadiusPx);

        // --- BG (flipped horizontally like your on-screen preview) ---
        const i = getCurrentIndex ? getCurrentIndex() : 0;
        const photoSrc = photos[i];
        if (photoSrc) {
          const bg = await loadImage(photoSrc);

          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);

          const scale = Math.max(width / bg.width, height / bg.height);
          const dw = bg.width * scale;
          const dh = bg.height * scale;
          const dx = (width - dw) / 2;
          const dy = (height - dh) / 2;

          ctx.drawImage(bg, dx, dy, dw, dh);
          ctx.restore();
        }

        // --- Stickers (object-fit: contain inside stickerSize box) ---
        const current = (getInVideoStickers?.() || []);
        for (const s of current) {
          const im = await loadImage(s.src);
          const scale = Math.min(stickerSize / im.width, stickerSize / im.height);
          const dw = im.width * scale;
          const dh = im.height * scale;
          const dx = s.videoPos.x + (stickerSize - dw) / 2;
          const dy = s.videoPos.y + (stickerSize - dh) / 2;

          ctx.drawImage(im, dx, dy, dw, dh);
        }

        ctx.restore();
      };

      const frameInterval = 1000 / fps;
      let rafId = 0;
      let last = performance.now();
      let elapsed = 0;

      const finished = new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, {
            type: recorder.mimeType || mimeType || "video/webm",
          });
          resolve(blob);
        };
      });

      const tick = async (now) => {
        const delta = now - last;
        if (delta >= frameInterval - 1) {
          last = now;
          await renderFrame();
          elapsed += delta;
        }
        if (elapsed < durationMs) {
          rafId = requestAnimationFrame(tick);
        } else {
          recorder.stop();
        }
      };

      recorder.start();
      rafId = requestAnimationFrame(tick);

      const blob = await finished;
      cancelAnimationFrame(rafId);
      return blob;
    } finally {
      setIsRecording(false);
    }
  }, [
    hostRef,
    photos,
    getCurrentIndex,
    getInVideoStickers,
    stickerSize,
    fps,
    durationMs,
    borderRadiusPx,
    preloadAll,
    pickBestMimeType,
    clipRoundedRect,
    loadImage,
  ]);

  const recordUploadAndGo = useCallback(async () => {
    if (isRecording || isWorking) return;
    setIsWorking(true);
    try {
      const blob = await recordOnce();
      if (!blob) return;

      const ext = blob.type && blob.type.includes("mp4") ? "mp4" : "webm";
      const path = `videos/${Date.now()}.${ext}`;
      const fileRef = sRef(storage, path);

      await uploadBytes(fileRef, blob, {
        contentType: blob.type || (ext === "mp4" ? "video/mp4" : "video/webm"),
      });
      const url = await getDownloadURL(fileRef);

      navigate("/qr", { state: { videoUrl: url } });
      return url;
    } finally {
      setIsWorking(false);
    }
  }, [recordOnce, storage, navigate, isRecording, isWorking]);

  return { isRecording, isWorking, recordUploadAndGo, recordOnce };
}
