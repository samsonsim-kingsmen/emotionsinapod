// src/pages/SlidesScreen.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import Slide1 from "/UI/Slide1.jpg";
import Slide2 from "/UI/Slide2.jpg";
import Slide3 from "/UI/Slide3.jpg";
import Slide4 from "/UI/Slide4.jpg";

import NavBar from "../components/navbar";
import YellowButton from "../components/YellowButton";
import useClearStickerState from "../hooks/useClearStickerState";

const content = [
  "Remember a time that made you smile or laugh at something funny!",
  "The feeling when you are with the people you love. That’s the feeling of happiness!",
  "Happiness in bonds we never forget!",
  "Happiness is when your heart feels light, safe, and full of joy! The little things that make you smile.",
];

const positions = [
  { left: "78%", bottom: "8%" },
  { left: "20%", bottom: "8%" },
  { left: "20%", bottom: "8%" },
  { left: "20%", bottom: "8%" },
];

const backgrounds = [Slide1, Slide2, Slide3, Slide4];

export default function SlidesScreen() {
  useClearStickerState(); // 🔹 clear stickers on slides too

  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (index === backgrounds.length - 1) {
      navigate("/tnc");
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${backgrounds[index]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </AnimatePresence>

      <NavBar />

      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: positions[index].left,
            bottom: positions[index].bottom,
            transform: "translateX(-50%)",
            backgroundColor: "#E18EB3",
            color: "#fff",
            borderRadius: "12px",
            padding: "2rem 3rem",
            fontSize: "1.5rem",
            fontWeight: "600",
            boxShadow: "0 6px 0 #9D5CB1",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30rem",
          }}
        >
          <span style={{ textAlign: "left" }}>{content[index]}</span>

          <div
            style={{
              position: "absolute",
              bottom: "-1.5rem",
              right: "-1.5rem",
            }}
          >
            <YellowButton
              onClick={handleNext}
              icon={<HiChevronRight size={40} color="white" />}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
