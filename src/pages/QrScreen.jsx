import React, { useState } from "react";
import NavBar from "../components/navbar";
 
function QrScreen() {
  // ✅ Global border radius variable
  const DIV_BORDER_RADIUS = "50px";

  // ✅ State to control visibility of QR Code
  const [qrReady, setQrReady] = useState(false);

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
      <NavBar/>
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
            justifyContent: qrReady ? "space-between" : "center", // ✅ center when QR not ready
            alignItems: "center",
            gap: "2%",
            padding: "0 3%",
            boxSizing: "border-box",            
          }}
        >
          {/* Left box - User Video */}
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
            }}
          >
            User Video
          </div>

          {/* Right box - QR Code (only visible when qrReady === true) */}
          {qrReady && (
            <div
              style={{
                width: "30%",
                height: "100%",
                backgroundColor: "#E8A87C",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: DIV_BORDER_RADIUS,
                fontSize: "1.5rem",
                fontFamily: "sans-serif",
                color: "#333",
                transition: "opacity 0.3s ease",
              }}
            >
              QR Code
            </div>
          )}
        </div>
      </section>

      {/* ✅ Temporary button for demo — toggle qrReady */}
      <button
        onClick={() => setQrReady(!qrReady)}
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          backgroundColor: "#fff",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Toggle QR Ready
      </button>
    </main>
  );
}

export default QrScreen;
