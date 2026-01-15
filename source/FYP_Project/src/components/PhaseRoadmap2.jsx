import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Folder from './Folder';

// PixelIcon 组件
const PixelIcon = ({ type }) => {
  const paths = {
    cex: ["M1 11h10v1h-10z", "M2 10h8v1h-8z", "M3 6h1v4h-1z", "M5 6h1v4h-1z", "M8 6h1v4h-1z", "M1 6h10v-1h-10z", "M2 5h8v-1h-8z", "M3 4h6v-1h-6z", "M4 3h4v-1h-4z"],
    deposit: ["M4 2h4v2h-4z", "M2 4h8v7h-8z", "M5 6h2v3h-2z"],
    dex: ["M2 2h2v2h-2z", "M8 2h2v2h-2z", "M5 5h2v2h-2z", "M2 8h2v2h-2z", "M8 8h2v2h-2z", "M4 3h1v1h-1z", "M7 3h1v1h-1z", "M4 8h1v1h-1z", "M7 8h1v1h-1z"],
    player: ["M2 2h2v2h-2z", "M8 2h2v2h-2z", "M2 4h8v4h-8z", "M4 8h4v2h-4z", "M3 5h2v2h-2z", "M7 5h2v2h-2z"],
    deconstruct: ["M2 2h8v8h-8z", "M3 3h6v1h-6z", "M3 5h4v1h-4z", "M3 7h5v1h-5z", "M9 3h1v1h-1z", "M9 5h1v1h-1z", "M9 7h1v1h-1z"],
    judge: ["M6 2h1v1h-1z", "M5 3h3v1h-3z", "M4 4h5v1h-5z", "M3 5h7v1h-7z", "M4 6h5v1h-5z", "M5 7h3v1h-3z", "M6 8h1v1h-1z", "M2 9h8v1h-8z"],
    danger: ["M6 1h1v1h-1z", "M5 2h3v1h-3z", "M4 3h5v1h-5z", "M3 4h7v1h-7z", "M4 5h5v1h-5z", "M5 6h3v1h-3z", "M6 7h1v1h-1z", "M5 8h3v1h-3z", "M4 9h5v1h-5z", "M3 10h7v1h-7z"]
  };
  const currentPath = paths[type] || paths.cex;
  return (
    <svg width="40" height="40" viewBox="0 0 12 12" fill="currentColor" style={{ imageRendering: 'pixelated' }}>
      {currentPath.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
};

const PhaseRoadmap2 = ({ language, setLanguage, onSelectChallenge, onClose, onOpenBackpack }) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [isStartingChallenge, setIsStartingChallenge] = useState(false);
  const [currentPos, setCurrentPos] = useState(null); // 当前玩家位置

  const challenges = [
    { 
      id: 'deconstruct-auth', 
      iconType: 'deconstruct',
      title: { chinese: '拆解授權內容', english: 'Deconstruct Authorization Content' },
      route: '/challenge/phase2/malicious-auth'
    },
    { 
      id: 'judge-auth', 
      iconType: 'judge',
      title: { chinese: '判斷授權內容', english: 'Judge Authorization Content' },
      route: '/challenge/phase2/judge-auth'
    },
    { 
      id: 'danger-auth', 
      iconType: 'danger',
      title: { chinese: '混合詐騙實戰', english: 'Hybrid Scam Drill' },
      route: '/challenge/phase2/phase2-danger-auth'
    }
  ];

  const getIconColorClass = (type) => {
    switch(type) {
      case 'cex': return 'text-purple-300';
      case 'deposit': return 'text-emerald-300';
      case 'dex': return 'text-pink-300';
      case 'deconstruct': return 'text-blue-300';
      case 'judge': return 'text-yellow-300';
      case 'danger': return 'text-red-300';
      default: return 'text-white';
    }
  };

  const handleStart = async () => {
    if (!selectedChallengeId) return;
    const challenge = challenges.find(c => c.id === selectedChallengeId);
    if (challenge && onSelectChallenge) {
      setIsStartingChallenge(true);
      await onSelectChallenge(challenge);
      setIsStartingChallenge(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[40] flex flex-col items-center justify-center w-full bg-[#1a1b26] p-4 font-mono select-none" style={{ minHeight: '100vh' }}>
      {/* ★ 降低 z-index 到 z-[40]，確保背包界面 (z-50) 可以覆蓋它 */}
      {/* 语言切换 - 左上角 */}
      <div className="absolute top-4 left-4 z-[60]">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage && setLanguage('chinese')}
            className="pixel-button"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: language === 'chinese' ? '#22d3ee' : 'transparent',
              color: language === 'chinese' ? '#ffffff' : '#9ca3af',
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
            }}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage && setLanguage('english')}
            className="pixel-button"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: language === 'english' ? '#22d3ee' : 'transparent',
              color: language === 'english' ? '#ffffff' : '#9ca3af',
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
            }}
          >
            English
          </button>
        </div>
      </div>

      {/* 返回按钮 - 右上角 */}
      <div className="absolute top-4 right-4 z-[60]">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose && onClose();
          }}
          className="pixel-button"
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
            backgroundColor: '#374151',
            color: '#ffffff',
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
          }}
        >
          {language === 'chinese' ? '返回遊戲' : 'Back to Game'}
        </button>
      </div>

      {/* 背包按鈕 - 右下角 */}
      <div className="absolute bottom-4 right-4 z-[60]">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onOpenBackpack) {
              onOpenBackpack();
            }
          }}
          style={{
            fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#ffffff',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#22d3ee';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Folder size={2} color="#22d3ee" />
          <span>{language === 'chinese' ? '背包' : 'Backpack'}</span>
        </div>
      </div>

      <div className="relative w-full max-w-6xl bg-[#2d3748] p-8 md:p-12 rounded-lg mt-8" style={{
        boxShadow: `-4px 0 0 0 black, 4px 0 0 0 black, 0 -4px 0 0 black, 0 4px 0 0 black, -8px 0 0 0 white, 8px 0 0 0 white, 0 -8px 0 0 white, 0 8px 0 0 white`
      }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 px-6 py-2 border-4 border-black z-20 shadow-[4px_4px_0px_#000]">
          <h2 className="text-xl md:text-3xl font-bold text-white tracking-[0.1em]" style={{ textShadow: "2px 2px 0px #000" }}>
            {language === 'chinese' ? 'WEB3授權內容挑戰' : 'WEB3 Authorization Challenges'}
          </h2>
        </div>

        <div 
          className="relative w-full h-[450px] bg-[#7f1d1d] overflow-hidden border-4 border-black shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"
          style={{
            backgroundImage: `radial-gradient(#991b1b 20%, transparent 20%), radial-gradient(#b91c1c 20%, transparent 20%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        >
          {/* 路徑虛線 - 紅色 */}
          <div className="absolute top-1/2 left-16 right-16 h-2 -translate-y-1/2 flex justify-between z-0 pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-[#fca5a5] opacity-30 mx-0.5"></div>
            ))}
          </div>

          <div className="relative z-10 w-full h-full flex items-center justify-between px-8 md:px-12">
            {challenges.map((challenge, index) => {
              const isSelected = selectedChallengeId === challenge.id;
              const isCurrentPos = currentPos === challenge.id || (currentPos === null && index === 0);
              const iconColorClass = getIconColorClass(challenge.iconType);

              return (
                <div key={challenge.id} className="relative flex flex-col items-center w-28">
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
                    onClick={() => setSelectedChallengeId(challenge.id)}
                    whileTap={{ scale: 0.9 }}
                    className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-4 transition-all z-20
                      ${isSelected ? 'border-yellow-400 bg-blue-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'border-black bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <div className={`${iconColorClass} drop-shadow-[2px_2px_0px_black]`}>
                      <PixelIcon type={challenge.iconType} />
                    </div>
                  </motion.button>

                  <div className="mt-4 px-2 py-1 text-center text-base md:text-lg font-bold bg-black/60 rounded text-gray-100 border-2 border-transparent" style={{ fontSize: '16px' }}>
                    {challenge.title[language]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 h-16 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {selectedChallengeId ? (
              <motion.button
                key="confirm-btn"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                onClick={handleStart}
                disabled={isStartingChallenge}
                className="bg-yellow-400 text-black border-4 border-black px-12 py-3 font-black text-lg tracking-widest hover:bg-yellow-300 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
              >
                {isStartingChallenge ? 'LOADING...' : (language === 'chinese' ? '開始冒險' : 'START MISSION')}
              </motion.button>
            ) : (
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

export default PhaseRoadmap2;

