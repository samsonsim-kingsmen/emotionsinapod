import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import QRCode from "qrcode";
import Background from "/UI/Background.jpg";
import YellowButton from "../components/YellowButton";

const DIV_BORDER_RADIUS = "50px";

export default function QrScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const videoUrl = state?.videoUrl || "";

  const [qrReady, setQrReady] = useState(false); // only true after READY click
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // 🔵 Header text state
  const [headerText, setHeaderText] = useState("Looks great!");

  // Generate QR silently in the background
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!videoUrl) return;
      try {
        const dataUrl = await QRCode.toDataURL(videoUrl, {
          margin: 1,
          width: 640,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoUrl]);

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
      <NavBar />

      {/* 🔵 Header text (same style as other screens) */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          zIndex: 1000,
          fontSize: "3rem",
          fontWeight: "700",
        }}
      >
        {headerText}
      </div>

      <section
        style={{
          position: "absolute",
          top: "19%",
          borderRadius: DIV_BORDER_RADIUS,
          height: "70%",
          width: "95%",
          backgroundColor: "#FBEEC7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="innerDiv"
          style={{
            width: "100%",
            height: "90%",
            display: "flex",
            justifyContent: qrReady ? "space-between" : "center",
            alignItems: "center",
            gap: "2%",
            padding: "0 3%",
            boxSizing: "border-box",
          }}
        >
          {/* Left: User Video */}
          <div
            style={{
              width: "70%",
              height: "100%",
              backgroundColor: "#A2D5F2",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.5rem",
              fontFamily: "sans-serif",
              color: "#333",
              transition: "all 0.3s ease",
              borderRadius: DIV_BORDER_RADIUS,
              overflow: "hidden",
            }}
          >
            {videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: DIV_BORDER_RADIUS,
                }}
              />
            ) : (
              "Preparing your video..."
            )}
          </div>

          {/* Right: QR Code — only visible when READY is pressed */}
          {qrReady && (
            <div
              style={{
                width: "30%",
                height: "100%",
                backgroundColor: "#ffffffff",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: DIV_BORDER_RADIUS,
                fontSize: "1.5rem",
                fontFamily: "sans-serif",
                color: "#333",
                transition: "opacity 0.3s ease",
                overflow: "hidden",
                border: "10px #F9C015 solid",
              }}
            >
              {qrDataUrl ? (
                <div
                  style={{
                    width: "50%",
                    aspectRatio: "1/1",
                    padding: "20px",
                    border: "5px #363636 solid",
                    borderRadius: "40px",
                  }}
                >
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                "Generating QR..."
              )}

              <div style={{ width: "80%", textAlign: "center" }}>
                Have your accompanied adult scan this QR code to save this
                memory!
              </div>
            </div>
          )}
        </div>
      </section>
      {/* Bottom buttons — disappear after READY */}
      {!qrReady && (
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 5%",
            boxSizing: "border-box",
          }}
        >
          {/* BACK button — left chevron */}
          <YellowButton
            label="BACK"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 6L8 12L14 18"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            iconPosition="left"
            onClick={() => navigate(-1)}
          />

          {/* READY button — right chevron on the RIGHT side */}
          <YellowButton
            label="READY"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 6L16 12L10 18"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            iconPosition="right"
            onClick={() => {
              setHeaderText("Your happy moment will be on the Happiness wall!");
              setQrReady(true);
            }}
          />
        </div>
      )}
    </main>
  );
}
