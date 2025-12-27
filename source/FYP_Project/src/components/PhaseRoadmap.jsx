import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. 內部子組件：像素圖標 (SVG Pixel Art)
// ==========================================
const PixelIcon = ({ type, color = "currentColor" }) => {
  const paths = {
    // 🔍 下載 (放大鏡)
    search: ["M4 4h4v1h-4z", "M3 5h1v4h-1z", "M8 5h1v4h-1z", "M4 9h4v1h-4z", "M9 9h1v1h-1z", "M10 10h1v1h-1z", "M11 11h1v1h-1z"],
    // 🔐 創建 (鎖/鑰匙)
    create: ["M4 2h4v3h-1v-2h-2v2h-1z", "M2 5h8v7h-8z", "M5 8h2v2h-2z"],
    // 💰 入金 (錢袋)
    deposit: ["M4 2h4v2h-4z", "M2 4h8v7h-8z", "M5 6h2v3h-2z"],
    // 💸 轉賬 (雙向箭頭)
    transfer: ["M1 5h3v1h-3z", "M2 4h1v1h-1z", "M2 6h1v1h-1z", "M5 5h2v1h-2z", "M8 5h3v1h-3z", "M9 4h1v1h-1z", "M9 6h1v1h-1z", "M1 7h3v1h-3z", "M2 8h1v1h-1z", "M2 10h1v1h-1z", "M5 9h2v1h-2z", "M8 9h3v1h-3z", "M9 8h1v1h-1z", "M9 10h1v1h-1z"],
    // 🏦 CEX (銀行建築)
    cex: ["M1 11h10v1h-10z", "M2 10h8v1h-8z", "M3 6h1v4h-1z", "M5 6h1v4h-1z", "M8 6h1v4h-1z", "M1 6h10v-1h-10z", "M2 5h8v-1h-8z", "M3 4h6v-1h-6z", "M4 3h4v-1h-4z"],
    // 🌐 DEX (去中心化網絡)
    dex: ["M2 2h2v2h-2z", "M8 2h2v2h-2z", "M5 5h2v2h-2z", "M2 8h2v2h-2z", "M8 8h2v2h-2z", "M4 3h1v1h-1z", "M7 3h1v1h-1z", "M4 8h1v1h-1z", "M7 8h1v1h-1z"],
    // 🦊 玩家 (小狐狸)
    player: ["M2 2h2v2h-2z", "M8 2h2v2h-2z", "M2 4h8v4h-8z", "M4 8h4v2h-4z", "M3 5h2v2h-2z", "M7 5h2v2h-2z"]
  };
  const currentPath = paths[type] || paths.search;
  return (
    <svg width="40" height="40" viewBox="0 0 12 12" fill={color} style={{ imageRendering: 'pixelated' }}>
      {currentPath.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
};

const PhaseRoadmap = ({ steps, onStartLevel, language }) => {
  // 若父層 steps 未包含 cex / dex，補上預設的 locked 節點，
  // 確保畫面始終顯示「中心化平台判別」與「去中心化平台判別」按鈕（沿用現有美術風格）
  const extraDefaults = [
    { id: 'cex', iconType: 'cex', status: 'locked', title: { chinese: '中心化平台判別', english: 'CEX Check' } },
    { id: 'dex', iconType: 'dex', status: 'locked', title: { chinese: '去中心化平台判別', english: 'DEX Check' } }
  ];
  const displaySteps = Array.isArray(steps) ? [...steps] : [];
  extraDefaults.forEach(d => {
    if (!displaySteps.find(s => s.id === d.id)) displaySteps.push(d);
  });

  const [selectedId, setSelectedId] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const nesContainerStyle = {
    boxShadow: `-4px 0 0 0 black, 4px 0 0 0 black, 0 -4px 0 0 black, 0 4px 0 0 black, -8px 0 0 0 white, 8px 0 0 0 white, 0 -8px 0 0 white, 0 8px 0 0 white`
  };

  const handleNodeClick = (step) => {
    if (step.status === 'locked') return;
    setSelectedId(step.id);
  };

  const handleStart = async () => {
    if (!selectedId || !onStartLevel) return;
    try {
      setIsStarting(true);
      await onStartLevel(selectedId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const getIconColorClass = (status, type) => {
    if (status === 'locked') return 'text-gray-500';
    switch(type) {
      case 'search': return 'text-cyan-300';
      case 'create': return 'text-yellow-300';
      case 'deposit': return 'text-emerald-300';
      case 'transfer': return 'text-blue-300';
      case 'cex': return 'text-purple-300';
      case 'dex': return 'text-pink-300';
      default: return 'text-white';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-[#1a1b26] p-4 font-mono select-none" style={{ minHeight: '100vh' }}>
      <div className="relative w-full max-w-6xl bg-[#2d3748] p-8 md:p-12 rounded-lg mt-8" style={nesContainerStyle}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 px-6 py-2 border-4 border-black z-20 shadow-[4px_4px_0px_#000]">
          <h2 className="text-xl md:text-3xl font-bold text-white tracking-[0.1em]" style={{ textShadow: "2px 2px 0px #000" }}>
            {language === 'chinese' ? 'Web3 新手之路' : 'WEB3 Rookie Roadmap'}
          </h2>
        </div>

        <div 
          className="relative w-full h-[450px] bg-[#14532d] overflow-hidden border-4 border-black shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"
          style={{
            backgroundImage: `radial-gradient(#166534 20%, transparent 20%), radial-gradient(#15803d 20%, transparent 20%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        >
          {/* 路徑虛線 */}
          <div className="absolute top-1/2 left-16 right-16 h-2 -translate-y-1/2 flex justify-between z-0 pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-[#86efac] opacity-30 mx-0.5"></div>
            ))}
          </div>

          <div className="relative z-10 w-full h-full flex items-center justify-between px-8 md:px-12">
            {displaySteps.map((step) => {
              const isLocked = step.status === 'locked';
              const isSelected = selectedId === step.id; 
              const isCurrentPos = step.status === 'current';
              const iconColorClass = getIconColorClass(step.status, step.iconType);

              return (
                <div key={step.id} className="relative flex flex-col items-center w-28">
                  {/* 玩家狐狸 (X軸與按鈕對齊，Y軸上方) */}
                  {isCurrentPos && (
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="absolute -top-14 left-1/2 -translate-x-1/2 z-30"
                    >
                      <div className="text-orange-500 scale-125"><PixelIcon type="player" /></div>
                    </motion.div>
                  )}

                  {/* 選擇箭頭 (X軸對齊，位在狐狸上方) */}
                  {isSelected && (
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      className="absolute -top-28 left-1/2 -translate-x-1/2 z-40 text-yellow-300 text-2xl font-black"
                    >
                      ▼
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => handleNodeClick(step)}
                    whileTap={{ scale: 0.9 }}
                    className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-4 transition-all z-20
                      ${isSelected ? 'border-yellow-400 bg-blue-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : isLocked ? 'border-gray-600 bg-gray-800 opacity-60' : 'border-black bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <div className={`${iconColorClass} drop-shadow-[2px_2px_0px_black]`}><PixelIcon type={step.iconType} /></div>
                  </motion.button>

                  <div className="mt-4 px-2 py-1 text-center text-[10px] md:text-xs font-bold bg-black/60 rounded text-gray-100 border-2 border-transparent">
                    {step.title[language]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 h-16 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {selectedId ? (
              <motion.button
                key="confirm-btn"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onClick={handleStart} disabled={isStarting}
                className="bg-yellow-400 text-black border-4 border-black px-12 py-3 font-black text-lg tracking-widest hover:bg-yellow-300 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
              >
                {isStarting ? 'LOADING...' : (language === 'chinese' ? '開始冒險' : 'START MISSION')}
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 font-bold tracking-widest animate-pulse">
                {language === 'chinese' ? '請先選擇一個區域...' : 'PLEASE SELECT A ZONE...'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PhaseRoadmap;