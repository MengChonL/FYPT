import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getChallengeConfig } from '../config/challenges-config';

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

// 2. 暫時移除缺失檔案的引用 (Level 1-3, Level 2-4)
// import ChatNFTScam from '../components/challenges/Level1-3_ChatNFTScam'; 
// import GoogleSearchMetaMask from '../components/challenges/Level2-4_GoogleSearchMetaMask';

const ChallengePage = () => {
  const { phase, id } = useParams();
  const location = useLocation();
  const config = getChallengeConfig(id);

  // 当路由参数变化时，确保组件重新渲染
  useEffect(() => {
    // 路由变化时，确保组件正确更新
  }, [phase, id, location.pathname]);

  // 防錯：如果找不到 Config
  if (!config) {
    console.error('ChallengePage: 找不到配置，id:', id, 'phase:', phase);
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white pixel-font">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">找不到挑戰配置 (ID: {id})</p>
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

  // 根據 Config 類型分發到現有組件
  switch (config.type) {
    
    // 對應 Level 1-1 (釣魚郵件)
    case 'phishing':
      return <PhishingEmailChallenge config={config} />;

    // 對應 Level 1-2 (創建錢包)
    case 'createWallet':
      return <CreateWalletChallenge config={config} />;

    // 對應 Level 1-3 (首次入金)
    case 'firstDeposit':
      return <FirstDepositChallenge config={config} />;

    // 對應 Level 1-4 (錢包轉帳模式)
    case 'addressPoisoning':
      if (config.mode === 'wallet') {
        return <WalletTransferChallenge config={config} />;
      }
      // 如果沒有 wallet mode，返回錯誤提示
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">配置錯誤</h1>
            <p className="text-xl">addressPoisoning 類型需要 wallet mode</p>
          </div>
        </div>
      );

    // 對應 Level 1-5 (中心化平台判別)
    case 'centralizedPlatform':
      return <CentralizedPlatform config={config} />;

    // 對應 Level 1-6 (去中心化平台判別)
    case 'decentralizedPlatform':
      return <Decentralizedplatform config={config} />;

    // 對應 Level 2-1 (判別惡意授權，包含兩個階段：域名判別和合約內容判別)
    case 'maliciousAuth':
      return <IdentifyMalicious config={config} />;

    // 對應 Level 2-2 (判斷授權內容)
    case 'judgeAuth':
      return <JudgeAuth config={config} />;

    // 對應 Level 2-3 (QuantumFi 混合詐騙實戰)
    case 'dangerAuthWeb3':
      return <Web3DangerAuth config={config} />;

    /* // 暫時註解掉缺失的關卡邏輯，防止報錯
    case 'chatNFT':
       return <ChatNFTScam config={config} />;
    
    case 'googleSearch': 
       return <GoogleSearchMetaMask config={config} />;
    */

    default:
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
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