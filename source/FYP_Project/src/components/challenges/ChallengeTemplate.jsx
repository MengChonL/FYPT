import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Folder from '../Folder';
import item1 from '../../assets/item1.png';
import item2 from '../../assets/item2.jpg';
import item3 from '../../assets/item3.png';
import item4 from '../../assets/item4.png';
import item5 from '../../assets/item5.png';
import item6 from '../../assets/item6.png';
// Web3錢包知識本圖片
import walletBook1cn from '../../assets/whatiswebewallet1cn.png';
import walletBook1en from '../../assets/whatiswebwallet1en.png';
import walletBook2cn from '../../assets/whatiswebwallet2cn.png';
import walletBook2en from '../../assets/whatiswebwallet2en.png';
import walletBook3cn from '../../assets/whatwebwallet3.png';
import walletBook3en from '../../assets/whatiswebwallet3en.png';
import transferGuide1Cn from '../../assets/Transfer1cn.png';
import transferGuide1En from '../../assets/Transfer1en.png';
import transferGuide2Cn from '../../assets/Transfer2cn.png';
import transferGuide2En from '../../assets/Transfer2en.png';
import transferGuide3Cn from '../../assets/transfer3cn.png';
import transferGuide3En from '../../assets/Transfer3en.png';
// 中心化交易平台指南圖片
import cexGuide1Cn from '../../assets/CEXCN1.png';
import cexGuide1En from '../../assets/CEXEN1.png';
import cexGuide2Cn from '../../assets/CEXCN2.png';
import cexGuide2En from '../../assets/CEXEN2.png';
import cexGuide3Cn from '../../assets/CEXCN3.png';
import cexGuide3En from '../../assets/CEXEN3.png';
import cexGuide4Cn from '../../assets/CEXCN4.png';
import cexGuide4En from '../../assets/CEXEN4.png';
// 去中心化平台指南圖片
import dexGuide1Cn from '../../assets/DEXCN1.png';
import dexGuide1En from '../../assets/DEXEN1.png';
import dexGuide2Cn from '../../assets/DEXCN2.png';
import dexGuide2En from '../../assets/DEXEN2.png';
import dexGuide3Cn from '../../assets/DEXCN3.png';
import dexGuide3En from '../../assets/DEXEN3.png';

/**
 * 挑战页面基础模板
 * 提供统一的布局、语言切换、返回按钮等功能
 */
