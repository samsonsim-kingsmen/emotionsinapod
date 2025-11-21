// src/hooks/useStickerDnD.js
import { useMemo, useRef, useState } from "react";

/**
 * useStickerDnD
 * - Tray stickers are templates and never move.
 * - Dragging from tray spawns a clone and shows a drag ghost.
 * - Dragging a placed sticker shows the same ghost and moves/removes it.
 */
export default function useStickerDnD({ sources, trayLayout, stickerSize }) {
  const initialStickers = useMemo(
    () =>
      sources.map((src, i) => ({
        id: i,
        src,
        isTemplate: true, // original in tray
        inVideo: false,   // becomes true only when actually placed
        trayHome: trayLayout[i],
        videoPos: { x: 100, y: 100 },
      })),
    [sources, trayLayout]
  );

  const [stickers, setStickers] = useState(initialStickers);

  // Drag ghost in screen space: { id, src, x, y } or null
  const [dragGhost, setDragGhost] = useState(null);

  // Internal drag refs
  const draggingRef = useRef(false);
  const activeIdRef = useRef(null);

  // Drop target (video area)
  const videoRef = useRef(null);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const onPointerDown = (id) => (e) => {
    e.preventDefault();

    const baseSticker = stickers.find((st) => st.id === id);
    if (!baseSticker) return;

    draggingRef.current = true;

    // 🔹 Dragging from tray: create a clone with a new id
    if (!baseSticker.inVideo && baseSticker.isTemplate) {
      const maxId = stickers.reduce((m, st) => Math.max(m, st.id), -1);
      const newId = maxId + 1;

      const newSticker = {
        ...baseSticker,
        id: newId,
        isTemplate: false, // clone, not a tray template
        inVideo: false,    // not yet placed in video
      };

      activeIdRef.current = newId;

      setStickers((prev) => [...prev, newSticker]);

      setDragGhost({
        id: newId,
        src: baseSticker.src,
        x: e.clientX - stickerSize / 2,
        y: e.clientY - stickerSize / 2,
      });
      return;
    }

    // 🔹 Dragging an already placed sticker in the video
    if (baseSticker.inVideo && !baseSticker.isTemplate) {
      activeIdRef.current = id;

      setDragGhost({
        id,
        src: baseSticker.src,
        x: e.clientX - stickerSize / 2,
        y: e.clientY - stickerSize / 2,
      });
      return;
    }

    // Fallback: shouldn't really happen
    draggingRef.current = false;
    activeIdRef.current = null;
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;

    setDragGhost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        x: e.clientX - stickerSize / 2,
        y: e.clientY - stickerSize / 2,
      };
    });
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

    setStickers((prev) => {
      const s = prev.find((st) => st.id === id);
      if (!s) return prev;

      // 🔹 Case 1: Clone created from tray (not yet in video)
      if (!s.inVideo && !s.isTemplate) {
        if (!pointerInVideo || !rect) {
          // Dropped outside video → delete clone
          return prev.filter((st) => st.id !== id);
        }

        // Drop inside video → place clone
        const relX = e.clientX - rect.left - stickerSize / 2;
        const relY = e.clientY - rect.top - stickerSize / 2;
        const maxX = rect.width - stickerSize;
        const maxY = rect.height - stickerSize;

        const clampedX = clamp(relX, 0, maxX);
        const clampedY = clamp(relY, 0, maxY);

        return prev.map((st) =>
          st.id === id
            ? {
                ...st,
                inVideo: true,
                videoPos: { x: clampedX, y: clampedY },
              }
            : st
        );
      }

      // 🔹 Case 2: Sticker already in the video
      if (s.inVideo && !s.isTemplate) {
        if (!pointerInVideo || !rect) {
          // Dragged out and released → delete placed sticker
          return prev.filter((st) => st.id !== id);
        }

        const relX = e.clientX - rect.left - stickerSize / 2;
        const relY = e.clientY - rect.top - stickerSize / 2;
        const maxX = rect.width - stickerSize;
        const maxY = rect.height - stickerSize;

        const clampedX = clamp(relX, 0, maxX);
        const clampedY = clamp(relY, 0, maxY);

        return prev.map((st) =>
          st.id === id
            ? {
                ...st,
                inVideo: true,
                videoPos: { x: clampedX, y: clampedY },
              }
            : st
        );
      }

      // Templates shouldn't be dragged as active
      return prev;
    });

    setDragGhost(null);
  };

  const isDragging = !!dragGhost;
  const draggingSticker =
    dragGhost && stickers.find((s) => s.id === dragGhost.id);

  return {
    stickers,
    setStickers,
    videoRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    isDragging,
    draggingSticker,
    dragGhost,
  };
}
