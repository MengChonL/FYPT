import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getScenario } from '../api';
import challengesConfig from '../config/challenges-config';

// 1. 只導入目前實際存在的組件
import PhishingEmailChallenge from '../components/challenges/PhishingEmailChallenge';
import WalletTransferChallenge from '../components/challenges/WalletTransferChallenge';
import CreateWalletChallenge from '../components/challenges/CreateWalletChallenge';
import FirstDepositChallenge from '../components/challenges/FirstDepositChallenge';
import CentralizedPlatform from '../components/challenges/CentralizedPlatform';
import Decentralizedplatform from '../components/challenges/Decentralizedplatform';
import IdentifyMalicious from '../components/challenges/IdentifyMalicious';
import JudgeAuth from '../components/challenges/JudgeAuth';
import Web3DangerAuth from '../components/challenges/Web3DangerAuth';

// 預載入快取：跨路由保存已載入的場景資料
const scenarioCache = new Map();

const ChallengePage = () => {
  const { phase, id } = useParams();
  const location = useLocation();
  const { scenarios, canStartScenario, language } = useGame();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const preloadedRef = useRef(new Set()); // 追蹤已預載入的關卡

  // 同步解析場景資料（不需要 async）
  const resolveScenarioSync = useCallback((scenarioId) => {
    // 1. 檢查快取
    if (scenarioCache.has(scenarioId)) {
      return scenarioCache.get(scenarioId);
    }
    // 2. 從 GameContext scenarios 中找
    const localScenario = scenarios?.find(s => s.scenario_code === scenarioId);
    if (localScenario) {
      scenarioCache.set(scenarioId, localScenario);
      return localScenario;
    }
    // 3. 從本地 challenges-config.js 取得
    if (challengesConfig[scenarioId]) {
      const configScenario = { 
        scenario_code: scenarioId, 
        useLocalConfig: true,
        config: challengesConfig[scenarioId]
      };
      scenarioCache.set(scenarioId, configScenario);
      return configScenario;
    }
    return null;
  }, [scenarios]);

  // 預載入下一關的場景資料
  const preloadNextChallenge = useCallback((nextLevelId) => {
    if (!nextLevelId || preloadedRef.current.has(nextLevelId)) return;
    preloadedRef.current.add(nextLevelId);

    // 先嘗試同步解析
    const syncResult = resolveScenarioSync(nextLevelId);
    if (syncResult) {
      if (import.meta.env.DEV) console.log('🚀 預載入下一關 (同步):', nextLevelId);
      return;
    }

    // 同步找不到，異步從 API 預取
    if (import.meta.env.DEV) console.log('🚀 預載入下一關 (異步):', nextLevelId);
    getScenario(nextLevelId)
      .then(data => {
        if (data) {
          scenarioCache.set(nextLevelId, data);
          if (import.meta.env.DEV) console.log('✅ 預載入完成:', nextLevelId);
        }
      })
      .catch(err => {
        if (import.meta.env.DEV) console.warn('⚠️ 預載入失敗:', nextLevelId, err);
      });
  }, [resolveScenarioSync]);

  // 從資料庫載入場景資料
  useEffect(() => {
    const loadScenario = async () => {
      if (import.meta.env.DEV) console.log('🔍 Loading scenario:', id);

      // 先嘗試同步解析（避免 loading flash）
      const syncResult = resolveScenarioSync(id);
      if (syncResult) {
        if (import.meta.env.DEV) console.log('✅ 同步載入場景:', id);
        setScenario(syncResult);
        setLoading(false);

        // 預載入下一關
        const nextLevel = syncResult.config?.nextLevel || challengesConfig[id]?.nextLevel;
        if (nextLevel) preloadNextChallenge(nextLevel);
        return;
      }

      // 同步找不到，走異步
      setLoading(true);
      try {
        if (import.meta.env.DEV) console.log('🌐 Fetching from API...');
        const data = await getScenario(id);
        if (import.meta.env.DEV) console.log('✅ Got scenario from API:', data);
        if (data) scenarioCache.set(id, data);
        setScenario(data);

        // 預載入下一關
        const nextLevel = data?.config_data?.nextLevel || challengesConfig[id]?.nextLevel;
        if (nextLevel) preloadNextChallenge(nextLevel);
      } catch (error) {
        console.error('❌ Failed to load scenario:', error);
        setScenario(null);
      } finally {
        setLoading(false);
      }
    };

    if (id && scenarios) {
      loadScenario();
    }
  }, [id, scenarios, resolveScenarioSync, preloadNextChallenge]);

  // 載入中
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white px-8">
        <h2>載入關卡...</h2>
      </div>
    );
  }

  // 防錯：如果找不到場景
  if (!scenario) {
    console.error('ChallengePage: 找不到場景，id:', id, 'phase:', phase);
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white pixel-font px-8">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">找不到挑戰關卡 (ID: {id})</p>
        <p className="text-sm mb-4 text-gray-400">Phase: {phase}</p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          返回
        </button>
      </div>
    );
  }

  // 如果使用本地 config，直接使用
  if (scenario.useLocalConfig && scenario.config) {
    const config = scenario.config;
    const challengeType = config.type;
    
    if (import.meta.env.DEV) console.log('🎮 Rendering challenge with local config:', config);
    if (import.meta.env.DEV) console.log('🎯 Challenge type:', challengeType);
    
    switch (challengeType) {
      case 'phishing':
        return <PhishingEmailChallenge config={config} language={language} />;
      case 'createWallet':
        return <CreateWalletChallenge config={config} language={language} />;
      case 'firstDeposit':
        return <FirstDepositChallenge config={config} language={language} />;
      case 'addressPoisoning':
        return <WalletTransferChallenge config={config} language={language} />;
      case 'centralizedPlatform':
        return <CentralizedPlatform config={config} language={language} />;
      case 'decentralizedPlatform':
        return <Decentralizedplatform config={config} language={language} />;
      case 'maliciousAuth':
        return <IdentifyMalicious config={config} language={language} />;
      case 'judgeAuth':
        return <JudgeAuth config={config} language={language} />;
      case 'dangerAuth':
      case 'dangerAuthWeb3':
        return <Web3DangerAuth config={config} language={language} />;
      default:
        return (
          <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white px-8">
            <h2>Unknown challenge type: {challengeType}</h2>
          </div>
        );
    }
  }

  // 建立相容的 config 物件（將資料庫格式轉換為組件需要的格式）
  const config = {
    id: scenario.scenario_code,
    type: scenario.scenario_types?.type_code || scenario.type_code,
    title: {
      chinese: scenario.title_zh,
      english: scenario.title_en
    },
    intro: {
      chinese: {
        title: `任務：${scenario.title_zh}`,
        story: scenario.story_zh,
        mission: scenario.mission_zh,
        warning: scenario.warning_zh,
        btn: '開始挑戰'
      },
      english: {
        title: `Mission: ${scenario.title_en}`,
        story: scenario.story_en,
        mission: scenario.mission_en,
        warning: scenario.warning_en,
        btn: 'Start Challenge'
      }
    },
    // 預設的 content（如果 config_data 中沒有）
    content: {
      chinese: {
        title: scenario.title_zh,
        scenario: '挑戰任務',
        scenarioText: scenario.mission_zh || scenario.story_zh,
        networkLabel: '網絡',
        assetLabel: '幣種',
        timeRemaining: '剩餘時間'
      },
      english: {
        title: scenario.title_en,
        scenario: 'Challenge Task',
        scenarioText: scenario.mission_en || scenario.story_en,
        networkLabel: 'Network',
        assetLabel: 'Currency',
        timeRemaining: 'Time Remaining'
      }
    },
    // 預設的 wallet 配置（用於轉帳挑戰）
    wallet: {
      defaultNetwork: 'ethereum',
      defaultAsset: 'eth',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      balance: '1.0',
      transactions: [
        {
          type: 'received',
          from: '0x8ba1f109551bD432803a645D4CEfc718b5c8B8C2',
          fromName: 'Ben',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '1.0',
          currency: 'ETH',
          timeAgo: { chinese: '2 小時前', english: '2 hours ago' }
        },
        {
          type: 'sent',
          to: '0x8ba1f109551bD432803a645D4CEfc718b5c8B8C2',
          toName: 'Ben',
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '0.2',
          currency: 'ETH',
          timeAgo: { chinese: '1 天前', english: '1 day ago' }
        }
      ]
    },
    // 預設的 recipient（用於轉帳挑戰）
    recipient: {
      username: 'Ryan',
      avatar: 'R',
      address: '0x1a2b3c4d5e6f781012345978901234567890abcb',
      relationship: { chinese: '朋友', english: 'Friend' }
    },
    // 預設的 networks 列表
    networks: [
      {
        id: 'ethereum',
        name: 'Ethereum Mainnet',
        icon: 'ethereum',
        description: { chinese: '以太坊主網', english: 'Ethereum Mainnet' }
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum One',
        icon: 'arbitrum',
        description: { chinese: 'Layer 2 擴容解決方案', english: 'Layer 2 Scaling Solution' }
      }
    ],
    // 預設的 assets 列表
    assets: [
      {
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        icon: 'ethereum',
        balance: '1.0'
      },
      {
        id: 'usdt',
        name: 'Tether USD',
        symbol: 'USDT',
        icon: 'usdt',
        balance: '1000.0'
      }
    ],
    ...scenario.config_data, // 合併 config_data 中的其他配置（會覆蓋預設值）
    // 確保 nextLevel 優先使用本地配置（優先順序：challengesConfig > config_data > null）
    nextLevel: challengesConfig[id]?.nextLevel ?? challengesConfig[scenario.scenario_code]?.nextLevel ?? scenario.config_data?.nextLevel ?? null,
  };

  if (import.meta.env.DEV) console.log('🎮 Rendering challenge with config:', config);
  if (import.meta.env.DEV) console.log('🎯 Challenge type:', config.type);

  // 根據場景類型分發到對應組件
  switch (config.type) {
    
    // 對應 Level 1-1 (釣魚郵件)
    case 'phishing':
      return <PhishingEmailChallenge config={config} language={language} />;

    // 對應 Level 1-2 (創建錢包)
    case 'createWallet':
      return <CreateWalletChallenge config={config} language={language} />;

    // 對應 Level 1-3 (首次入金)
    case 'firstDeposit':
      return <FirstDepositChallenge config={config} language={language} />;

    // 對應 Level 1-4 (錢包轉帳模式)
    case 'addressPoisoning':
      if (config.mode === 'wallet') {
        return <WalletTransferChallenge config={config} language={language} />;
      }
      // 如果沒有 wallet mode，返回錯誤提示
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">配置錯誤</h1>
            <p className="text-xl">addressPoisoning 類型需要 wallet mode</p>
          </div>
        </div>
      );

    // 對應 Level 1-5 (中心化平台判別)
    case 'centralizedPlatform':
      return <CentralizedPlatform config={config} language={language} />;

    // 對應 Level 1-6 (去中心化平台判別)
    case 'decentralizedPlatform':
      return <Decentralizedplatform config={config} language={language} />;

    // 對應 Level 2-1 (判別惡意授權，包含兩個階段：域名判別和合約內容判別)
    case 'maliciousAuth':
      return <IdentifyMalicious config={config} language={language} />;

    // 對應 Level 2-2 (判斷授權內容)
    case 'judgeAuth':
      return <JudgeAuth config={config} language={language} />;

    // 對應 Level 2-3 (QuantumFi 混合詐騙實戰)
    case 'dangerAuthWeb3':
      return <Web3DangerAuth config={config} language={language} />;

    /* // 暫時註解掉缺失的關卡邏輯，防止報錯
    case 'chatNFT':
       return <ChatNFTScam config={config} />;
    
    case 'googleSearch': 
       return <GoogleSearchMetaMask config={config} />;
    */

    default:
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">未知的挑戰類型</h1>
            <p className="text-xl">Type: {config.type}</p>
            <p className="text-gray-400 mt-2">目前的組件庫中可能尚未實作此類型。</p>
          </div>
        </div>
      );
  }
};

export default ChallengePage;