// src/pages/LandingScreen.jsx
import React from "react";
import LandingBackground from "/UI/LandingBackground.jpg";
import CircleButton from "../components/CircleButton";
import { useNavigate } from "react-router-dom";
import useClearStickerState from "../hooks/useClearStickerState";

function LandingScreen() {
  useClearStickerState(); // 🔹 clear stickers whenever we reach landing

  const buttons = ["Қазақ", "Русский", "English"];
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        position: "relative",
        height: "100vh",
        width: "100vw",
        fontSize: "2rem",
        fontFamily: "sans-serif",
        backgroundImage: `url(${LandingBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top title */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "3%",
        }}
      >
        <p style={{ textAlign: "center", color: "white" }}>
          ЖҮРЕКТЕН ШЫҚҚАН ҚУАНЫШ
          <br />
          ТАНЕЦ РАДОСТИ
          <br />
          Heartful HAPPINESS
          <br />
        </p>
      </div>

      {/* Subtitle */}
      <div style={{ position: "absolute", left: "5%", top: "35%" }}>
        <p style={{ textAlign: "left", color: "white" }}>
          Бақытты зерттеу үшін саяхатыңызды бастаңыз!
          <br />
          Начните свое приключение, чтобы исследовать счастье!
          <br />
          Begin your adventure to explore Happiness!
          <br />
        </p>
      </div>

      {/* Buttons section */}
      <div
        style={{
          position: "absolute",
          left: "5%",
          bottom: "18%",
          display: "flex",
          gap: "1.5rem",
        }}
      >
        {buttons.map((label, index) => (
          <CircleButton
            key={index}
            label={label}
            onClick={() => navigate("/slides")}
          />
        ))}
      </div>
    </div>
  );
}

export default LandingScreen;
