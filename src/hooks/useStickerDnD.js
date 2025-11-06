// src/hooks/useStickerDnD.js
import { useMemo, useRef, useState } from "react";

/**
 * useStickerDnD
 * Encapsulates sticker drag/drop between a tray and a video canvas.
 *
 * @param {Object} params
 * @param {string[]} params.sources - array of image URLs for stickers
 * @param {{left:number, top:number}[]} params.trayLayout - absolute tray homes for each sticker
 * @param {number} params.stickerSize - size (px) for each sticker
 *
 * @returns {
 *  {
 *    stickers,
 *    videoRef,
 *    onPointerDown,
 *    onPointerMove,
 *    onPointerUp,
 *    isDragging,
 *    draggingSticker,
 *    setStickers, // exposed in case you want to mutate externally
 *  }
 * }
 */
export default function useStickerDnD({ sources, trayLayout, stickerSize }) {
  const initialStickers = useMemo(
    () =>
      sources.map((src, i) => ({
        id: i,
        src,
        inVideo: false,
        trayHome: trayLayout[i],
        trayOffset: { x: 0, y: 0 },
        videoPos: { x: 100, y: 100 },
      })),
    [sources, trayLayout]
  );

  const [stickers, setStickers] = useState(initialStickers);

  // Refs for the current drag session
  const draggingRef = useRef(false);
  const activeIdRef = useRef(null);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // The drop target (video area)
  const videoRef = useRef(null);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const onPointerDown = (id) => (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    draggingRef.current = true;
    activeIdRef.current = id;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    const s = stickers.find((st) => st.id === id);
    if (!s) return;
    startPosRef.current = s.inVideo
      ? { x: s.videoPos.x, y: s.videoPos.y }
      : { x: s.trayOffset.x, y: s.trayOffset.y };
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const id = activeIdRef.current;
    if (id == null) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    setStickers((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.inVideo) {
          // Free drag while inside video (no clamping during move)
          return {
            ...s,
            videoPos: {
              x: startPosRef.current.x + dx,
              y: startPosRef.current.y + dy,
            },
          };
        } else {
          // Drag in tray via translate()
          return {
            ...s,
            trayOffset: {
              x: startPosRef.current.x + dx,
              y: startPosRef.current.y + dy,
            },
          };
        }
      })
    );
  };

  const onPointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const id = activeIdRef.current;
    activeIdRef.current = null;

    const videoEl = videoRef.current;
    const rect = videoEl?.getBoundingClientRect();

    const pointerInVideo =
      rect &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    setStickers((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        if (s.inVideo) {
          // Was in video when released
          if (!pointerInVideo) {
            // Leave video → back to tray origin
            return { ...s, inVideo: false, trayOffset: { x: 0, y: 0 } };
          } else {
            // Clamp only on drop (keep inside video bounds)
            const maxX = rect.width - stickerSize;
            const maxY = rect.height - stickerSize;
            return {
              ...s,
              videoPos: {
                x: clamp(s.videoPos.x, 0, maxX),
                y: clamp(s.videoPos.y, 0, maxY),
              },
            };
          }
        } else {
          // Was in tray when released
          if (pointerInVideo) {
            // Move into video, centered at pointer
            const relX = e.clientX - rect.left - stickerSize / 2;
            const relY = e.clientY - rect.top - stickerSize / 2;
            const maxX = rect.width - stickerSize;
            const maxY = rect.height - stickerSize;
            return {
              ...s,
              inVideo: true,
              videoPos: {
                x: clamp(relX, 0, maxX),
                y: clamp(relY, 0, maxY),
              },
              trayOffset: { x: 0, y: 0 },
            };
          }
          // Snap back to tray home
          return { ...s, trayOffset: { x: 0, y: 0 } };
        }
      })
    );
  };

  const isDragging = draggingRef.current;
  const draggingSticker = stickers.find((s) => s.id === activeIdRef.current) || null;

  return {
    stickers,
    setStickers, // optional external control if needed
    videoRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    isDragging,
    draggingSticker,
  };
}
