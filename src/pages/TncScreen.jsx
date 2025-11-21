import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../components/navbar";
import Background from "/UI/TncBackground.jpg";
import YellowButton from "../components/YellowButton";

function TncScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openModalKeyHandler = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsModalOpen(true);
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
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "3%",
          textAlign: "center",
          padding: "0 16px",
          color: "white",
          fontWeight: 700,
        }}
      >
        By clicking, you agree to our{" "}
        <span
          role="button"
          tabIndex={0}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={openModalKeyHandler}
          style={{
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Terms and Conditions
        </span>{" "}
        and are ready to dive into the experience!
      </div>

      <NavBar />

      {/* 🔥 UPDATED — "Let's Go" button now uses bottom:% */}
      <div
        style={{
          position: "absolute",
          bottom: "9%", // ← was top: "78%"
        }}
      >
        <YellowButton label={"Let's Go"} onClick={() => navigate("/capture")} />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setIsModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              zIndex: 9999,
            }}
          >
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "80%",
                margin: "20vh auto 0",
                background: "#FBEEC7",
                borderRadius: "24px",
                padding: "24px",
                color: "#000",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "60vh",
              }}
            >
              <style>
                {`
                  ::-webkit-scrollbar {
                    width: 8px;
                  }
                  ::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  ::-webkit-scrollbar-thumb {
                    background: rgba(252, 185, 0, 1);
                    border-radius: 8px;
                  }
                  ::-webkit-scrollbar-thumb:hover {
                    background: rgba(252, 185, 0, 1);
                  }
                `}
              </style>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  flexShrink: 0,
                }}
              >
                <h2 style={{ margin: 0 }}>Terms & Conditions</h2>
              </div>

              <div
                style={{
                  lineHeight: 1.6,
                  opacity: 0.9,
                  overflowY: "auto",
                  paddingRight: "12px",
                  flexGrow: 1,
                }}
              >
                <p>
                  <strong>Introduction</strong>
                  <br />
                  Welcome to our service. These terms and conditions outline the
                  rules and regulations for the use of our website and services.
                  <br />
                  <br />
                  <strong>Acceptance of Terms</strong>
                  <br />
                  By accessing or using our services, you agree to comply with
                  these terms. If you do not agree, please do not use our
                  services.
                  <br />
                  <br />
                  <strong>Use of Service</strong>
                  <br />
                  You must be at least 18 years old to use our services.
                  <br />
                  You agree to use our services only for lawful purposes and in
                  accordance with applicable laws.
                  <br />
                  <br />
                  <strong>User Responsibilities</strong>
                  <br />
                  You are responsible for maintaining the confidentiality of
                  your account information and for all activities that occur
                  under your account.
                  <br />
                  <br />
                  <strong>Limitation of Liability</strong>
                  <br />
                  In no event shall we be liable for any direct, indirect,
                  incidental, or consequential damages arising from your use of
                  our services.
                  <br />
                  <br />
                  <strong>Changes to Terms</strong>
                  <br />
                  We reserve the right to modify these terms at any time.
                  Changes will be effective immediately upon posting on our
                  website.
                  <br />
                  <br />
                  <strong>Governing Law</strong>
                  <br />
                  These terms shall be governed by and construed in accordance
                  with the laws of [Jurisdiction].
                  <br />
                  <br />
                  <strong>Contact Information</strong>
                  <br />
                  If you have any questions about these terms, please contact us
                  at [Email Address].
                </p>
              </div>

              {/* Confirm button overshooting bottom - already using % */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-6%",
                  left: "85%",
                  transform: "translateX(-50%)",
                }}
              >
                <YellowButton
                  label={"CONFIRM"}
                  onClick={() => setIsModalOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default TncScreen;
