import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingScreen from "./pages/LandingScreen";
import SlidesScreen from "./pages/SlidesScreen";
import CaptureScreen from "./pages/CaptureScreen";
import StickersScreen from "./pages/StickersScreen";
import QrScreen from "./pages/QRScreen";
import NotFoundPage from "./pages/NotFoundPage"; // ✅ new import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/slides" element={<SlidesScreen />} />
        <Route path="/capture" element={<CaptureScreen />} />
        <Route path="/stickers" element={<StickersScreen />} />
        <Route path="/qr" element={<QrScreen />} />        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
