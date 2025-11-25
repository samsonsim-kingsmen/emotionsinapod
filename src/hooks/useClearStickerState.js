// src/hooks/useClearStickerState.js
import { useEffect } from "react";
import { STICKERS_STORAGE_KEY } from "../constants/stickersStorage";

export default function useClearStickerState() {
  useEffect(() => {
    try {
      sessionStorage.removeItem(STICKERS_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear sticker state", err);
    }
  }, []);
}
