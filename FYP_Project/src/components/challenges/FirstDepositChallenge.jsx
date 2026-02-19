import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useAttemptTracking } from '../../hooks/useAttemptTracking';
import BrowserFrame from './BrowserFrame';
import ChallengeTemplate from './ChallengeTemplate';
import ChallengeResultScreen from './ChallengeResultScreen';
import PhaseRoadmap from '../PhaseRoadmap';
import EthereumIcon from '../../assets/Ethereum.png';
import MetaMaskFox from '../../assets/MetaMask_Fox.png';
import DiscordFavicon from '../../assets/Discordicon.png';
import DiscordPicture1 from '../../assets/DiscordPicture1.jpg';
import RichBankImage from '../../assets/Richbank.png';
import ASDTImage from '../../assets/ASDT.png';
import CreditCardImage from '../../assets/creditcard.png';
import BNBIcon from '../../assets/BNB.png';
import USDTIcon from '../../assets/USDT.png';
import SolanaIcon from '../../assets/Solana.png';

const FirstDepositChallenge = ({ config, language: propLanguage }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getPhaseByScenarioCode, completeScenarioAndUnlockNext } = useGame();
  const { startTracking, recordStageError } = useAttemptTracking(config?.id);
  const [language, setLanguage] = useState(propLanguage || 'chinese');
  const [view, setView] = useState('intro');
  const [activeTab, setActiveTab] = useState('discord');
  const [discordView, setDiscordView] = useState('chat');      // 'chat' | 'richbank'
  const [metamaskView, setMetamaskView] = useState('wallet');  // 'wallet' | 'topup' | 'buy'
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(3000);
  const [showQuote, setShowQuote] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [resultType, setResultType] = useState(null); // 'richbank' | 'metamask'
  const [hasAnyStageError, setHasAnyStageError] = useState(false); // Track if any error occurred
  
  const t = config?.content?.[language];
  const introData = config?.intro?.[language];

  // 语言内容对象
  const content = {
    chinese: {
      intro: {
        missionUnlocked: '新任務解鎖',
        background: 'Background',
        objective: 'Objective',
        btn: '開始充值'
      },
      wallet: {
        account: '帳戶 1',
        balance: 'US$0.00',
        balanceChange: '+$0 (+0.00%)',
        buy: '買入',
        exchange: '兌換',
        send: '發送',
        receive: '接收',
        tokens: '代幣',
        perpetual: '永續合約',
        defi: '去中心化金融',
        collectibles: '收藏品',
        ethereum: 'Ethereum',
        ethBalance: '0.00 ETH',
        earn: '賺取',
        earnRate: '2.1%',
        usdValue: 'US$0.00',
        dailyChange: '+2.18%',
        topUpMessage: '為錢包充值,開啟您的Web3 之旅',
        topUpBtn: '充值'
      },
      tabs: {
        metamask: 'MetaMask - metamask.io',
        discord: 'Web3 社群 | Discord',
        x: '首頁 / X'
      },
      discord: {
        serverName: 'Web3 社群',
        information: '資訊',
        channelOfficial: 'official-links',
        channelAnnouncements: 'announcements',
        channelGeneral: 'general-chat',
        warning: '請務必驗證網址！僅點擊管理員提供的連結。',
        groupDescription: '📢 群組說明',
        groupMessage: '這個群組旨在指導新手如何開始使用 Web3。首先，你需要創建一個錢包。我強烈推薦 MetaMask，因為它是一個主流錢包，可以處理大多數 Web3 區塊鏈活動。這是網站：',
        noPermission: '你沒有在此頻道發送訊息的權限。',
        todayAt1: '今天 下午 2:15',
        todayAt2: '今天 下午 3:50',
        todayAt3: '今天 下午 4:23',
        benNewMessage: '本群組為了鼓勵新手積極參與Web3活動在這段期間你們可以往我本人的銀行帳戶009871232331轉賬假如你想轉換以太幣的話可以暫時市價的多10%回贈給你們',
        richbankLink: 'https://richbank.com/transfer',
        kaisonMessage: '真的有相對應的以太幣回贈，謝謝Ben'
      }
    },
    english: {
      intro: {
        missionUnlocked: 'New Mission Unlocked',
        background: 'Background',
        objective: 'Objective',
        btn: 'Start Deposit'
      },
      wallet: {
        account: 'Account 1',
        balance: 'US$0.00',
        balanceChange: '+$0 (+0.00%)',
        buy: 'Buy',
        exchange: 'Swap',
        send: 'Send',
        receive: 'Receive',
        tokens: 'Tokens',
        perpetual: 'Perpetual',
        defi: 'DeFi',
        collectibles: 'Collectibles',
        ethereum: 'Ethereum',
        ethBalance: '0 ETH',
        earn: 'Earn',
        earnRate: '2.1%',
        usdValue: 'US$0.00',
        dailyChange: '+2.18%',
        topUpMessage: 'Top up your wallet, start your Web3 journey',
        topUpBtn: 'Top Up'
      },
      tabs: {
        metamask: 'MetaMask - metamask.io',
        discord: 'Web3 Community | Discord',
        x: 'Home / X'
      },
      discord: {
        serverName: 'Web3 Community',
        information: 'INFORMATION',
        channelOfficial: 'official-links',
        channelAnnouncements: 'announcements',
        channelGeneral: 'general-chat',
        warning: 'Always verify URLs! Only click links from Admins.',
        groupDescription: '📢 Group Description',
        groupMessage: 'This group aims to guide newcomers on how to get started with Web3. First, you need to create a wallet. I strongly recommend MetaMask as it is a mainstream wallet that can handle most Web3 blockchain activities. Here is the website:',
        noPermission: 'You do not have permission to send messages in this channel.',
        todayAt1: 'Today at 2:15 PM',
        todayAt2: 'Today at 3:50 PM',
        todayAt3: 'Today at 4:23 PM',
        benNewMessage: 'To encourage newcomers to actively participate in Web3 activities, during this period you can transfer funds to my personal bank account 009871232331. If you want to convert Ethereum, I can give you 1% more than the current market price.',
        richbankLink: 'https://richbank.com/transfer',
        kaisonMessage: 'Really got the ETH rebate, thanks Ben'
      }
    }
  };

  const currentContent = content[language] || content.chinese;

  // 初始化重置
  useEffect(() => {
    // 直接顯示 intro 頁面（PhaseRoadmap 選擇已移至 GamePage）
    setView('intro');
    setShowResult(false);
    setActiveTab('discord');
    setDiscordView('chat');
    setMetamaskView('wallet');
    setPurchaseAmount(3000);
    setShowQuote(false);
    setCardNumber('');
    setResultType(null);
    setHasAnyStageError(false);
  }, [location.pathname]);

  const handleStartLevel = (stepId) => {
    if (stepId === 'deposit') {
      setView('intro');
    }
  };

  // 進入充值代幣選擇介面
  const handleOpenTopUp = () => {
    setActiveTab('metamask');
    setMetamaskView('topup');
    setShowQuote(false);
    setCardNumber('');
  };

  // 完成充值（MetaMask 正確充值）
  const handleConfirmTopUp = () => {
    setIsCorrect(true);
    setResultType('metamask');
    setShowResult(true);
  };

  // RichBank 轉帳完成（錯誤示範）
  const handleRichBankTransfer = async () => {
    setIsCorrect(false);
    setResultType('richbank');
    setShowResult(true);
    
    // 記錄失敗：用戶使用了不安全的入金方式（不結束 attempt）
    if (config?.id) {
      setHasAnyStageError(true);
      await recordStageError({
        error_type: 'wrong_deposit_method',
        user_selected: 'richbank',
        correct_answer: 'metamask',
        description: language === 'chinese' 
          ? '用戶使用了 RichBank 不安全的入金方式' 
          : 'User used RichBank insecure deposit method'
      });
    }
  };

  // 处理下一关导航
  const handleNextLevel = async () => {
    // 記錄答題結果：如果有錯誤，is_success 為 false，但仍然更新進度
    if (config?.id) {
      const finalSuccess = isCorrect && !hasAnyStageError;
      // 即使失敗也要更新進度到下一關
      const errorDetails = finalSuccess ? null : { force_progress_update: true };
      await completeScenarioAndUnlockNext(config.id, config.nextLevel, finalSuccess, errorDetails);
    }
    
    if (config?.nextLevel) {
      const phase = getPhaseByScenarioCode(config.nextLevel);
      if (phase) {
        navigate(`/challenge/${phase}/${config.nextLevel}`, { state: { skipToIntro: true } });
      } else {
        console.error('Cannot find phase for scenario:', config.nextLevel);
      }
    }
  };

  const roadmapSteps = [
    { id: 'search', iconType: 'search', status: 'completed', title: { chinese: '下載錢包', english: 'Download Wallet' } },
    { id: 'create', iconType: 'create', status: 'completed', title: { chinese: '創建錢包', english: 'Create Wallet' } },
    { id: 'deposit', iconType: 'deposit', status: 'current', title: { chinese: '首次入金', english: 'First Deposit' } },
    { id: 'transfer', iconType: 'transfer', status: 'locked', title: { chinese: '轉賬', english: 'Transfer' } }
  ];

  const renderTabs = () => {
    const handleBack = () => {
      if (activeTab === 'discord' && discordView === 'richbank') {
        setDiscordView('chat');
      } else if (activeTab === 'metamask' && metamaskView === 'topup') {
        setMetamaskView('wallet');
      }
    };

    const handleForward = () => {
      if (activeTab === 'discord' && discordView === 'chat') {
        setDiscordView('richbank');
      } else if (activeTab === 'metamask' && metamaskView === 'wallet') {
        setMetamaskView('topup');
      }
    };

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
        <div className="flex items-center gap-1 mr-2 mb-1">
          <button
            type="button"
            onClick={handleBack}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-[#c2c5cc] text-xs text-[#2e3135] hover:bg-[#b5b8bf] disabled:opacity-40 disabled:cursor-default"
            disabled={
              (activeTab === 'discord' && discordView === 'chat') ||
              (activeTab === 'metamask' && metamaskView === 'wallet')
            }
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={handleForward}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-[#c2c5cc] text-xs text-[#2e3135] hover:bg-[#b5b8bf] disabled:opacity-40 disabled:cursor-default"
            disabled={
              (activeTab === 'discord' && discordView === 'richbank') ||
              (activeTab === 'metamask' && metamaskView === 'topup')
            }
          >
            {'>'}
          </button>
        </div>

        <div onClick={() => setActiveTab('discord')} className={getTabStyle('discord')}>
          <img src={DiscordFavicon} className="w-4 h-4 object-contain" alt="Discord" />
          <span className="text-xs font-medium truncate">{currentContent.tabs.discord}</span>
        </div>
        <div onClick={() => setActiveTab('metamask')} className={getTabStyle('metamask')}>
          <img src={MetaMaskFox} className="w-4 h-4 object-contain" alt="MetaMask" />
          <span className="text-xs font-medium truncate">{currentContent.tabs.metamask}</span>
        </div>
      </div>
    );
  };

  const renderBrowserContent = () => {
    // Discord Page
    if (activeTab === 'discord') {
      // 原本的 Discord 聊天介面
      if (discordView === 'chat') {
        return (
        <div className="w-full h-full bg-[#313338] text-white flex overflow-hidden font-sans">
          {/* 1. 左側：伺服器列表 */}
          <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-none overflow-y-auto no-scrollbar pb-16">
            <div className="w-12 h-12 bg-[#5865f2] rounded-xl flex items-center justify-center hover:bg-[#5865f2] cursor-pointer transition-all shadow-sm">
              <img src={DiscordFavicon} className="w-7 h-7" alt="Home"/>
            </div>
            <div className="w-8 h-[2px] bg-[#35363c] rounded-lg my-1"></div>
            
            <div className="group relative w-12 h-12 flex items-center justify-center cursor-pointer mb-2">
              <div className="w-12 h-12 bg-[#313338] rounded-xl flex items-center justify-center overflow-hidden transition-all border border-gray-700">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">W3</div>
              </div>
            </div>
            
            {[1, 2, 3].map(i => (
              <div key={i} className="w-12 h-12 bg-[#313338] rounded-xl hover:rounded-xl flex items-center justify-center transition-all cursor-pointer group hover:bg-[#5865f2]">
                <span className="text-xs font-bold group-hover:text-white text-[#dbdee1]">S{i}</span>
              </div>
            ))}
          </div>

          {/* 2. 中間：頻道列表 */}
          <div className="w-60 bg-[#2b2d31] flex flex-col flex-none rounded-tl-lg h-full overflow-hidden pb-16">
            <div className="h-12 px-4 flex-none flex items-center justify-between font-bold border-b border-[#1f2023] shadow-sm hover:bg-[#35373c] cursor-pointer transition-colors">
              <span className="truncate">{currentContent.discord.serverName}</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            
            <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
              <div className="px-2 py-1 text-[#949ba4] text-[11px] font-bold uppercase hover:text-[#dbdee1] flex items-center gap-1 cursor-pointer pt-4">
                <span>▼</span> {currentContent.discord.information}
              </div>
              <div className="px-2 py-[6px] bg-[#404249] text-white rounded-[4px] flex items-center gap-2 cursor-pointer group">
                <span className="text-[#80848e] text-lg">#</span> 
                <span className="font-medium truncate">{currentContent.discord.channelOfficial}</span>
              </div>
              <div className="px-2 py-[6px] text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] rounded-[4px] flex items-center gap-2 cursor-pointer group">
                <span className="text-[#80848e] text-lg">#</span> 
                <span className="font-medium truncate">{currentContent.discord.channelAnnouncements}</span>
              </div>
              <div className="px-2 py-[6px] text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] rounded-[4px] flex items-center gap-2 cursor-pointer group">
                <span className="text-[#80848e] text-lg">#</span> 
                <span className="font-medium truncate">{currentContent.discord.channelGeneral}</span>
              </div>
            </div>
          </div>

          {/* 3. 右側：聊天主視窗 */}
          <div className="flex-1 flex flex-col bg-[#313338] pb-16">
            <div className="h-12 border-b border-[#26272d] flex items-center px-4 shadow-sm justify-between">
              <div className="flex items-center">
                <span className="text-[#80848e] text-2xl mr-2">#</span> 
                <span className="font-bold mr-4 text-white">{currentContent.discord.channelOfficial}</span>
                <span className="hidden md:block text-xs text-[#b5bac1] border-l border-[#3f4147] pl-4">{currentContent.discord.warning}</span>
              </div>
              <div className="flex items-center gap-4 text-[#b5bac1]">
                <svg className="w-6 h-6 cursor-pointer hover:text-[#dbdee1]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <svg className="w-6 h-6 cursor-pointer hover:text-[#dbdee1]" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-[#1a1b1e] scrollbar-track-[#2b2d31]">
              <div className="flex gap-4 mt-4 opacity-50">
                <div className="h-[1px] bg-[#3f4147] flex-1 my-auto"></div>
                <span className="text-xs text-[#949ba4]">October 24, 2025</span>
                <div className="h-[1px] bg-[#3f4147] flex-1 my-auto"></div>
              </div>

              {/* 第一条消息 - 群组说明 */}
              <div className="flex gap-4 hover:bg-[#2e3035] p-2 -mx-2 rounded group">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex-shrink-0 mt-1 cursor-pointer flex items-center justify-center font-bold text-white">B</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-400 hover:underline cursor-pointer">Ben</span>
                    <span className="text-xs text-[#949ba4]">{currentContent.discord.todayAt1}</span>
                  </div>
                  <div className="mt-1 text-[#dbdee1]">
                    <p className="font-bold text-white mb-1">{currentContent.discord.groupDescription}</p>
                    <p className="text-sm leading-relaxed mb-2">
                      {currentContent.discord.groupMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('metamask');
                        setMetamaskView('wallet');
                      }}
                      className="text-[#00a8fc] font-bold hover:underline cursor-pointer break-all text-left focus:outline-none"
                      style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                    >
                      https://metamask.io
                    </button>
                  </div>
                </div>
              </div>

              {/* 第二条消息 - 新消息 */}
              <div className="flex gap-4 hover:bg-[#2e3035] p-2 -mx-2 rounded group">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex-shrink-0 mt-1 cursor-pointer flex items-center justify-center font-bold text-white">B</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-400 hover:underline cursor-pointer">Ben</span>
                    <span className="text-xs text-[#949ba4]">{currentContent.discord.todayAt2}</span>
                  </div>
                  <div className="mt-1 text-[#dbdee1] space-y-2">
                    <p className="text-sm leading-relaxed">
                      {currentContent.discord.benNewMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDiscordView('richbank')}
                      className="text-[#00a8fc] font-bold hover:underline break-all inline-block text-left cursor-pointer focus:outline-none"
                      style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                    >
                      {currentContent.discord.richbankLink}
                    </button>
                  </div>
                </div>
              </div>

              {/* 第三条消息 - Kaison 留言與截圖 */}
              <div className="flex gap-4 hover:bg-[#2e3035] p-2 -mx-2 rounded group">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex-shrink-0 mt-1 cursor-pointer flex items-center justify-center font-bold text-white">K</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-400 hover:underline cursor-pointer">Kaison</span>
                    <span className="text-xs text-[#949ba4]">{currentContent.discord.todayAt3}</span>
                  </div>
                  <div className="mt-1 text-[#dbdee1] space-y-2">
                    <p className="text-sm leading-relaxed">
                      {currentContent.discord.kaisonMessage}
                    </p>
                    <img
                      src={DiscordPicture1}
                      alt="Discord screenshot"
                      className="rounded-lg max-w-full shadow-lg"
                      style={{ maxWidth: '520px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 pt-0">
              <div className="bg-[#383a40] p-3 rounded-lg text-[#949ba4] flex items-center gap-3 cursor-not-allowed">
                <div className="bg-[#b5bac1] w-6 h-6 rounded-full flex items-center justify-center text-[#383a40] font-bold text-xs">+</div>
                <span className="flex-1">{currentContent.discord.noPermission}</span>
              </div>
            </div>
          </div>
        </div>
      );
      }

      // Discord 中點擊 richbank 連結後的轉帳頁面
      if (discordView === 'richbank') {
        return (
          <div className="w-full h-full flex items-center justify-center bg-[#f3f4f6] text-gray-800">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 space-y-6">
              {/* 頂部：Logo 與標題 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img src={RichBankImage} alt="RichBank" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold tracking-wide">RichBank Online</div>
                    <div className="text-xs text-gray-500">`https://richbank.com/transfer`</div>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                  Secure Transfer
                </span>
              </div>

              {/* 付款帳戶 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {language === 'chinese' ? '付款帳戶' : 'From Account'}
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    defaultValue="921347685168"
                  >
                    <option value="921347685168">
                      921347685168 · Checking · 3,000.00 USD
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'chinese'
                    ? '可用餘額：3,000.00 USD'
                    : 'Available balance: 3,000.00 USD'}
                </p>
              </div>

              {/* 收款帳戶 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {language === 'chinese' ? '收款帳戶' : 'Recipient Account'}
                </label>
                <input
                  type="text"
                  defaultValue="009871232331"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    language === 'chinese'
                      ? '輸入收款人銀行帳號'
                      : 'Enter recipient bank account number'
                  }
                />
                <p className="text-xs text-gray-400">
                  {language === 'chinese'
                    ? '請確認收款帳戶資訊正確，避免轉錯帳戶。'
                    : 'Please verify the recipient account carefully to avoid mis-transfer.'}
                </p>
              </div>

              {/* 轉帳金額 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {language === 'chinese' ? '轉帳金額' : 'Transfer Amount'}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500 text-xs">
                      USD
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {language === 'chinese'
                    ? '單筆最高限額：3,000.00 USD'
                    : 'Maximum per transfer: 3,000.00 USD'}
                </p>
              </div>

              {/* 驗證碼 ASDT */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {language === 'chinese' ? '圖片驗證碼' : 'Image Verification'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 flex items-center">
                    <img
                      src={ASDTImage}
                      alt="ASDT Captcha"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={language === 'chinese' ? '請輸入圖片中的字母：' : 'Enter code: ASDT'}
                  />
                </div>
          
              </div>

              {/* 按鈕區域 */}
              <div className="flex items-center justify-center pt-4">
                <button
                  type="button"
                  className="px-10 py-3 rounded-full text-white text-sm font-semibold shadow-lg"
                  style={{
                    backgroundColor: '#000000'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                  }}
                  onClick={handleRichBankTransfer}
                >
                  {language === 'chinese' ? '轉款' : 'Transfer'}
                </button>
              </div>
            </div>
          </div>
        );
      }
    }
    
    // MetaMask Wallet / 充值 Page
    if (activeTab === 'metamask') {
      // Buy ETH 頁面
      if (metamaskView === 'buy') {
        return (
          <div className="w-full h-full flex items-center justify-center bg-white text-gray-900">
            <div className="w-full max-w-md h-full md:h-[640px] flex flex-col bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setMetamaskView('topup');
                    setShowQuote(false);
                    setCardNumber('');
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <span className="text-lg">×</span>
                </button>
                <div className="text-lg font-semibold">
                  {language === 'chinese' ? '買入' : 'Buy'}
                </div>
                <div className="w-8 h-8" />
              </div>
    
              {/* Account & Region */}
              <div className="px-6 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-gray-100 text-sm">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="font-medium">
                      {language === 'chinese' ? '帳戶 1' : 'Account 1'}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">▼</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-100 text-sm">
                    <span className="text-xs">🇺🇸</span>
                    <span className="text-xs text-gray-700">USD</span>
                    <span className="ml-1 text-xs text-gray-500">▼</span>
                  </div>
                </div>
              </div>
    
              {/* Token row (放大) */}
              <div className="px-6 pt-2 pb-4 space-y-3">
                <p className="text-sm text-gray-500 mb-3">
                  {language === 'chinese' ? '您想購買' : 'You want to buy'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // 回到選擇代幣介面
                    setMetamaskView('topup');
                    setShowQuote(false);
                    setCardNumber('');
                  }}
                  className="w-full rounded-2xl bg-gray-100 px-6 py-5 flex items-center justify-between hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <img src={EthereumIcon} alt="Ethereum" className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900">Ethereum</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span>ETH</span>
                    <span className="text-xs text-gray-500">▼</span>
                  </div>
                </button>
              </div>
    
              {/* Amount (放大數字區) */}
              <div className="px-6 pt-6 space-y-3">
                <p className="text-sm text-gray-500">
                  {language === 'chinese' ? '金額' : 'Amount'}
                </p>
                <div className="w-full rounded-2xl bg-gray-100 px-6 py-5 flex items-center justify-between">
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setPurchaseAmount(Number.isNaN(value) ? 0 : value);
                    }}
                    className="bg-transparent outline-none border-none text-3xl md:text-4xl font-extrabold text-gray-900 flex-1"
                    style={{ minWidth: 0 }}
                  />
                  <span className="text-sm font-medium text-gray-700">USD</span>
                </div>
              </div>
    
              {/* 支付方式 (放大並留白) */}
              <div className="px-6 pt-6 pb-14 space-y-3">
                <p className="text-sm text-gray-500">
                  {language === 'chinese' ? '更新付款方式' : 'Payment method'}
                </p>
                <div className="w-full rounded-2xl bg-gray-100 px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">💳</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {language === 'chinese' ? '信用卡 / 轉帳卡' : 'Debit or Credit'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>{language === 'chinese' ? '更改' : 'Change'}</span>
                    <span className="text-xs text-gray-500">▼</span>
                  </div>
                </div>
              </div>
    
              {/* 底部按鈕 - 與信用卡區塊留更大距離（獨立區塊） */}
              <div
                className="px-6 pb-10 pt-2"
                style={{ marginTop: '60px' }}  // 直接用 inline style 明確拉開與上方信用卡區塊的距離
              >
                <div className="max-w-none mx-auto">
                  <button
                    type="button"
                    onClick={() => setShowQuote(true)}
                    className="w-full py-4 rounded-2xl text-white text-base font-semibold shadow-lg"
                    style={{ backgroundColor: '#000000' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
                  >
                    {language === 'chinese' ? '獲取報價' : 'Get Quote'}
                  </button>
                </div>
              </div>

              {/* 報價與信用卡輸入區塊 */}
              {showQuote && (
                <div className="px-6 pb-10">
                  <div className="mt-6 w-full rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 space-y-4 shadow-md">
                    <div className="text-sm text-gray-500">
                      {language === 'chinese' ? '預估兌換' : 'Estimated conversion'}
                    </div>
                    <div className="text-lg md:text-xl font-semibold text-gray-900">
                      {purchaseAmount || 0} USD ≈{' '}
                      {purchaseAmount ? (purchaseAmount / 3000).toFixed(2) : '0.00'} ETH
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'chinese' ? '信用卡號碼' : 'Credit card number'}
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="4477 5566 8998 1001"
                      />
                    </div>
                    <div className="mt-4">
                     <div style={{ marginTop: '40px' }} ></div>
                      <button
                        type="button"
                        onClick={handleConfirmTopUp}
                        className="w-full py-3 rounded-xl text-white text-sm font-semibold shadow-md"
                        style={{ backgroundColor: '#000000' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
                      >
                        {language === 'chinese' ? '確認' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      if (metamaskView === 'wallet') {
        return renderWalletPage();
      }

      // MetaMask 充值介面：選擇代幣
      if (metamaskView === 'topup') {
        const tokens = [
          { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: EthereumIcon },
          { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', icon: BNBIcon },
          { id: 'usdt', name: 'Tether USD', symbol: 'USDT', icon: USDTIcon },
          { id: 'sol', name: 'Solana', symbol: 'SOL', icon: SolanaIcon },
        ];

        return (
          <div className="w-full h-full flex items-center justify-center bg-white text-gray-900">
            <div className="w-full max-w-md h-full md:h-[640px] flex flex-col border border-gray-200 rounded-3xl shadow-2xl overflow-hidden bg-white">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setMetamaskView('wallet')}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <span className="text-lg">×</span>
                </button>
                <div className="text-base font-semibold">
                  {language === 'chinese' ? '選擇代幣' : 'Select Token'}
                </div>
                <div className="w-7 h-7" />
              </div>

              {/* Network chip - 僅顯示「所有」 */}
              <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto">
                <div className="px-3 py-1.5 rounded-full text-xs font-medium border bg-black text-white border-black">
                 
                </div>
              </div>

              {/* Search bar */}
              <div className="px-4 pb-2">
                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 text-sm text-gray-500">
                  <span className="text-base">🔍</span>
                  <span className="truncate">
                    {language === 'chinese'
                      ? '按名稱或地址搜尋代幣'
                      : 'Search name or paste address'}
                  </span>
                </div>
              </div>

              {/* Token list */}
              <div className="flex-1 overflow-y-auto px-2 pb-2">
                {tokens.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => {
                      if (token.id === 'eth') {
                        setMetamaskView('buy');
                        setShowQuote(false);
                        setCardNumber('');
                      }
                    }}
                    className="w-full flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-2xl"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img src={token.icon} alt={token.name} className="w-10 h-10 object-contain" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">{token.name}</span>
                      <span className="text-xs text-gray-500">{token.symbol}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  const renderMissionIntro = () => (
    <div className="flex items-center justify-center w-full min-h-screen p-8 relative z-10">
      <div className="bg-[#0f172a] rounded-3xl p-10 max-w-2xl text-center backdrop-blur-xl shadow-2xl border border-gray-800">
        <div className="mb-6 flex justify-center">
          <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-cyan-500/30">
            {currentContent.intro.missionUnlocked}
          </span>
        </div>
        <h1 className="text-4xl font-black text-white mb-6 tracking-tighter font-mono">
          {introData?.title || (language === 'chinese' ? '任務 3：首次入金' : 'Mission 3: First Deposit')}
        </h1>
        <div className="space-y-6 text-left mb-10">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">{currentContent.intro.background}</p>
            <p className="text-white text-lg leading-relaxed">
              {introData?.story || (language === 'chinese' 
                ? '您已經成功創建了 MetaMask 錢包。現在需要為錢包充值，才能開始進行 Web3 交易。' 
                : 'You have successfully created your MetaMask wallet. Now you need to top up your wallet to start Web3 transactions.')}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">{currentContent.intro.objective}</p>
            <p className="text-white text-lg leading-relaxed">
              {introData?.mission || (language === 'chinese' 
                ? '您的目標是：安全地為您的錢包進行首次充值。' 
                : 'Your goal is to safely make your first deposit to your wallet.')}
            </p>
          </div>
        </div>
        <button 
          onClick={async () => {
            await startTracking(); // 開始計時
            setView('wallet');
          }}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
        >
          {introData?.btn || currentContent.intro.btn}
        </button>
      </div>
    </div>
  );

  const renderWalletPage = () => (
    <div className="w-full bg-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <div className="sticky top-0 bg-white z-20 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900">{currentContent.wallet.account}</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
      <div className="px-6 py-8">
        <div className="text-4xl font-bold text-gray-900 mb-1">{currentContent.wallet.balance}</div>
        <div className="text-sm text-gray-600">{currentContent.wallet.balanceChange}</div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 grid grid-cols-4 gap-4">
        {/* Buy Button */}
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700">{currentContent.wallet.buy}</span>
        </button>
        
        {/* Exchange Button */}
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700">{currentContent.wallet.exchange}</span>
        </button>
        
        {/* Send Button */}
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700">{currentContent.wallet.send}</span>
        </button>
        
        {/* Receive Button */}
        <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700">{currentContent.wallet.receive}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 border-b border-gray-200 flex gap-6">
        <div className="pb-3 border-b-2 border-purple-600">
          <span className="text-sm font-semibold text-purple-600">{currentContent.wallet.tokens}</span>
        </div>
        <div className="pb-3">
          <span className="text-sm font-medium text-gray-600">{currentContent.wallet.perpetual}</span>
        </div>
        <div className="pb-3">
          <span className="text-sm font-medium text-gray-600">{currentContent.wallet.defi}</span>
        </div>
        <div className="pb-3">
          <span className="text-sm font-medium text-gray-600">{currentContent.wallet.collectibles}</span>
        </div>
      </div>

      {/* Asset Filter */}
      <div className="px-6 py-5 flex items-center justify-between">
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <img src={EthereumIcon} alt="Ethereum" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-900">{currentContent.wallet.ethereum}</span>
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
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <img src={EthereumIcon} alt="Ethereum" className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{currentContent.wallet.ethereum}</div>
            <div className="text-sm text-gray-600">{currentContent.wallet.ethBalance}</div>
            <div className="text-xs text-blue-600">{currentContent.wallet.earn} {currentContent.wallet.earnRate}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-900">{currentContent.wallet.usdValue}</div>
          <div className="text-sm text-green-600">{currentContent.wallet.dailyChange}</div>
        </div>
      </div>

      {/* Separator */}
      <div className="px-6 pt-0 pb-0">
        <div className="border-t border-gray-300"></div>
      </div>

      {/* Top Up Section - 放在卡片外，独立容器 */}
      <div className="w-full px-6 pb-8 text-center" style={{ paddingTop: '3rem' }}>
        <p className="text-gray-600 mb-8">{currentContent.wallet.topUpMessage}</p>
        <button
          onClick={handleOpenTopUp}
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
          {currentContent.wallet.topUpBtn}
        </button>
      </div>
    </div>
  );

  return (
    <ChallengeTemplate 
      language={language} 
      setLanguage={setLanguage} 
      title={t?.title}
      containerMaxWidth="100vw"
      containerMaxHeight="100vh"
    >
      {view === 'map' && <PhaseRoadmap steps={roadmapSteps} onStartLevel={handleStartLevel} language={language} />}
      {view === 'intro' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderMissionIntro()}
        </div>
      )}
      {view === 'wallet' && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-8 bg-gray-900">
            <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 items-stretch">
            <div className="flex-1">
              <BrowserFrame 
                url={
                  activeTab === 'discord'
                    ? (discordView === 'richbank' ? "richbank.com/transfer" : "discord.com/channels/web3")
                    : activeTab === 'metamask'
                      ? (metamaskView === 'topup' ? "metamask.io/deposit" : "metamask.io/wallet")
                      : ""
                }
                tabs={renderTabs()}
                className="w-full h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
                showControls={true}
                contentPadding={true}
              >
                {renderBrowserContent()}
              </BrowserFrame>
            </div>
            <div className="md:w-72 flex flex-col items-center justify-center gap-4">
              <img
                src={CreditCardImage}
                alt="Credit Card"
                className="w-full max-w-xs rounded-2xl shadow-2xl object-contain"
              />
              <p className="text-xs md:text-sm text-gray-200 text-center pixel-font leading-relaxed">
                {language === 'chinese'
                  ? '我想充值 3000 USD ≈ 1 ETH'
                  : 'I want to deposit 3000 USD ≈ 1 ETH'}
              </p>
            </div>
          </div>
        </div>
      )}
      {showResult && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChallengeResultScreen 
            isSuccess={isCorrect}
            title={
              isCorrect
                ? (language === 'chinese' ? "充值成功！" : "Deposit Successful!")
                : (language === 'chinese' ? "風險提示：疑似詐騙轉帳" : "Risk Alert: Suspicious Transfer")
            }
            description={
              isCorrect
                ? (language === 'chinese'
                    ? "您已透過官方管道成功為錢包充值。"
                    : "You have successfully topped up your wallet through the official channel.")
                : (language === 'chinese'
                    ? "你剛才嘗試透過 RichBank 進行轉帳，這是一個常見的詐騙情境。"
                    : "You just attempted to transfer via RichBank, which represents a common scam scenario.")
            }
            successMessage={
              isCorrect
                ? (language === 'chinese'
                    ? "恭喜！你選擇了正確的充值方式"
                    : "Well done! You chose the correct way to deposit.")
                : undefined
            }
            failureMessage={
              !isCorrect
                ? (language === 'chinese'
                    ? "警惕：詐騙者可能混合真實與虛假訊息"
                    : "Warning: Scammers may mix real and fake information.")
                : undefined
            }
            successExplanation={
              isCorrect
                ? (language === 'chinese'
                    ? "任何時候都要遵從正確的官方帳戶與平台進行充值，不要因為額外回贈或優惠而貪小便宜。"
                    : "Always use the correct official accounts and platforms when depositing. Do not chase extra bonuses or 'too good' deals.")
                : undefined
            }
            failureExplanation={
              !isCorrect
                ? (language === 'chinese'
                    ? "騙徒很常先提供一些真實、有用的資訊，取得你的信任，接著再引導你到不安全的轉帳頁面或帳戶進行匯款。請記住：任何涉及匯款或充值的操作，都應只透過官方網站或 App 完成。"
                    : "Scammers often start by sharing real and useful information to gain your trust, then later guide you to unsafe transfer pages or personal accounts. Always complete deposits only through official websites or apps.")
                : undefined
            }
            customStyles={{
              container: {
                width: '100vw',
                height: '100vh',
                minHeight: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                paddingTop: '30px'
              }
            }}
            checkItems={
              isCorrect
                ? [
                    {
                      label: language === 'chinese' ? '使用官方帳戶充值' : 'Deposited via official channel',
                      value: language === 'chinese' ? '已完成' : 'Completed',
                      isCorrect: true,
                      showValue: true
                    },
                    {
                      label: language === 'chinese' ? '避免被高回贈誘惑' : 'Ignored suspicious high bonus offer',
                      value: language === 'chinese' ? '保持警覺' : 'Stayed cautious',
                      isCorrect: true,
                      showValue: true
                    }
                  ]
                : [
                    {
                      label: language === 'chinese' ? 'RichBank 轉帳風險' : 'RichBank transfer risk',
                      value:
                        language === 'chinese'
                          ? '對方要求轉入個人帳戶並聲稱額外回贈'
                          : 'Asked to send funds to a personal account with extra rebate promise',
                      isCorrect: false,
                      showValue: true
                    },
                    {
                      label: language === 'chinese' ? '訊息混合真偽' : 'Mixed real and fake information',
                      value:
                        language === 'chinese'
                          ? '先分享教學與官方連結，再帶你到假轉帳頁面'
                          : 'First shared guides and official links, then led you to a fake transfer page',
                      isCorrect: false,
                      showValue: true
                    }
                  ]
            }
            onNextLevel={handleNextLevel}
            nextLevelButtonText={language === 'chinese' ? '下一關' : 'Next Level'}
          />
        </div>
      )}
    </ChallengeTemplate>
  );
};

export default FirstDepositChallenge;