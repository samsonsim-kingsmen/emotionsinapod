import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import NavBar from "../components/navbar";
import useStickerDnD from "../hooks/useStickerDnD";
import useRecordUploadQR from "../hooks/useRecordUploadQR";

import Sticker1 from "/stickers/sticker1.png";
import Sticker2 from "/stickers/sticker2.png";
import Sticker3 from "/stickers/sticker3.png";
import Sticker4 from "/stickers/sticker4.png";
import Sticker5 from "/stickers/sticker5.png";
import Sticker6 from "/stickers/sticker6.png";
import Sticker7 from "/stickers/sticker7.png";
import Sticker8 from "/stickers/sticker8.png";
import Sticker9 from "/stickers/sticker9.png";
import Background from "/UI/Background.jpg";

const DIV_BORDER_RADIUS = "50px";
const STICKER_SIZE = 120;
const FPS = 30;
const DURATION_MS = 2000;

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
  const navigate = useNavigate();
  const photos = (state && state.photos) || [];

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const userVideoDivRef = useRef(null);

  // Drag & Drop
  const {
    stickers,
    videoRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    isDragging,
    draggingSticker,
    dragGhost,
  } = useStickerDnD({
    sources: SOURCES,
    trayLayout: TRAY_LAYOUT,
    stickerSize: STICKER_SIZE,
  });

  const indexRef = useRef(index);
  const stickersRef = useRef(stickers);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    stickersRef.current = stickers;
  }, [stickers]);

  // Slideshow
  useEffect(() => {
    if (!photos.length) return;
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 300);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [photos]);

  // Record → upload → QR navigation hook
  const { isRecording, isWorking, recordUploadAndGo } = useRecordUploadQR({
    hostRef: userVideoDivRef,
    photos,
    getCurrentIndex: () => indexRef.current,
    getInVideoStickers: () =>
      (stickersRef.current || []).filter((s) => s.inVideo),
    stickerSize: STICKER_SIZE,
    navigate,
    fps: FPS,
    durationMs: DURATION_MS,
    borderRadiusPx: 50,
  });

  return (
    <main
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <NavBar />

      {/* Header text – same style as CaptureScreen header */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          zIndex: 1000,
          fontSize: "3rem",
          fontWeight: "700",
        }}
      >
        Good job! Let's add some stickers!
      </div>

      {/* Drag ghost that follows the cursor across the whole screen */}
      {dragGhost && (
        <img
          key={`ghost-${dragGhost.id}`}
          src={dragGhost.src}
          alt="Dragging sticker"
          draggable={false}
          style={{
            position: "fixed", // screen-space
            left: `${dragGhost.x}px`,
            top: `${dragGhost.y}px`,
            width: `${STICKER_SIZE}px`,
            height: `${STICKER_SIZE}px`,
            objectFit: "contain",
            pointerEvents: "none", // don't block pointer events
            zIndex: 9999,
          }}
        />
      )}

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
            if (typeof videoRef === "function") {
              videoRef(el);
            } else if (videoRef && "current" in videoRef) {
              videoRef.current = el;
            }
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
                  transform: "scaleX(-1)",
                }}
              />
              {stickers
                .filter(
                  (s) =>
                    s.inVideo &&
                    (!dragGhost || s.id !== dragGhost.id) // hide the one being dragged
                )
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
              backgroundColor: "#ffffffff",
              borderRadius: DIV_BORDER_RADIUS,
              position: "relative",
              border: "10px #F0CBDC solid",
            }}
          >
            {stickers
              .filter((s) => !s.inVideo && s.isTemplate) // only tray originals
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
              onClick={recordUploadAndGo}
              disabled={isRecording || isWorking}
              style={{
                flex: 1,
                height: "80%",
                borderRadius: "30px",
                border: "none",
                fontWeight: 700,
                background: "#F9C015",
                boxShadow: "0 12px 0 #F0A901",
                opacity: isRecording || isWorking ? 0.6 : 1,
                cursor: isRecording || isWorking ? "not-allowed" : "pointer",
              }}
            >
              {isRecording
                ? "Rendering..."
                : isWorking
                ? "Generating QR..."
                : "DONE!"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default StickersScreen;
