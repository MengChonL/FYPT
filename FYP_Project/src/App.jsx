import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import GamePage from "./pages/GamePage";
import ChallengePage from "./pages/ChallengePage";
import CentralizedPlatform from './components/challenges/CentralizedPlatform';

// 樣式導入
import "./main.tailwind.css";
import "./index.css";
import "./styles/global.css";
import "./styles/pixel-font.css"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 遊戲入口：同意書頁面 */}
        <Route path="/" element={<IndexPage />} />
        
        {/* 2. 遊戲大廳：選擇 Phase 1 或 Phase 2 */}
        <Route path="/game" element={<GamePage />} />
        
        {/* 3. 統一挑戰路由：對應你的重構計劃 /challenge/:phase/:id */}
        {/* 這裡的 phase 對應 onboarding 或 interaction */}
        <Route path="/challenge/:phase/:id" element={<ChallengePage />} />

        {/* 4. 自動補救：如果路徑不對，退回首頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/challenges/centralized-platform" element={<CentralizedPlatform />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;