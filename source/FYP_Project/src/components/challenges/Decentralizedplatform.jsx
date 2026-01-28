import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChallengeTemplate from './ChallengeTemplate';
import ChallengeResultScreen from './ChallengeResultScreen';
import PhaseRoadmap from '../PhaseRoadmap';
import BrowserFrame from './BrowserFrame';
import UniswapLogo from '../../assets/Uniswap.png';
import DEXclaimImage from '../../assets/DEXclaim.png';

const Decentralizedplatform = ({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('map'); // 'map' | 'intro' | 'challenge'
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [language, setLanguage] = useState('chinese');
  const [stage, setStage] = useState(1); // 1: Connection Question, 2: Transaction Receipt UI
  
  // Stage 1: Uniswap Connection Question State
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');
  
  // Stage 2: Transaction Receipt Anomaly Selection State
  const [selectedAnomalies, setSelectedAnomalies] = useState([]);
  const [anomalyError, setAnomalyError] = useState('');
  
  // Item Reminder State
  const [showItemReminder, setShowItemReminder] = useState(false);
  const [openBackpack, setOpenBackpack] = useState(false);
  const [autoOpenItemIndex, setAutoOpenItemIndex] = useState(null); // 自動打開的道具索引

  // 初始化：路由变化时重置状态
  useEffect(() => {
    setView('map');
    setShowResult(false);
    setIsCorrect(false);
    setStage(1);
    setSelectedAnswer('');
    setAnswerError('');
    setSelectedAnomalies([]);
    setAnomalyError('');
    setShowItemReminder(false);
    setOpenBackpack(false);
    setAutoOpenItemIndex(null);
  }, [location.pathname, config]);

  if (!config) {
    return (
      <div className="text-white text-center p-8">
        <h1 className="text-2xl">{language === 'chinese' ? '挑战配置未找到' : 'Challenge config not found'}</h1>
      </div>
    );
  }

  // 处理下一关导航
  const handleNextLevel = () => {
    if (config?.nextLevel) {
      const phase = config.nextLevel.split('-')[0];
      navigate(`/challenge/${phase}/${config.nextLevel}`);
    } else {
      // 如果没有下一关，返回游戏大厅
      navigate('/game');
    }
  };

  // 处理 roadmap 点击
  const handleStartLevel = (stepId) => {
    if (stepId === 'dex' || stepId === 'phase1-6') setView('intro');
  };

  // Roadmap 步骤配置
  const roadmapSteps = [
    { id: 'search', iconType: 'search', status: 'completed', title: { chinese: '下載錢包', english: 'Download Wallet' } },
    { id: 'create', iconType: 'create', status: 'completed', title: { chinese: '創建錢包', english: 'Create Wallet' } },
    { id: 'deposit', iconType: 'deposit', status: 'completed', title: { chinese: '首次入金', english: 'First Deposit' } },
    { id: 'transfer', iconType: 'transfer', status: 'completed', title: { chinese: '轉賬', english: 'Transfer' } },
    { id: 'cex', iconType: 'cex', status: 'completed', title: { chinese: '中心化平台判別', english: 'CEX Check' } },
    { id: 'dex', iconType: 'dex', status: 'current', title: { chinese: '去中心化平台判別', english: 'DEX Check' } }
  ];

  const currentContent = config.content[language];
  const introData = config?.intro?.[language];

  // 渲染道具提醒消息框
  const renderItemReminder = () => {
    if (!showItemReminder) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 flex items-center justify-center z-[100] p-8"
      >
        {/* 背景遮罩 */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
          onClick={() => setShowItemReminder(false)}
        />
        
        {/* 消息框 */}
        <div className="relative bg-[#0f172a] rounded-3xl p-12 py-16 w-[90%] max-w-[90%] text-center backdrop-blur-xl shadow-2xl border border-gray-800">
          <div className="mb-8 flex justify-center">
            <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-cyan-500/30">
              {language === 'chinese' ? '提示' : 'Tip'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-8 tracking-tighter font-mono">
            {language === 'chinese' ? '建議閱讀道具' : 'Recommended Item'}
          </h1>
          <div className="space-y-8 text-left mb-12">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-2 uppercase font-bold">
                {language === 'chinese' ? '建議' : 'Recommendation'}
              </p>
              <p className="text-white text-lg leading-relaxed">
                {language === 'chinese' 
                  ? '建議先閱讀「去中心化交易平台指南」以了解相關知識' 
                  : 'It is recommended to read "Decentralized Exchange Platform Guide" first to understand relevant knowledge'}
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-2 uppercase font-bold">
                {language === 'chinese' ? '幫助' : 'Help'}
              </p>
              <p className="text-white text-lg leading-relaxed">
                {language === 'chinese' 
                  ? '這將幫助您更好地完成挑戰' 
                  : 'This will help you complete the challenge better'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowItemReminder(false);
                // 自動打開「去中心化交易平台指南」（items[3]）
                setAutoOpenItemIndex(3);
                setOpenBackpack(true);
                setTimeout(() => {
                  setOpenBackpack(false);
                  setAutoOpenItemIndex(null);
                }, 100);
              }}
              className="flex-1 py-4 bg-purple-200 hover:bg-purple-300 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] transform hover:scale-[1.02]"
            >
              {language === 'chinese' ? '打開背包' : 'Open Backpack'}
            </button>
            <button
              onClick={() => {
                setShowItemReminder(false);
                setView('challenge');
              }}
              className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
            >
              {language === 'chinese' ? '繼續挑戰' : 'Continue'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // 检查答案选择
  const checkAnswerSelection = () => {
    if (!selectedAnswer) {
      setAnswerError(language === 'chinese' ? '請選擇一個答案' : 'Please select an answer');
      setShowResult(true);
      setIsCorrect(false);
      return;
    }
    
    // 正确答案是 B (direct) - 直接连接即可，不需要签署任何内容
    if (selectedAnswer === 'direct') {
      setIsCorrect(true);
      setAnswerError('');
      setShowResult(true);
    } else if (selectedAnswer === 'mnemonic') {
      setIsCorrect(false);
      setAnswerError(language === 'chinese' 
        ? '提供助記詞等於提供整個錢包的操控權，騙徒有機會隨時可以取走你所有錢包上的存款，所以釣魚網站都會以這種方式欺騙用戶連接錢包。'
        : 'Providing mnemonic phrases equals giving full control of your wallet. Scammers can take all your deposits at any time, which is why phishing sites use this method to trick users into connecting their wallets.');
      setShowResult(true);
    } else {
      // selectedAnswer === 'sign'
      setIsCorrect(false);
      setAnswerError(language === 'chinese' 
        ? '連接去中心化平台時，只需要直接連接即可告訴平台你的錢包地址，不需要簽署任何合同。只有再進行交易或者其他操作的時候才需要簽署授權合同。'
        : 'When connecting to a decentralized platform, you only need to connect directly to tell the platform your wallet address. No signature is required. Signatures are only needed when performing transactions or other operations.');
      setShowResult(true);
    }
  };

  // 進入第二階段：展示交易收據介面（僅前端教學畫面）
  const startStage2 = () => {
    setStage(2);
    setShowResult(false);
    setIsCorrect(false);
    setSelectedAnomalies([]);
    setAnomalyError('');
  };

  // 处理异常项选择（多选）
  const handleAnomalyToggle = (anomalyId) => {
    setAnomalyError('');
    setSelectedAnomalies(prev => {
      if (prev.includes(anomalyId)) {
        return prev.filter(id => id !== anomalyId);
      } else {
        return [...prev, anomalyId];
      }
    });
  };

  // 检查异常项选择结果
  const checkAnomalySelection = () => {
    if (selectedAnomalies.length === 0) {
      setAnomalyError(language === 'chinese' ? '請至少選擇一個異常項目' : 'Please select at least one anomaly');
      setShowResult(true);
      setIsCorrect(false);
      return;
    }
    
    // 正确答案：除了GAS费用之外的所有项目都是异常的
    // 货币名称（USDC.E模仿USDC）、货币金额（异常大）、来源（不知名收款）、合约号码（十六进制显示有断点）、交易哈希（包含域名用-等模糊）、货币附带域名（uniswap域名错误）
    // 唯一正常的是GAS费用
    const correctAnomalies = ['tokenName', 'tokenAmount', 'source', 'contractAddress', 'transactionHash', 'tokenDomain'];
    const selectedSet = new Set(selectedAnomalies);
    const correctSet = new Set(correctAnomalies);
    
    // 检查是否选择了所有正确的异常项，且没有选择错误的（不能选择gasFee）
    const allCorrect = correctAnomalies.every(id => selectedSet.has(id));
    const noExtra = selectedAnomalies.every(id => correctSet.has(id));
    const noGasFee = !selectedAnomalies.includes('gasFee');
    
    if (allCorrect && noExtra && noGasFee && selectedAnomalies.length === correctAnomalies.length) {
      setIsCorrect(true);
      setAnomalyError('');
      setShowResult(true);
    } else {
      setIsCorrect(false);
      setAnomalyError(language === 'chinese' 
        ? '請仔細檢查交易收據中的異常項目。注意：貨幣名稱（USDC.E模仿USDC）、貨幣金額（異常大）、來源（不知名收款）、合約號碼（十六進制顯示有斷點）、交易哈希（包含域名用-等模糊）、貨幣附帶域名（uniswap域名錯誤）。唯一正常的是GAS費用。'
        : 'Please carefully check the anomalies in the transaction receipt. Note: token name (USDC.E mimics USDC), token amount (abnormally large), source (unknown payment), contract address (hexadecimal display with breaks), transaction hash (contains domain with - etc.), token domain (incorrect uniswap domain). The only normal item is gas fee.');
      setShowResult(true);
    }
  };

  // 第二階段：模擬錢包內的交易收據畫面
  const renderTransactionReceipt = () => {
    const isChinese = language === 'chinese';

    const anomalyOptions = [
      { 
        id: 'tokenName', 
        title: isChinese ? '貨幣名稱' : 'Token Name',
        description: isChinese ? '檢查代幣名稱是否異常（如拼寫錯誤、相似名稱等）' : 'Check if token name is abnormal (e.g., spelling errors, similar names)'
      },
      { 
        id: 'tokenAmount', 
        title: isChinese ? '貨幣金額' : 'Token Amount',
        description: isChinese ? '檢查金額是否異常（如過大、過小或格式錯誤）' : 'Check if amount is abnormal (e.g., too large, too small, or format errors)'
      },
      { 
        id: 'source', 
        title: isChinese ? '來源' : 'Source',
        description: isChinese ? '檢查交易來源地址是否可疑' : 'Check if transaction source address is suspicious'
      },
      { 
        id: 'contractAddress', 
        title: isChinese ? '合約號碼' : 'Contract Address',
        description: isChinese ? '檢查合約地址是否為已知的詐騙合約' : 'Check if contract address is a known scam contract'
      },
      { 
        id: 'gasFee', 
        title: isChinese ? 'GAS費用' : 'Gas Fee',
        description: isChinese ? '檢查 Gas 費用是否異常' : 'Check if gas fee is abnormal'
      },
      { 
        id: 'transactionHash', 
        title: isChinese ? '交易哈希' : 'Transaction Hash',
        description: isChinese ? '檢查交易哈希是否有效' : 'Check if transaction hash is valid'
      },
      { 
        id: 'tokenDomain', 
        title: isChinese ? '貨幣附帶域名' : 'Token Domain',
        description: isChinese ? '檢查代幣附帶的域名是否可疑或偽造' : 'Check if token domain is suspicious or fake'
      }
    ];

    return (
      <div className="w-full h-full flex items-start justify-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1] overflow-y-auto pt-4">
        <div className="w-full max-w-4xl mx-auto p-8 py-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header with DEXclaim Image */}
            <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] p-4 text-center flex-shrink-0">
              <div className="flex justify-center">
                <img 
                  src={DEXclaimImage} 
                  alt="DEX Claim" 
                  className="w-full max-w-xl h-auto object-contain rounded-xl"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))', maxHeight: '450px' }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto flex-1">
              {/* Description */}
              <div className="mb-8 bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {isChinese 
                    ? '你打開 MetaMask 突然收到一筆不知名收款，請你選擇出這個款項中異常的地方。'
                    : 'You opened MetaMask and suddenly received an unknown payment. Please identify the anomalies in this transaction.'}
                </p>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-300 mb-8"></div>

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {isChinese ? '請選擇異常的項目：' : 'Please select the anomalies:'}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {isChinese ? '可多選，請仔細檢查交易收據中的每個項目' : 'Multiple selections allowed. Please carefully check each item in the transaction receipt'}
                </p>
              </div>

              {/* Anomaly Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {anomalyOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`p-6 border-2 rounded-xl transition-all text-left cursor-pointer ${
                      selectedAnomalies.includes(option.id)
                        ? 'border-pink-500 bg-pink-100 ring-2 ring-pink-300'
                        : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                    }`}
                    onClick={() => handleAnomalyToggle(option.id)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xl text-gray-800">
                          {option.title}
                        </div>
                        {selectedAnomalies.includes(option.id) && (
                          <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {anomalyError && (
                <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {anomalyError}
                </div>
              )}

              {/* Separator */}
              <div className="border-t border-gray-300 mb-6" style={{ marginTop: '2rem' }}></div>

              {/* Submit Button */}
              <div>
                <button
                  onClick={checkAnomalySelection}
                  className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#ff007a',
                    boxShadow: '0 4px 12px rgba(255, 0, 122, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e6006e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff007a';
                  }}
                >
                  {isChinese ? '提交答案' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染 Uniswap 介绍页面
  const renderUniswapIntro = () => {
    const uniswapInfo = {
      chinese: {
        title: 'Uniswap 去中心化交易所',
        description: 'Uniswap 是一個去中心化交易所（DEX），允許用戶透過智能合約直接在區塊鏈上兌換加密貨幣，無需註冊帳號、無需信任中介，也不受任何中心化機構控制。用戶只需連接如 MetaMask 等非託管錢包，即可自由交易主流代幣，所有操作由開源且可驗證的合約自動執行。Uniswap 採用自動做市商（AMM）機制，透過流動性池決定價格，並已擴展至 Ethereum、Arbitrum、Optimism、Base 等多個區塊鏈網絡。其唯一官方網站為 app.uniswap.org，無任何 .com、.net 或附加詞版本，且絕不會透過社交平台私訊用戶或要求支付費用。作為 Web3 金融基礎設施之一，Uniswap 體現了用戶自主掌控資產與交易的核心精神。',
        question: '假如你現在要連接 Uniswap，你需要進行下列哪一項操作？',
        options: [
          { 
            id: 'mnemonic', 
            title: '提供 12 個助記詞', 
            badge: '📝', 
            description: "輸入創建錢包時的 12 個助記詞連接去中心化平台。"
              },
          { 
            id: 'direct', 
            title: '直接連接，不簽署任何內容', 
            badge: '🔗', 
            description: "僅將錢包地址提供給網站，不發起區塊鏈交易或授權請求。"
          },
          { 
            id: 'sign', 
            title: '簽署授權內容連接錢包', 
            badge: '🔑', 
            description: "通過簽署一筆區塊鏈交易來完成連接或授予合約特定權限。"
          }
        ],
        submitBtn: '提交答案',
        selectHint: '請選擇正確的答案'
      },
      english: {
        title: 'Uniswap Decentralized Exchange',
        description: 'Uniswap is a decentralized exchange (DEX) that allows users to swap cryptocurrencies directly on the blockchain through smart contracts, without registration, intermediaries, or centralized control. Users only need to connect a non-custodial wallet like MetaMask to freely trade mainstream tokens, with all operations automatically executed by open-source and verifiable contracts. Uniswap uses an Automated Market Maker (AMM) mechanism, determining prices through liquidity pools, and has expanded to multiple blockchain networks including Ethereum, Arbitrum, Optimism, and Base. Its only official website is app.uniswap.org, with no .com, .net, or additional word versions, and it will never message users through social platforms or require payment. As one of the Web3 financial infrastructures, Uniswap embodies the core spirit of user-controlled assets and transactions.',
        question: 'If you want to connect to Uniswap now, which of the following operations do you need to perform?',
        options: [
          { 
            id: 'mnemonic', 
            title: 'Provide 12 mnemonic phrases', 
            badge: 'Extremely risky', 
            badgeType: 'danger',
            description: 'Asking you to input your full seed phrase means giving away full control of your wallet. Scammers can take all your deposits at any time, which is why phishing sites use this method to trick users.'
          },
          { 
            id: 'direct', 
            title: 'Connect directly without signing anything', 
            badge: 'Recommended', 
            badgeType: 'safe',
            description: 'When connecting to a decentralized platform, you only need to connect directly to tell the platform your wallet address. No signature is required during connection.'
          },
          { 
            id: 'sign', 
            title: 'Sign authorization to connect wallet', 
            badge: 'Incorrect', 
            badgeType: 'warning',
            description: 'Connecting does not require signing any contract. Signatures are only needed when performing transactions or other operations, not during the initial connection.'
          }
        ],
        submitBtn: 'Submit Answer',
        selectHint: 'Please select the correct answer'
      }
    };

    const info = uniswapInfo[language] || uniswapInfo.chinese;

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1]">
        <div className="w-full max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] p-8 text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src={UniswapLogo} 
                  alt="Uniswap" 
                  className="w-48 h-48 object-contain"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                />
              </div>
              <h1 className="text-4xl font-bold mb-4" style={{ color: '#ff007a' }}>
                {info.title}
              </h1>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Description - 用盒子包装 */}
              <div className="mb-8 bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {info.description}
                </p>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-300 mb-8"></div>

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {info.question}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {info.selectHint}
                </p>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {info.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`p-6 border-2 rounded-xl transition-all text-left cursor-pointer ${
                      selectedAnswer === option.id
                        ? 'border-pink-500 bg-pink-100 ring-2 ring-pink-300'
                        : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                    }`}
                    onClick={() => {
                      setSelectedAnswer(option.id);
                      setAnswerError('');
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xl text-gray-800">
                          {option.title}
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            option.badgeType === 'danger'
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : option.badgeType === 'warning'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          }`}
                        >
                          {option.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {option.description}
                      </p>
                      {selectedAnswer === option.id && (
                        <div className="mt-2 flex justify-end">
                          <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {answerError && (
                <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {answerError}
                </div>
              )}

              {/* Separator */}
              <div className="border-t border-gray-300 mb-6" style={{ marginTop: '2rem' }}></div>

              {/* Submit Button */}
              <div>
                <button
                  onClick={checkAnswerSelection}
                  className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#ff007a',
                    boxShadow: '0 4px 12px rgba(255, 0, 122, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e6006e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff007a';
                  }}
                >
                  {info.submitBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染任务介绍页面
  const renderMissionIntro = () => (
    <div className="flex items-center justify-center w-full min-h-screen p-8 relative z-10">
      <div className="bg-[#0f172a] rounded-3xl p-10 max-w-2xl text-center backdrop-blur-xl shadow-2xl border border-gray-800">
        <div className="mb-6 flex justify-center">
          <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-cyan-500/30">
            {language === 'chinese' ? '新任務解鎖' : 'New Mission Unlocked'}
          </span>
        </div>
        <h1 className="text-4xl font-black text-white mb-6 tracking-tighter font-mono">
          {introData?.title || currentContent.title}
        </h1>
        <div className="space-y-6 text-left mb-10">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">
              {language === 'chinese' ? '背景' : 'Background'}
            </p>
            <p className="text-white text-lg leading-relaxed">
              {introData?.story || currentContent.scenarioText}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">
              {language === 'chinese' ? '目標' : 'Objective'}
            </p>
            <p className="text-white text-lg leading-relaxed">
              {introData?.mission || (language === 'chinese' 
                ? '您的目標是：了解去中心化平台的運作方式與安全特性。' 
                : 'Your goal is to understand how decentralized platforms work and their security features.')}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowItemReminder(true)}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
        >
          {introData?.btn || (language === 'chinese' ? '開始挑戰' : 'Start Challenge')}
        </button>
      </div>
    </div>
  );

  return (
    <ChallengeTemplate
      language={language}
      setLanguage={setLanguage}
      containerMaxWidth="100vw"
      containerMaxHeight="100vh"
      openBackpack={openBackpack}
      autoOpenItemIndex={autoOpenItemIndex}
    >
      {/* 道具提醒消息框 */}
      {renderItemReminder()}
      
      {/* Roadmap 视图 */}
      {view === 'map' && (
        <PhaseRoadmap 
          steps={roadmapSteps} 
          onStartLevel={handleStartLevel} 
          language={language} 
        />
      )}

      {/* 任务介绍视图 */}
      {view === 'intro' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderMissionIntro()}
        </div>
      )}

      {/* Stage 1: Uniswap Introduction */}
      {view === 'challenge' && stage === 1 && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url="app.uniswap.org/about"
            className="w-full max-w-5xl h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            {renderUniswapIntro()}
          </BrowserFrame>
        </div>
      )}

      {/* Stage 2: Transaction Receipt UI */}
      {view === 'challenge' && stage === 2 && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url="metamask.io/tx/0x7f2...a1b9"
            className="w-full max-w-5xl h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            {renderTransactionReceipt()}
          </BrowserFrame>
        </div>
      )}

      {/* 结果显示 */}
      {view === 'challenge' && showResult && (
        <ChallengeResultScreen
          isSuccess={isCorrect}
          title={isCorrect
            ? (stage === 1
                ? (language === 'chinese' ? '第一階段完成' : 'Stage 1 Complete')
                : (language === 'chinese' ? '挑戰完成！' : 'Challenge Completed!'))
            : (language === 'chinese' ? '挑戰失敗' : 'Challenge Failed')}
          description={isCorrect
            ? (stage === 1
                ? (language === 'chinese' ? '您已成功辨識正確的連接方式。準備進入下一階段。' : 'You have successfully identified the correct connection method. Proceed to the next stage.')
                : currentContent.scenarioText)
            : (language === 'chinese' ? '請重新嘗試挑戰。' : 'Please try the challenge again.')}
          successMessage={language === 'chinese' ? '驗證通過' : 'Verification Passed'}
          failureMessage={language === 'chinese' ? '驗證失敗' : 'Verification Failed'}
          successExplanation={language === 'chinese' 
            ? (stage === 1
                ? '連接去中心化平台時，只需要直接連接即可告訴平台你的錢包地址，不需要簽署任何合同。只有再進行交易或者其他操作的時候才需要簽署授權合同。'
                : '您已學會閱讀交易收據畫面：包含收款金額、代幣合約地址、交易哈希與 Gas 費等關鍵資訊，這些都是日後核對交易真偽的重要依據。')
            : (stage === 1
                ? 'When connecting to a decentralized platform, you only need to connect directly to tell the platform your wallet address. No signature is required during connection. Signatures are only needed when performing transactions or other operations.'
                : 'You have learned how to read a transaction receipt screen, including amount received, token contract, transaction hash and gas fee — all key information to verify whether a transaction is genuine.')}
          failureExplanation={language === 'chinese' 
            ? (stage === 1 
                ? (answerError || '連接去中心化平台時，只需要直接連接即可告訴平台你的錢包地址，不需要簽署任何合同。提供助記詞等於提供整個錢包的操控權，騙徒有機會隨時可以取走你所有錢包上的存款。')
                : (anomalyError || '請仔細檢查交易收據中的異常項目。注意貨幣名稱、金額、合約地址和域名等關鍵信息。'))
            : (stage === 1
                ? (answerError || 'When connecting to a decentralized platform, you only need to connect directly to tell the platform your wallet address. No signature is required. Providing mnemonic phrases equals giving full control of your wallet to scammers.')
                : (anomalyError || 'Please carefully check the anomalies in the transaction receipt. Pay attention to token name, amount, contract address, and domain name.'))}
          successSubtitle={language === 'chinese' ? '恭喜' : 'Congratulations'}
          checkItems={isCorrect ? [] : (stage === 1 ? [
            {
              label: language === 'chinese' ? '連接方式' : 'Connection Method',
              value: answerError || (language === 'chinese' 
                ? '連接去中心化平台時，只需要直接連接即可告訴平台你的錢包地址'
                : 'When connecting to a decentralized platform, you only need to connect directly to tell the platform your wallet address'),
              isCorrect: false,
              showValue: true,
              details: language === 'chinese' 
                ? '正確的作法是「直接連接，不簽署任何內容」。連接去中心化平台時，只需要直接連接即可告訴平台你的錢包地址，不需要簽署任何合同。只有再進行交易或者其他操作的時候才需要簽署授權合同。「提供助記詞」等同把錢包所有權完全交出去，騙徒有機會隨時可以取走你所有錢包上的存款，所以釣魚網站都會以這種方式欺騙用戶連接錢包，絕對是詐騙。'
                : 'The correct approach is to \"connect directly without signing anything\". When connecting to a decentralized platform, you only need to connect directly to tell the platform your wallet address. No signature is required during connection. Signatures are only needed when performing transactions or other operations. \"Providing mnemonic phrases\" means handing over full control of your wallet, allowing scammers to take all your deposits at any time, which is why phishing sites use this method to trick users.'
            }
          ] : [
            {
              label: language === 'chinese' ? '異常項目' : 'Anomalies',
              value: anomalyError || (language === 'chinese' 
                ? '請仔細檢查交易收據中的異常項目'
                : 'Please carefully check the anomalies in the transaction receipt'),
              isCorrect: false,
              showValue: true,
              details: language === 'chinese' 
                ? '在檢查交易收據時，需要特別注意以下異常項目：貨幣名稱（USDC.E模仿USDC）、貨幣金額（異常大）、來源（不知名收款）、合約號碼（十六進制顯示有奇怪的斷點）、交易哈希（包含域名用-等模糊字符）、貨幣附帶域名（uniswap正確域名應該是https://app.uniswap.org）。唯一正常的是GAS費用。'
                : 'When checking transaction receipts, pay special attention to the following anomalies: token name (USDC.E mimics USDC), token amount (abnormally large), source (unknown payment), contract address (hexadecimal display with strange breaks), transaction hash (contains domain with - etc.), token domain (correct uniswap domain should be https://app.uniswap.org). The only normal item is gas fee.'
            }
          ])}
          onRetry={null}
          onNextLevel={stage === 1 ? startStage2 : handleNextLevel}
          nextLevelButtonText={language === 'chinese' ? '完成挑戰' : 'Complete Challenge'}
        />
      )}
    </ChallengeTemplate>
  );
};

export default Decentralizedplatform;

