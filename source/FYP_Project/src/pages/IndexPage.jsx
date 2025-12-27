import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CurvedLoop from '../components/CurvedLoop';
import ConsentModal from '../components/ConsentModal';
import SplashCursor from '../components/SplashCursor';

import gameIcon from '../assets/gameicon.png';

// --------------------------------------------------------
// 獨立中央按鈕元件 (Halo 3D 感應效果)
// --------------------------------------------------------
const HaloStartButton = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  // 靜態光暈效果 (移除動態縮放)
  const haloVariants = {
    initial: { 
      scale: 1,
      boxShadow: '0 0 8px rgba(100, 255, 218, 0.4)'
    },
    hover: { 
      scale: 1, // 保持原始大小，不放大
      boxShadow: '0 0 60px #64ffda, 0 0 120px #64ffda' // 懸停時的光暈
    }
  };

  return (
    <motion.button
      onClick={onStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-48 h-48 rounded-full transition-all duration-300 ease-out 
                 bg-gray-900 border-4 border-cyan-400 focus:outline-none overflow-hidden"
      style={{
        aspectRatio: '1/1', // 確保完全圓形
        borderRadius: '50%' // 強制圓形
      }}
      // 外層動畫
      variants={haloVariants}
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      whileTap={{ scale: 0.95 }} // 輕微的點擊效果
    >
      {/* 金屬圓形內層 */}
      <div className="absolute inset-2 rounded-full bg-gray-900/90 flex items-center justify-center p-4 
                      shadow-[inset_0_8px_10px_rgba(255,255,255,0.15),inset_0_-8px_10px_rgba(0,0,0,0.7)]">
        
        {/* 懸停內容: START 文字 (Neon 藍色) */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-full"
                  animate={{ 
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.8
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <span className="text-2xl font-extrabold tracking-widest text-cyan-400 pixel-button"
                        style={{ 
                            textShadow: '0 0 15px #64ffda, 0 0 30px #64ffda, 0 0 45px #64ffda',
                            fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '3px'
                        }}>
                    START
                  </span>
                </motion.div>
        
        {/* 預設內容: 遊戲圖標 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-4"
          animate={{ 
            opacity: isHovered ? 0 : 1,
            scale: isHovered ? 0.8 : 1
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {gameIcon ? (
            <img
              src={gameIcon} 
              alt="遊戲圖標"
              className="w-full h-full object-contain rounded-full"
              style={{ maxWidth: '90%', maxHeight: '90%' }}
            />
          ) : (
            <span className="text-xs font-bold text-red-500">
              資源缺失
            </span>
          )}
        </motion.div>
      </div>
    </motion.button>
  );
};
// --------------------------------------------------------

const IndexPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleEnter = () => {
    setIsModalOpen(true);
  };

  const handleConsent = (consentData) => {
    console.log('用戶同意數據:', consentData);
    // 這裡可以添加額外的處理邏輯
    navigate('/game');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    // 主頁面容器：填滿整個視窗的純黑色背景
    <div 
      className="w-full h-screen text-white overflow-hidden relative font-['Inter'] flex flex-col items-center justify-center"
      style={{ 
        background: '#000000', // 純黑色背景
        minHeight: '100vh',
        width: '100vw'
      }}
    >
      {/* CurvedLoop 組件 - 頂部弧形文字 (無藍色文字) */}
      <div className="absolute top-0 left-0 w-full h-32 z-10">
        <CurvedLoop 
          marqueeText="✦ WELCOME TO THE GAME ✦"
          speed={1}
          curveAmount={200}
          direction="left"
          interactive={false}
          className="text-white opacity-30"
        />
      </div>
      
      {/* --- 啟動按鈕 (調整到上方位置) --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 1 }}
        className="z-20 mb-16"
        style={{ 
          marginTop: '-300px', // 向上調整更多位置
          transform: 'translateY(-300px)' // 額外的 Y 軸調整
        }}
      >
        <HaloStartButton onStart={handleEnter} />
      </motion.div>

      {/* --- 底部資訊 --- */}
      <motion.p
        className="absolute bottom-6 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        ✦ University of Macau ✦ FST ✦ FYP-2025 ✦
      </motion.p>

      {/* 同意模態框 */}
      <ConsentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConsent={handleConsent}
      />

      {/* 背景流體效果 - 只在模態框關閉時顯示 */}
      {!isModalOpen && <SplashCursor />}
    </div>
  );
};

export default IndexPage;
