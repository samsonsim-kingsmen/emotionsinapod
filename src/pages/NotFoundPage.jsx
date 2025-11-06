import React from "react";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e1e2f, #2c3e50)",
        color: "white",
        textAlign: "center",
        fontFamily: "'Poppins', sans-serif",
        boxSizing: "border-box",
        padding: "0 20px",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          margin: 0,
          animation: "pulse 2s infinite",
        }}
      >
        404
      </h1>

      <h2 style={{ marginTop: "0.5rem", fontWeight: 400 }}>
        Oops! Page Not Found
      </h2>

      <p style={{ maxWidth: "500px", opacity: 0.8, marginTop: "0.5rem" }}>
        Looks like you took a wrong turn. The page you’re looking for doesn’t
        exist or has been moved elsewhere.
      </p>

      <button
        onClick={handleGoHome}
        style={{
          marginTop: "2rem",
          padding: "12px 28px",
          backgroundColor: "#ff6b6b",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          fontSize: "1rem",
          transition: "transform 0.2s ease, background-color 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#ff4b4b";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#ff6b6b";
          e.target.style.transform = "scale(1)";
        }}
      >
        Go Home
      </button>

      {/* 🔥 Subtle pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.85; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default NotFoundPage;