const ChallengeTemplate = ({ 
  children,
  language,
  setLanguage,
  title,
  backPath = '/game',
  showLanguageSwitch = true,
  containerMaxWidth = '75vw',
  containerMaxHeight = '75vh',
  openBackpack = false, // 外部控制打开背包
}) => {
  const navigate = useNavigate();
  const [showBackpack, setShowBackpack] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const [showItemViewer, setShowItemViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 确保导航时清除任何可能的路由状态
  const handleBackNavigation = () => {
    // 使用 replace: true 确保正确导航，避免路由历史问题
    const targetPath = backPath || '/game';
    navigate(targetPath, { replace: true, state: null });
  };

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
      name: '驗證令牌', 
      nameEn: 'Verification Token',
      description: '自動驗證交易合法性', 
      descriptionEn: 'Auto-verifies transaction legitimacy',
      rarity: '史詩', 
      rarityEn: 'Epic',
      type: '輔助道具', 
      typeEn: 'Support Item',
      image: item5 
    },
    { 
      name: '緊急傳送門', 
      nameEn: 'Emergency Portal',
      description: '危險時刻快速退出', 
      descriptionEn: 'Quick escape in danger',
      rarity: '傳說', 
      rarityEn: 'Legendary',
      type: '逃脫道具', 
      typeEn: 'Escape Item',
      image: item6 
    }
  ];

  const content = {
    chinese: {
      backToGame: '返回遊戲',
      backpack: '背包',
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
      backToGame: 'Back to Game',
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

  // 监听 openBackpack prop，当为 true 时打开背包
  useEffect(() => {
    if (openBackpack) {
      setShowBackpack(true);
    }
  }, [openBackpack]);

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
      // 第三個道具有5頁（4張圖片 + 1頁表格）
      const maxPages = selectedItem === 2 ? 5 : images.length;
      setCurrentImageIndex((prev) => (prev + 1) % maxPages);
    }
  };

  const handlePrevImage = () => {
    const item = items[selectedItem];
    if (item?.images) {
      const images = item.images[language] || item.images.chinese;
      // 第三個道具有5頁（4張圖片 + 1頁表格）
      const maxPages = selectedItem === 2 ? 5 : images.length;
      setCurrentImageIndex((prev) => (prev - 1 + maxPages) % maxPages);
    }
  };

  const currentContent = content[language] || content.chinese;

  return (
    <div 
      className="w-full h-screen overflow-hidden relative flex flex-col"
      style={{ 
        background: 'linear-gradient(45deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw'
      }}
    >
      {/* 语言切换 - 左上角 */}
      {showLanguageSwitch && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('chinese')}
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
              onClick={() => setLanguage('english')}
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
      )}

      {/* 返回按钮 - 右上角 */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBackNavigation();
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
          {currentContent.backToGame}
        </button>
      </div>

      {/* 背包按鈕 - 右下角 */}
      <div className="absolute bottom-4 right-4 z-10">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowBackpack(!showBackpack)}
          style={{
            fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#ffffff',
            fontSize: '14px',
            transition: 'all 0.3s ease'
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
          <span>{currentContent.backpack}</span>
        </div>
      </div>

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
            className="absolute inset-0 bg-black bg-opacity-5"
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
              className="absolute top-6 right-6 text-white cursor-pointer hover:text-gray-300 transition-colors"
              style={{
                fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0'
              }}
            >
              ×
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-cyan-400 text-center" style={{ 
              fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace', 
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {currentContent.backpackTitle}
            </h3>
            
            {/* 上方區域 - 左側放大物件，右側描述 */}
            <div className="flex gap-6 mb-6">
              {/* 左側 - 放大物件 */}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-cyan-400 mb-3" style={{
                  fontFamily: 'Courier New, Monaco, Menlo, Ubuntu Mono, monospace',
                  textTransform: 'uppercase'
                }}>
                  {currentContent.selectedItem}
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
                  {currentContent.itemDescription}
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
                    {currentContent.rarity}: {language === 'chinese' ? items[selectedItem]?.rarity : items[selectedItem]?.rarityEn}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentContent.type}: {language === 'chinese' ? items[selectedItem]?.type : items[selectedItem]?.typeEn}
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
                      {currentContent.useItem}
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
                  {index < 6 ? (
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
              <p>{currentContent.items}: 6/10</p>
              <p>{currentContent.emptySlots}: 4</p>
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
              {currentContent.close}
            </button>

            {/* 圖片顯示或表格顯示 */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden border-4 border-black shadow-2xl">
              {/* 檢查是否是第三個道具的第五頁（索引4） */}
              {selectedItem === 2 && currentImageIndex === 4 ? (
                // 顯示監管機構表格
                <div className="p-8 text-white" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400" style={{ fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace" }}>
                    {language === 'chinese' ? '監管機構查詢網站' : 'Regulatory Authority Query Websites'}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace" }}>
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
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 items-center z-10">
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
                {currentContent.prev}
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
                  // 第三個道具有5頁（4張圖片 + 1頁表格）
                  selectedItem === 2 
                    ? 5 
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
                {currentContent.next}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 主要内容区域 */}
      <div 
        className="flex-1 flex items-center justify-center" 
        style={{ 
          padding: containerMaxWidth === '100vw' ? '0' : '1rem',
          minHeight: 0,
          height: '100%',
          width: '100%',
          overflow: 'visible',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            maxWidth: containerMaxWidth,
            maxHeight: containerMaxHeight,
            width: containerMaxWidth === '100vw' ? '100%' : '100%',
            height: containerMaxHeight === '100vh' ? '100%' : 'auto',
            minHeight: containerMaxHeight === '100vh' ? '100%' : 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChallengeTemplate;

