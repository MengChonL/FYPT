import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChallengeTemplate from './ChallengeTemplate';
import BrowserFrame from './BrowserFrame';
import ChallengeResultScreen from './ChallengeResultScreen';
import PhaseRoadmap from '../PhaseRoadmap';
// 导入图标
import EthereumIcon from '../../assets/Ethereum.png';
import USDTIcon from '../../assets/USDT.png';
import ArbitrumIcon from '../../assets/ArbitrumOne.png';
import MetaMaskFox from '../../assets/MetaMask_Fox.png';
import MemoCn from '../../assets/memocn.png';
import MemoEn from '../../assets/memoen.png';

/**
 * 钱包转账挑战组件 - 模仿 MetaMask 转账界面
 * 用于地址投毒挑战中的钱包转账模式
 */
const WalletTransferChallenge = ({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('map'); // 'map' | 'intro' | 'wallet' | 'transfer'
  const [activeTab, setActiveTab] = useState('metamask'); // 'metamask'
  const [metamaskView, setMetamaskView] = useState('wallet'); // 'wallet' | 'send' | 'transfer'
  const [addressInput, setAddressInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(config?.wallet?.defaultNetwork || 'ethereum');
  const [selectedAsset, setSelectedAsset] = useState(config?.wallet?.defaultAsset || 'eth');
  const [showResult, setShowResult] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState('chinese');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showFullRecipientAddress, setShowFullRecipientAddress] = useState(false);
  const [showFullHistoryAddress, setShowFullHistoryAddress] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null); // 记录哪个地址被复制了
  const [timeRemaining, setTimeRemaining] = useState(config?.timeLimit || null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // 每页显示5条交易记录
  const [showFullReceiptAddress, setShowFullReceiptAddress] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  const [confirmAddress, setConfirmAddress] = useState('');
  const [showItemReminder, setShowItemReminder] = useState(false); // 显示道具提醒
  const [openBackpack, setOpenBackpack] = useState(false); // 控制打开背包
  
  const networkDropdownRef = useRef(null);
  const assetDropdownRef = useRef(null);

  // 初始化：路由变化时重置状态
  useEffect(() => {
    setView('map');
    setActiveTab('metamask');
    setMetamaskView('wallet');
    setShowResult(false);
    setAddressInput('');
    setAmountInput('');
    setSelectedNetwork(config?.wallet?.defaultNetwork || 'ethereum');
    setSelectedAsset(config?.wallet?.defaultAsset || 'eth');
    setErrorMessage('');
    setIsTimedOut(false);
    setTimeRemaining(config?.timeLimit || null);
    setCurrentPage(1);
    setCopiedIndex(null);
    setShowReceipt(false);
    setShowConfirmScreen(false);
    setConfirmAddress('');
    setShowItemReminder(false);
    setOpenBackpack(false);
  }, [location.pathname, config]);

  // 处理下一关导航
  const handleNextLevel = () => {
    if (config?.nextLevel) {
      const phase = config.nextLevel.split('-')[0];
      navigate(`/challenge/${phase}/${config.nextLevel}`);
    }
  };

  // 处理 roadmap 点击
  const handleStartLevel = (stepId) => {
    if (stepId === 'transfer') setView('intro');
  };

  // Roadmap 步骤配置
  const roadmapSteps = [
    { id: 'search', iconType: 'search', status: 'completed', title: { chinese: '下載錢包', english: 'Download Wallet' } },
    { id: 'create', iconType: 'create', status: 'completed', title: { chinese: '創建錢包', english: 'Create Wallet' } },
    { id: 'deposit', iconType: 'deposit', status: 'completed', title: { chinese: '首次入金', english: 'First Deposit' } },
    { id: 'transfer', iconType: 'transfer', status: 'current', title: { chinese: '轉賬', english: 'Transfer' } },
    { id: 'cex', iconType: 'cex', status: 'locked', title: { chinese: '中心化平台判別', english: 'CEX Check' } },
    { id: 'dex', iconType: 'dex', status: 'locked', title: { chinese: '去中心化平台判別', english: 'DEX Check' } }
  ];

  // 地址格式化函数：显示首6位 + ... + 尾6位
  const formatAddress = (address, showFull = false) => {
    if (!address || address.length <= 14 || showFull) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // 复制地址到剪贴板
  const handleCopyAddress = async (address, index) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedIndex(index);
      // 2秒后清除复制状态
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = address;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => {
          setCopiedIndex(null);
        }, 2000);
      } catch (err) {
        console.error('降级复制也失败:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target)) {
        setShowNetworkDropdown(false);
      }
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(event.target)) {
        setShowAssetDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 倒计时功能
  useEffect(() => {
    if (config.timeLimit && timeRemaining > 0 && !showResult) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimedOut(true);
            setIsCorrect(false);
            setErrorMessage(language === 'chinese' ? '時間已到！' : 'Time is up!');
            setShowResult(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [config.timeLimit, timeRemaining, showResult, language]);

  // 格式化时间显示（分:秒）
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!config) {
    return (
      <div className="text-white text-center p-8">
        <h1 className="text-2xl">挑战配置未找到</h1>
      </div>
    );
  }

  const currentContent = config.content[language];
  const introData = config?.intro?.[language];

  // 处理发送按钮点击 - 进入发送代币选择界面
  const handleOpenSend = () => {
    setActiveTab('metamask');
    setMetamaskView('send');
    setShowReceipt(false);
  };

  // 处理选择代币 - 进入转账界面
  const handleSelectToken = () => {
    setMetamaskView('transfer');
  };

  // 渲染 Tabs
  const renderTabs = () => {
    const getTabStyle = (tabId) => {
      const isActive = activeTab === tabId;
      return `
        group relative flex items-center gap-2 px-3 py-2 pr-4
        max-w-[200px] h-[36px] mt-2
        rounded-t-lg cursor-pointer select-none transition-all
        ${isActive 
          ? 'bg-white text-[#1f1f1f] shadow-[0_0_5px_rgba(0,0,0,0.1)] z-10' 
          : 'bg-transparent text-[#474747] hover:bg-[#dee1e6]' 
        }
      `;
    };

    return (
      <div className="flex items-end h-full px-2 gap-1 bg-[#dfe1e5] pt-1 border-b border-[#dfe1e5] relative z-50">
        <div onClick={() => setActiveTab('metamask')} className={getTabStyle('metamask')}>
          <img src={MetaMaskFox} className="w-4 h-4 object-contain" alt="MetaMask" />
          <span className="text-xs font-medium truncate">
            {language === 'chinese' ? 'MetaMask - metamask.io' : 'MetaMask - metamask.io'}
          </span>
        </div>
      </div>
    );
  };

  // 渲染 MetaMask 钱包页面
  const renderWalletPage = () => {
    const walletContent = {
      chinese: {
        account: '帳戶 1',
        balance: 'US$2,460.30',
        balanceChange: '+$2,460.30 (+100.00%)',
        buy: '買入',
        exchange: '兌換',
        send: '發送',
        receive: '接收',
        tokens: '代幣',
        perpetual: '永續合約',
        defi: '去中心化金融',
        collectibles: '收藏品',
        ethereum: 'Ethereum',
        ethBalance: '0.8201 ETH',
        earn: '賺取',
        earnRate: '2.1%',
        usdValue: 'US$2,460.30',
        dailyChange: '+2.18%',
        sendMessage: '向朋友轉帳，開始您的 Web3 交易',
        sendBtn: '充值'
      },
      english: {
        account: 'Account 1',
        balance: 'US$2,460.30',
        balanceChange: '+$2,460 (+100.00%)',
        buy: 'Buy',
        exchange: 'Swap',
        send: 'Send',
        receive: 'Receive',
        tokens: 'Tokens',
        perpetual: 'Perpetual',
        defi: 'DeFi',
        collectibles: 'Collectibles',
        ethereum: 'Ethereum',
        ethBalance: '0.8201 ETH',
        earn: 'Earn',
        earnRate: '2.1%',
        usdValue: 'US$2,460.30',
        dailyChange: '+2.18%',
        sendMessage: 'Send to friends, start your Web3 transactions',
        sendBtn: 'Top Up'
      }
    };

    const wallet = walletContent[language];

    return (
      <div className="w-full bg-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">{wallet.account}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div className="w-8 h-8 flex items-center justify-center relative">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="px-4 py-6">
          <div className="text-4xl font-bold text-gray-900 mb-1">{wallet.balance}</div>
          <div className="text-sm text-gray-600">{wallet.balanceChange}</div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-6 grid grid-cols-4 gap-4">
          {/* Buy Button */}
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">{wallet.buy}</span>
          </button>
          
          {/* Exchange Button */}
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">{wallet.exchange}</span>
          </button>
          
          {/* Send Button */}
          <button 
            onClick={handleOpenSend}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">{wallet.send}</span>
          </button>
          
          {/* Receive Button */}
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">{wallet.receive}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 border-b border-gray-200 flex gap-6">
          <div className="pb-3 border-b-2 border-purple-600">
            <span className="text-sm font-semibold text-purple-600">{wallet.tokens}</span>
          </div>
          <div className="pb-3">
            <span className="text-sm font-medium text-gray-600">{wallet.perpetual}</span>
          </div>
          <div className="pb-3">
            <span className="text-sm font-medium text-gray-600">{wallet.defi}</span>
          </div>
          <div className="pb-3">
            <span className="text-sm font-medium text-gray-600">{wallet.collectibles}</span>
          </div>
        </div>

        {/* Asset Filter */}
        <div className="px-4 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <img src={EthereumIcon} alt="Ethereum" className="w-5 h-5" />
            <span className="text-sm font-medium text-gray-900">{wallet.ethereum}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ethereum Asset */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <img src={EthereumIcon} alt="Ethereum" className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{wallet.ethereum}</div>
              <div className="text-sm text-gray-600">{wallet.ethBalance}</div>
              <div className="text-xs text-blue-600">{wallet.earn} {wallet.earnRate}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">{wallet.usdValue}</div>
            <div className="text-sm text-green-600">{wallet.dailyChange}</div>
          </div>
        </div>

        {/* Separator */}
        <div className="px-4 pt-0 pb-0">
          <div className="border-t border-gray-300"></div>
        </div>

        {/* Send Section - 放在卡片外，独立容器 */}
        <div className="w-full px-4 pb-8 text-center" style={{ paddingTop: '3rem' }}>
          <p className="text-gray-600 mb-8">{wallet.sendMessage}</p>
          <button
          // 此按鈕僅作為提示文案展示「充值」，不再跳轉到轉帳/發送介面
          type="button"
            className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
            }}
          >
            {wallet.sendBtn}
          </button>
        </div>
      </div>
    );
  };

  // 渲染发送代币选择页面
  const renderSendPage = () => {
    const sendContent = {
      chinese: {
        title: '發送',
        searchPlaceholder: '搜索代幣和 NFT',
        tokens: '代幣',
        ethereum: 'Ethereum',
        eth: 'ETH',
        balance: '0.8201 ETH',
        usdValue: 'US$2,460.30'
      },
      english: {
        title: 'Send',
        searchPlaceholder: 'Search tokens and NFTs',
        tokens: 'Tokens',
        ethereum: 'Ethereum',
        eth: 'ETH',
        balance: '0.8201 ETH',
        usdValue: 'US$2,460.30'
      }
    };

    const send = sendContent[language];

    return (
      <div className="w-full h-full bg-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{send.title}</h1>
          <button
            onClick={() => setMetamaskView('wallet')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder={send.searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-sm text-gray-500"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            />
          </div>
        </div>

        {/* Tokens Section */}
        <div className="px-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">{send.tokens}</div>
          
          {/* Ethereum Token */}
          <button
            onClick={handleSelectToken}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {/* Token Icon - Ethereum logo with Solana overlay */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center overflow-hidden">
                <img src={EthereumIcon} alt="Ethereum" className="w-10 h-10 object-contain" />
              </div>
              {/* Solana overlay icon */}
              <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded bg-purple-600 flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-bold">S</span>
              </div>
            </div>
            
            {/* Token Info */}
            <div className="flex-1 text-left">
              <div className="text-base font-semibold text-gray-900">{send.ethereum}</div>
              <div className="text-sm text-gray-600">{send.eth}</div>
            </div>
            
            {/* Balance */}
            <div className="text-right">
              <div className="text-base font-semibold text-gray-900">{send.usdValue}</div>
              <div className="text-sm text-gray-600">{send.balance}</div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // 渲染转账键盘页面（精简版）
  const renderTransferPage = () => {
    const asset = config.assets.find((a) => a.id === selectedAsset);
    const available = asset ? parseFloat(asset.balance) || 0 : 0;
    const parsedAmount = parseFloat(amountInput);
    const isValidNumber = !Number.isNaN(parsedAmount) && parsedAmount > 0;
    const exceeds = isValidNumber && parsedAmount > available;
    const isValid = isValidNumber && !exceeds;
    const percentOptions = [
      { label: '25%', value: 0.25*0.8201 },
      { label: '50%', value: 0.5*0.8201 },
      { label: '75%', value: 0.75*0.8201 },
      { label: 'Max', value: 1*0.8201 }
    ];

    const handlePercent = (ratio) => {
      const val = (available * ratio).toFixed(4).replace(/\.?0+$/, '');
      setAmountInput(val);
    };

    const handleKeyPress = (key) => {
      if (key === 'backspace') {
        setAmountInput((prev) => prev.slice(0, -1));
        return;
      }
      if (key === '.' && amountInput.includes('.')) return;
      setAmountInput((prev) => (prev === '0' && key !== '.' ? key : `${prev}${key}`));
    };

    const percentClass = (ratio) => {
      const val = available * ratio;
      const isActive = Math.abs(val - parsedAmount) < 1e-6;
      return `flex-1 py-3 rounded-xl text-sm font-semibold border ${
        isActive && isValid
          ? 'bg-black text-white border-black'
          : 'bg-white text-[#111827] border-[#d1d5db]'
      }`;
    };

    const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

    // 確認頁（按「查看」後展示，類似審核畫面）
    if (showConfirmScreen) {
      const amountDisplay = amountInput && !Number.isNaN(parseFloat(amountInput)) && parseFloat(amountInput) > 0
        ? parseFloat(amountInput).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
        : '0.006';
      const maskAddr = (addr) => {
        if (!addr) return '0x____...____';
        if (showFullReceiptAddress) return addr;
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
      };
      const maskedAddr = maskAddr(confirmAddress);

      return (
        <div className="w-full h-full bg-[#f4f6fb] flex flex-col" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div className="flex items-center px-4 py-3 text-lg font-semibold text-[#111827]">
            <button type="button" className="text-2xl mr-3" onClick={() => setShowConfirmScreen(false)}>‹</button>
            <span className="flex-1 text-center">{language === 'chinese' ? '審核' : 'Review'}</span>
            <div className="w-6" />
          </div>

          <div className="flex flex-col items-center mt-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-[#eef1f7] flex items-center justify-center mb-3">
              <img src={EthereumIcon} alt="ETH" className="w-16 h-16 object-contain" />
            </div>
            <div className="text-4xl font-bold text-[#111827] tracking-tight">{amountDisplay} ETH</div>
            <div className="text-base text-gray-400 mt-1">$0.8201</div>
          </div>

          <div className="space-y-3 px-4">
            {/* Account row */}
            <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center">A1</div>
                <span className="text-base font-semibold text-gray-800">Account 1 to</span>
              </div>
              <div className="text-sm text-gray-500">{maskedAddr}</div>
            </div>

            {/* To (recipient) row */}
            <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between px-4 py-4">
              <span className="text-base font-semibold text-gray-800">{language === 'chinese' ? '收款人' : 'To'}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{maskedAddr}</span>
                <button
                  type="button"
                  onClick={() => setShowFullReceiptAddress((prev) => !prev)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{
                    border: '2px solid #0066ff',
                    color: '#0066ff',
                    backgroundColor: showFullReceiptAddress ? '#e6f2ff' : '#f0f7ff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#cce5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = showFullReceiptAddress ? '#e6f2ff' : '#f0f7ff';
                  }}
                  title={showFullReceiptAddress ? (language === 'chinese' ? '隱藏地址' : 'Hide address') : (language === 'chinese' ? '顯示完整地址' : 'Show full address')}
                >
                  {showFullReceiptAddress ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="3" style={{ display: 'block' }}>
                      <path d="M3 3l14 14" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5a10.523 10.523 0 001.47 2.615" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.228 6.228A10.45 10.45 0 0110 5.5c3.756 0 6.774 2.162 8.066 5.5a10.523 10.523 0 01-1.238 2.28" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.73 12.73A3 3 0 017.27 7.27" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="3" style={{ display: 'block' }}>
                      <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5C3.226 14.338 6.244 16.5 10 16.5c3.756 0 6.774-2.162 8.066-5.5C16.774 7.662 13.756 5.5 10 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Network */}
            <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between px-4 py-4">
              <span className="text-base font-semibold text-gray-800">{language === 'chinese' ? '網絡' : 'Network'}</span>
              <div className="flex items-center gap-2">
                <img src={EthereumIcon} alt="Ethereum" className="w-6 h-6" />
                <span className="text-base font-semibold text-gray-800">Ethereum</span>
              </div>
            </div>

            {/* spacing between Network and Fee */}
            <div className="h-3" />

            {/* Network fee */}
            <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-base font-semibold text-gray-800">
                  <span>{language === 'chinese' ? '網絡費' : 'Network Fee'}</span>
                </div>
                <div className="flex items-center gap-1 text-base font-semibold text-gray-800">
                  <span>0</span>
                  <span>ETH</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span role="img" aria-label="fox">🦊</span>
                  <span>{language === 'chinese' ? '市場型 ~12 秒' : 'Market ~12 sec'}</span>
                </div>
              </div>
            </div>

            {/* spacing between Fee and Advanced */}
            <div className="h-3" />

            {/* Advanced info */}
            <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800">{language === 'chinese' ? '高級信息' : 'Advanced'}</span>
              <span className="text-xl text-gray-400">›</span>
            </div>
          </div>

          <div className="flex-1" />

          <div className="px-4 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmScreen(false)}
              className="flex-1 py-3 rounded-xl text-base font-bold text-[#111111] hover:brightness-105"
              style={{ backgroundColor: '#f2f3f7' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f2f3f7'; }}
            >
              {language === 'chinese' ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => {
                const targetAddr = '0x1a2b3c4d5e6f781012345978901234567890abcb';
                const addrOk = confirmAddress.trim().toLowerCase() === targetAddr;
                const amtNum = parseFloat(amountInput);
                const amountOk = !Number.isNaN(amtNum) && Math.abs(amtNum - 0.25) < 1e-6;
                const success = addrOk && amountOk;
                setIsCorrect(success);
                setErrorMessage(
                  success
                    ? ''
                    : (language === 'chinese'
                      ? '鏈上交易公開可查，請仔細核對地址與金額，提防相似地址誘導。'
                      : 'On-chain transactions are public. Double-check address and amount; beware lookalike-address scams.')
                );
                setShowConfirmScreen(false);
                setShowReceipt(false);
                setShowResult(true);
              }}
              className="flex-1 py-3 rounded-xl text-base font-bold text-white hover:brightness-110"
              style={{ backgroundColor: '#000000' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#111111'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
            >
              {language === 'chinese' ? '確認' : 'Confirm'}
            </button>
          </div>
        </div>
      );
    }

    // 成功後的回執頁（參考提供截圖）
    if (showReceipt) {
      const ts = new Date();
      const hh = ts.getHours().toString().padStart(2, '0');
      const mm = ts.getMinutes().toString().padStart(2, '0');
      const timestamp = `${hh}:${mm}`;
      // 記錄顯示金額固定為 0.0001 ETH（與實際輸入無關）
      const fixedRecordAmount = 0.0001;
      const displayAmount = fixedRecordAmount.toFixed(4);
      const gasFee = 0.0005;
      const totalValue = fixedRecordAmount + gasFee;
      const displayAddress = addressInput || config?.recipient?.address || '';
      const senderName = 'Ryan';
      const senderInitial = senderName?.[0]?.toUpperCase() || 'R';
      const symbol = asset?.symbol?.toUpperCase() || 'ETH';
      const fromAddr = '0x1a2b3c4d5e6f789012345678901234567890abcd';
      const toAddr = '0x742d35Cc6634C0532925a3b8D4C9Fb2f2e2f0891';

      const maskAddr = (addr) => {
        if (!addr) return '';
        if (showFullReceiptAddress) return addr;
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
      };

      const handleCopyReceipt = async (addr) => {
        try {
          await navigator.clipboard.writeText(addr || '');
          setCopiedReceipt(true);
          setTimeout(() => setCopiedReceipt(false), 1500);
        } catch (err) {
          console.error('copy failed', err);
        }
      };

      const extraRecords = [
        {
          fromName: language === 'chinese' ? 'Ryan' : 'Ryan',
          fromAddr: '0x742d35Cc6634C0532925a3b8D4C9Fb2f2e2f0891',
          toName: 'Ryan',
          toAddr: '0x1a2b3c4d5e6f781012345978901234567890abcb',
          amount: '0.3000',
          gas: '0.0006',
          total: '0.3006',
          timestamp
        },
        {
          fromName: 'Susan',
          fromAddr: '0x8fE13D8D3b2158431d3eE3F1C872e7a1a1b8c9D2',
          toName: 'Ryan',
          toAddr: '0x742d35Cc6634C0532925a3b8D4C9Fb2f2e2f0891',
          amount: '0.1200',
          gas: '0.0005',
          total: '0.1205',
          timestamp
        }
      ];

      const targetAddr = '0x1a2b3c4d5e6f781012345978901234567890abcb';
      const targetAmount = 0.25;

      return (
        <div
          className="w-full h-full bg-white flex flex-col"
          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          {/* 頂部導航 */}
          <div className="flex items-center justify-between px-5 pt-4 pb-4 text-[#111827]">
            <button type="button" className="text-2xl" onClick={() => setShowReceipt(false)}>‹</button>
            <div className="text-lg font-bold">{language === 'chinese' ? '發送' : 'Send'}</div>
            <button type="button" className="text-2xl" onClick={() => { setShowReceipt(false); setMetamaskView('wallet'); }}>×</button>
          </div>

          {/* 地址列 */}
          <div className="px-4 pb-4">
            <div className="flex items-center border border-[#dcdfe6] rounded-xl px-3 py-3 bg-white shadow-sm">
              <span className="text-gray-500 mr-2">{language === 'chinese' ? '至' : 'To'}</span>
              <input
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                }}
                placeholder={language === 'chinese' ? '輸入接收地址' : 'Enter address'}
              />
              <button
                type="button"
                onClick={async () => {
                  // 若已有文字則清空
                  if (addressInput && addressInput.length > 0) {
                    setAddressInput('');
                    return;
                  }
                  // 否則嘗試貼上剪貼簿
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setAddressInput(text);
                  } catch (err) {
                    console.error('paste failed', err);
                  }
                }}
                className="ml-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-[#f5f7fa] text-gray-700 border border-[#e5e7eb]"
              >
                {addressInput ? (language === 'chinese' ? '清空' : 'Clear') : (language === 'chinese' ? '粘貼' : 'Paste')}
              </button>
            </div>
            {addressInput && (
              <div className="mt-2">
                <button
                  type="button"
                  className="w-full py-3 rounded-xl text-sm font-bold shadow-md hover:brightness-110"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none'
                  }}
                  onClick={() => {
                    setConfirmAddress(addressInput);
                    setShowConfirmScreen(true);
                  }}
                >
                  {language === 'chinese' ? '查看' : 'View'}
                </button>
              </div>
            )}
          </div>

          {/* 與下方卡片拉開距離 */}
          <div className="h-6" />

          {/* 交易卡片 */}
          <div className="px-4">
            <div className="border border-[#e5e7eb] rounded-2xl shadow-sm bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-200 flex items-center justify-center">
                    <img src={MetaMaskFox} alt="MetaMask" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">MetaMask {language === 'chinese' ? '交易' : 'Transaction'}</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900">{displayAmount} {symbol}</div>
                  <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                    <span>{language === 'chinese' ? '已確認' : 'Confirmed'}</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#f1f2f5]" />

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center">
                    {senderInitial}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm text-gray-500">{language === 'chinese' ? '來自' : 'From'}</span>
                    <span className="text-sm font-semibold text-gray-800">{senderName}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{timestamp}</div>
              </div>

              <div className="border-t border-[#f1f2f5]" />

              {/* 地址區塊 */}
              <div className="px-4 py-3 space-y-2 text-sm text-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                  <span className="text-gray-500">{language === 'chinese' ? 'From' : 'From'}</span>
                  <span className="font-mono font-semibold">{maskAddr(fromAddr)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                    onClick={() => handleCopyReceipt(fromAddr)}
                    title={language === 'chinese' ? '複製完整地址' : 'Copy full address'}
                    className="p-2 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                    >
                      {/* copy icon */}
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#2563eb" strokeWidth="1.5">
                        <rect x="6" y="6" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 4h10v10" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="sr-only">{language === 'chinese' ? '複製' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFullReceiptAddress((prev) => !prev)}
                      title={showFullReceiptAddress ? (language === 'chinese' ? '隱藏地址' : 'Hide address') : (language === 'chinese' ? '顯示完整地址' : 'Show full address')}
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{
                        border: '2px solid #0066ff',
                        color: '#0066ff',
                        backgroundColor: showFullReceiptAddress ? '#e6f2ff' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#cce5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = showFullReceiptAddress ? '#e6f2ff' : 'transparent';
                      }}
                    >
                      {/* eye / eye-off icon */}
                      {showFullReceiptAddress ? (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                          <path d="M3 3l14 14" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5a10.523 10.523 0 001.47 2.615" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.228 6.228A10.45 10.45 0 0110 5.5c3.756 0 6.774 2.162 8.066 5.5a10.523 10.523 0 01-1.238 2.28" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12.73 12.73A3 3 0 017.27 7.27" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                          <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5C3.226 14.338 6.244 16.5 10 16.5c3.756 0 6.774-2.162 8.066-5.5C16.774 7.662 13.756 5.5 10 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <span className="sr-only">{language === 'chinese' ? '顯示/隱藏' : 'Show/Hide'}</span>
                    </button>
                    {copiedReceipt && (
                      <span className="text-xs text-green-500 ml-1">
                        {language === 'chinese' ? '已複製' : 'Copied'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{language === 'chinese' ? 'To' : 'To'}</span>
                    <span className="font-mono font-semibold">{maskAddr(toAddr)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyReceipt(toAddr)}
                      title={language === 'chinese' ? '複製完整地址' : 'Copy full address'}
                      className="p-2 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                    >
                      {/* copy icon */}
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#2563eb" strokeWidth="1.5">
                        <rect x="6" y="6" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 4h10v10" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="sr-only">{language === 'chinese' ? '複製' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFullReceiptAddress((prev) => !prev)}
                      title={showFullReceiptAddress ? (language === 'chinese' ? '隱藏地址' : 'Hide address') : (language === 'chinese' ? '顯示完整地址' : 'Show full address')}
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{
                        border: '2px solid #0066ff',
                        color: '#0066ff',
                        backgroundColor: showFullReceiptAddress ? '#e6f2ff' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#cce5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = showFullReceiptAddress ? '#e6f2ff' : 'transparent';
                      }}
                    >
                      {/* eye / eye-off icon */}
                      {showFullReceiptAddress ? (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                          <path d="M3 3l14 14" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5a10.523 10.523 0 001.47 2.615" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.228 6.228A10.45 10.45 0 0110 5.5c3.756 0 6.774 2.162 8.066 5.5a10.523 10.523 0 01-1.238 2.28" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12.73 12.73A3 3 0 017.27 7.27" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                          <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5C3.226 14.338 6.244 16.5 10 16.5c3.756 0 6.774-2.162 8.066-5.5C16.774 7.662 13.756 5.5 10 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <span className="sr-only">{language === 'chinese' ? '顯示/隱藏' : 'Show/Hide'}</span>
                    </button>
                    {copiedReceipt && (
                      <span className="text-xs text-green-500 ml-1">
                        {language === 'chinese' ? '已複製' : 'Copied'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#f1f2f5]" />

              <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-800">
                <span>{language === 'chinese' ? '燃氣費' : 'Gas Fee'}</span>
                <span>{gasFee.toFixed(4)} {symbol}</span>
              </div>

              <div className="border-t border-[#f1f2f5]" />

              <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-900 font-bold">
                <span>{language === 'chinese' ? '總計' : 'Total'}</span>
                <span>{totalValue.toFixed(4)} {symbol}</span>
              </div>
            </div>
          </div>

          {/* 拉開主記錄與列表距離 */}
          <div className="h-6" />

          {/* 其他紀錄列表 */}
          <div className="px-4 mt-2">
            {extraRecords.map((rec, idx) => (
              <React.Fragment key={idx}>
                <div className="border border-[#e5e7eb] rounded-2xl shadow-sm bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center">
                        {rec.fromName?.[0]?.toUpperCase() || 'U'}
                      </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-gray-500">{language === 'chinese' ? '來自' : 'From'}</span>
                      <span className="text-sm font-semibold text-gray-800">{rec.fromName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-900">{rec.amount} {symbol}</div>
                    <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                      <span>{language === 'chinese' ? '已確認' : 'Confirmed'}</span>
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    </div>
                    <div className="text-[11px] text-gray-400">{rec.timestamp}</div>
                  </div>
                </div>

                  <div className="text-sm text-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{language === 'chinese' ? 'From' : 'From'}</span>
                        <span className="font-mono font-semibold">{maskAddr(rec.fromAddr)}</span>
                      </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(rec.fromAddr);
                            setCopiedReceipt(true);
                            setTimeout(() => setCopiedReceipt(false), 1200);
                          } catch (err) {
                            console.error('copy failed', err);
                          }
                        }}
                        title={language === 'chinese' ? '複製完整地址' : 'Copy full address'}
                        className="p-2 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#2563eb" strokeWidth="1.5">
                          <rect x="6" y="6" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 4h10v10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFullReceiptAddress((prev) => !prev)}
                        title={showFullReceiptAddress ? (language === 'chinese' ? '隱藏地址' : 'Hide address') : (language === 'chinese' ? '顯示完整地址' : 'Show full address')}
                        className="p-2 rounded-full flex items-center justify-center"
                        style={{
                          border: '2px solid #0066ff',
                          color: '#0066ff',
                          backgroundColor: showFullReceiptAddress ? '#e6f2ff' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#cce5ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = showFullReceiptAddress ? '#e6f2ff' : 'transparent';
                        }}
                      >
                        {showFullReceiptAddress ? (
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                            <path d="M3 3l14 14" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5a10.523 10.523 0 001.47 2.615" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.228 6.228A10.45 10.45 0 0110 5.5c3.756 0 6.774 2.162 8.066 5.5a10.523 10.523 0 01-1.238 2.28" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12.73 12.73A3 3 0 017.27 7.27" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                            <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5C3.226 14.338 6.244 16.5 10 16.5c3.756 0 6.774-2.162 8.066-5.5C16.774 7.662 13.756 5.5 10 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      {copiedReceipt && (
                        <span className="text-[11px] text-green-500">
                          {language === 'chinese' ? '已複製' : 'Copied'}
                        </span>
                      )}
                    </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{language === 'chinese' ? 'To' : 'To'}</span>
                        <span className="font-mono font-semibold">{maskAddr(rec.toAddr)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(rec.toAddr);
                              setCopiedReceipt(true);
                              setTimeout(() => setCopiedReceipt(false), 1200);
                            } catch (err) {
                              console.error('copy failed', err);
                            }
                          }}
                          title={language === 'chinese' ? '複製完整地址' : 'Copy full address'}
                          className="p-2 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#2563eb" strokeWidth="1.5">
                            <rect x="6" y="6" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 4h10v10" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFullReceiptAddress((prev) => !prev)}
                          title={showFullReceiptAddress ? (language === 'chinese' ? '隱藏地址' : 'Hide address') : (language === 'chinese' ? '顯示完整地址' : 'Show full address')}
                          className="p-2 rounded-full flex items-center justify-center"
                          style={{
                            border: '2px solid #0066ff',
                            color: '#0066ff',
                            backgroundColor: showFullReceiptAddress ? '#e6f2ff' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#cce5ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = showFullReceiptAddress ? '#e6f2ff' : 'transparent';
                          }}
                        >
                          {showFullReceiptAddress ? (
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                              <path d="M3 3l14 14" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5a10.523 10.523 0 001.47 2.615" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.228 6.228A10.45 10.45 0 0110 5.5c3.756 0 6.774 2.162 8.066 5.5a10.523 10.523 0 01-1.238 2.28" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12.73 12.73A3 3 0 017.27 7.27" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#0066ff" strokeWidth="2">
                              <path d="M10 5.5c-3.756 0-6.774 2.162-8.066 5.5C3.226 14.338 6.244 16.5 10 16.5c3.756 0 6.774-2.162 8.066-5.5C16.774 7.662 13.756 5.5 10 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                        {copiedReceipt && (
                          <span className="text-[11px] text-green-500">
                            {language === 'chinese' ? '已複製' : 'Copied'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[13px] text-gray-700">
                      <span>{language === 'chinese' ? '燃氣費' : 'Gas Fee'}</span>
                      <span>{rec.gas} {symbol}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] text-gray-900 font-semibold">
                      <span>{language === 'chinese' ? '總計' : 'Total'}</span>
                      <span>{rec.total} {symbol}</span>
                    </div>
                  </div>
                </div>
                {idx < extraRecords.length - 1 && <div className="h-4" />}
              </React.Fragment>
            ))}
          </div>

          {/* 完成並驗證 */}
          <div className="px-4 py-5">
            <button
              type="button"
              className="w-full py-4 rounded-xl text-base font-bold bg-black text-white hover:bg-[#111]"
              onClick={() => {
                const addrOk = (addressInput || '').trim().toLowerCase() === targetAddr;
                const amtNum = parseFloat(amountInput);
                const amountOk = !Number.isNaN(amtNum) && Math.abs(amtNum - targetAmount) < 1e-6;
                const success = addrOk && amountOk;
                setIsCorrect(success);
                setErrorMessage(
                  success
                    ? ''
                    : (language === 'chinese'
                      ? '鏈上交易公開可查，請仔細核對地址與金額，提防相似地址誘導。'
                      : 'On-chain transactions are public. Double-check address and amount; beware lookalike-address scams.')
                );
                setShowReceipt(false);
                setShowResult(true);
              }}
            >
              {language === 'chinese' ? '完成' : 'Finish'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="w-full h-full bg-white flex flex-col"
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* 頂部：返回 / 關閉 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-6 text-[#111827]">
          <button
            type="button"
            onClick={() => setMetamaskView('send')}
            className="text-2xl"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setMetamaskView('wallet')}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-400 tracking-tight mb-3">
            {amountInput && amountInput !== '0' ? amountInput : '0'} ETH
          </div>
          <div className="text-base text-gray-500">
            0.8201 ETH {language === 'chinese' ? '可用' : 'available'}
          </div>
          {!isValid && amountInput && (
            <div className="mt-3 text-sm text-red-500">
              {exceeds
                ? language === 'chinese' ? '金額超過可用餘額' : 'Amount exceeds balance'
                : language === 'chinese' ? '金額格式錯誤' : 'Invalid amount'}
            </div>
          )}
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* 發送標題放在 percent 上方中央 */}
          <div className="text-center text-sm font-semibold text-gray-500">
           
          </div>

          <div className="flex gap-2">
            {percentOptions.map((p) => (
              <button key={p.label} type="button" className={percentClass(p.value)} onClick={() => handlePercent(p.value)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {keypad.map((key) => (
              <button
                key={key}
                type="button"
                className="py-4 rounded-xl bg-[#f1f2f5] text-2xl font-semibold text-[#111827]"
                onClick={() => handleKeyPress(key)}
              >
                {key === 'backspace' ? '⌫' : key}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!isValid}
            className={`w-full py-4 rounded-xl text-base font-bold mt-2 bg-black text-white ${
              isValid
                ? 'hover:bg-[#111] cursor-pointer'
                : 'cursor-not-allowed filter brightness-75'
            }`}
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
            onClick={() => {
              if (!isValid) return;
              setShowFullReceiptAddress(false); // 預設隱藏完整地址
              setShowReceipt(true);
            }}
          >
            {language === 'chinese' ? '繼續' : 'Continue'}
          </button>
        </div>
      </div>
    );
  };

  // 渲染浏览器内容
  const renderBrowserContent = () => {
    if (activeTab === 'metamask') {
      if (metamaskView === 'wallet') return renderWalletPage();
      if (metamaskView === 'send') return renderSendPage();
      if (metamaskView === 'transfer') return renderTransferPage();
    }
    return null;
  };

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
                  ? '建議先閱讀「Web3 轉賬指南」以了解相關知識' 
                  : 'It is recommended to read "Web3 Transfer Guide" first to understand relevant knowledge'}
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
                setOpenBackpack(true);
                setTimeout(() => setOpenBackpack(false), 100);
              }}
              className="flex-1 py-4 bg-purple-200 hover:bg-purple-300 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] transform hover:scale-[1.02]"
            >
              {language === 'chinese' ? '打開背包' : 'Open Backpack'}
            </button>
            <button
              onClick={() => {
                setShowItemReminder(false);
                setView('wallet');
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
                ? '您的目標是：正確地完成轉帳操作，包括選擇正確的網絡、資產、地址和金額。' 
                : 'Your goal is to correctly complete the transfer operation, including selecting the correct network, asset, address, and amount.')}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowItemReminder(true)}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
        >
          {introData?.btn || (language === 'chinese' ? '開始轉帳' : 'Start Transfer')}
        </button>
      </div>
    </div>
  );

  const handleTransfer = () => {
    // 验证网络、资产、地址和金额
    const inputAddress = addressInput.trim().toLowerCase();
    const correctAddress = config.addresses.correct.toLowerCase();
    const inputAmount = amountInput.trim();
    const correctAmount = config.transfer.amount;
    
    let errors = [];
    
    // 检查网络
    if (config.transfer.requireNetworkSelection) {
      const networkCorrect = selectedNetwork === config.transfer.correctNetwork;
      if (!networkCorrect) {
        errors.push(language === 'chinese' ? '網絡選擇錯誤' : 'Wrong network');
      }
    }
    
    // 检查资产
    if (config.transfer.requireAssetSelection) {
      const assetCorrect = selectedAsset === config.transfer.correctAsset;
      if (!assetCorrect) {
        errors.push(language === 'chinese' ? '資產選擇錯誤' : 'Wrong asset');
      }
    }
    
    // 检查地址
    const addressCorrect = inputAddress === correctAddress;
    if (!addressCorrect) {
      errors.push(language === 'chinese' ? '地址輸入錯誤' : 'Wrong address');
    }
    
    // 检查金额
    const amountCorrect = inputAmount === correctAmount;
    if (!amountCorrect) {
      errors.push(language === 'chinese' ? '金額輸入錯誤' : 'Wrong amount');
    }
    
    const allCorrect = errors.length === 0;
    
    setIsCorrect(allCorrect);
    setErrorMessage(errors.join(', '));
    setShowResult(true);
    
    setTimeout(() => {
      console.log('轉帳驗證:', {
        network: selectedNetwork,
        asset: selectedAsset,
        address: addressInput,
        amount: amountInput,
        correct: allCorrect,
        errors
      });
    }, 1000);
  };

  // 图标映射
  const iconMap = {
    ethereum: EthereumIcon,
    arbitrum: ArbitrumIcon,
    usdt: USDTIcon,
  };

  // 通用文本
  const commonText = {
    chinese: {
      wallet: '錢包',
      balance: '餘額',
      sent: '發送',
      received: '接收',
      success: '成功',
      from: '從',
      to: '收款人',
      amount: '金額',
      amountLabel: '轉帳金額',
      amountPlaceholder: '請輸入轉帳金額',
      addressLabel: '收款地址',
      correct: '轉帳成功！',
      incorrect: '轉帳失敗！',
      correctExplanation: '恭喜！你成功完成了轉帳。所有參數都正確：網絡、資產、地址和金額。',
      incorrectExplanation: '轉帳失敗！請檢查：',
      continueButton: '繼續',
      retryButton: '重試',
      warning: '警告',
      selectNetwork: '選擇網絡',
      selectAsset: '選擇資產',
      yourInput: '你輸入的',
      shouldBe: '應該選擇',
      selected: '你選擇的',
      correctAddress: '正確地址',
      correctAmount: '正確金額',
      empty: '(空)',
      checkmark: '✓',
      crossmark: '✗',
      showFullAddress: '顯示完整地址',
      hideAddress: '隱藏地址',
      recipient: '收款人',
      benNetwork: 'Ryan使用的網路',
      layer2Solution: 'Layer 2 擴容解決方案',
      transferSettings: '轉帳設定',
      selectNetworkLabel: '選擇網路',
      mainnet: '主網',
      selectCurrency: '選擇幣種',
      availableBalance: '可用餘額',
      useAll: '使用全部',
      addressInputPlaceholder: '請輸入或貼上收款地址（0x...）',
      recentTransactions: '最近交易記錄',
      sendTo: '向',
      transfer: '轉帳',
      confirmTransfer: '確定轉帳',
    },
    english: {
      wallet: 'Wallet',
      balance: 'Balance',
      sent: 'Sent',
      received: 'Received',
      success: 'Success',
      from: 'From',
      to: 'To',
      amount: 'Amount',
      amountLabel: 'Transfer Amount',
      amountPlaceholder: 'Enter transfer amount',
      addressLabel: 'Recipient Address',
      copyFromHistory: 'Copy from History',
      correct: 'Transfer Successful!',
      incorrect: 'Transfer Failed!',
      correctExplanation: 'Congratulations! You successfully completed the transfer. All parameters are correct: network, asset, address, and amount.',
      incorrectExplanation: 'Transfer failed! Please check:',
      continueButton: 'Continue',
      retryButton: 'Retry',
      warning: 'Warning',
      warningText: 'Please verify network, asset, address, and amount carefully! Errors will result in permanent loss of assets.',
      selectNetwork: 'Select Network',
      selectAsset: 'Select Asset',
      yourInput: 'Your Input',
      shouldBe: 'Should Be',
      selected: 'You Selected',
      correctAmount: 'Correct Amount',
      checkmark: '✓',
      crossmark: '✗',
      showFullAddress: 'Show Full Address',
      hideAddress: 'Hide Address',
      recipient: 'Recipient',
      benNetwork: "Ryan's Network",
      layer2Solution: 'Layer 2 Scaling Solution',
      transferSettings: 'Transfer Settings',
      selectNetworkLabel: 'Select Network',
      mainnet: 'Mainnet',
      selectCurrency: 'Select Currency',
      availableBalance: 'Available Balance',
      useAll: 'Use All',
      addressInputPlaceholder: 'Enter or paste recipient address (0x...)',
      recentTransactions: 'Recent Transactions',
      sendTo: 'To',
      transfer: 'Transfer',
      confirmTransfer: 'Confirm Transfer',
    }
  };

  const common = commonText[language];

  // 分页逻辑
  const totalTransactions = config.wallet.transactions.length;
  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = config.wallet.transactions.slice(startIndex, endIndex);

  return (
    <ChallengeTemplate
      language={language}
      setLanguage={setLanguage}
      containerMaxWidth={view === 'map' || view === 'intro' ? "100vw" : "95vw"}
      containerMaxHeight={view === 'map' || view === 'intro' ? "100vh" : "90vh"}
      openBackpack={openBackpack}
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

      {/* 钱包视图 */}
      {view === 'wallet' && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 items-stretch">
            <div className="flex-1">
              <BrowserFrame
                url={
                  activeTab === 'metamask'
                    ? metamaskView === 'transfer'
                      ? 'metamask.io/transfer'
                      : metamaskView === 'send'
                        ? 'metamask.io/send'
                        : 'metamask.io/wallet'
                    : ''
                }
                tabs={renderTabs()}
                className="w-full h-[85vh] shadow-2xl rounded-xl overflow-hidden bg-white"
                showControls={true}
              >
                {/* 只保留錢包與發送列表畫面，完整的轉帳教學介面已按需求移除 */}
                {renderBrowserContent()}
              </BrowserFrame>
            </div>
            <div className="md:w-72 flex flex-col items-center justify-center gap-4">
              <img
                src={language === 'chinese' ? MemoCn : MemoEn}
                alt={language === 'chinese' ? '備註示意' : 'Memo reminder'}
                className="w-full max-w-xs rounded-2xl shadow-2xl object-contain bg-white"
              />
              <p className="text-xs md:text-sm text-gray-200 text-center pixel-font leading-relaxed">
                {language === 'chinese'
                  ? '留意交易備註（Memo/Tag）才不會轉錯'
                  : 'Mind the memo/tag to avoid mis-sending'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 结果显示 */}
      {view === 'wallet' && metamaskView === 'transfer' && showResult && (
        <ChallengeResultScreen
          isSuccess={isCorrect}
          title={currentContent.scenario}
          description={currentContent.scenarioText}
          successMessage={common.correct}
          failureMessage={common.incorrect}
          successExplanation={common.correctExplanation}
          failureExplanation={
            `${common.incorrectExplanation} ${
              errorMessage ||
              (language === 'chinese'
                ? '鏈上交易公開可查，請仔細核對地址與金額，提防相似地址誘導。'
                : 'On-chain transactions are public. Double-check address and amount and beware lookalike-address scams.')
            }`
          }
          successSubtitle={language === 'chinese' ? '恭喜完成任務' : 'Congratulations on completing the task'}
          retryButtonText={common.retryButton}
          checkItems={[
            // 网络检查
            ...(config.transfer.requireNetworkSelection ? [{
              label: currentContent.networkLabel || '網絡',
              value: config.networks.find(n => n.id === selectedNetwork)?.name,
              isCorrect: selectedNetwork === config.transfer.correctNetwork,
              showValue: isCorrect,
              details: selectedNetwork !== config.transfer.correctNetwork ? (
                <div>
                  <div className="mb-1">
                    <span className="text-gray-400">{common.selected}: </span>
                    <span className="font-bold text-red-400">
                      {config.networks.find(n => n.id === selectedNetwork)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">{common.shouldBe}: </span>
                    <span className="text-green-400 font-bold">
                      {config.networks.find(n => n.id === config.transfer.correctNetwork)?.name}
                    </span>
                  </div>
                </div>
              ) : null
            }] : []),
            // 资产检查
            ...(config.transfer.requireAssetSelection ? [{
              label: currentContent.assetLabel || '幣種',
              value: config.assets.find(a => a.id === selectedAsset)?.symbol,
              isCorrect: selectedAsset === config.transfer.correctAsset,
              showValue: isCorrect,
              details: selectedAsset !== config.transfer.correctAsset ? (
                <div>
                  <div className="mb-1">
                    <span className="text-gray-400">{common.selected}: </span>
                    <span className="font-bold text-red-400">
                      {config.assets.find(a => a.id === selectedAsset)?.symbol}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">{common.shouldBe}: </span>
                    <span className="text-green-400 font-bold">
                      {config.assets.find(a => a.id === config.transfer.correctAsset)?.symbol}
                    </span>
                  </div>
                </div>
              ) : null
            }] : []),
            // 地址检查
            {
              label: common.addressLabel || '收款地址',
              value: `${config.addresses.correct.slice(0, 10)}...${config.addresses.correct.slice(-8)}`,
              isCorrect: addressInput.trim().toLowerCase() === config.addresses.correct.toLowerCase(),
              showValue: isCorrect,
              details: addressInput.trim().toLowerCase() !== config.addresses.correct.toLowerCase() ? (
                <div>
                  <div className="mb-2">
                    <span className="text-gray-400">{common.yourInput}:</span>
                    <div className="mt-1 text-xs bg-gray-800/50 p-2 rounded border border-gray-700 break-all font-mono">
                      {addressInput || '(空)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">{common.shouldBe}: </span>
                    <div className="mt-1 text-xs bg-gray-800/50 p-2 rounded border border-green-700 break-all font-mono text-green-400">
                      {config.addresses.correct}
                    </div>
                  </div>
                </div>
              ) : null
            },
            // 金额检查
            {
              label: common.amountLabel || '轉帳金額',
              value: `${config.transfer.amount} ${config.transfer.currency}`,
              isCorrect: amountInput === config.transfer.amount,
              showValue: isCorrect,
              details: amountInput !== config.transfer.amount ? (
                <div>
                  <div className="mb-1">
                    <span className="text-gray-400">{common.yourInput}: </span>
                    <span className="font-bold text-red-400">
                      {amountInput || '(空)'} {config.transfer.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">{common.shouldBe}: </span>
                    <span className="text-green-400 font-bold">
                      {config.transfer.amount} {config.transfer.currency}
                    </span>
                  </div>
                </div>
              ) : null
            }
          ]}
          onRetry={null}
          onNextLevel={config?.nextLevel ? handleNextLevel : handleNextLevel}
          nextLevelButtonText={language === 'chinese' ? '下一關' : 'Next Level'}
        />
      )}
    </ChallengeTemplate>
  );
};

export default WalletTransferChallenge;

