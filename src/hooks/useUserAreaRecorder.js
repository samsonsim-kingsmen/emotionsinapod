import { useMemo, useRef, useState } from "react";

/**
 * Records a specific element (hostRef) by redrawing its visual state into a canvas.
 * You provide functions to read the *current* photo index and *current* stickers,
 * so the recording always uses live values (no stale closures).
 *
 * Params:
 * - hostRef: ref to the DOM element whose size we mirror (the left "user video" area)
 * - photos: string[] of photo URLs/data URLs
 * - sources: string[] of sticker src paths (for preloading)
 * - getCurrentPhotoIndex: () => number
 * - getInVideoStickers: () => [{ src, videoPos: {x,y} }]
 * - stickerSize: number (box size each sticker fits into)
 * - borderRadiusPx?: number (rounded rect clip)
 * - fps?: number
 * - durationMs?: number
 *
 * Returns:
 * - { record, isRecording }
 *   - record: async () => Blob|null
 *   - isRecording: boolean
 */
export default function useUserAreaRecorder({
  hostRef,
  photos,
  sources,
  getCurrentPhotoIndex,
  getInVideoStickers,
  stickerSize,
  borderRadiusPx = 50,
  fps = 30,
  durationMs = 2000,
}) {
  const [isRecording, setIsRecording] = useState(false);

  // Preload photos
  const photoImageCache = useMemo(() => {
    const m = new Map();
    (photos || []).forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      m.set(src, img);
    });
    return m;
  }, [photos]);

  // Preload sticker images
  const stickerImageCache = useMemo(() => {
    const m = new Map();
    (sources || []).forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      m.set(src, img);
    });
    return m;
  }, [sources]);

  const createMediaRecorder = (stream) => {
    const candidates = [
      "video/mp4;codecs=avc1.42E01E",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    for (const mimeType of candidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(mimeType)) {
        return new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6_000_000,
        });
      }
    }
    return new MediaRecorder(stream, { videoBitsPerSecond: 6_000_000 });
  };

  const record = async () => {
    if (!photos || photos.length === 0) {
      alert("No photos to record.");
      return null;
    }

    const host = hostRef.current;
    const rect = host?.getBoundingClientRect();
    const width = Math.max(2, Math.floor(rect?.width || 1280));
    const height = Math.max(2, Math.floor(rect?.height || 720));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const stream = canvas.captureStream(fps);
    const recorder = createMediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const drawRoundedRectClip = (r) => {
      const x = 0,
        y = 0,
        w = width,
        h = height;
      const rad = borderRadiusPx;
      r.beginPath();
      r.moveTo(x + rad, y);
      r.arcTo(x + w, y, x + w, y + h, rad);
      r.arcTo(x + w, y + h, x, y + h, rad);
      r.arcTo(x, y + h, x, y, rad);
      r.arcTo(x, y, x + w, y, rad);
      r.closePath();
      r.clip();
    };

    setIsRecording(true);
    recorder.start();

    const start = performance.now();

    const draw = () => {
      const elapsed = performance.now() - start;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      drawRoundedRectClip(ctx);

      // Current slideshow image
      const currentIndex = getCurrentPhotoIndex();
      const currentPhotoSrc = photos[currentIndex];
      const photoImg = photoImageCache.get(currentPhotoSrc);

      if (photoImg && photoImg.complete) {
        const imgW = photoImg.naturalWidth || photoImg.width;
        const imgH = photoImg.naturalHeight || photoImg.height;
        const canvasRatio = width / height;
        const imgRatio = imgW / imgH;

        let drawW, drawH, dx, dy;
        if (imgRatio > canvasRatio) {
          drawH = height;
          drawW = imgRatio * drawH;
          dx = (width - drawW) / 2;
          dy = 0;
        } else {
          drawW = width;
          drawH = drawW / imgRatio;
          dx = 0;
          dy = (height - drawH) / 2;
        }
        ctx.drawImage(photoImg, dx, dy, drawW, drawH);
      } else {
        ctx.fillStyle = "#A2D5F2";
        ctx.fillRect(0, 0, width, height);
      }

      // Stickers (object-fit: contain in a `stickerSize` box)
      const inVideoStickers = getInVideoStickers() || [];
      for (const s of inVideoStickers) {
        const img = stickerImageCache.get(s.src);
        if (!img || !img.complete) continue;

        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        if (!iw || !ih) continue;

        const box = stickerSize;
        const scale = Math.min(box / iw, box / ih);
        const tw = iw * scale;
        const th = ih * scale;
        const dx = s.videoPos.x + (box - tw) / 2;
        const dy = s.videoPos.y + (box - th) / 2;

        ctx.drawImage(img, dx, dy, tw, th);
      }

      ctx.restore();

      if (elapsed < durationMs) {
        requestAnimationFrame(draw);
      } else {
        try {
          recorder.stop();
        } catch {}
      }
    };

    await new Promise((resolve) => {
      recorder.onstop = () => resolve();
      requestAnimationFrame(draw);
    });

    setIsRecording(false);

    const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
    return blob;
  };

  return { record, isRecording };
}
