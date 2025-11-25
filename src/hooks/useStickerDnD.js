// src/hooks/useStickerDnD.js
import { useMemo, useRef, useState } from "react";

/**
 * useStickerDnD
 * - Tray stickers are templates and never move.
 * - Dragging from tray spawns a clone and shows a drag ghost.
 * - Dragging a placed sticker moves/removes it.
 * - Placed stickers have a `scale` and can be resized via a resize handle.
 * - NEW: Each sticker has a `baseSize` (from TRAY_LAYOUT.size or fallback stickerSize).
 */
export default function useStickerDnD({ sources, trayLayout, stickerSize }) {
  const initialStickers = useMemo(
    () =>
      sources.map((src, i) => {
        const trayHome = trayLayout[i] || {};
        return {
          id: i,
          src,
          isTemplate: true, // original in tray
          inVideo: false, // becomes true only when actually placed
          trayHome,
          videoPos: { x: 100, y: 100 },
          scale: 1, // base scale
          baseSize: trayHome.size ?? stickerSize, // NEW: per-sticker base size
        };
      }),
    [sources, trayLayout, stickerSize]
  );

  const [stickers, setStickers] = useState(initialStickers);

  // Drag ghost in screen space: { id, src, x, y, scale, baseSize } or null
  const [dragGhost, setDragGhost] = useState(null);

  // Internal drag / resize refs
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);
  const activeIdRef = useRef(null);
  const resizeStartRef = useRef({
    x: 0,
    y: 0,
    scale: 1,
  });

  // Drop target (video area)
  const videoRef = useRef(null);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const onPointerDown = (id) => (e) => {
    // If we are in resize mode, ignore normal dragging
    if (resizingRef.current) return;

    e.preventDefault();

    const baseSticker = stickers.find((st) => st.id === id);
    if (!baseSticker) return;

    draggingRef.current = true;

    const effectiveScale = baseSticker.scale ?? 1;
    const baseSize = baseSticker.baseSize ?? stickerSize;
    const pixelSize = baseSize * effectiveScale;

    // 🔹 Dragging from tray: create a clone with a new id
    if (!baseSticker.inVideo && baseSticker.isTemplate) {
      const maxId = stickers.reduce((m, st) => Math.max(m, st.id), -1);
      const newId = maxId + 1;

      const newSticker = {
        ...baseSticker,
        id: newId,
        isTemplate: false, // clone, not a tray template
        inVideo: false, // not yet placed in video
        scale: 1, // tray clones start at scale 1
        // baseSize comes from baseSticker.baseSize
      };

      activeIdRef.current = newId;

      setStickers((prev) => [...prev, newSticker]);

      const cloneBaseSize = newSticker.baseSize ?? stickerSize;

      setDragGhost({
        id: newId,
        src: baseSticker.src,
        scale: 1,
        baseSize: cloneBaseSize,
        x: e.clientX - cloneBaseSize / 2,
        y: e.clientY - cloneBaseSize / 2,
      });
      return;
    }

    // 🔹 Dragging an already placed sticker in the video
    if (baseSticker.inVideo && !baseSticker.isTemplate) {
      activeIdRef.current = id;

      setDragGhost({
        id,
        src: baseSticker.src,
        scale: effectiveScale,
        baseSize,
        x: e.clientX - pixelSize / 2,
        y: e.clientY - pixelSize / 2,
      });
      return;
    }

    // Fallback: shouldn't really happen
    draggingRef.current = false;
    activeIdRef.current = null;
  };

  // pointer down on the resize handle
  const onResizePointerDown = (id) => (e) => {
    e.preventDefault();
    e.stopPropagation(); // don't trigger normal drag

    const st = stickers.find((s) => s.id === id && s.inVideo && !s.isTemplate);
    if (!st) return;

    resizingRef.current = true;
    activeIdRef.current = id;
    dragGhost && setDragGhost(null); // ensure no ghost while resizing

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scale: st.scale ?? 1,
    };
  };

  const onPointerMove = (e) => {
    // 🔹 Resizing mode
    if (resizingRef.current) {
      e.preventDefault();

      const { x: startX, y: startY, scale: startScale } =
        resizeStartRef.current;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Simple sensitivity: drag diagonally to resize
      const delta = (dx + dy) / 200; // tweak the divisor to taste
      const newScaleRaw = startScale + delta;
      const newScale = clamp(newScaleRaw, 0.4, 3.0); // min/max scale

      const id = activeIdRef.current;
      if (id == null) return;

      setStickers((prev) =>
        prev.map((st) =>
          st.id === id
            ? {
                ...st,
                scale: newScale,
              }
            : st
        )
      );

      return;
    }

    // 🔹 Dragging mode
    if (!draggingRef.current) return;

    setDragGhost((prev) => {
      if (!prev) return prev;
      const scale = prev.scale ?? 1;
      const baseSize = prev.baseSize ?? stickerSize;
      return {
        ...prev,
        x: e.clientX - (baseSize * scale) / 2,
        y: e.clientY - (baseSize * scale) / 2,
      };
    });
  };

  const onPointerUp = (e) => {
    // 🔹 Finish resizing
    if (resizingRef.current) {
      resizingRef.current = false;
      activeIdRef.current = null;
      return;
    }

    // 🔹 Finish dragging
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

      const scale = s.scale ?? 1;
      const baseSize = s.baseSize ?? stickerSize;
      const pixelSize = baseSize * scale;

      // 🔹 Case 1: Clone created from tray (not yet in video)
      if (!s.inVideo && !s.isTemplate) {
        if (!pointerInVideo || !rect) {
          // Dropped outside video → delete clone
          return prev.filter((st) => st.id !== id);
        }

        // Drop inside video → place clone
        const relX = e.clientX - rect.left - pixelSize / 2;
        const relY = e.clientY - rect.top - pixelSize / 2;
        const maxX = rect.width - pixelSize;
        const maxY = rect.height - pixelSize;

        const clampedX = clamp(relX, 0, Math.max(0, maxX));
        const clampedY = clamp(relY, 0, Math.max(0, maxY));

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

        const relX = e.clientX - rect.left - pixelSize / 2;
        const relY = e.clientY - rect.top - pixelSize / 2;
        const maxX = rect.width - pixelSize;
        const maxY = rect.height - pixelSize;

        const clampedX = clamp(relX, 0, Math.max(0, maxX));
        const clampedY = clamp(relY, 0, Math.max(0, maxY));

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
    onResizePointerDown,
    onPointerMove,
    onPointerUp,
    isDragging,
    draggingSticker,
    dragGhost,
  };
}
