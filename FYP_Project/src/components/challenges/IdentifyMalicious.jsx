import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChallengeTemplate from './ChallengeTemplate';
import ChallengeResultScreen from './ChallengeResultScreen';
import BrowserFrame from './BrowserFrame';
import MetaMaskFox from '../../assets/MetaMask_Fox.png';

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

const IdentifyMalicious = ({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('intro'); // 'intro' | 'challenge'
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [language, setLanguage] = useState('chinese');
  const [stage, setStage] = useState(1); // 1: Domain Check, 2: Contract Content Check, 3: Function Matching
  
  // Drag and Drop State (Stage 1)
  const [items, setItems] = useState([]);
  const [phishingBox, setPhishingBox] = useState([]);
  const [legitBox, setLegitBox] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [errorItems, setErrorItems] = useState([]);
  
  // Stage 2: Contract Content Check State
  const [currentContractIndex, setCurrentContractIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { contractId: 'connect' | 'authorize' }
  const [contractErrorItems, setContractErrorItems] = useState([]);
  
  // Stage 3: Function Matching State
  const [functionBoxes, setFunctionBoxes] = useState({}); // { functionId: [functionItemId, ...] }
  const [functionItems, setFunctionItems] = useState([]);
  const [functionErrorItems, setFunctionErrorItems] = useState([]);
  
  // Item Reminder State
  const [showItemReminder, setShowItemReminder] = useState(false);
  const [openBackpack, setOpenBackpack] = useState(false);

  // 授權相關網址清單
  const authorizationUrls = [
    { id: 1, name: ' https://app.uniswap.org/swap', type: 'legit' },
    { id: 2, name: ' https://opensea-rewards-claim.com/login', type: 'phishing' },
    { id: 3, name: ' https://revoke.cash/', type: 'legit' },
    { id: 4, name: ' https://app.unisvvap.org/swap', type: 'phishing' },
    { id: 5, name: ' https://opensea.io/account', type: 'legit' },
  ];

  // 釣魚手法解析（結果頁用）
  const phishingReasons = [
    {
      name: '🔒 https://opensea-rewards-claim.com/login',
      zhMethod: '插入功能詞 + 多個連字符（Keyword Insertion + Multiple Hyphens）',
      enMethod: 'Keyword insertion + Multiple hyphens',
      zhDesc: '在品牌後加入多個連字符（-）以及 "rewards-claim" 和 "login" 等誘餌字眼，偽裝官方獎勵領取頁面。多個連字符是釣魚網站的常見特徵，用於引誘用戶點擊。',
      enDesc: 'Adds multiple hyphens (-) and bait keywords like "rewards-claim" and "login" after the brand to mimic an official reward claim page. Multiple hyphens are a common characteristic of phishing sites used to lure users into clicking.'
    },
    {
      name: '🔒 https://app.unisvvap.org/swap',
      zhMethod: '視覺欺騙（Visual Deception / Typosquatting）',
      enMethod: 'Visual deception / Typosquatting',
      zhDesc: '將 "uniswap" 中的 "w" 替換為 "vv"，利用視覺相似性進行欺騙。在快速瀏覽時，"vv" 看起來很像 "w"，這是典型的視覺欺騙手法，誘導用戶誤點擊。',
      enDesc: 'Replaces "w" in "uniswap" with "vv", using visual similarity to deceive. When browsing quickly, "vv" looks very similar to "w", which is a typical visual deception tactic to trick users into clicking.'
    },
  ];

  // 合約內容清單（Stage 2）
  const contractContents = [
    {
      id: 1,
      type: 'connect', // 'connect' 或 'authorize'
      content: `🦊 MetaMask Notification
--------------------------------------------------
opensea.io wants you to sign in with your account:
0x742d35Cc6634C0532925a3b8D4C9Fb2f2e2f0891

Click to sign in and accept the OpenSea Terms of Service (https://opensea.io/tos) and Privacy Policy (https://opensea.io/privacy).

URI: https://opensea.io/
Version: 1
Chain ID: 1
Nonce: 6rrg7il05ub2slhdcquidmqe83
Issued At: 2026-01-02T11:48:08.289Z
--------------------------------------------------
[ Cancel ]                        [ Connect ]`,
      descriptionZh: 'MetaMask 簽名登入請求（SIWE）',
      descriptionEn: 'MetaMask Sign-In Request (SIWE)',
      explanationZh: '這是連接請求（connect），SIWE（Sign-In with Ethereum）用於身份驗證，僅請求簽名以證明帳戶所有權，不涉及資產轉移權限。',
      explanationEn: 'This is a connection request (connect), SIWE (Sign-In with Ethereum) is used for authentication, only requesting a signature to prove account ownership, does not involve asset transfer permissions.',
      detailedExplanationZh: {
        essence: '僅是前端應用（dApp）與用戶錢包（如 MetaMask）建立本地通訊，獲取帳號地址。',
        blockchain: '不發送任何交易到區塊鏈，純屬客戶端行為。',
        gas: '不消耗 gas。',
        signature: '通常不需要區塊鏈簽名（部分 dApp 可能要求「簽名驗證身份」，但這屬於額外步驟，不等同於「連接」本身）。',
        risk: '僅暴露錢包地址，不涉及資產控制權。'
      },
      detailedExplanationEn: {
        essence: 'Only establishes local communication between the frontend application (dApp) and the user\'s wallet (such as MetaMask) to obtain the account address.',
        blockchain: 'Does not send any transactions to the blockchain, purely client-side behavior.',
        gas: 'Does not consume gas.',
        signature: 'Usually does not require blockchain signature (some dApps may require "signature verification for identity", but this is an additional step and is not equivalent to "connection" itself).',
        risk: 'Only exposes wallet address, does not involve asset control rights.'
      }
    },
    {
      id: 2,
      type: 'authorize',
      content: `🦊 MetaMask Notification
--------------------------------------------------
Give permission to access your USDT

Grant access to:
Uniswap V3 Router

Transaction Fee (Gas):
0.002 ETH ($3.50)
--------------------------------------------------
[ Reject ]                        [ Confirm ]`,
      descriptionZh: '請求授權存取 USDT',
      descriptionEn: 'Request permission to access your USDT',
      explanationZh: '這是授權請求（authorize），用於請求授權存取 USDT 代幣，涉及資產操作權限。',
      explanationEn: 'This is an authorization request (authorize), used to request permission to access USDT tokens, involving asset operation permissions.',
      detailedExplanationZh: {
        essence: '用戶向智能合約（如 DEX、借貸協議）授予操作其代幣的權限。',
        blockchain: '會發送一筆交易到區塊鏈，調用如 ERC-20 的 approve(spender, amount) 函數。',
        gas: '會消耗 gas，因為這是一筆寫入區塊鏈的狀態變更。',
        signature: '需要用戶簽署交易（由錢包彈出確認視窗）。',
        risk: '授出後，被授權方可在限額內直接操作你的代幣，即使你未再簽名。若授權對象是惡意合約，可能導致資產被盜。'
      },
      detailedExplanationEn: {
        essence: 'User grants permission to smart contracts (such as DEX, lending protocols) to operate their tokens.',
        blockchain: 'Sends a transaction to the blockchain, calling functions such as ERC-20\'s approve(spender, amount).',
        gas: 'Consumes gas because this is a state change written to the blockchain.',
        signature: 'Requires user to sign the transaction (wallet will pop up a confirmation window).',
        risk: 'After authorization, the authorized party can directly operate your tokens within the limit without your signature again. If the authorized object is a malicious contract, it may lead to asset theft.'
      }
    }
  ];

  // 授权函数列表（Stage 3）
  const authorizationFunctions = [
    {
      id: 1,
      name: 'approve(address spender, uint256 amount) Metamask:支出上限請求(Spending Cap Request)',
      standard: '基礎交易類 (ERC-20 代幣)',
      functionItemId: 1
    },
    {
      id: 2,
      name: 'allowance(address owner, address spender)',
      standard: '基礎交易類 (ERC-20 代幣)',
      functionItemId: 2
    },
    {
      id: 3,
      name: 'approve(address to, uint256 tokenId) Metamask:授權單個項目(Authorize Single Item)',
      standard: '單品(如NFT)管理類(ERC-721)',
      functionItemId: 3
    },
    {
      id: 4,
      name: 'setApprovalForAll(address operator, bool approved) Metamask:全部授權 (Set Approval For All)',
      standard: '單品(如NFT)管理類(ERC-721)',
      functionItemId: 4
    },
    {
      id: 5,
      name: 'getApproved(uint256 tokenId)',
      standard: '單品(如NFT)管理類(ERC-721)',
      functionItemId: 5
    },
    {
      id: 6,
      name: 'setApprovalForAll(address operator, bool approved) Metamask:全部授權 (Set Approval For All)',
      standard: '多用於GameFi ERC-1155',
      functionItemId: 6
    }
  ];

  // 功能列表（Stage 3）
  const functionItemsList = [
    {
      id: 1,
      functionId: 1,
      descriptionZh: '就像開一張支票給商家。你填寫多少金額，商家最多就只能領走這麼多。',
      descriptionEn: 'Like writing a check to a merchant. You fill in the amount, and the merchant can only withdraw up to that amount.'
    },
    {
      id: 2,
      functionId: 2,
      descriptionZh: '就像查看支票簿存根。檢查我之前到底授權給這個平台多少額度？',
      descriptionEn: 'Like checking the checkbook stub. Check how much authorization I previously granted to this platform?'
    },
    {
      id: 3,
      functionId: 3,
      descriptionZh: '就像借一本書給朋友。你只把這一本書的使用權交給他，你書架上其他的書是安全的。',
      descriptionEn: 'Like lending a book to a friend. You only give them the right to use this one book, and the other books on your shelf are safe.'
    },
    {
      id: 4,
      functionId: 4,
      descriptionZh: '就像把保險箱備用鑰匙交出去。對方可以隨時打開保險箱，搬空你這一個系列的所有收藏。',
      descriptionEn: 'Like handing over the spare key to a safe. The other party can open the safe at any time and empty all your collections in this series.'
    },
    {
      id: 5,
      functionId: 5,
      descriptionZh: '就像查看某本書現在在哪個人身上？',
      descriptionEn: 'Like checking which person currently has a specific book?'
    },
    {
      id: 6,
      functionId: 6,
      descriptionZh: '就像交出遊戲帳號的倉庫密碼。對方可以隨意處置你的金幣、裝備、藥水等所有道具。',
      descriptionEn: 'Like giving out your game account warehouse password. The other party can freely dispose of all your items including coins, equipment, potions, etc.'
    }
  ];

  // 初始化：路由变化时重置状态
  useEffect(() => {
    setView('intro');
    setShowResult(false);
    setIsCorrect(false);
    setStage(1);
    // Stage 1: 设置固定的5个网址
    setItems([...authorizationUrls]);
    setPhishingBox([]);
    setLegitBox([]);
    // Stage 2: 重置合约内容状态
    setCurrentContractIndex(0);
    setSelectedAnswers({});
    setContractErrorItems([]);
    // Stage 3: 重置函数匹配状态
    setFunctionBoxes({});
    setFunctionItems([...functionItemsList]);
    setFunctionErrorItems([]);
    setShowItemReminder(false);
    setOpenBackpack(false);
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
      // nextLevel 格式可能是 'phase1-2' (完整id) 或 'phase2-judge-auth' (phase + id)
      // 需要判断格式并提取 phase 和 id
      const parts = config.nextLevel.split('-');
      if (parts[0].startsWith('phase')) {
        // 如果 nextLevel 以 phase 开头
        if (parts.length === 2 && !isNaN(parts[1])) {
          // 格式: 'phase1-2' -> phase: 'phase1', id: 'phase1-2' (整个 nextLevel 就是 id)
          const phase = parts[0];
          navigate(`/challenge/${phase}/${config.nextLevel}`);
        } else if (parts.length > 2) {
          // 格式: 'phase2-judge-auth' -> phase: 'phase2', id: 'judge-auth'
          const phase = parts[0];
          const id = parts.slice(1).join('-'); // 处理 id 中可能包含 '-' 的情况
          navigate(`/challenge/${phase}/${id}`);
        } else {
          // 其他情况，使用整个 nextLevel 作为 id
          const phase = parts[0];
          navigate(`/challenge/${phase}/${config.nextLevel}`);
        }
      } else {
        // 格式: 'judge-auth' -> 使用当前 phase (从路由中获取)
        const currentPhase = location.pathname.split('/')[2] || 'phase2';
        navigate(`/challenge/${currentPhase}/${config.nextLevel}`);
      }
    }
  };

  // 开始第二阶段
  const startStage2 = () => {
    setStage(2);
    setShowResult(false);
    setIsCorrect(false);
    setCurrentContractIndex(0);
    setSelectedAnswers({});
    setContractErrorItems([]);
  };

  // 开始第三阶段
  const startStage3 = () => {
    setStage(3);
    setShowResult(false);
    setIsCorrect(false);
    setFunctionBoxes({});
    setFunctionItems([...functionItemsList]);
    setFunctionErrorItems([]);
  };

  // Stage 3: 拖拽处理函数
  const handleFunctionDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFunctionDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleFunctionDrop = (e, functionId) => {
    e.preventDefault();
    if (!draggedItem) return;

    // 从所有位置移除
    setFunctionItems(prev => prev.filter(i => i.id !== draggedItem.id));
    setFunctionBoxes(prev => {
      const newBoxes = { ...prev };
      Object.keys(newBoxes).forEach(key => {
        newBoxes[key] = newBoxes[key].filter(i => i.id !== draggedItem.id);
      });
      return newBoxes;
    });

    // 添加到目标函数框
    setFunctionBoxes(prev => ({
      ...prev,
      [functionId]: [...(prev[functionId] || []), draggedItem]
    }));

    setDraggedItem(null);
  };

  const handleFunctionItemBackToCenter = (e, item, functionId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFunctionBoxes(prev => ({
      ...prev,
      [functionId]: prev[functionId]?.filter(i => i.id !== item.id) || []
    }));
    setFunctionItems(prev => [...prev, item]);
  };

  // Stage 3: 检查函数匹配结果
  const checkFunctionResult = () => {
    const errors = [];

    // 检查未分类的功能
    if (functionItems.length > 0) {
      functionItems.forEach(item => {
        errors.push({
          functionItem: item,
          functionId: null,
          reasonZh: '尚未完成分類',
          reasonEn: 'Not categorized',
          explanationZh: null,
          explanationEn: null
        });
      });
    }

    // 检查每个函数框
    authorizationFunctions.forEach(func => {
      const boxItems = functionBoxes[func.id] || [];
      
      if (boxItems.length === 0) {
        errors.push({
          functionItem: null,
          functionId: func.id,
          reasonZh: '尚未分配功能',
          reasonEn: 'No function assigned',
          explanationZh: null,
          explanationEn: null
        });
      } else if (boxItems.length > 1) {
        boxItems.forEach(item => {
          errors.push({
            functionItem: item,
            functionId: func.id,
            reasonZh: '一個函數只能對應一個功能',
            reasonEn: 'One function can only correspond to one function',
            explanationZh: null,
            explanationEn: null
          });
        });
      } else {
        const item = boxItems[0];
        if (item.functionId !== func.id) {
          errors.push({
            functionItem: item,
            functionId: func.id,
            reasonZh: '功能與函數不匹配',
            reasonEn: 'Function does not match',
            explanationZh: null,
            explanationEn: null
          });
        }
      }
    });

    setFunctionErrorItems(errors);
    setIsCorrect(errors.length === 0 && functionItems.length === 0);
    setShowResult(true);
  };

  // Drag Handlers
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

  // Stage 1: 检查域名分类结果
  const checkResult = () => {
    const errors = [];

    // 未分類
    if (items.length > 0) {
      items.forEach(i => {
        errors.push({
          name: i.name,
          reasonZh: '尚未完成分類',
          reasonEn: 'Not categorized',
          explanationZh: null,
          explanationEn: null
        });
      });
    }

    // 放錯箱
    phishingBox.forEach(i => {
      if (i.type !== 'phishing') {
        errors.push({
          name: i.name,
          reasonZh: '應標記為正規平台',
          reasonEn: 'Should be marked as legit',
          explanationZh: null,
          explanationEn: null
        });
      }
    });
    legitBox.forEach(i => {
      if (i.type !== 'legit') {
        errors.push({
          name: i.name,
          reasonZh: '應標記為釣魚/可疑',
          reasonEn: 'Should be marked as phishing',
          explanationZh: null,
          explanationEn: null
        });
      }
    });

    setErrorItems(errors);
    setIsCorrect(errors.length === 0 && items.length === 0);
    setShowResult(true);
  };

  // Stage 2: 处理合约内容选择
  const handleSelectAnswer = (contractId, answerType) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [contractId]: answerType
    }));
  };

  // Stage 2: 检查合约内容判别结果
  const checkContractResult = () => {
    const errors = [];
    
    // 检查是否所有合约都已选择
    contractContents.forEach(contract => {
      if (!selectedAnswers[contract.id]) {
        errors.push({
          contractId: contract.id,
          contract: contract,
          reasonZh: '尚未選擇答案',
          reasonEn: 'Answer not selected',
          explanationZh: null,
          explanationEn: null
        });
      } else if (selectedAnswers[contract.id] !== contract.type) {
        errors.push({
          contractId: contract.id,
          contract: contract,
          reasonZh: selectedAnswers[contract.id] === 'connect' 
            ? '應選擇為授權內容' 
            : '應選擇為連接內容',
          reasonEn: selectedAnswers[contract.id] === 'connect'
            ? 'Should be selected as authorization'
            : 'Should be selected as connection',
          explanationZh: contract.explanationZh,
          explanationEn: contract.explanationEn
        });
      }
    });

    setContractErrorItems(errors);
    setIsCorrect(errors.length === 0);
    setShowResult(true);
  };

  // Stage 1: 成功時顯示正確識別的釣魚網站
  const stage1SuccessCheckItems = useMemo(() => {
    if (isCorrect && stage === 1) {
      // 顯示正確識別的兩個釣魚網站
      const identifiedPhishing = phishingBox.filter(item => item.type === 'phishing');
      return identifiedPhishing.map((item, index) => {
        const phishingReason = phishingReasons.find(r => {
          const reasonUrl = r.name.replace('🔒 ', '').trim();
          const itemUrl = item.name.replace('🔒 ', '').trim();
          return itemUrl === reasonUrl || itemUrl.includes(reasonUrl) || reasonUrl.includes(itemUrl);
        });
        
        return {
          label: `${index + 1}. ${item.name}`,
          value: language === 'chinese' ? '正確識別為釣魚網站' : 'Correctly identified as phishing',
          isCorrect: true,
          showValue: true,
          details: phishingReason ? (
            <div className="mt-2">
              <p className="text-lg font-semibold text-green-300 mb-2">
                {language === 'chinese' ? phishingReason.zhMethod : phishingReason.enMethod}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {language === 'chinese' ? phishingReason.zhDesc : phishingReason.enDesc}
              </p>
            </div>
          ) : null
        };
      });
    }
    return [];
  }, [isCorrect, stage, phishingBox, language]);

  // Stage 2: 成功時顯示正確識別的合約
  const stage2SuccessCheckItems = useMemo(() => {
    if (isCorrect && stage === 2) {
      return contractContents.map((contract, index) => {
        const detailed = language === 'chinese' ? contract.detailedExplanationZh : contract.detailedExplanationEn;
        return {
          label: `${index + 1}. ${language === 'chinese' ? contract.descriptionZh : contract.descriptionEn}`,
          value: language === 'chinese' 
            ? (contract.type === 'connect' ? '連接內容' : '授權內容')
            : (contract.type === 'connect' ? 'Connection' : 'Authorization'),
          isCorrect: true,
          showValue: true,
          details: (
            <div className="mt-2">
              <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto mb-3">
                {contract.content}
              </pre>
              <p className="text-gray-300 leading-relaxed mb-4">
                {language === 'chinese' ? contract.explanationZh : contract.explanationEn}
              </p>
              {detailed && (
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '本質：' : 'Essence: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.essence}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '區塊鏈互動：' : 'Blockchain Interaction: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.blockchain}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '是否消耗 gas：' : 'Gas Consumption: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.gas}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '是否需要簽名：' : 'Signature Required: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.signature}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '風險：' : 'Risk: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.risk}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        };
      });
    }
    return [];
  }, [isCorrect, stage, language]);

  // Stage 1: 失敗時顯示錯誤分析
  const stage1FailureCheckItems = useMemo(() => {
    if (!isCorrect && stage === 1) {
      return errorItems.map((item, index) => {
        // 查找是否有对应的钓鱼手法解析
        const phishingReason = phishingReasons.find(r => {
          const reasonUrl = r.name.replace('🔒 ', '').trim();
          const itemUrl = item.name.replace('🔒 ', '').trim();
          return itemUrl === reasonUrl || itemUrl.includes(reasonUrl) || reasonUrl.includes(itemUrl);
        });
        
        return {
          label: `${index + 1}. ${item.name}`,
          value: language === 'chinese' ? item.reasonZh : item.reasonEn,
          isCorrect: false,
          showValue: true,
          details: phishingReason ? (
            <div className="mt-2">
              <p className="text-lg font-semibold text-red-300 mb-2">
                {language === 'chinese' ? phishingReason.zhMethod : phishingReason.enMethod}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {language === 'chinese' ? phishingReason.zhDesc : phishingReason.enDesc}
              </p>
            </div>
          ) : null
        };
      });
    }
    return [];
  }, [isCorrect, stage, errorItems, language]);

  // Stage 2: 失敗時顯示錯誤分析
  const stage2FailureCheckItems = useMemo(() => {
    if (!isCorrect && stage === 2) {
      return contractErrorItems.map((item, index) => {
        const contract = item.contract;
        const detailed = language === 'chinese' ? contract.detailedExplanationZh : contract.detailedExplanationEn;
        return {
          label: `${index + 1}. ${language === 'chinese' ? contract.descriptionZh : contract.descriptionEn}`,
          value: language === 'chinese' ? item.reasonZh : item.reasonEn,
          isCorrect: false,
          showValue: true,
          details: (
            <div className="mt-2">
              <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto mb-3">
                {contract.content}
              </pre>
              <p className="text-lg font-semibold text-green-300 mb-2">
                {language === 'chinese' ? '正確答案' : 'Correct Answer'}: {language === 'chinese' 
                  ? (contract.type === 'connect' ? '連接內容' : '授權內容')
                  : (contract.type === 'connect' ? 'Connection' : 'Authorization')}
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                {language === 'chinese' ? contract.explanationZh : contract.explanationEn}
              </p>
              {detailed && (
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '本質：' : 'Essence: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.essence}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '區塊鏈互動：' : 'Blockchain Interaction: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.blockchain}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '是否消耗 gas：' : 'Gas Consumption: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.gas}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '是否需要簽名：' : 'Signature Required: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.signature}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">
                      {language === 'chinese' ? '風險：' : 'Risk: '}
                    </p>
                    <p className="text-gray-300">
                      {detailed.risk}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        };
      });
    }
    return [];
  }, [isCorrect, stage, contractErrorItems, language]);

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
                  ? '建議先閱讀「授權知識指南」以了解相關知識' 
                  : 'It is recommended to read "Authorization Knowledge Guide" first to understand relevant knowledge'}
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

  // Stage 2: 渲染当前合约内容
  const renderCurrentContract = () => {
    const contract = contractContents[currentContractIndex];
    if (!contract) return null;

    const isSelectedConnect = selectedAnswers[contract.id] === 'connect';
    const isSelectedAuthorize = selectedAnswers[contract.id] === 'authorize';

    const renderMetaMaskNotification = () => {
      if (contract.id === 1) {
        return (
          <div className="space-y-6">
            {/* MetaMask 通知样式 - 合约1 */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <img src={MetaMaskFox} alt="MetaMask" className="w-10 h-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                <h4 className="text-lg font-bold" style={{ color: '#7c3aed' }}>MetaMask Notification</h4>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-gray-700 font-mono leading-relaxed">
                  <p className="mb-2">opensea.io wants you to sign in with your account:</p>
                  <p className="font-semibold mb-4">0x742d35Cc6634C0532925a3b8D4C9Fb2f2e2f0891</p>
                  <p className="mb-4">Click to sign in and accept the OpenSea Terms of Service (https://opensea.io/tos) and Privacy Policy (https://opensea.io/privacy).</p>
                  <div className="space-y-1 text-xs bg-gray-50 p-4 rounded border border-gray-200">
                    <p><span className="font-semibold">URI:</span> https://opensea.io/</p>
                    <p><span className="font-semibold">Version:</span> 1</p>
                    <p><span className="font-semibold">Chain ID:</span> 1</p>
                    <p><span className="font-semibold">Nonce:</span> 6rrg7il05ub2slhdcquidmqe83</p>
                    <p><span className="font-semibold">Issued At:</span> 2026-01-02T11:48:08.289Z</p>
                  </div>
                  <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200 justify-center">
                    <button 
                      ref={(el) => {
                        if (el) {
                          el.style.setProperty('background-color', '#000000', 'important');
                          el.style.setProperty('color', '#ffffff', 'important');
                          el.style.setProperty('border', 'none', 'important');
                        }
                      }}
                      className="px-6 py-2 rounded-lg font-semibold transition-all" 
                      style={{ 
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#1a1a1a', 'important');
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#000000', 'important');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      ref={(el) => {
                        if (el) {
                          el.style.setProperty('background-color', '#000000', 'important');
                          el.style.setProperty('color', '#ffffff', 'important');
                          el.style.setProperty('border', 'none', 'important');
                        }
                      }}
                      className="px-6 py-2 rounded-lg font-semibold transition-all" 
                      style={{ 
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#1a1a1a', 'important');
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#000000', 'important');
                      }}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (contract.id === 2) {
        return (
          <div className="space-y-6">
            {/* MetaMask 通知样式 - 合约2 */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <img src={MetaMaskFox} alt="MetaMask" className="w-10 h-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                <h4 className="text-lg font-bold" style={{ color: '#7c3aed' }}>MetaMask Notification</h4>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-gray-700 font-mono leading-relaxed">
                  <p className="mb-4">Give permission to access your USDT</p>
                  <p className="mb-2">Grant access to:</p>
                  <p className="font-semibold mb-6">Uniswap V3 Router</p>
                  <div className="mb-4">
                    <p className="mb-1">Transaction Fee (Gas):</p>
                    <p className="font-semibold">0.002 ETH ($3.50)</p>
                  </div>
                  <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200 justify-center">
                    <button 
                      ref={(el) => {
                        if (el) {
                          el.style.setProperty('background-color', '#000000', 'important');
                          el.style.setProperty('color', '#ffffff', 'important');
                          el.style.setProperty('border', 'none', 'important');
                        }
                      }}
                      className="px-6 py-2 rounded-lg font-semibold transition-all" 
                      style={{ 
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#1a1a1a', 'important');
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#000000', 'important');
                      }}
                    >
                      Reject
                    </button>
                    <button 
                      ref={(el) => {
                        if (el) {
                          el.style.setProperty('background-color', '#000000', 'important');
                          el.style.setProperty('color', '#ffffff', 'important');
                          el.style.setProperty('border', 'none', 'important');
                        }
                      }}
                      className="px-6 py-2 rounded-lg font-semibold transition-all" 
                      style={{ 
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#1a1a1a', 'important');
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.setProperty('background-color', '#000000', 'important');
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* 主卡片 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header - MetaMask 风格 */}
          <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] p-8 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={MetaMaskFox} 
                alt="MetaMask" 
                className="w-24 h-24 object-contain"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
              />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#7c3aed' }}>
              {language === 'chinese' ? '合約內容' : 'Contract Content'} {currentContractIndex + 1} / {contractContents.length}
            </h3>
          </div>

          {/* Content */}
          <div className="p-8">
            {renderMetaMaskNotification()}

            {/* 选择按钮区域 */}
            <div className="mt-8">
              <p className="text-gray-600 text-sm mb-6 font-semibold text-center">
                {language === 'chinese' ? '請選擇此合約內容的類型：' : 'Please select the type of this contract content:'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectAnswer(contract.id, 'connect')}
                  className={`p-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    isSelectedConnect
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                  style={isSelectedConnect ? {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isSelectedConnect) {
                      e.currentTarget.style.borderColor = '#7c3aed';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelectedConnect) {
                      e.currentTarget.style.borderColor = '';
                    }
                  }}
                >
                  <div className="text-xl font-bold mb-2">
                    {language === 'chinese' ? '連接內容' : 'Connection'}
                  </div>
                  <div className="text-sm opacity-90">
                    {language === 'chinese' 
                      ? '僅讀取帳戶信息，不涉及資產轉移'
                      : 'Read account info only, no asset transfer'}
                  </div>
                </button>
                
                <button
                  onClick={() => handleSelectAnswer(contract.id, 'authorize')}
                  className={`p-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    isSelectedAuthorize
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                  style={isSelectedAuthorize ? {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isSelectedAuthorize) {
                      e.currentTarget.style.borderColor = '#7c3aed';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelectedAuthorize) {
                      e.currentTarget.style.borderColor = '';
                    }
                  }}
                >
                  <div className="text-xl font-bold mb-2">
                    {language === 'chinese' ? '授權內容' : 'Authorization'}
                  </div>
                  <div className="text-sm opacity-90">
                    {language === 'chinese' 
                      ? '涉及資產操作，如轉移代幣、批准花費'
                      : 'Involves asset operations, e.g., transfer tokens, approve spending'}
                  </div>
                </button>
              </div>
            </div>

            {/* 导航按钮 */}
            <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentContractIndex(prev => Math.max(0, prev - 1))}
                disabled={currentContractIndex === 0}
                className="px-8 py-3 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#000000',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                {language === 'chinese' ? '上一題' : 'Previous'}
              </button>
              
              {/* 中间提交按钮 */}
              <button
                onClick={checkContractResult}
                className="px-8 py-3 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: '#000000',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
              >
                {language === 'chinese' ? '提交答案' : 'Submit Answers'}
              </button>
              
              {currentContractIndex < contractContents.length - 1 ? (
                <button
                  onClick={() => setCurrentContractIndex(prev => prev + 1)}
                  className="px-8 py-3 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#000000',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
                >
                  {language === 'chinese' ? '下一題' : 'Next'}
                </button>
              ) : (
                <div className="px-8 py-3"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stage 3: 成功时显示正确匹配的函数
  const stage3SuccessCheckItems = useMemo(() => {
    if (isCorrect && stage === 3) {
      return authorizationFunctions.map((func, index) => {
        const matchedItem = functionBoxes[func.id]?.[0];
        return {
          label: `${index + 1}. ${func.name}`,
          value: language === 'chinese' ? `所屬標準：${func.standard}` : `Standard: ${func.standard}`,
          isCorrect: true,
          showValue: true,
          details: matchedItem ? (
            <div className="mt-2">
              <p className="text-gray-300 leading-relaxed">
                {language === 'chinese' ? matchedItem.descriptionZh : matchedItem.descriptionEn}
              </p>
            </div>
          ) : null
        };
      });
    }
    return [];
  }, [isCorrect, stage, functionBoxes, language]);

  // Stage 3: 失败时显示错误分析
  const stage3FailureCheckItems = useMemo(() => {
    if (!isCorrect && stage === 3) {
      return functionErrorItems.map((item, index) => {
        const func = item.functionId ? authorizationFunctions.find(f => f.id === item.functionId) : null;
        return {
          label: `${index + 1}. ${func ? func.name : (language === 'chinese' ? '未分類功能' : 'Uncategorized Function')}`,
          value: language === 'chinese' ? item.reasonZh : item.reasonEn,
          isCorrect: false,
          showValue: true,
          details: item.functionItem ? (
            <div className="mt-2">
              <p className="text-gray-300 leading-relaxed">
                {language === 'chinese' ? item.functionItem.descriptionZh : item.functionItem.descriptionEn}
              </p>
            </div>
          ) : null
        };
      });
    }
    return [];
  }, [isCorrect, stage, functionErrorItems, language]);

  // Stage 3: 渲染函数匹配界面
  const renderStage3 = () => {
    return (
      <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-0 font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-[92vh] max-w-[1600px]"
        >
          <BrowserFrame 
            url="https://security-check.web3/function-matching"
            className="w-full h-full shadow-2xl"
          >
            <div className="h-full bg-slate-900 p-6 flex flex-col relative overflow-hidden">
              {/* Pixel Grid Background Effect */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 text-center uppercase tracking-widest border-b-4 border-white/20 pb-4 z-10">
                {language === 'chinese' ? '授權函數匹配:將功能拖曳到對應的授權函數' : 'Authorization Function Matching: Drag functions to corresponding authorization functions'}
              </h2>
              <p className="text-cyan-400 text-center mb-6 text-sm uppercase tracking-wider z-10">
                {language === 'chinese' ? '>>> 拖曳功能到正確的函數 <<<' : '>>> Drag functions to the correct function <<<'}
              </p>
              
              <div className="flex-1 flex flex-col gap-4 min-h-0 z-10">
                {/* 函数框区域 - 上半部分 */}
                <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto p-2">
                  {authorizationFunctions.map(func => {
                    const boxItems = functionBoxes[func.id] || [];
                    return (
                      <div
                        key={func.id}
                        className="bg-blue-900/20 border-4 border-blue-500 flex flex-col transition-colors hover:bg-blue-900/30 min-h-[150px]"
                        onDragOver={handleFunctionDragOver}
                        onDrop={(e) => handleFunctionDrop(e, func.id)}
                      >
                        <div className="bg-blue-500 text-white font-bold text-sm p-2 text-center uppercase">
                          {func.name}
                        </div>
                        <div className="bg-blue-600/50 text-white text-xs p-1 text-center">
                          {language === 'chinese' ? `所屬標準：${func.standard}` : `Standard: ${func.standard}`}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                          {boxItems.map(item => (
                            <div
                              key={item.id}
                              className="bg-blue-500/20 p-2 text-blue-200 border-2 border-blue-500/50 text-xs cursor-pointer hover:bg-blue-500/30 flex items-start justify-between"
                              onClick={(e) => handleFunctionItemBackToCenter(e, item, func.id)}
                            >
                              <span className="flex-1">{language === 'chinese' ? item.descriptionZh : item.descriptionEn}</span>
                              <span className="ml-2 text-blue-400">×</span>
                            </div>
                          ))}
                          {boxItems.length === 0 && (
                            <div className="text-blue-300/50 text-center text-xs mt-4">
                              {language === 'chinese' ? '拖曳功能到此處' : 'Drag function here'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 功能列表区域 - 下半部分 */}
                <div className="bg-slate-800 border-4 border-slate-600 p-4">
                  <div className="bg-slate-700 text-white font-bold text-lg p-2 text-center uppercase mb-3">
                    {language === 'chinese' ? '功能列表' : 'Function List'}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px]">
                    {functionItems.map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleFunctionDragStart(e, item)}
                        className="bg-slate-700 p-3 text-white text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all border-2 border-slate-500"
                      >
                        {language === 'chinese' ? item.descriptionZh : item.descriptionEn}
                      </div>
                    ))}
                    {functionItems.length === 0 && (
                      <div className="text-white/30 text-center mt-4 uppercase">
                        {language === 'chinese' ? '--- 所有功能已分配 ---' : '--- All functions assigned ---'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={checkFunctionResult}
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
              </div>
            </div>
          </BrowserFrame>
        </motion.div>
      </div>
    );
  };

  // 渲染任务介绍页面
  const renderMissionIntro = () => {
    const introText = language === 'chinese' 
      ? '在 Web3 去中心化平台中，授權（Authorization）是用戶與智能合約或第三方應用互動的核心機制之一。與傳統中心化服務不同，去中心化應用（dApps）通常不會直接存取用戶的私鑰，而是透過請求用戶使用錢包（如 MetaMask）對特定操作進行數位簽署，以授予臨時或有限的權限。常見的授權場景包括：允許去中心化交易所（如 Uniswap）存取特定代幣餘額以進行交易、授權借貸協議（如 Aave）使用抵押資產，或讓 NFT 市場可轉移特定資產。後面的挑戰將會逐步拆解授權內容讓你免受損失!'
      : 'In Web3 decentralized platforms, Authorization is one of the core mechanisms for users to interact with smart contracts or third-party applications. Unlike traditional centralized services, decentralized applications (dApps) typically do not directly access users\' private keys. Instead, they request users to use wallets (such as MetaMask) to digitally sign specific operations, granting temporary or limited permissions. Common authorization scenarios include: allowing decentralized exchanges (such as Uniswap) to access specific token balances for trading, authorizing lending protocols (such as Aave) to use collateral assets, or enabling NFT markets to transfer specific assets. The following challenges will gradually break down authorization content to help you avoid losses!';

    return (
      <div className="flex items-center justify-center w-full min-h-screen p-8 relative z-10">
        <div className="bg-[#0f172a] rounded-3xl p-10 max-w-2xl text-center backdrop-blur-xl shadow-2xl border border-gray-800">
          <div className="mb-6 flex justify-center">
            <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-cyan-500/30">
              {language === 'chinese' ? '新任務解鎖' : 'New Mission Unlocked'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-6 tracking-tighter font-mono">
            {language === 'chinese' ? '判別惡意授權' : 'Identify Malicious Authorization'}
          </h1>
          <div className="space-y-6 text-left mb-10">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">
                {language === 'chinese' ? '背景' : 'Background'}
              </p>
              <p className="text-white text-lg leading-relaxed">
                {introText}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">
                {language === 'chinese' ? '目標' : 'Objective'}
              </p>
              <p className="text-white text-lg leading-relaxed">
                {language === 'chinese' 
                  ? '您的目標是：透過對授權機制的了解，判斷哪些授權網站是合法的，哪些是惡意或釣魚網站。' 
                  : 'Your goal is to understand authorization mechanisms and determine which authorization websites are legitimate and which are malicious or phishing sites.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowItemReminder(true)}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
          >
            {language === 'chinese' ? '開始挑戰' : 'Start Challenge'}
          </button>
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
    >
      {/* 道具提醒消息框 */}
      {renderItemReminder()}
      
      {/* 任务介绍视图 */}
      {view === 'intro' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderMissionIntro()}
        </div>
      )}

      {/* 挑战视图 - Stage 1: 域名判别 */}
      {view === 'challenge' && !showResult && stage === 1 && (
        <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-0 font-mono">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-[92vh] max-w-[1600px]"
          >
            <BrowserFrame 
              url="https://security-check.web3/verify-authorization"
              className="w-full h-full shadow-2xl"
            >
              <div className="h-full bg-slate-900 p-6 flex flex-col relative overflow-hidden">
                {/* Pixel Grid Background Effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center uppercase tracking-widest border-b-4 border-white/20 pb-4 z-10">
                  {language === 'chinese' ? '授權網站判別:判別去中心化平台的正確網址對於判別惡意授權至關重要' : 'Authorization Website Check: Identifying the correct URLs for decentralized platforms is crucial for identifying malicious authorization'}
                </h2>
                <p className="text-cyan-400 text-center mb-6 text-sm uppercase tracking-wider z-10">
                  {language === 'chinese' ? '>>> 拖曳項目到正確的區域 <<<' : '>>> Drag items to the correct zone <<<'}
                </p>
                
                <div className="flex-1 flex gap-6 min-h-0 z-10">
                  {/* Red Box - Phishing */}
                  <div 
                    className="flex-1 bg-red-900/20 border-4 border-red-500 flex flex-col transition-colors hover:bg-red-900/30"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'phishing')}
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
                          className="bg-red-500/10 p-3 text-red-300 border-2 border-red-500/50 cursor-grab active:cursor-grabbing hover:bg-red-500/20 flex items-start"
                        >
                          <AlertIconSmall />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center - Source */}
                  <div 
                    className="flex-1 flex flex-col bg-slate-800 border-4 border-slate-600 p-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'center')}
                  >
                    <div className="flex-1 overflow-y-auto space-y-3 p-2">
                      {items.map(item => (
                        <div 
                          key={item.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, item)}
                          className="bg-slate-700 p-3 text-white text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all border-2 border-slate-500"
                        >
                          {item.name}
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
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'legit')}
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
                      {language === 'chinese' ? '正規平台' : 'Legitimate Platform'}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {legitBox.map(item => (
                        <div 
                          key={item.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, item)}
                          className="bg-green-500/10 p-3 text-green-300 border-2 border-green-500/50 cursor-grab active:cursor-grabbing hover:bg-green-500/20 flex items-start"
                        >
                          <CheckIconSmall />
                          <span className="text-sm">{item.name}</span>
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

      {/* 挑战视图 - Stage 2: 合约内容判别 */}
      {view === 'challenge' && !showResult && stage === 2 && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url="metamask.io/notification"
            className="w-full max-w-5xl h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1] p-8">
              {renderCurrentContract()}
            </div>
          </BrowserFrame>
        </div>
      )}

      {/* 挑战视图 - Stage 3: 授权函数匹配 */}
      {view === 'challenge' && !showResult && stage === 3 && (
        renderStage3()
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
                ? (language === 'chinese' ? '您已成功辨識所有授權網站。準備進入下一階段：判別合約內容類型。' : 'You have successfully identified all authorization websites. Proceed to Stage 2: Contract Content Type Check.')
                : stage === 2
                ? (language === 'chinese' ? '您已成功判別所有合約內容類型。準備進入下一階段：授權函數匹配。' : 'You have successfully identified all contract content types. Proceed to Stage 3: Authorization Function Matching.')
                : (language === 'chinese' ? '您已成功完成所有授權函數匹配。' : 'You have successfully completed all authorization function matching.'))
            : (language === 'chinese' ? '請重新檢查您的分類。' : 'Please check your categorization.')}
          successMessage={language === 'chinese' ? '驗證通過' : 'Verification Passed'}
          failureMessage={language === 'chinese' ? '驗證失敗' : 'Verification Failed'}
          successExplanation={language === 'chinese' 
            ? (stage === 1 
                ? '授權網站判別通過。'
                : stage === 2
                ? '合約內容類型判別通過。'
                : '授權函數匹配通過。')
            : (stage === 1 
                ? 'Authorization website check passed.'
                : stage === 2
                ? 'Contract content type identification passed.'
                : 'Authorization function matching passed.')}
          failureExplanation={language === 'chinese' 
            ? (stage === 1
                ? '請仔細檢查網站的域名、拼寫和結構，識別釣魚網站的特徵。'
                : stage === 2
                ? '請仔細閱讀合約內容，區分連接請求（僅讀取帳戶）和授權請求（涉及資產操作）。'
                : '請仔細閱讀函數說明，將功能正確匹配到對應的授權函數。')
            : (stage === 1
                ? 'Please carefully check the website\'s domain, spelling, and structure to identify phishing site characteristics.'
                : stage === 2
                ? 'Please carefully read the contract content to distinguish between connection requests (read accounts only) and authorization requests (involve asset operations).'
                : 'Please carefully read the function descriptions and correctly match functions to their corresponding authorization functions.')}
          successSubtitle={language === 'chinese' ? '恭喜' : 'Congratulations'}
          checkItems={
            stage === 1
              ? (isCorrect ? stage1SuccessCheckItems : stage1FailureCheckItems)
              : stage === 2
              ? (isCorrect ? stage2SuccessCheckItems : stage2FailureCheckItems)
              : (isCorrect ? stage3SuccessCheckItems : stage3FailureCheckItems)
          }
          onRetry={null}
          onNextLevel={
            stage === 1 
              ? startStage2 
              : stage === 2
              ? startStage3
              : handleNextLevel
          }
          nextLevelButtonText={
            stage === 1 
              ? (language === 'chinese' ? '下一階段' : 'Next Stage')
              : stage === 2
              ? (language === 'chinese' ? '下一階段' : 'Next Stage')
              : (language === 'chinese' ? '下一關' : 'Next Level')
          }
        />
      )}
    </ChallengeTemplate>
  );
};

export default IdentifyMalicious;

