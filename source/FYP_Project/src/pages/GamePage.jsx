import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FixedBackground from '../components/FixedBackground';
import Folder from '../components/Folder';
import PhaseRoadmap2 from '../components/PhaseRoadmap2';
// 導入圖片
import challenge1Img from '../assets/Challenge1.png';
import challenge2Img from '../assets/Challenge2.png';
// 道具圖片
import item1 from '../assets/item1.png';
import item2 from '../assets/item2.jpg';
import item3 from '../assets/item3.png';
import item4 from '../assets/item4.png';
import item5 from '../assets/item5.png';
import AuthCN1 from '../assets/AuthCN1.png';
import AuthCN2 from '../assets/AuthCN2.png';
import AuthCN3 from '../assets/AuthCN3.png';
import AuthCN4 from '../assets/AuthCN4.png';
import AuthCN5 from '../assets/AuthCN5.png';
import AuthCN6 from '../assets/AuthCN6.png';
import AuthCN7 from '../assets/AuthCN7.png';
import AuthCN8 from '../assets/AuthCN8.png';
import AuthCN9 from '../assets/AuthCN9.png';
import AuthEN1 from '../assets/AuthEN1.png';
import AuthEN2 from '../assets/AuthEN2.png';
import AuthEN3 from '../assets/AuthEN3.png';
import AuthEN4 from '../assets/AuthEN4.png';
import AuthEN5 from '../assets/AuthEN5.png';
import AuthEN6 from '../assets/AuthEN6.png';
import AuthEN7 from '../assets/AuthEN7.png';
import AuthEN8 from '../assets/AuthEN8.png';
import AuthEN9 from '../assets/AuthEN9.png';
import item6 from '../assets/item6.png';
// Web3錢包知識本圖片
import walletBook1cn from '../assets/whatiswebewallet1cn.png';
import walletBook1en from '../assets/whatiswebwallet1en.png';
import walletBook2cn from '../assets/whatiswebwallet2cn.png';
import walletBook2en from '../assets/whatiswebwallet2en.png';
import walletBook3cn from '../assets/whatwebwallet3.png';
import walletBook3en from '../assets/whatiswebwallet3en.png';
import transferGuide1Cn from '../assets/Transfer1cn.png';
import transferGuide1En from '../assets/Transfer1en.png';
import transferGuide2Cn from '../assets/Transfer2cn.png';
import transferGuide2En from '../assets/Transfer2en.png';
import transferGuide3Cn from '../assets/transfer3cn.png';
import transferGuide3En from '../assets/Transfer3en.png';
// 中心化交易平台指南圖片
import cexGuide1Cn from '../assets/CEXCN1.png';
import cexGuide1En from '../assets/CEXEN1.png';
import cexGuide2Cn from '../assets/CEXCN2.png';
import cexGuide2En from '../assets/CEXEN2.png';
import cexGuide3Cn from '../assets/CEXCN3.png';
import cexGuide3En from '../assets/CEXEN3.png';
import cexGuide4Cn from '../assets/CEXCN4.png';
import cexGuide4En from '../assets/CEXEN4.png';
// 去中心化平台指南圖片
import dexGuide1Cn from '../assets/DEXCN1.png';
import dexGuide1En from '../assets/DEXEN1.png';
import dexGuide2Cn from '../assets/DEXCN2.png';
import dexGuide2En from '../assets/DEXEN2.png';
import dexGuide3Cn from '../assets/DEXCN3.png';
import dexGuide3En from '../assets/DEXEN3.png';

