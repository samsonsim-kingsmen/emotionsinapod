import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import Background from "/UI/Background.jpg";
import Frame from "/UI/frame.png";
const DIV_BORDER_RADIUS = "50px";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function CaptureScreen() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(null);
  const [statusText, setStatusText] = useState("Ready to capture");
  const [streamReady, setStreamReady] = useState(false);

  // NEW: recording + progress state
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const rafRef = useRef(null);
  const progressStartRef = useRef(0);
  const totalDurationMsRef = useRef(0);

  const TOTAL_PHOTOS = 4;
  const COUNTDOWN_SECS = 3;
  const POST_COUNTDOWN_MS = 150;
  const POST_CAPTURE_MS = 300;

  useEffect(() => {
    let activeStream = null;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamReady(true);
        }
      } catch (e) {
        console.error("Unable to access camera", e);
        setStatusText("Camera access denied or unavailable");
      }
    })();

    return () => {
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const captureStill = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  };

  const startProgress = (totalMs) => {
    totalDurationMsRef.current = totalMs;
    progressStartRef.current = performance.now();
    setProgress(0);

    const tick = () => {
      const now = performance.now();
      const elapsed = now - progressStartRef.current;
      const p = Math.min(1, elapsed / totalDurationMsRef.current);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopProgress = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setProgress(1);
  };

  const handleCaptureSequence = async () => {
    if (!streamReady || isRecording) return;

    const perPhotoMs =
      COUNTDOWN_SECS * 1000 + POST_COUNTOWN_MS + POST_CAPTURE_MS; // typo fix below
  };

  // ---- Fix the small typo I just introduced (sorry!) ----
  // Replace the handleCaptureSequence above with this correct version:
  // (Keeping your pose description + countdown logic exactly as before)

  const handleCaptureSequenceCorrect = async () => {
    if (!streamReady || isRecording) return;

    const perPhotoMs =
      COUNTDOWN_SECS * 1000 + POST_COUNTDOWN_MS + POST_CAPTURE_MS;
    const totalMs = perPhotoMs * TOTAL_PHOTOS;

    setIsRecording(true);
    setStatusText("Get ready...");
    startProgress(totalMs);

    const photos = [];
    const perShotDescription = "Strike a pose!";

    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      setStatusText(`${perShotDescription} (Photo ${i + 1} of ${TOTAL_PHOTOS})`);
      for (let c = COUNTDOWN_SECS; c >= 1; c--) {
        setCountdown(c);
        await delay(1000);
      }
      setCountdown(null);
      await delay(POST_COUNTDOWN_MS);

      const shot = captureStill();
      if (shot) photos.push(shot);

      setStatusText("Captured!");
      await delay(POST_CAPTURE_MS);
    }

    stopProgress();
    setIsRecording(false);
    setStatusText("Done!");
    navigate("/stickers", { state: { photos } });
  };

  // ---- Progress Ring geometry (SVG) ----
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

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
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${Frame})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: "5",
        }}
      ></div>

      <NavBar />
        <div style={{position:"absolute", top:"3%",zIndex:1000, fontSize:"5rem",fontWeight:"700"}}>Tap the button to start</div>
      <section
        className="webcam"
        style={{
          position: "absolute",
          top: "17%",
          borderRadius: DIV_BORDER_RADIUS,
          height: "72%",
          width: "95%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2%",
          background: "purple",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: DIV_BORDER_RADIUS,
            transform: "scaleX(-1)",
            filter: countdown ? "brightness(0.85)" : "none",
            zIndex: "1",
          }}
        />

        {/* HUD (pose description + countdown) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            color: "white",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            pointerEvents: "none",
            zIndex: 10, // ⬅️ ensure above the Frame overlay
          }}
        >
          <div
            style={{
              marginTop: "12px",
              fontSize: "1.25rem",
              fontFamily: "sans-serif",
            }}
          >
            {statusText}
          </div>

          {countdown !== null && (
            <div
              style={{ fontSize: "6rem", fontWeight: 800, marginBottom: "10%" }}
            >
              {countdown}
            </div>
          )}
        </div>
      </section>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Record Button + Progress Ring */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          zIndex: 999,
          width: "5%",
          aspectRatio: "1 / 1",
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>

        <button
          className="record button"
          onClick={handleCaptureSequenceCorrect}
          style={{
            width: "68%",
            aspectRatio: "1/1",
            borderRadius: "100%",
            background: isRecording ? "#FF3B30" : "#FFFFFF",
            position: "relative",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            cursor: streamReady && !isRecording ? "pointer" : "default",
            transition: "background 0.2s ease",
          }}
          disabled={!streamReady || isRecording}
          aria-label="Record"
          title={
            streamReady ? (isRecording ? "Recording..." : "Start capture") : "Camera not ready"
          }
        />
      </div>
    </main>
  );
}

export default CaptureScreen;
