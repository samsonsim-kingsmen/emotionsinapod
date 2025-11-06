import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";

const DIV_BORDER_RADIUS = "50px";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function CaptureScreen() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(null);
  const [statusText, setStatusText] = useState("Ready to capture");
  const [streamReady, setStreamReady] = useState(false);

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

  const handleCaptureSequence = async () => {
    if (!streamReady) return;
    const photos = [];
    const perShotDescription = "Strike a pose!";

    for (let i = 0; i < 4; i++) {
      setStatusText(`${perShotDescription} (Photo ${i + 1} of 4)`);
      for (let c = 3; c >= 1; c--) {
        setCountdown(c);
        await delay(1000);
      }
      setCountdown(null);
      await delay(150);

      const shot = captureStill();
      if (shot) photos.push(shot);

      setStatusText("Captured!");
      await delay(300);
    }

    navigate("/stickers", { state: { photos } });
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
    >
      <NavBar />
      <section
        className="webcam"
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
          }}
        />

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

      <button
        onClick={handleCaptureSequence}
        style={{
          width: "5%",
          aspectRatio: "1/1",
          borderRadius: "100%",
          background: "yellow",
          position: "absolute",
          bottom: "8%",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
        }}
      ></button>
    </main>
  );
}

export default CaptureScreen;