const GamePage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('chinese');
  const [showBackpack, setShowBackpack] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const [showItemViewer, setShowItemViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAuthorizationChallenges, setShowAuthorizationChallenges] = useState(false);

  // 道具數據
  const items = [
    { 
      name: 'WEB3錢包知識本', 
      nameEn: 'WEB3 Wallet Knowledge Book',
      description: '查看WEB3錢包基礎知識', 
      descriptionEn: 'View WEB3 wallet basic knowledge',
      rarity: '普通', 
      rarityEn: 'Common',
      type: '知識道具', 
      typeEn: 'Knowledge Item',
      image: item1,
      usable: true,
      images: {
        chinese: [walletBook1cn, walletBook2cn, walletBook3cn],
        english: [walletBook1en, walletBook2en, walletBook3en]
      }
    },
    { 
      name: 'Web3 轉賬指南', 
      nameEn: 'Web3 Transfer Guide',
      description: '查看安全轉賬流程與注意事項', 
      descriptionEn: 'View safe transfer steps and precautions',
      rarity: '史詩', 
      rarityEn: 'Epic',
      type: '輔助道具', 
      typeEn: 'Support Item',
      image: item2,
      usable: true,
      images: {
        chinese: [transferGuide1Cn, transferGuide2Cn, transferGuide3Cn],
        english: [transferGuide1En, transferGuide2En, transferGuide3En]
      }
    },
    { 
      name: '中心化交易平台指南', 
      nameEn: 'Centralized Exchange Platform Guide',
      description: '這本指南主要介紹正規的中心化平台以及釣魚網站之間的區別,以及提供相關政府平台超連結讓玩家查閱', 
      descriptionEn: 'This guide introduces the differences between legitimate centralized platforms and phishing sites, and provides relevant government platform hyperlinks for players to consult',
      rarity: '史詩', 
      rarityEn: 'Epic',
      type: '知識道具', 
      typeEn: 'Knowledge Item',
      image: item3,
      usable: true,
      images: {
        chinese: [cexGuide1Cn, cexGuide2Cn, cexGuide3Cn, cexGuide4Cn],
        english: [cexGuide1En, cexGuide2En, cexGuide3En, cexGuide4En]
      }
    },
    { 
      name: '去中心化平台指南', 
      nameEn: 'Decentralized Platform Guide',
      description: '這本指南是介紹去中心化平台需要注意的事項', 
      descriptionEn: 'This guide introduces important considerations for decentralized platforms',
      rarity: '史詩', 
      rarityEn: 'Epic',
      type: '知識道具', 
      typeEn: 'Knowledge Item',
      image: item4,
      usable: true,
      images: {
        chinese: [dexGuide1Cn, dexGuide2Cn, dexGuide3Cn],
        english: [dexGuide1En, dexGuide2En, dexGuide3En]
      }
    },
    { 
      name: '授權指南', 
      nameEn: 'Authorization Guide',
      description: '學習如何辨識與管理 Web3 授權，避免惡意無限授權攻擊', 
      descriptionEn: 'Learn how to read and manage Web3 approvals to avoid malicious unlimited approvals',
      rarity: '史詩', 
      rarityEn: 'Epic',
      type: '輔助道具', 
      typeEn: 'Support Item',
      image: item5,
      usable: true,
      images: {
        chinese: [AuthCN1, AuthCN2, AuthCN3, AuthCN4, AuthCN5, AuthCN6, AuthCN7, AuthCN8, AuthCN9],
        english: [AuthEN1, AuthEN2, AuthEN3, AuthEN4, AuthEN5, AuthEN6, AuthEN7, AuthEN8, AuthEN9],
      }
    },
    // 第 6 格改為空位，不再放入道具（顯示為 Empty）
  ];

  // 根據 FYP 報告定義的教學目標 [cite: 15, 23, 28]
  const content = {
    chinese: {
      title: 'WEB3防釣魚遊戲',
      subtitle: '從建立錢包到授權內容釣魚的防禦培訓',
      backpack: '背包系統',
      backpackTitle: '道具背包',
      selectedItem: '選中道具',
      itemDescription: '道具描述',
      rarity: '稀有度',
      type: '類型',
      items: '道具',
      emptySlots: '空格',
      useItem: '使用道具',
      close: '關閉',
      next: '下一頁',
      prev: '上一頁'
    },
    english: {
      title: 'WEB3 Anti-Phishing Game',
      subtitle: 'From Wallet Setup to Authorization Phishing Defense Training',
      backpack: 'Backpack',
      backpackTitle: 'Item Backpack',
      selectedItem: 'Selected Item',
      itemDescription: 'Item Description',
      rarity: 'Rarity',
      type: 'Type',
      items: 'Items',
      emptySlots: 'Empty Slots',
      useItem: 'Use Item',
      close: 'Close',
      next: 'Next',
      prev: 'Prev'
    }
  };
  const t = content[language];

  // 處理使用道具
  const handleUseItem = (itemIndex) => {
    const item = items[itemIndex];
    if (item?.usable && item?.images) {
      setCurrentImageIndex(0);
      setShowItemViewer(true);
      setShowBackpack(false);
    }
  };

  // 處理圖片切換
  const handleNextImage = () => {
    const item = items[selectedItem];
    if (item?.images) {
      const images = item.images[language] || item.images.chinese;
      // 第 3 個道具有 6 頁（4 張圖片 + 1 頁表格 + 1 頁平台網址）
      // 第 5 個道具有 10 頁（9 張圖片 + 1 頁文字說明）
      let maxPages = images.length;
      if (selectedItem === 2) maxPages = 6;
      if (selectedItem === 4) maxPages = 10;
      setCurrentImageIndex((prev) => (prev + 1) % maxPages);
    }
  };

  const handlePrevImage = () => {
    const item = items[selectedItem];
    if (item?.images) {
      const images = item.images[language] || item.images.chinese;
      let maxPages = images.length;
      if (selectedItem === 2) maxPages = 6;
      if (selectedItem === 4) maxPages = 10;
      setCurrentImageIndex((prev) => (prev - 1 + maxPages) % maxPages);
    }
  };
  // 像素字體樣式定義 - 確保高保真模擬感 [cite: 30]
  const pixelFontStyle = {
    fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
    imageRendering: 'pixelated',
  };

  const blueTextStyle = {
    ...pixelFontStyle,
    color: '#22d3ee',
    textShadow: '0 0-10px rgba(34, 211, 238, 0.6)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold'
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col items-center justify-center bg-[#0f172a] text-white pixel-font">
      {/* 動態粒子背景 */}
      <FixedBackground />

      {/* 頂部導航：語言切換與背包 - 當顯示授權挑戰選擇界面時隱藏 */}
      {!showAuthorizationChallenges && (
        <div className="absolute top-0 left-0 w-full flex justify-between items-center p-10 z-[60]">
        <div className="flex gap-8 text-base tracking-widest">
          <span 
            onClick={() => setLanguage('chinese')}
            style={{ 
              ...blueTextStyle, 
              opacity: language === 'chinese' ? 1 : 0.4,
              borderBottom: language === 'chinese' ? '2px solid #22d3ee' : 'none',
              paddingBottom: '4px'
            }}
          >
            中文
          </span>
          <span 
            onClick={() => setLanguage('english')}
            style={{ 
              ...blueTextStyle, 
              opacity: language === 'english' ? 1 : 0.4,
              borderBottom: language === 'english' ? '2px solid #22d3ee' : 'none',
              paddingBottom: '4px'
            }}
          >
            ENGLISH
          </span>
        </div>
        <div 
          onClick={() => setShowBackpack(true)} 
          className="flex items-center gap-2 group"
          style={blueTextStyle}
        >
          <Folder size={1.2} color="#22d3ee" />
          <span className="group-hover:opacity-80 uppercase">{t.backpack}</span>
        </div>
      </div>
      )}

      {/* 主內容區：標題與大關卡選擇 [cite: 34, 42] - 當顯示授權挑戰選擇界面時隱藏 */}
      {!showAuthorizationChallenges && (
      <main className="flex flex-col items-center justify-center z-10 w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter"
              style={{ 
                ...pixelFontStyle,
                color: '#22d3ee', 
                textShadow: '4px 4px 0px #000, 0 0 20px rgba(34, 211, 238, 0.5)',
                textTransform: 'uppercase'
              }}>
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl opacity-80 tracking-[0.3em] font-bold" style={pixelFontStyle}>
            {t.subtitle}
          </p>
        </motion.div>

        {/* 核心圖片按鈕區：消除方塊感並增加呼吸動畫 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-24">
          
          {/* 第一階段：基礎設施 [cite: 22, 23, 200] */}
          <motion.div
            whileHover={{ 
              scale: 1.15, 
              y: -15, 
              filter: "drop-shadow(0 0 25px rgba(34, 211, 238, 0.9)) brightness(1.2)" 
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 0 }}
            animate={{ 
              y: [0, -10, 0], 
              transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="cursor-pointer"
            onClick={() => navigate('/challenge/onboarding/phase1-1', { replace: false })}
          >
            <img 
              src={challenge1Img} 
              alt="Phase 1: Onboarding" 
              className="w-[380px] md:w-[420px] h-auto transition-all duration-300" 
              style={{ imageRendering: 'pixelated' }} 
            />
          </motion.div>

          {/* 第二階段：交互與防禦 */}
          <motion.div
            whileHover={{ 
              scale: 1.15, 
              y: -15, 
              filter: "drop-shadow(0 0 25px rgba(249, 115, 22, 0.9)) brightness(1.2)" 
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 0 }}
            animate={{ 
              y: [0, -10, 0], 
              transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
            }}
            className="cursor-pointer"
            onClick={() => setShowAuthorizationChallenges(true)}
          >
            <img 
              src={challenge2Img} 
              alt="Phase 2: Advanced Defense" 
              className="w-[380px] md:w-[420px] h-auto transition-all duration-300" 
              style={{ imageRendering: 'pixelated' }} 
            />
          </motion.div>
        </div>
      </main>
      )}

      {/* 背包界面 - 居中顯示 */}
      {showBackpack && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowBackpack(false)}
          />
          
          {/* 背包內容 */}
          <div className="relative p-8 text-white" style={{
            width: '800px',
            backgroundColor: '#1f2937',
            border: '4px solid #000000',
            boxShadow: '8px 8px 0px #000000',
            borderRadius: '20px'
          }}>
            {/* 關閉按鈕 */}
            <button
              onClick={() => setShowBackpack(false)}
              className="pixel-button absolute top-2 right-6"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
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
              {t.close}
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-cyan-400 text-center" style={{ 
              fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace', 
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {t.backpackTitle}
            </h3>
            
            {/* 上方區域 - 左側放大物件，右側描述 */}
            <div className="flex gap-6 mb-6">
              {/* 左側 - 放大物件 */}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-cyan-400 mb-3" style={{
                  fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
                  textTransform: 'uppercase'
                }}>
                  {t.selectedItem}
                </h4>
                <div className="w-32 h-32 flex items-center justify-center mx-auto" style={{
                  border: '3px solid #000000',
                  backgroundColor: '#374151',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 0px #000000',
                  overflow: 'hidden'
                }}>
                  <img
                    src={items[selectedItem]?.image}
                    alt={items[selectedItem]?.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
              
              {/* 右側 - 道具描述 */}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-cyan-400 mb-3" style={{
                  fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
                  textTransform: 'uppercase'
                }}>
                  {t.itemDescription}
                </h4>
                <div className="p-4 border-2 border-gray-600 bg-gray-800" style={{
                  border: '2px solid #4b5563',
                  backgroundColor: '#374151',
                  fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
                  borderRadius: '8px'
                }}>
                  <h5 className="text-lg font-bold text-white mb-2">
                    {language === 'chinese' ? items[selectedItem]?.name : items[selectedItem]?.nameEn}
                  </h5>
                  <p className="text-sm text-gray-300 mb-2">
                    {language === 'chinese' ? items[selectedItem]?.description : items[selectedItem]?.descriptionEn}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.rarity}: {language === 'chinese' ? items[selectedItem]?.rarity : items[selectedItem]?.rarityEn}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.type}: {language === 'chinese' ? items[selectedItem]?.type : items[selectedItem]?.typeEn}
                  </p>
                  {/* 使用道具按鈕 */}
                  {items[selectedItem]?.usable && (
                    <button
                      onClick={() => handleUseItem(selectedItem)}
                      className="pixel-button mt-4 w-full"
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
                      {t.useItem}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* 背包格子 - 5x2 網格 */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedItem(index)}
                  className="w-20 h-20 bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-all duration-200 rounded-lg"
                  style={{
                    border: selectedItem === index ? '3px solid #ffffff' : '3px solid #000000',
                    backgroundColor: '#374151',
                    fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
                    fontSize: '24px',
                    color: '#9ca3af',
                    boxShadow: selectedItem === index ? '0 0 10px #ffffff, 4px 4px 0px #000000' : '4px 4px 0px #000000',
                    transform: selectedItem === index ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {index < 5 ? (
                    <img
                      src={items[index]?.image}
                      alt={items[index]?.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span className="text-gray-500">{language === 'chinese' ? '空' : 'Empty'}</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* 背包描述 */}
            <div className="text-lg text-gray-300 text-center" style={{ 
              fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
              lineHeight: '1.4'
            }}>
              <p>{t.items}: 5/10</p>
              <p>{t.emptySlots}: 5</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 道具查看器 - 顯示圖片序列 */}
      {showItemViewer && items[selectedItem]?.images && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-[60]"
        >
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-80"
            onClick={() => setShowItemViewer(false)}
          />
          
          {/* 圖片容器 */}
          <div className="relative z-10 max-w-4xl mx-4 pb-32">
            {/* 關閉按鈕 */}
            <button
              onClick={() => setShowItemViewer(false)}
              className="pixel-button absolute -top-12 right-0"
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
              {t.close}
            </button>

            {/* 圖片顯示或表格 / 文字顯示 */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden border-4 border-black shadow-2xl">
              {/* 第 3 個道具第 5 頁：監管機構表格 */}
              {selectedItem === 2 && currentImageIndex === 4 ? (
                // 顯示監管機構表格
                <div className="p-8 text-white" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400" style={pixelFontStyle}>
                    {language === 'chinese' ? '監管機構查詢網站' : 'Regulatory Authority Query Websites'}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={pixelFontStyle}>
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="border-2 border-gray-600 px-4 py-3 text-left text-cyan-400">
                            {language === 'chinese' ? '國家／地區' : 'Country/Region'}
                          </th>
                          <th className="border-2 border-gray-600 px-4 py-3 text-left text-cyan-400">
                            {language === 'chinese' ? '監管機構' : 'Regulatory Authority'}
                          </th>
                          <th className="border-2 border-gray-600 px-4 py-3 text-left text-cyan-400">
                            {language === 'chinese' ? '官方查詢網站' : 'Official Query Website'}
                          </th>
                          <th className="border-2 border-gray-600 px-4 py-3 text-left text-cyan-400">
                            {language === 'chinese' ? '可查內容' : 'Queryable Content'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 美國 */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">
                            {language === 'chinese' ? '美國' : 'United States'}
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            {language === 'chinese' 
                              ? 'Financial Crimes Enforcement Network (FinCEN) / 各州 MSB'
                              : 'Financial Crimes Enforcement Network (FinCEN) / State MSB'}
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.fincen.gov/resources/msb-state-selector?spm=a2ty_o01.29997173.0.0.6304517143wAqR" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              FinCEN MSB Registry
                            </a>
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            {language === 'chinese' 
                              ? '查詢是否註冊為 Money Services Business（MSB）'
                              : 'Query if registered as Money Services Business (MSB)'}
                          </td>
                        </tr>
                        {/* 英國 */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">
                            {language === 'chinese' ? '英國' : 'United Kingdom'}
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            Financial Conduct Authority (FCA)
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://register.fca.org.uk/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              FCA Register
                            </a>
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            {language === 'chinese' 
                              ? '搜尋公司名或 FRN 編號（如 Coinbase FRN: 900544）'
                              : 'Search company name or FRN number (e.g., Coinbase FRN: 900544)'}
                          </td>
                        </tr>
                        {/* 新加坡 */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">
                            {language === 'chinese' ? '新加坡' : 'Singapore'}
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            Monetary Authority of Singapore (MAS)
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://eservices.mas.gov.sg/fid/institution" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              MAS Financial Institution Directory
                            </a>
                          </td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            {language === 'chinese' 
                              ? '查詢是否為持牌 Payment Institution（如 Coinbase: PSN0000077）'
                              : 'Query if licensed as Payment Institution (e.g., Coinbase: PSN0000077)'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedItem === 2 && currentImageIndex === 5 ? (
                // 第 3 個道具第 6 頁：主流中心化交易平台網址
                <div className="p-8 text-white pb-24" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400" style={pixelFontStyle}>
                    {language === 'chinese' ? '主流中心化交易平台網址' : 'Mainstream Centralized Exchange Platform URLs'}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]" style={pixelFontStyle}>
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="border-2 border-gray-600 px-4 py-3 text-left text-cyan-400" style={{ width: '10%' }}>
                            {language === 'chinese' ? '序號' : 'No.'}
                          </th>
                          <th className="border-2 border-gray-600 px-4 py-3 text-left text-cyan-400" style={{ width: '20%' }}>
                            {language === 'chinese' ? '平台名稱' : 'Platform Name'}
                          </th>
                          <th className="border-2 border-gray-600 px-4 py-3 text-left text-cyan-400" style={{ width: '70%', minWidth: '400px' }}>
                            {language === 'chinese' ? '官方網址' : 'Official Website'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Binance */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">1</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">Binance</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.binance.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.binance.com
                            </a>
                          </td>
                        </tr>
                        {/* Coinbase */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">2</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">Coinbase</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.coinbase.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.coinbase.com
                            </a>
                          </td>
                        </tr>
                        {/* Kraken */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">3</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">Kraken</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.kraken.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.kraken.com
                            </a>
                          </td>
                        </tr>
                        {/* OKX */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">4</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">OKX</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.okx.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.okx.com
                            </a>
                          </td>
                        </tr>
                        {/* Bybit */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">5</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">Bybit</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.bybit.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.bybit.com
                            </a>
                          </td>
                        </tr>
                        {/* Bitget */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">6</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">Bitget</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.bitget.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.bitget.com
                            </a>
                          </td>
                        </tr>
                        {/* KuCoin */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">7</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">KuCoin</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.kucoin.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.kucoin.com
                            </a>
                          </td>
                        </tr>
                        {/* Gate.io */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">8</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">Gate.io</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.gate.io" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.gate.io
                            </a>
                          </td>
                        </tr>
                        {/* HTX */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">9</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">HTX</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.htx.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.htx.com
                            </a>
                          </td>
                        </tr>
                        {/* Crypto.com */}
                        <tr className="bg-gray-700 hover:bg-gray-600">
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold text-center">10</td>
                          <td className="border-2 border-gray-600 px-4 py-3 font-bold">Crypto.com</td>
                          <td className="border-2 border-gray-600 px-4 py-3">
                            <a 
                              href="https://www.crypto.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              https://www.crypto.com
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedItem === 4 && currentImageIndex === 9 ? (
                // 第 5 個道具第 10 頁：Pocket Universe & Revoke.cash 文字說明
                <div className="p-8 text-white text-left space-y-6" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <section>
                    <h2 className="text-4xl font-bold mb-4 text-cyan-400" style={pixelFontStyle}>
                      {language === 'chinese' ? '1. Pocket Universe（口袋宇宙）' : '1. Pocket Universe'}
                    </h2>
                    <p className="text-lg mb-2">
                      {language === 'chinese'
                        ? '角色設定：你的隨身保鑣／交易翻譯官。這是一個免費的瀏覽器擴充插件，像一道防火牆擋在你的錢包（例如 MetaMask）前面。'
                        : 'Role: your on‑chain bodyguard / transaction translator. It is a free browser extension that sits in front of your wallet (e.g. MetaMask) like a firewall.'}
                    </p>
                    <p className="text-lg mb-2">
                      {language === 'chinese'
                        ? '當你要簽名時，它會先模擬結果，用「人話」告訴你這筆交易會發生什麼事，例如：'
                        : 'Before you sign, it simulates the result and explains in plain language what will happen, for example:'}
                    </p>
                    <p className="text-lg italic mb-2 text-red-300">
                      {language === 'chinese'
                        ? '「⚠️ 如果你簽了這筆，你的 Bored Ape NFT 會被轉走，你將獲得 0 元。」'
                        : '"⚠️ If you sign this, your Bored Ape NFT will be transferred out and you will receive 0 ETH."'}
                    </p>
                    <p className="text-lg">
                      {language === 'chinese'
                        ? '它能把像 SetApprovalForAll 這類的授權陷阱轉成紅色警報，還提供最高約 2000 美元的防詐保險（針對特定情境）。'
                        : 'It can convert tricks like SetApprovalForAll into clear red alerts, and even offers up to around $2,000 of coverage for specific scam scenarios.'}
                    </p>
                    <p className="text-base mt-3 text-slate-400">
                      {language === 'chinese' ? '官方網站： ' : 'Official site: '}
                      <a 
                        href="https://pocketuniverse.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        https://pocketuniverse.app/
                      </a>
                    </p>
                  </section>

                  <section>
                    <h2 className="text-4xl font-bold mb-4 text-cyan-400" style={pixelFontStyle}>
                      {language === 'chinese' ? '2. Revoke.cash' : '2. Revoke.cash'}
                    </h2>
                    <p className="text-lg mb-2">
                      {language === 'chinese'
                        ? '角色設定：你的資產管家／授權大掃除工具。它是一個網站儀表板，用來檢查並撤銷你過去給出去的代幣授權。'
                        : 'Role: your asset housekeeper / approval cleanup tool. It is a dashboard website for checking and revoking token approvals you have granted before.'}
                    </p>
                    <p className="text-lg mb-2">
                      {language === 'chinese'
                        ? '例如：你半年前為了領空投，給某個網站「無限動用 USDT」的權限，之後忘記撤銷。如果該合約被駭，駭客可以直接把你現在錢包裡的 USDT 轉走。'
                        : 'For example: half a year ago you approved a site to spend "unlimited USDT" for an airdrop and forgot. If that contract is hacked, the attacker can drain your current USDT.'}
                    </p>
                    <p className="text-lg">
                      {language === 'chinese'
                        ? '建議養成習慣（例如每月一次）連上 Revoke.cash，找出「不明或已不用的平台授權」，點擊 Revoke 把鑰匙收回。'
                        : 'Best practice: once a month, connect your wallet to Revoke.cash, find unknown or unused approvals, and click Revoke to take your keys back.'}
                    </p>
                    <p className="text-base mt-3 text-slate-400">
                      {language === 'chinese' ? '官方網站： ' : 'Official site: '}
                      <a 
                        href="https://revoke.cash/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        https://revoke.cash/
                      </a>
                    </p>
                  </section>
                </div>
              ) : (
                // 顯示圖片
                <img
                  src={items[selectedItem].images[language]?.[currentImageIndex] || items[selectedItem].images.chinese[currentImageIndex]}
                  alt={`${items[selectedItem].name} - Page ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[75vh] object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
            </div>
            
            {/* 導航按鈕 - 位置放低避免擋住圖片 */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-4 items-center z-10">
              {/* 上一頁按鈕 */}
              <button
                onClick={handlePrevImage}
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
                {t.prev}
              </button>
              
              {/* 頁碼指示 */}
              <span className="px-4 py-2"
                style={{
                  fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  backgroundColor: '#374151',
                  border: '2px solid #000',
                  borderRadius: '4px',
                  textShadow: '2px 2px 0px #000',
                  letterSpacing: '1px'
                }}
              >
                {currentImageIndex + 1} / {
                  // 第三個道具有6頁（4張圖片 + 1頁表格 + 1頁平台網址）
                  // 第五個道具有10頁（9張圖片 + 1頁文字說明）
                  selectedItem === 2 
                    ? 6 
                    : selectedItem === 4
                    ? 10
                    : (items[selectedItem].images[language]?.length || items[selectedItem].images.chinese.length)
                }
              </span>
              
              {/* 下一頁按鈕 */}
              <button
                onClick={handleNextImage}
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
                {t.next}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 授权挑战选择界面 */}
      {showAuthorizationChallenges && (
        <PhaseRoadmap2
          language={language}
          setLanguage={setLanguage}
          onSelectChallenge={(challenge) => {
            navigate(challenge.route, { replace: false });
            setShowAuthorizationChallenges(false);
          }}
          onClose={() => setShowAuthorizationChallenges(false)}
          onOpenBackpack={() => setShowBackpack(true)}
        />
      )}

      {/* 底部基石文字 - 當顯示授權挑戰選擇界面時隱藏 */}
      {!showAuthorizationChallenges && (
        <footer className="absolute bottom-10 w-full text-center opacity-40 text-xs tracking-[0.5em] uppercase" style={pixelFontStyle}>
          ✦The website information is just use for anti-phishing education. The game challenges mimic web pages and are not intended for phishing.✦
        </footer>
      )}

      {/* 全局 CSS：確保像素風格渲染 [cite: 30] */}
      <style>{`
        .pixel-font {
          font-family: 'Courier New', Monaco, Menlo, 'Ubuntu Mono', monospace;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        * {
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
};
export default GamePage;