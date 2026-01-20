import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChallengeTemplate from './ChallengeTemplate';
import ChallengeResultScreen from './ChallengeResultScreen';
import PhaseRoadmap from '../PhaseRoadmap';
import BrowserFrame from './BrowserFrame';
import CoinbaseLogo from '../../assets/coinbase.png';
import CoinbaseFCA from '../../assets/CoinbaseFCA.jpg';
import CoinbaseMAS from '../../assets/CoinbaseMAS.jpg';
import CoinbaseMSB from '../../assets/CoinbaseMSB.jpg';

// Icons components
const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="square" strokeLinejoin="miter" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2 text-red-400 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CheckIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2 text-green-400 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const CentralizedPlatform = ({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('map'); // 'map' | 'intro' | 'challenge'
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [language, setLanguage] = useState('chinese');
  const [stage, setStage] = useState(1); // 1: Domain Check, 2: Feature Check, 3: Coinbase Introduction

  // Drag and Drop State
  const [items, setItems] = useState([]);
  const [phishingBox, setPhishingBox] = useState([]);
  const [legitBox, setLegitBox] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [errorItems, setErrorItems] = useState([]);

  // Touch Drag State (for tablet/mobile support)
  const [touchDragState, setTouchDragState] = useState({
    isDragging: false,
    item: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    targetBox: null
  });

  // Stage 3: Coinbase License Selection State
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [licenseError, setLicenseError] = useState('');
  const [currentLicenseImageIndex, setCurrentLicenseImageIndex] = useState(0);
  
  // Item Reminder State
  const [showItemReminder, setShowItemReminder] = useState(false); // 显示道具提醒
  const [openBackpack, setOpenBackpack] = useState(false); // 控制打开背包
  const [autoOpenItemIndex, setAutoOpenItemIndex] = useState(null); // 自動打開的道具索引

  // License images for carousel
  const licenseImages = useMemo(() => [
    { id: 'fca', image: CoinbaseFCA, name: language === 'chinese' ? 'FCA 牌照' : 'FCA License' },
    { id: 'mas', image: CoinbaseMAS, name: language === 'chinese' ? 'MAS 牌照' : 'MAS License' },
    { id: 'msb', image: CoinbaseMSB, name: language === 'chinese' ? 'MSB 牌照' : 'MSB License' }
  ], [language]);

  // Reset license image index when showing result (both success and failure)
  useEffect(() => {
    if (stage === 3 && showResult) {
      // Reset to first image when showing result (both success and failure)
      setCurrentLicenseImageIndex(0);
    }
  }, [stage, showResult]);

  // Handle license image navigation
  const handlePreviousImage = () => {
    setCurrentLicenseImageIndex((prev) => 
      prev === 0 ? licenseImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentLicenseImageIndex((prev) => 
      (prev + 1) % licenseImages.length
    );
  };

  // 域名清單：完整 URL，含 https/http，方便辨識釣魚手法
  const stage1Items = [
    // 官方 / 合法
    { id: 1, name: 'https://www.binance.com', type: 'legit' },
    { id: 2, name: 'https://www.coinbase.com', type: 'legit' },
    { id: 3, name: 'https://www.kraken.com', type: 'legit' },
    { id: 4, name: 'https://www.okx.com', type: 'legit' },
    { id: 5, name: 'https://www.bybit.com', type: 'legit' },
    { id: 6, name: 'https://www.bitget.com', type: 'legit' },
    { id: 7, name: 'https://www.kucoin.com', type: 'legit' },
    { id: 8, name: 'https://www.gate.io', type: 'legit' },
    { id: 9, name: 'https://www.htx.com', type: 'legit' },
    { id: 10, name: 'https://www.crypto.com', type: 'legit' },

    // 釣魚 / 可疑
    { id: 11, name: 'https://www.biance.com', type: 'phishing' }, 
    { id: 12, name: 'https://www.cainbase.com', type: 'phishing' },
    { id: 13, name: 'https://www.binance-login.com', type: 'phishing' },
    { id: 14, name: 'https://binance-secure.org', type: 'phishing' },
    { id: 15, name: 'https://www.coinbase-support.net', type: 'phishing' },
    { id: 16, name: 'https://kraken-verify.com', type: 'phishing' },
    { id: 17, name: 'https://www.binance.co', type: 'phishing' },
    { id: 18, name: 'https://www.coinbase.app', type: 'phishing' },
    { id: 19, name: 'https://bybit.exchange', type: 'phishing' },
    { id: 20, name: 'https://binance.com.security-check.ru', type: 'phishing' },
    { id: 21, name: 'https://coinbase.com.login.verify-scamsite.com', type: 'phishing' },
    { id: 22, name: 'http://bit.ly/3XxxxYz', type: 'phishing' },
    { id: 23, name: 'http://tinyurl.com/binance-reward', type: 'phishing' },
    { id: 24, name: 'https://Binance.com.security-update.page', type: 'phishing' },
    { id: 25, name: 'https://www.coin-base.com', type: 'phishing' },
  ];

  // Stage 2 Items: Features & Behaviors with detailed explanations
  const stage2Items = [
    { 
      id: 101, 
      content: '註冊時要求提供身份證件、進行人臉比對或地址驗證。', 
      contentEn: 'Registration requires providing ID documents, facial recognition, or address verification.',
      type: 'legit',
      explanationZh: '全球合規平台（如 Coinbase、Kraken）均強制 KYC，尤其在歐美、新加坡、日本。',
      explanationEn: 'Compliant platforms worldwide (e.g., Coinbase, Kraken) require mandatory KYC, especially in Europe, US, Singapore, and Japan.'
    },
    { 
      id: 102, 
      content: '註冊過程無需提供身份證明即可完成並開始交易。', 
      contentEn: 'Registration can be completed and trading can begin without providing identity verification.',
      type: 'phishing',
      explanationZh: '合規平台不容許匿名交易；無 KYC 即可交易多見於未受監管或詐騙平台。',
      explanationEn: 'Compliant platforms do not allow anonymous trading; trading without KYC is common in unregulated or scam platforms.'
    },
    { 
      id: 103, 
      content: '註冊後可立即進行大額提現，無審核流程。', 
      contentEn: 'Large withdrawals can be made immediately after registration, with no review process.',
      type: 'phishing',
      explanationZh: '合規平台對新帳戶有提現冷卻期或額度限制，防洗錢。',
      explanationEn: 'Compliant platforms have withdrawal cooldown periods or limits for new accounts to prevent money laundering.'
    },
    { 
      id: 104, 
      content: '提現前需完成多階段身份驗證。', 
      contentEn: 'Multi-stage identity verification is required before withdrawal.',
      type: 'legit',
      explanationZh: '分級驗證（Level 1/2/3）是標準做法，高額提現需更高驗證。',
      explanationEn: 'Tiered verification (Level 1/2/3) is standard practice; high-value withdrawals require higher verification.'
    },
    { 
      id: 105, 
      content: '註冊或提現過程中要求支付額外費用（如驗證費、解凍費）。', 
      contentEn: 'Additional fees (such as verification fees or unfreezing fees) are required during registration or withdrawal.',
      type: 'phishing',
      explanationZh: '合規平台絕不收取「驗證費」；此為經典詐騙話術。',
      explanationEn: 'Compliant platforms never charge "verification fees"; this is a classic scam tactic.'
    },
    { 
      id: 106, 
      content: '提供質押或儲蓄服務，並標註「收益非保證」或「本金有風險」。', 
      contentEn: 'Provides staking or savings services, and labels "yield not guaranteed" or "principal at risk."',
      type: 'legit',
      explanationZh: '如 Coinbase、Binance 均明確標示風險，符合金融廣告規範。',
      explanationEn: 'Platforms like Coinbase and Binance clearly indicate risks, complying with financial advertising regulations.'
    },
    { 
      id: 107, 
      content: '宣稱固定高年化收益率（例如「日息 1%」或「穩賺不賠」）。', 
      contentEn: 'Claims fixed high annualized returns (e.g., "1% daily interest" or "guaranteed profit").',
      type: 'phishing',
      explanationZh: '合規平台不承諾保本或固定高收益（日息 1% = 年化 3650%，不可能）。',
      explanationEn: 'Compliant platforms do not promise guaranteed returns or fixed high yields (1% daily = 3650% annual, impossible).'
    },
    { 
      id: 108, 
      content: '收益產品支援主流資產（如 ETH、BTC、USDC），並說明收益來源。', 
      contentEn: 'Yield products support mainstream assets (e.g., ETH, BTC, USDC) and explain the source of income.',
      type: 'legit',
      explanationZh: '收益來源透明（如 PoS 質押、借貸市場）。',
      explanationEn: 'Revenue sources are transparent (e.g., PoS staking, lending markets).'
    },
    { 
      id: 109, 
      content: '收益機制未說明具體運作方式，僅強調高回報。', 
      contentEn: 'The revenue mechanism does not explain the specific operation method, only emphasizes high returns.',
      type: 'phishing',
      explanationZh: '資金盤常見手法：用高回報吸引，不解釋如何產生收益。',
      explanationEn: 'Common Ponzi scheme tactic: attract with high returns without explaining how profits are generated.'
    },
    { 
      id: 110, 
      content: '提供推薦獎勵，且獎勵比例高於常見市場水平（如推薦一人返 30%）。', 
      contentEn: 'Offers referral rewards, and the reward ratio is higher than common market levels (e.g., 30% return for referring one person).',
      type: 'phishing',
      explanationZh: '合規平台推薦獎勵通常 ≤10%（如 Coinbase 約 5–10%），30% 屬異常。',
      explanationEn: 'Compliant platforms typically offer ≤10% referral rewards (e.g., Coinbase ~5–10%); 30% is abnormal.'
    },
    { 
      id: 111, 
      content: '網域名稱僅包含品牌名稱，頂級域為 .com 或行業常見域名（如 .io）。', 
      contentEn: 'The domain name only contains the brand name, and the top-level domain is .com or a common industry domain (e.g., .io).',
      type: 'legit',
      explanationZh: 'binance.com、gate.io 為官方標準。',
      explanationEn: 'binance.com, gate.io are official standards.'
    },
    { 
      id: 112, 
      content: '網域名稱包含額外詞彙，如 login、support、verify、secure。', 
      contentEn: 'The domain name contains additional words, such as login, support, verify, secure.',
      type: 'phishing',
      explanationZh: '官方不會用 binance-login.com；此為釣魚常見變體。',
      explanationEn: 'Official platforms do not use binance-login.com; this is a common phishing variant.'
    },
    { 
      id: 113, 
      content: '使用非標準頂級域（如 .net、.org、.app、.xyz）搭配主流品牌名。', 
      contentEn: 'Using non-standard top-level domains (e.g., .net, .org, .app, .xyz) with mainstream brand names.',
      type: 'phishing',
      explanationZh: '合規平台極少使用非 .com/.io 域名承載主業務。',
      explanationEn: 'Compliant platforms rarely use non-.com/.io domains for main business operations.'
    },
    { 
      id: 114, 
      content: '網址以短網址服務（如 bit.ly、tinyurl.com）呈現。', 
      contentEn: 'URL is presented using URL shortening services (e.g., bit.ly, tinyurl.com).',
      type: 'phishing',
      explanationZh: '官方從不透過短網址引導用戶登入或充值。',
      explanationEn: 'Official platforms never use URL shorteners to direct users to login or deposit pages.'
    },
    { 
      id: 115, 
      content: '主域名位於子網域中，例如 brand.com.fake-site.ru。', 
      contentEn: 'The main domain is located within a subdomain, for example, brand.com.fake-site.ru.',
      type: 'phishing',
      explanationZh: '真實域名是 fake-site.ru，利用子網域視覺欺騙。',
      explanationEn: 'The real domain is fake-site.ru, using subdomain visual deception.'
    },
    { 
      id: 116, 
      content: '客服僅透過網站內建工單系統或官方郵箱提供支援。', 
      contentEn: 'Customer service only provides support through the website\'s built-in ticket system or official email.',
      type: 'legit',
      explanationZh: '如 Coinbase、Kraken 僅提供工單或 help@ 官郵。',
      explanationEn: 'Platforms like Coinbase and Kraken only provide tickets or official help@ email.'
    },
    { 
      id: 117, 
      content: '客服主動透過社交平台私訊（如 Telegram、WhatsApp、Line）聯繫用戶。', 
      contentEn: 'Customer service proactively contacts users through social media private messages (e.g., Telegram, WhatsApp, Line).',
      type: 'phishing',
      explanationZh: '合規平台絕不主動私訊；此為社交工程經典手法。',
      explanationEn: 'Compliant platforms never proactively message users; this is a classic social engineering tactic.'
    },
    { 
      id: 118, 
      content: '官方網站未列出實體公司名稱、註冊地或監管資訊。', 
      contentEn: 'The official website does not list the physical company name, registration location, or regulatory information.',
      type: 'phishing',
      explanationZh: '合規平台必有「Legal」或「Compliance」頁面。',
      explanationEn: 'Compliant platforms must have "Legal" or "Compliance" pages.'
    },
    { 
      id: 119, 
      content: '網站底部明確列出監管機構名稱與牌照編號。', 
      contentEn: 'The website footer clearly lists regulatory agency names and license numbers.',
      type: 'legit',
      explanationZh: '如 Coinbase 列出 FCA FRN、MAS 牌照號等。',
      explanationEn: 'Platforms like Coinbase list FCA FRN, MAS license numbers, etc.'
    },
    { 
      id: 120, 
      content: '提現僅收取區塊鏈網路手續費，無其他附加費用。', 
      contentEn: 'Withdrawals only charge blockchain network fees, with no other additional fees.',
      type: 'legit',
      explanationZh: '提現成本僅為 gas fee，無「平台驗證費」。',
      explanationEn: 'Withdrawal cost is only gas fees, no "platform verification fees".'
    },
    { 
      id: 121, 
      content: '提現時系統提示需先支付一定金額才能完成驗證。', 
      contentEn: 'The system prompts that a certain amount must be paid first to complete verification when withdrawing.',
      type: 'phishing',
      explanationZh: '經典「提現詐騙」：付費後仍無法提現。',
      explanationEn: 'Classic "withdrawal scam": unable to withdraw even after payment.'
    },
    { 
      id: 122, 
      content: '提現申請後需等待審核，時間與規則透明。', 
      contentEn: 'Withdrawal applications require review, and the time and rules are transparent.',
      type: 'legit',
      explanationZh: '合規平台提現有明確時間表（如 24–48 小時）。',
      explanationEn: 'Compliant platforms have clear withdrawal timelines (e.g., 24–48 hours).'
    },
    { 
      id: 123, 
      content: '提現按鈕長期處於無法點擊狀態，或狀態顯示為「系統維護中」。', 
      contentEn: 'The withdrawal button is in an unclickable state for a long time, or the status shows "system maintenance".',
      type: 'phishing',
      explanationZh: '實際為資金池枯竭或平台無意讓用戶提現。',
      explanationEn: 'Actually indicates depleted funds or platform unwillingness to allow withdrawals.'
    },
    { 
      id: 124, 
      content: '支援本地法幣出入金，並需綁定用戶名下的銀行帳戶。', 
      contentEn: 'Supports local fiat currency deposits and withdrawals, and requires binding a bank account under the user\'s name.',
      type: 'legit',
      explanationZh: '如日本、韓國、新加坡平台均需綁定本地銀行。',
      explanationEn: 'Platforms in Japan, Korea, and Singapore require binding to local bank accounts.'
    },
    { 
      id: 125, 
      content: '網站聲明資產多數存於離線冷錢包，並提及保險或第三方審計。', 
      contentEn: 'The website claims most assets are stored in offline cold wallets and mentions insurance or third-party audits.',
      type: 'legit',
      explanationZh: '如 Coinbase 說明 >98% 冷儲存 + 2.55 億美元保險。',
      explanationEn: 'Platforms like Coinbase state >98% cold storage + $255 million insurance.'
    },
    { 
      id: 126, 
      content: '網站未提供任何關於資產儲存或安全措施的具體說明。', 
      contentEn: 'The website does not provide any specific information about asset storage or security measures.',
      type: 'phishing',
      explanationZh: '安全資訊空白或僅用「軍用級加密」等模糊詞。',
      explanationEn: 'Security information is blank or only uses vague terms like "military-grade encryption".'
    },
    { 
      id: 127, 
      content: '產品頁面標註風險提示，如「非存款保險」或「價值可能波動」。', 
      contentEn: 'Product pages label risk warnings, such as "not deposit insurance" or "value may fluctuate".',
      type: 'legit',
      explanationZh: '受監管平台依法需披露風險。',
      explanationEn: 'Regulated platforms are legally required to disclose risks.'
    },
    { 
      id: 128, 
      content: '所有金融產品均以「保證收益」或「零風險」作為宣傳重點。', 
      contentEn: 'All financial products use "guaranteed returns" or "zero risk" as the main selling point.',
      type: 'phishing',
      explanationZh: '合規金融產品不得宣稱「零風險」或「保本」。',
      explanationEn: 'Compliant financial products cannot claim "zero risk" or "principal guaranteed".'
    },
  ];

  // 釣魚手法分類（6種類型）
  const phishingCategoryTypes = {
    keywordInsertion: {
      zh: '插入功能詞',
      en: 'Keyword Insertion',
      zhDesc: '在域名中插入 -login、-support、-verify、-secure 等功能詞，偽裝成官方功能頁面。',
      enDesc: 'Inserts functional keywords like -login, -support, -verify, -secure into the domain to mimic official function pages.'
    },
    typosquatting: {
      zh: '混淆拼寫',
      en: 'Typosquatting',
      zhDesc: '用錯字或類似字母代替，或者少了一些字，誘導輸入錯誤流量。',
      enDesc: 'Uses misspellings or similar letters, or omits characters to capture typo traffic.'
    },
    hyphenSquatting: {
      zh: '添加連接符',
      en: 'Hyphen Squatting',
      zhDesc: '在品牌名稱中插入連字符（-），造成視覺混淆。',
      enDesc: 'Inserts hyphens (-) within brand names to cause visual confusion.'
    },
    nonStandardTLD: {
      zh: '使用非頂級域名',
      en: 'Non-Standard TLD',
      zhDesc: '使用 .xyz、.app、.exchange、.org、.net 等非官方使用的頂級域名，而非 .com 或 .io。',
      enDesc: 'Uses non-standard TLDs like .xyz, .app, .exchange, .org, .net instead of official .com or .io.'
    },
    subdomainSpoofing: {
      zh: '子域名欺騙',
      en: 'Subdomain Spoofing',
      zhDesc: '使用子域名偽裝，例如 brand.com.fake-site.ru，真正的域名是後面的部分。',
      enDesc: 'Uses subdomain spoofing, e.g., brand.com.fake-site.ru, where the real domain is the latter part.'
    },
    urlShortening: {
      zh: '短網址工具',
      en: 'URL Shortening',
      zhDesc: '使用 bit.ly、tinyurl.com 等短網址服務，隱藏真實域名，令用戶無法查閱完整域名。',
      enDesc: 'Uses URL shortening services like bit.ly, tinyurl.com to hide the real domain, preventing users from viewing the full domain.'
    }
  };

  // 釣魚手法解析（結果頁用）- 按6種類型分類
  const phishingReasons = [
    // 1. 插入功能詞
    {
      name: 'https://www.binance-login.com',
      category: 'keywordInsertion',
      zhMethod: '插入功能詞',
      enMethod: 'Keyword Insertion',
      zhDesc: '在品牌後加入 "login"，偽裝官方登入頁。',
      enDesc: 'Adds "login" after the brand to mimic an official sign-in page.'
    },
    {
      name: 'https://binance-secure.org',
      category: 'keywordInsertion',
      zhMethod: '插入功能詞',
      enMethod: 'Keyword Insertion',
      zhDesc: '插入 "secure" 功能詞，同時使用非官方 TLD (.org)。',
      enDesc: 'Inserts "secure" keyword while using non-official TLD (.org).'
    },
    {
      name: 'https://www.coinbase-support.net',
      category: 'keywordInsertion',
      zhMethod: '插入功能詞',
      enMethod: 'Keyword Insertion',
      zhDesc: '插入 "support" 功能詞，同時使用非官方 TLD (.net)。',
      enDesc: 'Inserts "support" keyword while using non-official TLD (.net).'
    },
    {
      name: 'https://kraken-verify.com',
      category: 'keywordInsertion',
      zhMethod: '插入功能詞',
      enMethod: 'Keyword Insertion',
      zhDesc: '插入 "verify" 功能詞，Kraken 官方不使用此類子品牌。',
      enDesc: 'Inserts "verify" keyword; Kraken does not use such sub-brands officially.'
    },
    // 2. 混淆拼寫
    {
      name: 'https://www.biance.com',
      category: 'typosquatting',
      zhMethod: '混淆拼寫',
      enMethod: 'Typosquatting',
      zhDesc: '將 "binance" 拼錯成 "biance"（缺少 n），誘導輸入錯誤流量。',
      enDesc: 'Misspells "binance" as "biance" (missing the "n"), capturing typo traffic.'
    },
    {
      name: 'https://www.cainbase.com',
      category: 'typosquatting',
      zhMethod: '混淆拼寫',
      enMethod: 'Typosquatting',
      zhDesc: '將 "coinbase" 寫成 "cainbase"（oi 變成 ai），常見快速打字錯誤。',
      enDesc: 'Spells "coinbase" as "cainbase" (oi becomes ai), a common fast-typing mistake.'
    },
    // 3. 添加連接符
    {
      name: 'https://www.coin-base.com',
      category: 'hyphenSquatting',
      zhMethod: '添加連接符',
      enMethod: 'Hyphen Squatting',
      zhDesc: '在品牌 "coinbase" 中插入連字符，變成 "coin-base"，造成混淆。',
      enDesc: 'Inserts a hyphen within "coinbase" to become "coin-base", causing confusion.'
    },
    // 4. 使用非頂級域名
    {
      name: 'https://www.binance.co',
      category: 'nonStandardTLD',
      zhMethod: '使用非頂級域名',
      enMethod: 'Non-Standard TLD',
      zhDesc: '使用 .co 而非官方 .com，視覺上相近但非官方域名。',
      enDesc: 'Uses .co instead of official .com, visually similar but not the official domain.'
    },
    {
      name: 'https://www.coinbase.app',
      category: 'nonStandardTLD',
      zhMethod: '使用非頂級域名',
      enMethod: 'Non-Standard TLD',
      zhDesc: '使用 .app 而非官方 .com，雖合法但非 Coinbase 官方使用。',
      enDesc: 'Uses .app instead of official .com; legal but not used by Coinbase officially.'
    },
    {
      name: 'https://bybit.exchange',
      category: 'nonStandardTLD',
      zhMethod: '使用非頂級域名',
      enMethod: 'Non-Standard TLD',
      zhDesc: '使用 .exchange 而非官方 .com，看似合理但 Bybit 官方僅用 bybit.com。',
      enDesc: 'Uses .exchange instead of official .com; seems relevant but Bybit only uses bybit.com.'
    },
    {
      name: 'https://binance-secure.org',
      category: 'nonStandardTLD',
      zhMethod: '使用非頂級域名',
      enMethod: 'Non-Standard TLD',
      zhDesc: '使用 .org 而非官方 .com，同時插入功能詞 "secure"。',
      enDesc: 'Uses .org instead of official .com, while inserting "secure" keyword.'
    },
    {
      name: 'https://www.coinbase-support.net',
      category: 'nonStandardTLD',
      zhMethod: '使用非頂級域名',
      enMethod: 'Non-Standard TLD',
      zhDesc: '使用 .net 而非官方 .com，同時插入功能詞 "support"。',
      enDesc: 'Uses .net instead of official .com, while inserting "support" keyword.'
    },
    // 5. 子域名欺騙
    {
      name: 'https://binance.com.security-check.ru',
      category: 'subdomainSpoofing',
      zhMethod: '子域名欺騙',
      enMethod: 'Subdomain Spoofing',
      zhDesc: '真正的域名是 security-check.ru，"binance.com" 只是子域名，偽裝成官方域名。',
      enDesc: 'Real domain is security-check.ru; "binance.com" is just a subdomain, disguising as official domain.'
    },
    {
      name: 'https://coinbase.com.login.verify-scamsite.com',
      category: 'subdomainSpoofing',
      zhMethod: '子域名欺騙',
      enMethod: 'Subdomain Spoofing',
      zhDesc: '真正的域名是 verify-scamsite.com，前面的 "coinbase.com.login" 只是多層子域名。',
      enDesc: 'Real domain is verify-scamsite.com; "coinbase.com.login" is just nested subdomains.'
    },
    {
      name: 'https://Binance.com.security-update.page',
      category: 'subdomainSpoofing',
      zhMethod: '子域名欺騙',
      enMethod: 'Subdomain Spoofing',
      zhDesc: '真正的域名是 security-update.page，"Binance.com" 只是子域名片段，同時使用混合大小寫混淆。',
      enDesc: 'Real domain is security-update.page; "Binance.com" is just a subdomain fragment, using mixed case to confuse.'
    },
    // 6. 短網址工具
    {
      name: 'http://bit.ly/3XxxxYz',
      category: 'urlShortening',
      zhMethod: '短網址工具',
      enMethod: 'URL Shortening',
      zhDesc: '使用 bit.ly 短網址服務，隱藏真實域名，用戶無法直接查看完整域名。',
      enDesc: 'Uses bit.ly URL shortening service to hide the real domain, preventing users from viewing the full domain.'
    },
    {
      name: 'http://tinyurl.com/binance-reward',
      category: 'urlShortening',
      zhMethod: '短網址工具',
      enMethod: 'URL Shortening',
      zhDesc: '使用 tinyurl.com 短網址服務，並以 "reward" 誘餌詞吸引點擊，隱藏真實域名。',
      enDesc: 'Uses tinyurl.com URL shortening service with "reward" bait keyword to attract clicks, hiding the real domain.'
    },
  ];

  // 第二階段教學用詞條（成功/失敗結果畫面展示）
  const featureChecklist = [
    '註冊時要求提供身份證件、進行人臉比對或地址驗證。',
    '註冊過程無需提供身份證明即可完成並開始交易。',
    '註冊後可立即進行大額提現，無審核流程。',
    '提現前需完成多階段身份驗證。',
    '註冊或提現過程中要求支付額外費用（如驗證費、解凍費）。',
    '提供質押或儲蓄服務，並標註「收益非保證」或「本金有風險」。',
    '宣稱固定高年化收益率（例如「日息 1%」或「穩賺不賠」）。',
    '收益產品支援主流資產（如 ETH、BTC、USDC），並說明收益來源。',
    '收益機制未說明具體運作方式，僅強調高回報。',
    '提供推薦獎勵，且獎勵比例高於常見市場水平（如推薦一人返 30%）。',
    '網域名稱僅包含品牌名稱，頂級域為 .com 或行業常見域名（如 .io）。',
    '網域名稱包含額外詞彙，如 login、support、verify、secure。',
    '使用非標準頂級域（如 .net、.org、.app、.xyz）搭配主流品牌名。',
    '網址以短網址服務（如 bit.ly、tinyurl.com）呈現。',
    '主域名位於子網域中，例如 brand.com.fake-site.ru。',
    '客服僅透過網站內建工單系統或官方郵箱提供支援。',
    '客服主動透過社交平台私訊（如 Telegram、WhatsApp、Line）聯繫用戶。',
    '官方網站未列出實體公司名稱、註冊地或監管資訊。',
    '網站底部明確列出監管機構名稱與牌照編號。',
    '提現僅收取區塊鏈網路手續費，無其他附加費用。',
    '提現時系統提示需先支付一定金額才能完成驗證。',
    '提現申請後需等待審核，時間與規則透明。',
    '提現按鈕長期處於無法點擊狀態，或狀態顯示為「系統維護中」。',
    '支援本地法幣出入金，並需綁定用戶名下的銀行帳戶。',
    '網站聲明資產多數存於離線冷錢包，並提及保險或第三方審計。',
    '網站未提供任何關於資產儲存或安全措施的具體說明。',
    '產品頁面標註風險提示，如「非存款保險」或「價值可能波動」。',
    '所有金融產品均以「保證收益」或「零風險」作為宣傳重點。',
  ];

  // 随机选择第一阶段域名：5个合法 + 5个非法
  const getRandomStage1Items = () => {
    const legitItems = stage1Items.filter(item => item.type === 'legit');
    const phishingItems = stage1Items.filter(item => item.type === 'phishing');
    
    // 随机选择5个合法域名
    const selectedLegit = [...legitItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    // 随机选择5个非法域名
    const selectedPhishing = [...phishingItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    // 合并并打乱顺序
    return [...selectedLegit, ...selectedPhishing]
      .sort(() => Math.random() - 0.5);
  };

  // 随机选择第二阶段特征：7个合法 + 7个非法
  const getRandomStage2Items = () => {
    const legitItems = stage2Items.filter(item => item.type === 'legit');
    const phishingItems = stage2Items.filter(item => item.type === 'phishing');
    
    // 随机选择7个合法特征
    const selectedLegit = [...legitItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, 7);
    
    // 随机选择7个非法特征
    const selectedPhishing = [...phishingItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, 7);
    
    // 合并并打乱顺序
    return [...selectedLegit, ...selectedPhishing]
      .sort(() => Math.random() - 0.5);
  };

  // 初始化：路由变化时重置状态
  useEffect(() => {
    setView('map');
    setShowResult(false);
    setIsCorrect(false);
    setStage(1);
    // Reset game - 随机选择10个域名（5合法+5非法）
    setItems(getRandomStage1Items());
    setPhishingBox([]);
    setLegitBox([]);
    // Reset Stage 3
    setSelectedLicenses([]);
    setLicenseError('');
    setShowItemReminder(false);
    setOpenBackpack(false);
    setAutoOpenItemIndex(null);
  }, [location.pathname, config]);

  if (!config) {
    return (
      <div className="text-white text-center p-8">
        <h1 className="text-2xl">挑战配置未找到</h1>
      </div>
    );
  }

  // 处理下一关导航
  const handleNextLevel = () => {
    if (config?.nextLevel) {
      const phase = config.nextLevel.split('-')[0];
      navigate(`/challenge/${phase}/${config.nextLevel}`);
    }
  };

  const startStage2 = () => {
    setStage(2);
    setShowResult(false);
    setIsCorrect(false);
    // 随机选择14个特征（7合法+7非法）
    setItems(getRandomStage2Items());
    setPhishingBox([]);
    setLegitBox([]);
  };

  const startStage3 = () => {
    setStage(3);
    setShowResult(false);
    setIsCorrect(false);
    setSelectedLicenses([]);
    setLicenseError('');
  };

  // 处理牌照选择（多选）
  const handleLicenseToggle = (licenseId) => {
    setLicenseError('');
    setSelectedLicenses(prev => {
      if (prev.includes(licenseId)) {
        return prev.filter(id => id !== licenseId);
      } else {
        return [...prev, licenseId];
      }
    });
  };

  // 检查牌照选择结果
  const checkLicenseSelection = () => {
    // 所有三个牌照都是正确的
    const correctLicenses = ['fca', 'mas', 'msb'];
    const selectedSet = new Set(selectedLicenses);
    const correctSet = new Set(correctLicenses);
    
    // 检查是否选择了所有正确的牌照，且没有选择错误的
    const allCorrect = correctLicenses.every(id => selectedSet.has(id));
    const noExtra = selectedLicenses.every(id => correctSet.has(id));
    
    if (allCorrect && noExtra && selectedLicenses.length === 3) {
      setIsCorrect(true);
      setLicenseError('');
      setShowResult(true);
    } else {
      setIsCorrect(false);
      if (selectedLicenses.length === 0) {
        setLicenseError(language === 'chinese' ? '請至少選擇一個牌照' : 'Please select at least one license');
      } else {
        setLicenseError(language === 'chinese' ? '請選擇所有正確的牌照' : 'Please select all correct licenses');
      }
      setShowResult(true);
    }
  };

  // 重置當前階段（仍保留以防日後需要重試）
  const resetCurrentStage = () => {
    setShowResult(false);
    setIsCorrect(false);
    setPhishingBox([]);
    setLegitBox([]);
    if (stage === 1) {
      // 随机选择10个域名（5合法+5非法）
      setItems(getRandomStage1Items());
    } else {
      // 随机选择14个特征（7合法+7非法）
      setItems(getRandomStage2Items());
    }
  };

  // 处理 roadmap 点击
  const handleStartLevel = (stepId) => {
    if (stepId === 'cex' || stepId === 'phase1-5') setView('intro');
  };

  // Roadmap 步骤配置
  const roadmapSteps = [
    { id: 'search', iconType: 'search', status: 'completed', title: { chinese: '下載錢包', english: 'Download Wallet' } },
    { id: 'create', iconType: 'create', status: 'completed', title: { chinese: '創建錢包', english: 'Create Wallet' } },
    { id: 'deposit', iconType: 'deposit', status: 'completed', title: { chinese: '首次入金', english: 'First Deposit' } },
    { id: 'transfer', iconType: 'transfer', status: 'completed', title: { chinese: '轉賬', english: 'Transfer' } },
    { id: 'cex', iconType: 'cex', status: 'current', title: { chinese: '中心化平台判別', english: 'CEX Check' } }
  ];

  const currentContent = config.content[language];
  const introData = config?.intro?.[language];

  // Drag Handlers (Mouse/Desktop)
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetBox) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Remove from all lists first
    setItems(prev => prev.filter(i => i.id !== draggedItem.id));
    setPhishingBox(prev => prev.filter(i => i.id !== draggedItem.id));
    setLegitBox(prev => prev.filter(i => i.id !== draggedItem.id));

    // Add to target
    if (targetBox === 'phishing') {
      setPhishingBox(prev => [...prev, draggedItem]);
    } else if (targetBox === 'legit') {
      setLegitBox(prev => [...prev, draggedItem]);
    } else if (targetBox === 'center') {
      setItems(prev => [...prev, draggedItem]);
    }
    setDraggedItem(null);
  };

  // Touch Handlers (Tablet/Mobile)
  const handleTouchStart = (e, item) => {
    const touch = e.touches[0];
    setTouchDragState({
      isDragging: true,
      item: item,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      targetBox: null
    });
    e.preventDefault(); // Prevent scrolling while dragging
  };

  // Prevent default touch behavior on document when dragging
  useEffect(() => {
    if (touchDragState.isDragging) {
      const handleTouchMoveGlobal = (e) => {
        if (!touchDragState.isDragging) return;
        
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        // Find which box the touch is over
        const elements = document.elementsFromPoint(currentX, currentY);
        let targetBox = null;
        
        for (const el of elements) {
          if (el.getAttribute('data-drop-zone') === 'phishing') {
            targetBox = 'phishing';
            break;
          } else if (el.getAttribute('data-drop-zone') === 'legit') {
            targetBox = 'legit';
            break;
          } else if (el.getAttribute('data-drop-zone') === 'center') {
            targetBox = 'center';
            break;
          }
        }

        setTouchDragState(prev => ({
          ...prev,
          currentX,
          currentY,
          targetBox
        }));
        e.preventDefault(); // Prevent scrolling
      };

      const handleTouchEndGlobal = (e) => {
        if (!touchDragState.isDragging || !touchDragState.item) {
          setTouchDragState({
            isDragging: false,
            item: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            targetBox: null
          });
          return;
        }

        const item = touchDragState.item;
        const targetBox = touchDragState.targetBox;

        // Remove from all lists first
        setItems(prev => prev.filter(i => i.id !== item.id));
        setPhishingBox(prev => prev.filter(i => i.id !== item.id));
        setLegitBox(prev => prev.filter(i => i.id !== item.id));

        // Add to target (if valid target, otherwise return to center)
        if (targetBox === 'phishing') {
          setPhishingBox(prev => [...prev, item]);
        } else if (targetBox === 'legit') {
          setLegitBox(prev => [...prev, item]);
        } else if (targetBox === 'center') {
          setItems(prev => [...prev, item]);
        } else {
          // If dropped outside, return to center
          setItems(prev => [...prev, item]);
        }

        // Reset touch drag state
        setTouchDragState({
          isDragging: false,
          item: null,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          targetBox: null
        });
      };

      document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
      document.addEventListener('touchend', handleTouchEndGlobal, { passive: false });
      return () => {
        document.removeEventListener('touchmove', handleTouchMoveGlobal);
        document.removeEventListener('touchend', handleTouchEndGlobal);
      };
    }
  }, [touchDragState.isDragging, touchDragState.item, touchDragState.targetBox]);

  // 輔助函數：查找域名的釣魚類型
  const findPhishingCategory = (domainName) => {
    const reason = phishingReasons.find(r => r.name === domainName);
    if (reason) {
      return {
        category: reason.category,
        zhMethod: reason.zhMethod,
        enMethod: reason.enMethod,
        zhDesc: reason.zhDesc,
        enDesc: reason.enDesc
      };
    }
    return null;
  };

  const checkResult = () => {
    const errors = [];

    // 未分類
    if (items.length > 0) {
      items.forEach(i => {
        if (stage === 1) {
          const phishingInfo = findPhishingCategory(i.name);
          errors.push({
            name: i.name || i.content,
            reasonZh: '尚未完成分類',
            reasonEn: 'Not categorized',
            explanationZh: null,
            explanationEn: null,
            phishingCategory: phishingInfo?.category || null,
            phishingMethodZh: phishingInfo?.zhMethod || null,
            phishingMethodEn: phishingInfo?.enMethod || null,
            phishingDescZh: phishingInfo?.zhDesc || null,
            phishingDescEn: phishingInfo?.enDesc || null
          });
        } else {
          // Stage 2: 使用詳細說明
          errors.push({
            name: i.name || i.content,
            nameZh: i.name || i.content,
            nameEn: i.name || (i.contentEn || i.content),
            reasonZh: '尚未完成分類',
            reasonEn: 'Not categorized',
            explanationZh: i.explanationZh || null,
            explanationEn: i.explanationEn || null
          });
        }
      });
    }

    // 放錯箱
    phishingBox.forEach(i => {
      if (i.type !== 'phishing') {
        if (stage === 1) {
          const phishingInfo = findPhishingCategory(i.name);
          errors.push({
            name: i.name || i.content,
            reasonZh: '應標記為正規平台/特徵',
            reasonEn: 'Should be marked as legit',
            explanationZh: null,
            explanationEn: null,
            phishingCategory: phishingInfo?.category || null,
            phishingMethodZh: phishingInfo?.zhMethod || null,
            phishingMethodEn: phishingInfo?.enMethod || null,
            phishingDescZh: phishingInfo?.zhDesc || null,
            phishingDescEn: phishingInfo?.enDesc || null
          });
        } else {
          // Stage 2: 使用詳細說明
          errors.push({
            name: i.name || i.content,
            nameZh: i.name || i.content,
            nameEn: i.name || (i.contentEn || i.content),
            reasonZh: '應標記為正規平台/特徵',
            reasonEn: 'Should be marked as legit',
            explanationZh: i.explanationZh || null,
            explanationEn: i.explanationEn || null
          });
        }
      }
    });
    legitBox.forEach(i => {
      if (i.type !== 'legit') {
        if (stage === 1) {
          const phishingInfo = findPhishingCategory(i.name);
          errors.push({
            name: i.name || i.content,
            reasonZh: '應標記為釣魚/可疑',
            reasonEn: 'Should be marked as phishing',
            explanationZh: null,
            explanationEn: null,
            phishingCategory: phishingInfo?.category || null,
            phishingMethodZh: phishingInfo?.zhMethod || null,
            phishingMethodEn: phishingInfo?.enMethod || null,
            phishingDescZh: phishingInfo?.zhDesc || null,
            phishingDescEn: phishingInfo?.enDesc || null
          });
        } else {
          // Stage 2: 使用詳細說明
          errors.push({
            name: i.name || i.content,
            nameZh: i.name || i.content,
            nameEn: i.name || (i.contentEn || i.content),
            reasonZh: '應標記為釣魚/可疑',
            reasonEn: 'Should be marked as phishing',
            explanationZh: i.explanationZh || null,
            explanationEn: i.explanationEn || null
          });
        }
      }
    });

    setErrorItems(errors);
    setIsCorrect(errors.length === 0 && items.length === 0);
    setShowResult(true);
  };

  // License Image Carousel Component
  const LicenseImageCarousel = () => {
    const currentImage = licenseImages[currentLicenseImageIndex];
    
    if (!currentImage) return null;
    
    return (
      <div className="w-full flex flex-col items-center justify-center py-6 relative z-20" style={{ position: 'relative' }}>
        <div className="relative w-full max-w-2xl h-96 mb-6 overflow-visible rounded-lg border-2 border-gray-300 bg-white shadow-lg" style={{ zIndex: 20 }}>
          {/* Left Arrow Button */}
          <button
            onClick={handlePreviousImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Previous image"
            style={{ zIndex: 30 }}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image */}
          <motion.img
            key={currentLicenseImageIndex}
            src={currentImage.image}
            alt={currentImage.name}
            className="w-full h-full object-contain p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          />

          {/* Right Arrow Button */}
          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Next image"
            style={{ zIndex: 30 }}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex gap-3 items-center justify-center mb-3">
          {licenseImages.map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition-all ${
                index === currentLicenseImageIndex ? 'w-10 bg-blue-500' : 'w-3 bg-gray-400'
              }`}
            />
          ))}
        </div>
        <p className="text-lg text-gray-200 font-semibold">
          {currentImage.name}
        </p>
      </div>
    );
  };

  // 結果頁用的解析清單
  const resultCheckItems = useMemo(() => {
    // 辅助函数：查找域名的钓鱼类型（在 useMemo 内部定义）
    const findPhishingCategoryLocal = (domainName) => {
      const reason = phishingReasons.find(r => r.name === domainName);
      if (reason) {
        return {
          category: reason.category,
          zhMethod: reason.zhMethod,
          enMethod: reason.enMethod,
          zhDesc: reason.zhDesc,
          enDesc: reason.enDesc
        };
      }
      return null;
    };

    if (isCorrect && stage === 1) {
      // 第一阶段成功时，显示所有正确分类的钓鱼域名及其类型
      // 从 phishingBox 中获取所有正确分类的钓鱼域名
      const correctPhishingDomains = phishingBox
        .filter(item => item.type === 'phishing')
        .map(item => {
          const phishingInfo = findPhishingCategoryLocal(item.name);
          return {
            name: item.name,
            ...phishingInfo
          };
        })
        .filter(item => item.category); // 只显示有分类信息的域名
      
      if (correctPhishingDomains.length > 0) {
        return correctPhishingDomains.map((item, index) => {
          const categoryInfo = phishingCategoryTypes[item.category];
          return {
            label: `${index + 1}. ${item.name}`,
            value: language === 'chinese' ? item.zhMethod : item.enMethod,
            isCorrect: true,
            showValue: true,
            details: (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">{language === 'chinese' ? '釣魚類型：' : 'Phishing Type: '}</span>
                  {language === 'chinese' ? item.zhMethod : item.enMethod}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">{language === 'chinese' ? '說明：' : 'Description: '}</span>
                  {language === 'chinese' ? item.zhDesc : item.enDesc}
                </p>
                {categoryInfo && (
                  <p className="text-xs text-gray-400 mt-2 italic">
                    {language === 'chinese' ? categoryInfo.zhDesc : categoryInfo.enDesc}
                  </p>
                )}
              </div>
            )
          };
        });
      }
      return []; // Success message handled by subtitle
    }
    
    return errorItems.map((item, index) => {
      // 在第二阶段，如果有详细说明，将其添加到 value 中
      let value = language === 'chinese' ? item.reasonZh : item.reasonEn;
      let details = null;
      
      if (stage === 1 && item.phishingCategory) {
        // 第一阶段：显示钓鱼类型分类
        const categoryInfo = phishingCategoryTypes[item.phishingCategory];
        details = (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">{language === 'chinese' ? '釣魚類型：' : 'Phishing Type: '}</span>
              {language === 'chinese' ? item.phishingMethodZh : item.phishingMethodEn}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-semibold">{language === 'chinese' ? '說明：' : 'Description: '}</span>
              {language === 'chinese' ? item.phishingDescZh : item.phishingDescEn}
            </p>
            {categoryInfo && (
              <p className="text-xs text-gray-400 mt-2 italic">
                {language === 'chinese' ? categoryInfo.zhDesc : categoryInfo.enDesc}
              </p>
            )}
          </div>
        );
      } else if (stage === 2 && item.explanationZh && item.explanationEn) {
        // 第二阶段：将详细说明作为 details
        details = language === 'chinese' ? item.explanationZh : item.explanationEn;
      }
      
      // 根据语言选择显示的名称
      const displayName = stage === 2 
        ? (language === 'chinese' ? (item.nameZh || item.name) : (item.nameEn || item.name))
        : item.name;
      
      return {
        label: `${index + 1}. ${displayName}`,
        value: value,
        isCorrect: item.isCorrect || false,
        showValue: true,
        details: details
      };
    });
  }, [isCorrect, errorItems, language, stage, phishingCategoryTypes, phishingBox, phishingReasons]);

  // Stage 3 成功时的 checkItems（包含图片轮播）
  const stage3SuccessCheckItems = useMemo(() => {
    if (stage === 3 && isCorrect) {
      return [
        {
          label: language === 'chinese' ? 'Coinbase 牌照' : 'Coinbase Licenses',
          value: '',
          isCorrect: true,
          showValue: false,
          details: <LicenseImageCarousel />
        }
      ];
    }
    return null;
  }, [stage, isCorrect, language, currentLicenseImageIndex, licenseImages]);

  // Stage 3 失败时的 checkItems（包含图片轮播）
  const stage3FailureCheckItems = useMemo(() => {
    if (stage === 3 && !isCorrect) {
      return [
        {
          label: language === 'chinese' ? '牌照選擇' : 'License Selection',
          value: licenseError || (language === 'chinese' ? '請選擇所有正確的牌照' : 'Please select all correct licenses'),
          isCorrect: false,
          showValue: true,
          details: (
            <div>
              <p className="text-xl text-gray-300 mb-6">
                {language === 'chinese' 
                  ? 'Coinbase 擁有 FCA（英國）、MAS（新加坡）和 MSB（美國）三個牌照。所有三個都是正確答案。'
                  : 'Coinbase has three licenses: FCA (UK), MAS (Singapore), and MSB (US). All three are correct answers.'}
              </p>
              <LicenseImageCarousel />
            </div>
          )
        }
      ];
    }
    return null;
  }, [stage, isCorrect, language, licenseError, currentLicenseImageIndex, licenseImages]);

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
                  ? '建議先閱讀「中心化交易平台指南」以了解相關知識' 
                  : 'It is recommended to read "Centralized Exchange Platform Guide" first to understand relevant knowledge'}
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
                // 自動打開「中心化交易平台指南」（items[2]）
                setAutoOpenItemIndex(2);
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
                ? '您的目標是：透過對中心化平台的了解，判斷中心化平台是否合法或只是騙局。' 
                : 'Your goal is to understand centralized platforms and determine whether a centralized platform is legitimate or just a scam.')}
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

  // 渲染 Coinbase 介绍页面
  const renderCoinbaseIntro = () => {
    const coinbaseInfo = {
      chinese: {
        title: 'Coinbase 交易所',
        description: 'Coinbase 交易所是一所在美國設立的加密貨幣交易暨投資平台，用戶可在其上輕鬆購買、販賣、交換並儲存加密貨幣。該平台直覺易學，具備交易、數位錢包、PayPal 提領等基本功能，初學者亦能很快學會使用。對資深投資者，Coinbase Pro 提供更多專業交易功能，手續費也更低廉。不過，2022 年 6 月該公司宣布將關閉 Coinbase Pro，所有原用戶可改用主要 app 中的「進階交易」功能。',
        question: 'Coinbase 有哪些相關牌照？(提示:可以利用中心化平台指南中的超連結查詢!)',
        licenses: [
          { id: 'fca', name: 'FCA', country: '🇬🇧 英國', description: '英國金融行為監管局' },
          { id: 'mas', name: 'MAS', country: '🇸🇬 新加坡', description: '新加坡金融管理局' },
          { id: 'msb', name: 'MSB', country: '🇺🇸 美國', description: '美國貨幣服務業務牌照' }
        ],
        submitBtn: '提交答案',
        selectHint: '請選擇所有正確的牌照'
      },
      english: {
        title: 'Coinbase Exchange',
        description: 'Coinbase is a cryptocurrency trading and investment platform established in the United States. Users can easily buy, sell, exchange, and store cryptocurrencies on the platform. The platform is intuitive and easy to learn, with basic features such as trading, digital wallets, and PayPal withdrawals, making it accessible even for beginners. For experienced investors, Coinbase Pro offers more professional trading features with lower fees. However, in June 2022, the company announced the closure of Coinbase Pro, and all original users can switch to the "Advanced Trade" feature in the main app.',
        question: 'What licenses does Coinbase have?',
        licenses: [
          { id: 'fca', name: 'FCA', country: '🇬🇧 United Kingdom', description: 'UK Financial Conduct Authority' },
          { id: 'mas', name: 'MAS', country: '🇸🇬 Singapore', description: 'Monetary Authority of Singapore' },
          { id: 'msb', name: 'MSB', country: '🇺🇸 United States', description: 'US Money Services Business License' }
        ],
        submitBtn: 'Submit Answer',
        selectHint: 'Please select all correct licenses'
      }
    };

    const info = coinbaseInfo[language] || coinbaseInfo.chinese;

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1]">
        <div className="w-full max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] p-8 text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src={CoinbaseLogo} 
                  alt="Coinbase" 
                  className="w-48 h-48 object-contain"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                />
              </div>
              <h1 className="text-4xl font-bold mb-4" style={{ color: '#0052ff' }}>
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

              {/* License Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {info.licenses.map((license) => (
                  <button
                    key={license.id}
                    type="button"
                    className={`p-6 border-2 rounded-xl transition-all text-left cursor-pointer ${
                      selectedLicenses.includes(license.id)
                        ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-300'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={() => handleLicenseToggle(license.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-xl text-gray-800">
                        {license.name}
                      </div>
                      {selectedLicenses.includes(license.id) && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-1">
                      {license.country}
                    </div>
                    <div className="text-sm text-gray-500">
                      {license.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {licenseError && (
                <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {licenseError}
                </div>
              )}

              {/* Separator */}
              <div className="border-t border-gray-300 mb-6" style={{ marginTop: '2rem' }}></div>

              {/* Submit Button */}
              <div>
                <button
                  onClick={checkLicenseSelection}
                  className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#0052ff',
                    boxShadow: '0 4px 12px rgba(0, 82, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0040cc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0052ff';
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

      {/* 挑战视图 */}
      {view === 'challenge' && !showResult && stage !== 3 && (
        <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-0 font-mono">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-[92vh] max-w-[1600px]"
          >
            <BrowserFrame 
              url={stage === 1 ? "https://security-check.web3/verify-domain" : "https://security-check.web3/verify-features"}
              className="w-full h-full shadow-2xl"
            >
              <div className="h-full bg-slate-900 p-6 flex flex-col relative overflow-hidden">
                {/* Pixel Grid Background Effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center uppercase tracking-widest border-b-4 border-white/20 pb-4 z-10">
                  {stage === 1 
                    ? (language === 'chinese' ? '第一階段：域名檢測' : 'Stage 1: Domain Check')
                    : (language === 'chinese' ? '第二階段：特徵檢測' : 'Stage 2: Feature Check')
                  }
                </h2>
                <p className="text-cyan-400 text-center mb-6 text-sm uppercase tracking-wider z-10">
                  {language === 'chinese' ? '>>> 拖曳項目到正確的區域 <<<' : '>>> Drag items to the correct zone <<<'}
                </p>
                
                <div className="flex-1 flex gap-6 min-h-0 z-10">
                  {/* Red Box - Phishing */}
                  <div 
                    className="flex-1 bg-red-900/20 border-4 border-red-500 flex flex-col transition-colors hover:bg-red-900/30"
                    data-drop-zone="phishing"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'phishing')}
                    style={{
                      borderColor: touchDragState.isDragging && touchDragState.targetBox === 'phishing' 
                        ? '#fbbf24' 
                        : '#ef4444',
                      borderWidth: touchDragState.isDragging && touchDragState.targetBox === 'phishing' 
                        ? '6px' 
                        : '4px'
                    }}
                  >
                    {/* Pixel X background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 10px 10px, rgba(239,68,68,0.3) 2px, transparent 0),
                          radial-gradient(circle at 30px 30px, rgba(239,68,68,0.2) 2px, transparent 0),
                          radial-gradient(circle at 50px 50px, rgba(239,68,68,0.25) 2px, transparent 0)
                        `,
                        backgroundSize: '40px 40px'
                      }}
                    />
                    <div className="bg-red-500 text-white font-bold text-lg p-2 text-center uppercase flex items-center justify-center">
                      <WarningIcon />
                      {language === 'chinese' ? '釣魚/詐騙/可疑' : 'Phishing / Scam / Suspicious'}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {phishingBox.map(item => (
                        <div 
                          key={item.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, item)}
                          onTouchStart={(e) => handleTouchStart(e, item)}
                          className="bg-red-500/10 p-3 text-red-300 border-2 border-red-500/50 cursor-grab active:cursor-grabbing hover:bg-red-500/20 flex items-start touch-none select-none"
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTouchCallout: 'none'
                          }}
                        >
                          <AlertIconSmall />
                          <span className="text-sm">{item.name || (language === 'chinese' ? item.content : (item.contentEn || item.content))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center - Source */}
                  <div 
                    className="flex-1 flex flex-col bg-slate-800 border-4 border-slate-600 p-4"
                    data-drop-zone="center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'center')}
                    style={{
                      borderColor: touchDragState.isDragging && touchDragState.targetBox === 'center' 
                        ? '#fbbf24' 
                        : '#475569',
                      borderWidth: touchDragState.isDragging && touchDragState.targetBox === 'center' 
                        ? '6px' 
                        : '4px'
                    }}
                  >
                    <div className="flex-1 overflow-y-auto space-y-3 p-2">
                      {items.map(item => (
                        <div 
                          key={item.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, item)}
                          onTouchStart={(e) => handleTouchStart(e, item)}
                          className={`bg-slate-700 p-3 text-white text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all border-2 border-slate-500 touch-none select-none ${stage === 2 ? 'text-sm text-left' : ''}`}
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTouchCallout: 'none',
                            transform: touchDragState.isDragging && touchDragState.item?.id === item.id
                              ? `translate(${touchDragState.currentX - touchDragState.startX}px, ${touchDragState.currentY - touchDragState.startY}px)`
                              : undefined,
                            opacity: touchDragState.isDragging && touchDragState.item?.id === item.id ? 0.7 : 1,
                            zIndex: touchDragState.isDragging && touchDragState.item?.id === item.id ? 1000 : 1
                          }}
                        >
                          {item.name || (language === 'chinese' ? item.content : (item.contentEn || item.content))}
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="text-white/30 text-center mt-10 uppercase">
                          {language === 'chinese' ? '--- 等待指令 ---' : '--- Waiting for command ---'}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={checkResult}
                      className="mt-4 w-full px-16 py-6 text-white font-bold text-xl uppercase tracking-widest rounded-lg border-3 transition-all transform hover:scale-110 active:scale-95 pixel-font"
                      style={{ 
                        backgroundColor: '#22c55e',
                        borderColor: '#86efac',
                        borderWidth: '4px',
                        boxShadow: '0 0 25px rgba(34, 197, 94, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16a34a';
                        e.currentTarget.style.boxShadow = '0 0 35px rgba(34, 197, 94, 1), inset 0 -3px 0 rgba(0,0,0,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#22c55e';
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 197, 94, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)';
                      }}
                    >
                      {language === 'chinese' ? '提交審核' : 'Submit Review'}
                    </button>
                  </div>

                  {/* Green Box - Legit */}
                  <div 
                    className="flex-1 bg-green-900/20 border-4 border-green-500 flex flex-col transition-colors hover:bg-green-900/30"
                    data-drop-zone="legit"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'legit')}
                    style={{
                      borderColor: touchDragState.isDragging && touchDragState.targetBox === 'legit' 
                        ? '#fbbf24' 
                        : '#22c55e',
                      borderWidth: touchDragState.isDragging && touchDragState.targetBox === 'legit' 
                        ? '6px' 
                        : '4px'
                    }}
                  >
                    {/* Pixel check background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 12px 12px, rgba(52,211,153,0.3) 2px, transparent 0),
                          radial-gradient(circle at 32px 32px, rgba(52,211,153,0.25) 2px, transparent 0),
                          radial-gradient(circle at 52px 52px, rgba(52,211,153,0.2) 2px, transparent 0)
                        `,
                        backgroundSize: '44px 44px'
                      }}
                    />
                    <div className="bg-green-500 text-white font-bold text-lg p-2 text-center uppercase flex items-center justify-center">
                      <CheckIcon />
                      {language === 'chinese' ? '正規平台/特徵' : 'Legitimate Platform / Feature'}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {legitBox.map(item => (
                        <div 
                          key={item.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, item)}
                          onTouchStart={(e) => handleTouchStart(e, item)}
                          className="bg-green-500/10 p-3 text-green-300 border-2 border-green-500/50 cursor-grab active:cursor-grabbing hover:bg-green-500/20 flex items-start touch-none select-none"
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTouchCallout: 'none'
                          }}
                        >
                          <CheckIconSmall />
                          <span className="text-sm">{item.name || (language === 'chinese' ? item.content : (item.contentEn || item.content))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </motion.div>
        </div>
      )}

      {/* Stage 3: Coinbase Introduction */}
      {view === 'challenge' && stage === 3 && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url="coinbase.com/about"
            className="w-full max-w-5xl h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            {renderCoinbaseIntro()}
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
                : stage === 2
                ? (language === 'chinese' ? '第二階段完成' : 'Stage 2 Complete')
                : (language === 'chinese' ? '挑戰完成！' : 'Challenge Completed!'))
            : (language === 'chinese' ? '審核失敗' : 'Review Failed')}
          description={isCorrect 
            ? (stage === 1 
                ? (language === 'chinese' ? '您已成功辨識所有域名。準備進入下一階段：特徵檢測。' : 'You have identified all domains. Proceed to Stage 2: Feature Check.')
                : stage === 2
                ? (language === 'chinese' ? '您已成功完成特徵檢測。準備了解 Coinbase 交易所。' : 'You have completed feature detection. Learn about Coinbase exchange.')
                : currentContent.scenarioText)
            : (stage === 3
                ? (language === 'chinese' ? '請重新選擇牌照。' : 'Please reselect licenses.')
                : (language === 'chinese' ? '請重新檢查您的分類。' : 'Please check your categorization.'))}
          successMessage={language === 'chinese' ? '驗證通過' : 'Verification Passed'}
          failureMessage={language === 'chinese' ? '驗證失敗' : 'Verification Failed'}
          successExplanation={language === 'chinese' 
            ? (stage === 1 
                ? '域名檢測通過。'
                : stage === 2
                ? '特徵檢測通過。'
                : '您已成功完成中心化平台判別挑戰。')
            : (stage === 1 
                ? 'Domain check passed.'
                : stage === 2
                ? 'Feature check passed.'
                : 'You have successfully completed the centralized platform check challenge.')}
          failureExplanation={language === 'chinese' 
            ? (stage === 3
                ? 'Coinbase 擁有 FCA（英國）、MAS（新加坡）和 MSB（美國）三個牌照。'
                : '請仔細檢查平台的合法性、營運商資訊和用戶評價。')
            : (stage === 3
                ? 'Coinbase has three licenses: FCA (UK), MAS (Singapore), and MSB (US).'
                : 'Please carefully check the platform\'s legitimacy, operator information, and user reviews.')}
          successSubtitle={language === 'chinese' ? '恭喜' : 'Congratulations'}
          checkItems={
            stage3SuccessCheckItems 
              ? stage3SuccessCheckItems 
              : stage3FailureCheckItems
              ? stage3FailureCheckItems
              : resultCheckItems
          }
          onRetry={null}
          onNextLevel={stage === 1 
            ? startStage2 
            : stage === 2 
            ? startStage3 
            : handleNextLevel}
          nextLevelButtonText={stage === 1 
            ? (language === 'chinese' ? '下一階段' : 'Next Stage')
            : stage === 2
            ? (language === 'chinese' ? '下一階段' : 'Next Stage') 
            : (language === 'chinese' ? '下一關' : 'Next Level')}
        />
      )}
    </ChallengeTemplate>
  );
};

export default CentralizedPlatform;
