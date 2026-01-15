import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrowserFrame from './BrowserFrame';
import ChallengeTemplate from './ChallengeTemplate';
import ChallengeResultScreen from './ChallengeResultScreen';
import PhaseRoadmap from '../PhaseRoadmap';

// === 1. 圖片引入 ===
import GoogleFavicon from '../../assets/Google__G__logo.png';
import DiscordFavicon from '../../assets/Discordicon.png';
import XFavicon from '../../assets/Xicon.png';
import GoogleFullLogo from '../../assets/Google_logo.png'; 
import Fox from '../../assets/MetaMask_Fox.png';

const PhishingEmailChallenge = ({ config }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('chinese');
  const [view, setView] = useState('map'); 
  const [activeTab, setActiveTab] = useState('google'); 
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [source, setSource] = useState('google'); // 跟踪来源：google, discord, x
  const [showItemReminder, setShowItemReminder] = useState(false); // 显示道具提醒
  const [openBackpack, setOpenBackpack] = useState(false); // 控制打开背包
  
  const t = config?.content?.[language];
  const introData = config?.intro?.[language];

  // 语言内容对象
  const content = {
    chinese: {
      intro: {
        missionUnlocked: '新任務解鎖',
        background: 'Background',
        objective: 'Objective',
        btn: '開啟瀏覽器搜尋'
      },
      tabs: {
        google: 'MetaMask - Google 搜尋',
        discord: 'Web3 Community | Discord',
        x: 'Home / X'
      },
      google: {
        navAll: '全部',
        navItems: ['圖片', '影片', '新聞', '購物', '更多', '工具'],
        resultsCount: '約有 21,400,000 項結果 (0.42 秒)',
        relatedQuestions: '相關問題',
        questions: ['MetaMask是熱錢包嗎？', 'MetaMask安全嗎？', 'MetaMask是什麼錢包？', 'MetaMask 可以收usdt嗎？'],
        chromeStore: 'MetaMask - Chrome 線上應用程式商店',
        chromeStoreDesc: '3 天前 — 以太坊瀏覽器擴充插件. MetaMask is an extension for accessing Ethereum enabled distributed applications, or "Dapps" in your normal Chrome ...'
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
        todayAt: '今天 下午 2:15'
      },
      x: {
        home: '首頁',
        explore: '探索',
        notifications: '通知',
        post: '發文',
        forYou: '為你推薦',
        following: '關注中',
        whatHappening: '發生什麼事？！',
        alert: '🚨 警告 🚨',
        phishingMessage: '你是否曾經看到有人透過 Web3 區塊鏈每月賺取數百萬，而你還在從事普通工作，每月只賺一兩萬元，勉強維持生計？你是否曾經想過利用 Web3 的興起來累積財富並實現財務自由，不再為明天擔憂？別擔心，我和我的學生已經建立了一個完整的財富增長計劃。如果你想開始使用 Web3，首先需要下載一個 Web3 錢包。這是我們推薦的錢包；點擊下面的連結下載並開始你的 Web3 之旅。',
        lastChance: '改變人生的最後機會',
        officialPatch: '全球最多人使用的web3錢包'
      },
      footer: {
        warning: '注意：本網站僅作教學用途，並非釣魚網站 | Note: This website is for educational purposes only.'
      }
    },
    english: {
      intro: {
        missionUnlocked: 'New Mission Unlocked',
        background: 'Background',
        objective: 'Objective',
        btn: 'Open Browser Search'
      },
      tabs: {
        google: 'MetaMask - Google Search',
        discord: 'Web3 Community | Discord',
        x: 'Home / X'
      },
      google: {
        navAll: 'All',
        navItems: ['Images', 'Videos', 'News', 'Shopping', 'More', 'Tools'],
        resultsCount: 'About 21,400,000 results (0.42 seconds)',
        relatedQuestions: 'Related Questions',
        questions: ['Is MetaMask a hot wallet?', 'Is MetaMask safe?', 'What is MetaMask wallet?', 'Can MetaMask receive USDT?'],
        chromeStore: 'MetaMask - Chrome Web Store',
        chromeStoreDesc: '3 days ago — Ethereum browser extension. MetaMask is an extension for accessing Ethereum enabled distributed applications, or "Dapps" in your normal Chrome ...'
      },
      discord: {
        serverName: 'Web3 Community',
        information: 'Information',
        channelOfficial: 'official-links',
        channelAnnouncements: 'announcements',
        channelGeneral: 'general-chat',
        warning: 'Always verify URLs! Only click links from Admins.',
        groupDescription: '📢 Group Description',
        groupMessage: 'This group is for guiding beginners on how to get started with Web3. First, you\'ll need to create a wallet. I highly recommend Metamask, as it\'s a mainstream wallet and can handle most Web3 blockchain activities. Here\'s the website:',
        noPermission: 'You do not have permission to send messages in this channel.',
        todayAt: 'Today at 2:15 PM'
      },
      x: {
        home: 'Home',
        explore: 'Explore',
        notifications: 'Notifications',
        post: 'Post',
        forYou: 'For you',
        following: 'Following',
        whatHappening: 'What is happening?!',
        alert: '🚨 ALERT 🚨',
        phishingMessage: 'Have you ever seen people earning millions a month through Web3 blockchain while you\'re still working a regular job earning only ten or twenty thousand yuan a month, struggling to make ends meet? Have you ever thought about taking advantage of the rise of Web3 to accumulate wealth and achieve financial freedom, no longer worrying about tomorrow? Don\'t worry, my students and I have already established a complete wealth growth plan. If you want to get started with Web3, you first need to download a Web3 wallet. Here is the wallet we recommend; click the link below to download and begin your Web3 journey.',
        lastChance: 'The last chance to turn your life around',
        officialPatch: 'Official Security Patch v2.0'
      },
      footer: {
        warning: 'Note: This website is for educational purposes only.'
      }
    }
  };

  const currentContent = content[language] || content.chinese;

  useEffect(() => {
    setView('map');
    setShowResult(false);
    setShowItemReminder(false);
    setOpenBackpack(false);
  }, [location.pathname]);

  const handleStartLevel = (stepId) => { if (stepId === 'search') setView('intro'); };
  
  // 点击正确的官方链接
  const handleSelectOfficial = (sourceType = 'google') => {
    setIsCorrect(true);
    setSource(sourceType);
    setShowResult(true);
  };
  
  // 点击错误的钓鱼链接
  const handleSelectPhishing = (type) => {
    setIsCorrect(false);
    setShowResult(true);
  };

  // 处理下一关导航
  const handleNextLevel = () => {
    if (config?.nextLevel) {
      // 根据 nextLevel 确定路由路径
      // nextLevel 格式应该是 'phase1-2'，需要转换为 '/challenge/phase1/phase1-2'
      const phase = config.nextLevel.split('-')[0]; // 提取 'phase1'
      navigate(`/challenge/${phase}/${config.nextLevel}`);
    }
  };

  const roadmapSteps = [
    { id: 'search', iconType: 'search', status: 'current', title: { chinese: '下載錢包', english: 'Download Wallet' } },
    { id: 'create', iconType: 'create', status: 'locked', title: { chinese: '創建錢包', english: 'Create Wallet' } },
    { id: 'deposit', iconType: 'deposit', status: 'locked', title: { chinese: '首次入金', english: 'First Deposit' } },
    { id: 'transfer', iconType: 'transfer', status: 'locked', title: { chinese: '轉賬', english: 'Transfer' } }
  ];

  const renderMissionIntro = () => (
    <div className="flex items-center justify-center w-full min-h-screen p-8 relative z-10">
      <div className="bg-[#0f172a] rounded-3xl p-10 max-w-2xl text-center backdrop-blur-xl shadow-2xl border border-gray-800">
          <div className="mb-6 flex justify-center">
            <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-cyan-500/30">
              {currentContent.intro.missionUnlocked}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-6 tracking-tighter font-mono">
            {introData?.title || (language === 'chinese' ? '任務 1：初入 Web3 世界' : 'Mission 1: Entering the Web3 World')}
          </h1>
          <div className="space-y-6 text-left mb-10">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">{currentContent.intro.background}</p>
              <p className="text-white text-lg leading-relaxed">{introData?.story || (language === 'chinese' ? '你是一位剛接觸 Web3 的新手。為了參與交易，你需要先下載一個加密貨幣錢包。' : 'You are a beginner in Web3. To participate in transactions, you need to download a cryptocurrency wallet first.')}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">{currentContent.intro.objective}</p>
              <p className="text-white text-lg leading-relaxed">{introData?.mission || (language === 'chinese' ? '你的目標是：在搜尋引擎結果中，安全地下載官方版 MetaMask 錢包。' : 'Your goal is to safely download the official MetaMask wallet from search engine results.')}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowItemReminder(true)}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
          >
            {introData?.btn || currentContent.intro.btn}
          </button>
        </div>
    </div>
  );

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
      <div className="flex items-end h-full px-2 gap-1 bg-[#dfe1e5] pt-1 border-b border-[#dfe1e5]">
        <div onClick={() => setActiveTab('google')} className={getTabStyle('google')}>
          <img src={GoogleFavicon} className="w-4 h-4 object-contain" alt="G" />
          <span className="text-xs font-medium truncate">{currentContent.tabs.google}</span>
          <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center">✕</span>
        </div>
        <div onClick={() => setActiveTab('discord')} className={getTabStyle('discord')}>
          <img src={DiscordFavicon} className="w-4 h-4 object-contain" alt="Discord" />
          <span className="text-xs font-medium truncate">{currentContent.tabs.discord}</span>
        </div>
        <div onClick={() => setActiveTab('x')} className={getTabStyle('x')}>
          <img src={XFavicon} className="w-4 h-4 object-contain" alt="X" />
          <span className="text-xs font-medium truncate">{currentContent.tabs.x}</span>
        </div>
        <div className="w-7 h-7 flex items-center justify-center hover:bg-[#dee1e6] rounded-full cursor-pointer ml-1 mb-1">
          <span className="text-lg text-[#474747]">+</span>
        </div>
      </div>
    );
  };

  const renderBrowserContent = () => {
    const leftSpacing = '180px'; 

    return (
      <div className="relative w-full h-full flex flex-col bg-white overflow-hidden"> 
        
        {/* ==================== GOOGLE 介面 ======================== */}
        {activeTab === 'google' && (
          <div className="w-full h-full flex flex-col font-sans overflow-y-auto">
            
            {/* Header */}
            <div className="w-full flex items-center sticky top-0 bg-white z-20" style={{ padding: '30px 40px' }}>
               <img src={GoogleFullLogo} alt="Google" style={{ height: '30px', marginRight: '60px', cursor: 'pointer' }} onClick={() => setView('search')} />
               <div className="flex-1 max-w-[690px] h-[46px] bg-white border border-gray-200 rounded-full px-4 flex items-center shadow-[0_1px_6px_rgba(32,33,36,0.28)] hover:shadow-md transition-shadow group">
                  <span className="text-[16px] text-[#202124] flex-1 outline-none ml-1">metamask</span>
                  <div className="flex items-center gap-3 border-l border-gray-300 pl-3 ml-2">
                     <span className="text-gray-500 cursor-pointer hover:text-gray-700 text-lg">✕</span>
                     <svg className="w-5 h-5 text-[#4285f4] cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                     <svg className="w-5 h-5 text-[#4285f4] cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                     <svg className="w-5 h-5 text-[#4285f4] cursor-pointer ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                  </div>
               </div>
               <div style={{ marginLeft: 'auto', paddingLeft: '40px' }} className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm cursor-pointer hover:bg-purple-700 transition-colors">U</div>
               </div>
            </div>

            {/* Google Nav Tabs */}
            <div className="flex gap-6 border-b border-[#dadce0] text-sm text-[#5f6368] bg-white" style={{ paddingLeft: leftSpacing }}>
                <div className="py-3 border-b-[3px] border-[#1a73e8] text-[#1a73e8] font-medium flex items-center gap-1 cursor-pointer">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg> {currentContent.google.navAll}
                </div>
                {currentContent.google.navItems.map(item => (
                  <div key={item} className="py-3 hover:text-[#202124] cursor-pointer">{item}</div>
                ))}
            </div>

            {/* 搜尋結果區 */}
            <div className="flex-1 py-6 bg-white pb-20" style={{ paddingLeft: leftSpacing, paddingRight: '20px' }}>
              <div className="text-sm text-[#70757a] mb-5">{currentContent.google.resultsCount}</div>
              
              <div className="mb-10 max-w-[650px]">
                <div className="flex items-center gap-3 mb-2 group cursor-pointer" onClick={handleSelectOfficial}>
                  <div className="bg-white p-1 rounded-full border border-[#dadce0] shadow-sm">
                    <img src={Fox} className="h-6 w-6 object-contain" alt="icon"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#202124] font-medium leading-tight">MetaMask</span>
                    <span className="text-xs text-[#202124] leading-tight">https://metamask.io</span>
                  </div>
                  <div className="text-gray-500 text-lg ml-auto font-bold mb-2">⋮</div>
                </div>
                <h3 onClick={handleSelectOfficial} className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer mb-1 leading-[1.3] font-normal">
                  MetaMask: The Leading Crypto Wallet Platform, Blockchain ...
                </h3>
                <p className="text-sm text-[#4d5156] leading-relaxed mb-4">
                  Set up your crypto wallet and access all of Web3 and enjoy total control over your data, assets, and digital self. The go-to web3 wallet for 100+ million ...
                </p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 ml-0">
                  {[
                    {t: 'Download MetaMask mobile app', d: 'Download MetaMask: The Leading Crypto Wallet. Available as a ...'}, 
                    {t: 'MetaMask Portfolio', d: 'All your assets, all your accounts, all in one place. Open ...'}, 
                    {t: 'Login', d: 'Login. MetaMask Developer provides instant and scalable ...'}, 
                    {t: 'MetaMask SDK', d: 'Securely connect your dapp to millions of MetaMask wallet ...'}
                  ].map(link => (
                    <div key={link.t} onClick={handleSelectOfficial} className="cursor-pointer group">
                      <div className="text-[#1a0dab] group-hover:underline text-[15px] mb-1">{link.t}</div>
                      {link.d && <div className="text-xs text-[#4d5156] leading-snug">{link.d}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10 max-w-[650px]">
                <div className="text-[20px] text-[#202124] mb-4">{currentContent.google.relatedQuestions}</div>
                <div className="border-t border-[#dadce0]">
                  {currentContent.google.questions.map((q) => (
                    <div key={q} className="py-3 border-b border-[#dadce0] flex justify-between items-center cursor-pointer hover:bg-gray-50">
                      <span className="text-[#202124] text-[15px]">{q}</span>
                      <svg className="w-5 h-5 text-[#70757a]" viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8 max-w-[650px]">
                 <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={handleSelectOfficial}>
                  <div className="bg-white p-1.5 rounded-full border border-[#dadce0]">
                    <img src={GoogleFavicon} className="h-4 w-4 object-contain" alt="Store"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#202124] font-medium leading-tight">Chrome Web Store</span>
                    <span className="text-xs text-[#202124]">https://chromewebstore.google.com › detail › metamask</span>
                  </div>
                  <div className="text-gray-500 text-lg ml-auto font-bold mb-2">⋮</div>
                </div>
                <h3 onClick={handleSelectOfficial} className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer mb-1 leading-[1.3]">
                   {currentContent.google.chromeStore}
                </h3>
                <p className="text-sm text-[#4d5156] leading-relaxed">
                   {currentContent.google.chromeStoreDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DISCORD 介面 (User Block 刪除) ======================= */}
        {activeTab === 'discord' && (
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

            {/* 2. 中間：頻道列表 (User Block 刪除) */}
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
              
              {/* User Profile Footer 已刪除 */}
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

                 <div className="flex gap-4 hover:bg-[#2e3035] p-2 -mx-2 rounded group">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex-shrink-0 mt-1 cursor-pointer flex items-center justify-center font-bold text-white">B</div>
                    <div>
                        <div className="flex items-center gap-2">
                           <span className="font-medium text-green-400 hover:underline cursor-pointer">Ben</span>
                           <span className="text-xs text-[#949ba4]">{currentContent.discord.todayAt}</span>
                        </div>
                        <div className="mt-1 text-[#dbdee1]">
                           <p className="font-bold text-white mb-1">{currentContent.discord.groupDescription}</p>
                           <p className="text-sm leading-relaxed mb-2">
                           {currentContent.discord.groupMessage}
                           </p>
                           <p className="text-[#00a8fc] font-bold hover:underline cursor-pointer break-all" onClick={() => handleSelectOfficial('discord')}>
                             https://metamask.io
                           </p>
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
        )}
        
        {/* ==================== X (TWITTER) 介面 =================== */}
        {activeTab === 'x' && (
           <div className="w-full h-full bg-white text-black flex justify-center font-sans overflow-hidden">
              
              {/* === 1. 左側導航欄 (User Block 刪除) === */}
              <div className="hidden md:flex flex-col h-full items-end w-[88px] xl:w-[275px] pr-4 py-4 overflow-y-auto no-scrollbar border-r border-gray-100 pb-20">
                 
                 <div className="flex flex-col w-full max-w-[240px] flex-1">
                    <div className="w-12 h-12 rounded-full hover:bg-gray-200 flex items-center justify-center cursor-pointer mb-2 transition-colors">
                       <svg viewBox="0 0 24 24" className="w-8 h-8 fill-black"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
                    </div>
                    
                    {[
                       { name: currentContent.x.home, icon: <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"/>, active: true },
                       { name: currentContent.x.explore, icon: <path d="M9.688 5.75c-2.175 0-3.938 1.763-3.938 3.938 0 2.175 1.763 3.938 3.938 3.938 2.175 0 3.938-1.763 3.938-3.938-3.938zm-6.188 3.938c0-3.417 2.771-6.188 6.188-6.188s6.188 2.771 6.188 6.188-2.771 6.188-6.188 6.188-6.188-2.771-6.188-6.188z"/>, active: false },
                       { name: currentContent.x.notifications, icon: <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2z"/>, active: false }
                    ].map((item, idx) => (
                       <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-200 rounded-full cursor-pointer transition-colors w-max xl:w-full">
                          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-black">{item.icon}</svg>
                          <span className={`hidden xl:block text-xl ${item.active ? 'font-bold' : ''}`}>{item.name}</span>
                       </div>
                    ))}
                    
                    {/* Post Button */}
                    <div className="mt-12 bg-black hover:bg-gray-800 text-white font-bold rounded-full h-[52px] w-[52px] xl:w-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                       <span className="hidden xl:block text-lg">{currentContent.x.post}</span>
                       <svg viewBox="0 0 24 24" className="xl:hidden w-6 h-6 fill-white"><path d="M23 3c-6.62-.1-10.38 2.42-13.05 6.03C7.29 12.65 6 17.33 6 22h2c0-1.05.1-4.31 1.77-8.16 1.67-3.85 6.2-7.85 13.23-7.85V3z"></path></svg>
                    </div>
                 </div>
                 
                 {/* User Profile Block Removed Here */}
              </div>

              {/* === 2. 中間：主動態牆 === */}
              <div className="w-full max-w-[600px] border-r border-gray-100 h-full flex flex-col overflow-y-auto no-scrollbar bg-white pb-20">
                 <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 flex">
                    <div className="flex-1 flex flex-col items-center justify-center h-[53px] hover:bg-gray-100 cursor-pointer transition-colors">
                       <span className="font-bold text-[15px] relative h-full flex items-center">
                          {currentContent.x.forYou}
                          <div className="absolute bottom-0 h-1 w-full bg-[#1d9bf0] rounded-full"></div>
                       </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center h-[53px] hover:bg-gray-100 cursor-pointer transition-colors">
                       <span className="text-gray-500 text-[15px]">{currentContent.x.following}</span>
                    </div>
                 </div>

                 <div className="p-4 border-b border-gray-100 flex gap-4 hidden sm:flex">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white">U</div>
                    <div className="flex-1 pt-2">
                       <div className="text-gray-500 text-xl">{currentContent.x.whatHappening}</div>
                       <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end items-center">
                          <div className="bg-black text-white px-4 py-1.5 rounded-full font-bold text-sm opacity-50 cursor-not-allowed">{currentContent.x.post}</div>
                       </div>
                    </div>
                 </div>

                 {/* 釣魚推文 */}
                 <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleSelectPhishing('x')}>
                    <div className="flex gap-3">
                       <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white">C</div>
                       <div className="flex-1">
                          <div className="flex items-center gap-1 text-gray-500 text-[15px]">
                             <span className="font-bold text-black hover:underline">CryptoWhale</span>
                             <span className="text-[#1d9bf0] fill-current w-4 h-4"><svg viewBox="0 0 22 22" className="w-full h-full fill-[#1d9bf0]"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.687.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.215 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.14.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg></span>
                             <span>@RealWhale · 1h</span>
                          </div>
                          <div className="mt-1 text-[15px] leading-normal whitespace-pre-line text-black">
                             {currentContent.x.alert} <br/>
                              <br/>
                              {currentContent.x.phishingMessage} <br/>
                             <span className="text-[#1d9bf0]">https://metamask.com</span>
                          </div>
                          <div className="mt-3 border border-gray-200 rounded-2xl overflow-hidden hover:bg-gray-50 transition-colors">
                             <div className="h-48 bg-gradient-to-r from-red-500 to-orange-600 flex flex-col items-center justify-center text-white p-4 text-center">
                                <span className="text-5xl mb-2">⚠️</span>
                                <span className="font-bold text-xl uppercase">{currentContent.x.lastChance}</span>
                             </div>
                             <div className="p-3 bg-gray-50">
                                <p className="text-gray-500 text-sm">metemask.com</p>
                                <p className="font-bold text-black">{currentContent.x.officialPatch}</p>
                             </div>
                          </div>
                          <div className="flex justify-between text-gray-500 mt-3 text-sm max-w-[400px]">
                             <span className="flex items-center gap-1 hover:text-[#1d9bf0] transition-colors"><div className="w-4 h-4 rounded-full border border-current"></div> 245</span>
                             <span className="flex items-center gap-1 hover:text-[#00ba7c] transition-colors"><div className="w-4 h-4 rounded-full border border-current"></div> 1.2k</span>
                             <span className="flex items-center gap-1 hover:text-[#f91880] transition-colors"><div className="w-4 h-4 rounded-full border border-current"></div> 3.5k</span>
                             <span className="flex items-center gap-1 hover:text-[#1d9bf0] transition-colors"><div className="w-4 h-4 rounded-full border border-current"></div> 120k</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 普通推文 */}
                 <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                       <div className="w-10 h-10 bg-green-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white">V</div>
                       <div className="flex-1">
                          <div className="flex items-center gap-1 text-gray-500 text-[15px]">
                             <span className="font-bold text-black hover:underline">VitalikButerin</span>
                             <span className="text-gray-500">@VitalikButerin · 4h</span>
                          </div>
                          <p className="mt-1 text-[15px] leading-normal text-black">
                             Looking forward to the next Ethereum upgrade. The roadmap is solid.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* === 3. 右側：資訊欄 (pl-16) === */}
              <div className="hidden lg:flex flex-col w-[350px] pl-16 py-3 h-full overflow-y-auto no-scrollbar pb-20">
                 <div className="sticky top-0 bg-white z-10 pb-2">
                    <div className="bg-[#eff3f4] rounded-full h-[42px] flex items-center px-4 focus-within:bg-white focus-within:border focus-within:border-[#1d9bf0] group">
                       <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-500 group-focus-within:fill-[#1d9bf0]"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>
                       <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-black ml-3 w-full placeholder-gray-500" />
                    </div>
                 </div>

                 <div className="bg-[#f7f9f9] rounded-2xl p-4 mb-4">
                    <h2 className="font-bold text-xl mb-2 text-black">Subscribe to Premium</h2>
                    <p className="text-black mb-2 leading-tight">Subscribe to unlock new features and if eligible, receive a share of ads revenue.</p>
                    <button className="bg-black text-white font-bold rounded-full px-5 py-2 hover:bg-gray-800 transition-colors">Subscribe</button>
                 </div>

                 <div className="bg-[#f7f9f9] rounded-2xl pt-4 mb-4">
                    <h2 className="font-black text-xl mb-4 px-4 text-black">What's happening</h2>
                    {[
                       { cat: 'Business & finance · Trending', title: 'Base', posts: '193K posts' },
                       { cat: 'Trending in Taiwan', title: '#MemeCoinSeason', posts: '156K posts' },
                       { cat: 'Technology · Trending', title: 'Solana', posts: '369K posts' },
                    ].map((item, i) => (
                       <div key={i} className="px-4 py-3 hover:bg-[#eff3f4] cursor-pointer transition-colors flex justify-between">
                          <div>
                             <div className="text-gray-500 text-xs">{item.cat}</div>
                             <div className="font-bold text-black mt-0.5">{item.title}</div>
                             <div className="text-gray-500 text-xs mt-0.5">{item.posts}</div>
                          </div>
                          <div className="text-gray-500">...</div>
                       </div>
                    ))}
                    <div className="px-4 py-4 text-[#1d9bf0] hover:bg-[#eff3f4] cursor-pointer rounded-b-2xl text-sm">Show more</div>
                 </div>
              </div>
           </div>
        )}

        {/* === 底部教學聲明 === */}
        <div className="absolute bottom-0 w-full bg-[#202124]/95 backdrop-blur-sm text-white py-2 text-center z-50 border-t border-gray-600 flex items-center justify-center gap-2">
           <span className="text-yellow-400 text-lg">⚠️</span>
           <p className="text-xs md:text-sm font-mono tracking-wider">
              {currentContent.footer.warning}
           </p>
        </div>

      </div>
    );
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
                  ? '建議先閱讀「WEB3錢包知識本」以了解相關知識' 
                  : 'It is recommended to read "WEB3 Wallet Knowledge Book" first to understand relevant knowledge'}
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
                // 重置 openBackpack 状态，以便下次可以再次打开
                setTimeout(() => setOpenBackpack(false), 100);
              }}
              className="flex-1 py-4 bg-purple-200 hover:bg-purple-300 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] transform hover:scale-[1.02]"
            >
              {language === 'chinese' ? '打開背包' : 'Open Backpack'}
            </button>
            <button
              onClick={() => {
                setShowItemReminder(false);
                setView('search');
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

  return (
    <ChallengeTemplate 
      language={language} 
      setLanguage={setLanguage} 
      title={t?.title}
      containerMaxWidth="100vw"
      containerMaxHeight="100vh"
      openBackpack={openBackpack}
    >
      {/* 道具提醒消息框 */}
      {renderItemReminder()}
      
      {view === 'map' && <PhaseRoadmap steps={roadmapSteps} onStartLevel={handleStartLevel} language={language} />}
      {view === 'intro' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderMissionIntro()}
        </div>
      )}
      {view === 'search' && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url={activeTab === 'google' ? "https://www.google.com/search?q=metamask" : activeTab === 'discord' ? "discord.com/channels/web3" : "x.com/home"}
            tabs={renderTabs()}
            className="w-full max-w-7xl h-[85vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            {renderBrowserContent()}
          </BrowserFrame>
        </div>
      )}
      {view === 'onboarding' && (
         <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
            <h1 className="text-2xl">Onboarding Page (To be implemented)</h1>
         </div>
      )}
      {showResult && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChallengeResultScreen 
            isSuccess={isCorrect}
            title={isCorrect ? (language === 'chinese' ? "通關成功！" : "Challenge Passed!") : (language === 'chinese' ? "遭受釣魚攻擊" : "Phishing Attack Detected")}
            description={isCorrect ? (language === 'chinese' ? "你成功避開了社交工程陷阱！" : "You successfully avoided the social engineering trap!") : (language === 'chinese' ? "你點擊了非官方連結。" : "You clicked on an unofficial link.")}
            successMessage={isCorrect ? (language === 'chinese' ? "選擇了正確的域名" : "Correct Domain Selected") : undefined}
            failureMessage={!isCorrect ? (language === 'chinese' ? "選擇了錯誤的域名" : "Wrong Domain Selected") : undefined}
            successExplanation={isCorrect ? (language === 'chinese' ? "你正確識別並選擇了官方 MetaMask 網站。" : "You correctly identified and selected the official MetaMask website.") : undefined}
            failureExplanation={!isCorrect ? (language === 'chinese' ? "請檢查以下項目：" : "Please check the following items:") : undefined}
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
            checkItems={isCorrect ? [
            {
              label: language === 'chinese' ? '域名檢查' : 'Domain Check',
              value: 'metamask.io',
              isCorrect: true,
              showValue: true
            },
            {
              label: language === 'chinese' ? '來源信任' : 'Source Trust',
              value: source === 'google' 
                ? (language === 'chinese' ? '官方搜尋結果' : 'Official Search Result')
                : source === 'discord'
                ? 'Discord'
                : (language === 'chinese' ? '官方連結' : 'Official Link'),
              isCorrect: true,
              showValue: true
            }
          ] : [
            {
              label: language === 'chinese' ? '可疑域名' : 'Suspicious Domain',
              value: activeTab === 'x' ? 'metamask-token-claim.com' : 'unknown-site.com',
              isCorrect: false,
              showValue: true,
              details: language === 'chinese' ? '非官方域名，包含誤導性關鍵字。' : 'Unofficial domain with misleading keywords.'
            },
            {
              label: language === 'chinese' ? '可疑來源' : 'Suspicious Source',
              value: language === 'chinese' ? '非官方/私訊/廣告連結' : 'Unofficial/DM/Ad Link',
              isCorrect: false,
              showValue: true
            }
          ]}
            onNextLevel={handleNextLevel}
            nextLevelButtonText={language === 'chinese' ? '下一關' : 'Next Level'}
          />
        </div>
      )}
    </ChallengeTemplate>
  );
};

export default PhishingEmailChallenge;