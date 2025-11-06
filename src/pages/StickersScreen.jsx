import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import NavBar from "../components/navbar";
import useStickerDnD from "../hooks/useStickerDnD";
import useUserAreaRecorder from "../hooks/useUserAreaRecorder";

import Sticker1 from "/stickers/sticker1.png";
import Sticker2 from "/stickers/sticker2.png";
import Sticker3 from "/stickers/sticker3.png";
import Sticker4 from "/stickers/sticker4.png";
import Sticker5 from "/stickers/sticker5.png";
import Sticker6 from "/stickers/sticker6.png";
import Sticker7 from "/stickers/sticker7.png";
import Sticker8 from "/stickers/sticker8.png";
import Sticker9 from "/stickers/sticker9.png";

const DIV_BORDER_RADIUS = "50px";
const STICKER_SIZE = 120; // px

const TRAY_LAYOUT = [
  { left: 20, top: 40 },
  { left: 140, top: 32 },
  { left: 260, top: 20 },
  { left: 20, top: 180 },
  { left: 140, top: 180 },
  { left: 260, top: 180 },
  { left: 20, top: 350 },
  { left: 140, top: 350 },
  { left: 260, top: 350 },
];

const SOURCES = [
  Sticker1,
  Sticker2,
  Sticker3,
  Sticker4,
  Sticker5,
  Sticker6,
  Sticker7,
  Sticker8,
  Sticker9,
];

function StickersScreen() {
  const { state } = useLocation();  
  const photos = (state && state.photos) || [];

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const userVideoDivRef = useRef(null);

  //Drag and drop logic
  const {
    stickers,
    videoRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    isDragging,
    draggingSticker,
  } = useStickerDnD({
    sources: SOURCES,
    trayLayout: TRAY_LAYOUT,
    stickerSize: STICKER_SIZE,
  });

 
  const indexRef = useRef(index);
  const stickersRef = useRef(stickers);
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { stickersRef.current = stickers; }, [stickers]);

  // Slideshow
  useEffect(() => {
    if (!photos.length) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 300);
    return () => clearInterval(timerRef.current);
  }, [photos]);

  // Recording Logic
  const { record, isRecording } = useUserAreaRecorder({
    hostRef: userVideoDivRef,
    photos,
    sources: SOURCES,
    getCurrentPhotoIndex: () => indexRef.current,
    getInVideoStickers: () => (stickersRef.current || []).filter((s) => s.inVideo),
    stickerSize: STICKER_SIZE,
    borderRadiusPx: 50,
    fps: 30,
    durationMs: 2000,
  });

  //Downloading Logic

  const downloadBlob = (blob, preferredName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const isMp4 = (blob.type || "").includes("mp4");
    const filename = preferredName || `stickers-${Date.now()}.${isMp4 ? "mp4" : "webm"}`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDone = async () => {
    try {
      const clip = await record();
      if (clip) downloadBlob(clip, "user-video-2s");
      // ❌ No navigation away — stays on this page
    } catch (e) {
      console.error(e);
      alert("Recording failed.");
    }
  };

  return (
    <main
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        background: "red",
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <NavBar />
      <section
        style={{
          position: "absolute",
          top: "19%",
          borderRadius: DIV_BORDER_RADIUS,
          height: "70%",
          width: "95%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2%",
          boxSizing: "border-box",
        }}
      >
        {/* Left: user video */}
        <div
          ref={(el) => {
            userVideoDivRef.current = el;
            if (typeof videoRef === "function") videoRef(el);
            else if (videoRef && "current" in videoRef) videoRef.current = el;
          }}
          className="user video"
          style={{
            width: "75%",
            height: "100%",
            backgroundColor: "#A2D5F2",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "1.5rem",
            fontFamily: "sans-serif",
            color: "#333",
            borderRadius: DIV_BORDER_RADIUS,
            position: "relative",
            zIndex: draggingSticker?.inVideo && isDragging ? 10 : 1,     
          }}
        >
          {!photos.length ? (
            "No photos found. Go back and capture first."
          ) : (
            <>
              <img
                src={photos[index]}
                alt={`frame ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: DIV_BORDER_RADIUS,
                  transition: "opacity 0.2s ease-in-out",
                  pointerEvents: "none",
                }}
              />
              {stickers
                .filter((s) => s.inVideo)
                .map((s) => (
                  <img
                    key={`video-${s.id}`}
                    src={s.src}
                    alt={`Sticker ${s.id + 1}`}
                    draggable={false}
                    onPointerDown={onPointerDown(s.id)}
                    style={{
                      position: "absolute",
                      left: `${s.videoPos.x}px`,
                      top: `${s.videoPos.y}px`,
                      width: `${STICKER_SIZE}px`,
                      height: `${STICKER_SIZE}px`,
                      objectFit: "contain",
                      borderRadius: "12px",
                      cursor: "grab",
                      userSelect: "none",
                      touchAction: "none",
                      zIndex: 11,
                    }}
                  />
                ))}
            </>
          )}
        </div>

        {/* Right: sticker tray + Done */}
        <div
          style={{
            width: "25%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2%",
            fontSize: "1.5rem",
            fontFamily: "sans-serif",
            color: "#333",
            borderRadius: DIV_BORDER_RADIUS,
            boxSizing: "border-box",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className="stickers"
            style={{
              width: "100%",
              height: "80%",
              backgroundColor: "#F8E9A1",
              borderRadius: DIV_BORDER_RADIUS,
              position: "relative",
            }}
          >
            {stickers
              .filter((s) => !s.inVideo)
              .map((s) => (
                <img
                  key={`tray-${s.id}`}
                  src={s.src}
                  alt={`Sticker ${s.id + 1}`}
                  draggable={false}
                  onPointerDown={onPointerDown(s.id)}
                  style={{
                    position: "absolute",
                    left: `${s.trayHome.left}px`,
                    top: `${s.trayHome.top}px`,
                    transform: `translate(${s.trayOffset.x}px, ${s.trayOffset.y}px)`,
                    width: `${STICKER_SIZE}px`,
                    height: `${STICKER_SIZE}px`,
                    objectFit: "contain",
                    borderRadius: "12px",
                    cursor: "grab",
                    userSelect: "none",
                    touchAction: "none",
                  }}
                />
              ))}
          </div>

          <div
            style={{
              width: "100%",
              height: "20%",           
              borderRadius: DIV_BORDER_RADIUS,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              padding: "0 12px",
            }}
          >
            <button
              onClick={handleDone}
              disabled={isRecording}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: DIV_BORDER_RADIUS,
                border: "none",
                cursor: isRecording ? "wait" : "pointer",
                fontWeight: 700,
                opacity: isRecording ? 0.6 : 1,
              }}
            >
              {isRecording ? "Recording…" : "Done!"}
            </button>
           
          </div>
        </div>
      </section>
    </main>
  );
}

export default StickersScreen;
