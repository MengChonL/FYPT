import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Folder from './Folder';
import { useGame } from '../context/GameContext';

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

const PhaseRoadmap = ({ language, setLanguage, onSelectChallenge, onClose, onOpenBackpack }) => {
  const { canStartScenario, currentScenarioCode } = useGame();
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [isStartingChallenge, setIsStartingChallenge] = useState(false);

  const challenges = [
    { id: 'download-wallet', iconType: 'search', title: { chinese: '下載錢包', english: 'Download Wallet' }, route: '/challenge/onboarding/phase1-1', scenarioCode: 'phase1-1' },
    { id: 'create-wallet', iconType: 'create', title: { chinese: '創建錢包', english: 'Create Wallet' }, route: '/challenge/onboarding/phase1-2', scenarioCode: 'phase1-2' },
    { id: 'first-deposit', iconType: 'deposit', title: { chinese: '首次入金', english: 'First Deposit' }, route: '/challenge/onboarding/phase1-3', scenarioCode: 'phase1-3' },
    { id: 'wallet-transfer', iconType: 'transfer', title: { chinese: '錢包轉賬', english: 'Wallet Transfer' }, route: '/challenge/onboarding/phase1-4', scenarioCode: 'phase1-4' },
    { id: 'cex-check', iconType: 'cex', title: { chinese: '中心化平台判別', english: 'CEX Check' }, route: '/challenge/onboarding/phase1-5', scenarioCode: 'phase1-5' },
    { id: 'dex-check', iconType: 'dex', title: { chinese: '去中心化平台判別', english: 'DEX Check' }, route: '/challenge/onboarding/phase1-6', scenarioCode: 'phase1-6' },
  ];

  // Fox position: follows user clicks, defaults to current scenario
  const getDefaultFoxId = () => {
    if (currentScenarioCode === 'completed') return null;
    const found = challenges.find(c => c.scenarioCode === currentScenarioCode);
    return found?.id || challenges[0].id;
  };
  const foxPos = selectedChallengeId || getDefaultFoxId();

  const isChallengeUnlocked = (challenge) => canStartScenario(challenge.scenarioCode);

  const getIconColorClass = (type) => {
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

  const handleStart = async () => {
    if (!selectedChallengeId) return;
    const challenge = challenges.find(c => c.id === selectedChallengeId);
    if (challenge && onSelectChallenge && isChallengeUnlocked(challenge)) {
      setIsStartingChallenge(true);
      await onSelectChallenge(challenge);
      setIsStartingChallenge(false);
    }
  };

  const pixelBtnStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    border: '2px solid #000',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '2px 2px 0px #000',
    WebkitFontSmoothing: 'none',
    MozOsxFontSmoothing: 'unset'
  };

  return (
    <div className="fixed inset-0 z-[40] flex flex-col items-center justify-center w-full bg-[#1a1b26] p-4 font-mono select-none" style={{ minHeight: '100vh' }}>
      {/* 語言切換 - 左上角 */}
      <div className="absolute top-4 left-4 z-[60]">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage && setLanguage('chinese')}
            className="pixel-button"
            style={{ ...pixelBtnStyle, backgroundColor: language === 'chinese' ? '#22d3ee' : 'transparent', color: language === 'chinese' ? '#ffffff' : '#9ca3af' }}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage && setLanguage('english')}
            className="pixel-button"
            style={{ ...pixelBtnStyle, backgroundColor: language === 'english' ? '#22d3ee' : 'transparent', color: language === 'english' ? '#ffffff' : '#9ca3af' }}
          >
            English
          </button>
        </div>
      </div>

      {/* 返回按鈕 - 右上角 */}
      <div className="absolute top-4 right-4 z-[60]">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose && onClose(); }}
          className="pixel-button"
          style={{ ...pixelBtnStyle, backgroundColor: '#374151', color: '#ffffff' }}
        >
          {language === 'chinese' ? '返回遊戲' : 'Back to Game'}
        </button>
      </div>

      {/* 背包按鈕 - 右下角 */}
      <div className="absolute bottom-4 right-4 z-[60]">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onOpenBackpack) onOpenBackpack(); }}
          style={{ fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff', fontSize: '14px', transition: 'all 0.3s ease', pointerEvents: 'auto' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#22d3ee'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Folder size={2} color="#22d3ee" />
          <span>{language === 'chinese' ? '背包' : 'Backpack'}</span>
        </div>
      </div>

      <div className="relative w-full max-w-6xl bg-[#2d3748] p-8 md:p-12 rounded-lg mt-8" style={{
        boxShadow: `-4px 0 0 0 black, 4px 0 0 0 black, 0 -4px 0 0 black, 0 4px 0 0 black, -8px 0 0 0 white, 8px 0 0 0 white, 0 -8px 0 0 white, 0 8px 0 0 white`
      }}>
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

          <div className="relative z-10 w-full h-full flex items-center justify-between px-4 md:px-8">
            {challenges.map((challenge) => {
              const isSelected = selectedChallengeId === challenge.id;
              const isFoxHere = foxPos === challenge.id;
              const isUnlocked = isChallengeUnlocked(challenge);
              const iconColorClass = getIconColorClass(challenge.iconType);

              return (
                <div key={challenge.id} className="relative flex flex-col items-center w-20 md:w-24">
                  {/* 玩家狐狸 */}
                  {isFoxHere && isUnlocked && (
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="absolute -top-14 left-1/2 -translate-x-1/2 z-30"
                    >
                      <div className="text-orange-500 scale-125"><PixelIcon type="player" /></div>
                    </motion.div>
                  )}

                  {/* 鎖定圖標 */}
                  {!isUnlocked && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}

                  {/* 選擇箭頭 */}
                  {isSelected && isUnlocked && (
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      className="absolute -top-28 left-1/2 -translate-x-1/2 z-40 text-yellow-300 text-2xl font-black"
                    >
                      ▼
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => isUnlocked && setSelectedChallengeId(challenge.id)}
                    whileTap={isUnlocked ? { scale: 0.9 } : {}}
                    className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-4 transition-all z-20
                      ${!isUnlocked ? 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50' :
                        isSelected ? 'border-yellow-400 bg-blue-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'border-black bg-gray-700 hover:bg-gray-600 cursor-pointer'}`}
                  >
                    <div className={`${isUnlocked ? iconColorClass : 'text-gray-500'} drop-shadow-[2px_2px_0px_black]`}>
                      <PixelIcon type={challenge.iconType} />
                    </div>
                  </motion.button>

                  <div className={`mt-4 px-1 py-1 text-center text-sm md:text-base font-bold bg-black/60 rounded border-2 border-transparent ${isUnlocked ? 'text-gray-100' : 'text-gray-500'}`} style={{ fontSize: '13px' }}>
                    {challenge.title[language]}
                    {!isUnlocked && (
                      <div className="text-xs text-gray-500 mt-1">
                        {language === 'chinese' ? '🔒 已鎖定' : '🔒 Locked'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 h-16 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {selectedChallengeId ? (() => {
              const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);
              const isSelectedUnlocked = selectedChallenge ? isChallengeUnlocked(selectedChallenge) : false;

              return (
                <motion.button
                  key="confirm-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={handleStart}
                  disabled={isStartingChallenge || !isSelectedUnlocked}
                  className={`border-4 border-black px-12 py-3 font-black text-lg tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,0.5)]
                    ${isSelectedUnlocked
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                >
                  {isStartingChallenge ? 'LOADING...' :
                   !isSelectedUnlocked ? (language === 'chinese' ? '🔒 已鎖定' : '🔒 LOCKED') :
                   (language === 'chinese' ? '開始冒險' : 'START MISSION')}
                </motion.button>
              );
            })() : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 font-bold tracking-widest animate-pulse"
              >
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