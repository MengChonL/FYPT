// seed-database.js
// 用於將 challenges-config.js 的資料導入 Supabase 資料庫
// 在 Back_end/db 資料夾執行: node seed-database.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===== Phase 資料 =====
const phases = [
  {
    phase_code: 'phase1',
    title_zh: '基礎設施與資產安全',
    title_en: 'Infrastructure & Asset Security',
    description_zh: '包含：下載錢包、助記詞備份、首次入金等新手流程',
    description_en: 'Includes: Download wallet, backup mnemonic, first deposit and other beginner processes',
    display_order: 1,
    is_active: true
  },
  {
    phase_code: 'phase2',
    title_zh: '授權與交互安全',
    title_en: 'Authorization & Interaction Security',
    description_zh: '包含：授權機制、惡意授權判別、混合詐騙實戰',
    description_en: 'Includes: Authorization mechanism, malicious authorization detection, hybrid scam drill',
    display_order: 2,
    is_active: true
  }
];

// ===== Scenario Types 資料 =====
const scenarioTypes = [
  { type_code: 'phishing', name_zh: '釣魚攻擊', name_en: 'Phishing Attack', component_name: 'PhishingEmailChallenge' },
  { type_code: 'createWallet', name_zh: '創建錢包', name_en: 'Create Wallet', component_name: 'CreateWalletChallenge' },
  { type_code: 'firstDeposit', name_zh: '首次入金', name_en: 'First Deposit', component_name: 'FirstDepositChallenge' },
  { type_code: 'addressPoisoning', name_zh: '地址投毒', name_en: 'Address Poisoning', component_name: 'WalletTransferChallenge' },
  { type_code: 'centralizedPlatform', name_zh: '中心化平台', name_en: 'Centralized Platform', component_name: 'CentralizedPlatform' },
  { type_code: 'decentralizedPlatform', name_zh: '去中心化平台', name_en: 'Decentralized Platform', component_name: 'Decentralizedplatform' },
  { type_code: 'maliciousAuth', name_zh: '惡意授權', name_en: 'Malicious Authorization', component_name: 'IdentifyMalicious' },
  { type_code: 'judgeAuth', name_zh: '判斷授權', name_en: 'Judge Authorization', component_name: 'JudgeAuth' },
  { type_code: 'dangerAuthWeb3', name_zh: '混合詐騙', name_en: 'Hybrid Scam', component_name: 'Web3DangerAuth' }
];

// ===== Scenarios 資料 (從 challenges-config.js 轉換) =====
const scenarios = [
  // Phase 1 Scenarios
  {
    scenario_code: 'phase1-1',
    phase_code: 'phase1',
    type_code: 'phishing',
    title_zh: '下載錢包',
    title_en: 'Download Wallet',
    story_zh: '作為一位剛剛接觸web3的用戶，你需要創建一個web3錢包。並利用web3錢包去參加web3上面的區塊鏈活動。',
    story_en: 'You are a Web3 novice looking to join a hot NFT project. To participate, you first need to set up a crypto wallet.',
    mission_zh: '你的目標是：在充滿陷阱的網路搜尋結果中，安全地下載並安裝 MetaMask 錢包。',
    mission_en: 'Your Goal: Safely download and install the MetaMask wallet from Google search results.',
    warning_zh: '注意：必須要細心留意官方網站的域名是否正確。',
    warning_en: 'Warning: Search ads may be purchased by attackers to promote fake wallets. Verify the official domain.',
    icon_type: 'search',
    display_order: 1,
    config_data: {
      difficulty: 'easy',
      nextLevel: 'phase1-2',
      wallet: {
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        mnemonic: 'ocean hidden verify unfair ripple master harvest bitter galaxy eternal badge mountain'
      }
    },
    is_active: true
  },
  {
    scenario_code: 'phase1-2',
    phase_code: 'phase1',
    type_code: 'createWallet',
    title_zh: '創建錢包',
    title_en: 'Create Wallet',
    story_zh: '您已經成功下載了 MetaMask 錢包。現在需要創建一個新的錢包來開始您的 Web3 之旅。',
    story_en: 'You have successfully downloaded MetaMask. Now you need to create a new wallet to begin your Web3 journey.',
    mission_zh: '您的目標是：按照 MetaMask 的引導流程，安全地創建一個新的加密貨幣錢包。',
    mission_en: 'Your goal is to safely create a new cryptocurrency wallet following MetaMask onboarding process.',
    warning_zh: '注意：創建錢包後，請務必妥善保管您的助記詞，這是恢復錢包的唯一方式。',
    warning_en: 'Warning: After creating your wallet, make sure to securely store your recovery phrase.',
    icon_type: 'create',
    display_order: 2,
    config_data: {
      difficulty: 'easy',
      nextLevel: 'phase1-3'
    },
    is_active: true
  },
  {
    scenario_code: 'phase1-3',
    phase_code: 'phase1',
    type_code: 'firstDeposit',
    title_zh: '首次入金',
    title_en: 'First Deposit',
    story_zh: '您已經成功創建了 MetaMask 錢包。現在需要為錢包充值，才能開始進行 Web3 交易。',
    story_en: 'You have successfully created your MetaMask wallet. Now you need to top up your wallet to start Web3 transactions.',
    mission_zh: '您的目標是：安全地為您的錢包進行首次充值。',
    mission_en: 'Your goal is to safely make your first deposit to your wallet.',
    warning_zh: '注意：請確保使用正確的充值方式，避免資金損失。',
    warning_en: 'Warning: Make sure to use the correct deposit method to avoid fund loss.',
    icon_type: 'deposit',
    display_order: 3,
    config_data: {
      difficulty: 'easy',
      nextLevel: 'phase1-4'
    },
    is_active: true
  },
  {
    scenario_code: 'phase1-4',
    phase_code: 'phase1',
    type_code: 'addressPoisoning',
    title_zh: '錢包轉帳',
    title_en: 'Wallet Transfer',
    story_zh: '您已經成功為錢包充值。現在需要向朋友 Ryan 轉帳 0.25 ETH。請仔細核對收款地址、網絡和金額。',
    story_en: 'You have successfully topped up your wallet. Now you need to transfer 0.25 ETH to your friend Ryan.',
    mission_zh: '您的目標是：正確地完成轉帳操作，包括選擇正確的網絡、資產、地址和金額。',
    mission_en: 'Your goal is to correctly complete the transfer operation.',
    warning_zh: '注意：請仔細核對完整地址，避免地址投毒攻擊。',
    warning_en: 'Warning: Please carefully verify the complete address to avoid address poisoning attacks.',
    icon_type: 'transfer',
    display_order: 4,
    config_data: {
      difficulty: 'easy',
      nextLevel: 'phase1-5',
      mode: 'wallet',
      transfer: {
        amount: '0.25',
        currency: 'ETH',
        correctNetwork: 'ethereum',
        correctAsset: 'eth'
      },
      addresses: {
        correct: '0x1a2b3c4d5e6f781012345978901234567890abcb',
        poisoned: '0x1a2b3c4d5e6f781012345978901234567890abcf'
      }
    },
    is_active: true
  },
  {
    scenario_code: 'phase1-5',
    phase_code: 'phase1',
    type_code: 'centralizedPlatform',
    title_zh: '中心化平台判別',
    title_en: 'CEX Check',
    story_zh: '隨著 Web3 概念的興起，許多中心化平台相繼出現。這些平台的運作模式更接近 Web2，類似傳統金融中的中心化交易中介。',
    story_en: 'With the rise of Web3 concepts, many centralized platforms have emerged. These platforms operate more like Web2.',
    mission_zh: '您的目標是：透過對中心化平台的了解，判斷中心化平台是否合法或只是騙局。',
    mission_en: 'Your goal is to understand centralized platforms and determine whether a centralized platform is legitimate or just a scam.',
    warning_zh: '注意：請仔細檢查平台的合法性、營運商資訊和用戶評價。',
    warning_en: 'Warning: Please carefully check the platform legitimacy, operator information, and user reviews.',
    icon_type: 'cex',
    display_order: 5,
    config_data: {
      difficulty: 'medium',
      nextLevel: 'phase1-6'
    },
    is_active: true
  },
  {
    scenario_code: 'phase1-6',
    phase_code: 'phase1',
    type_code: 'decentralizedPlatform',
    title_zh: '去中心化平台判別',
    title_en: 'DEX Check',
    story_zh: '去中心化平台（DEX）是 Web3 生態系統的核心組成部分。與中心化平台不同，去中心化平台允許用戶直接進行點對點交易。',
    story_en: 'Decentralized platforms (DEX) are core components of the Web3 ecosystem. Unlike centralized platforms, DEX allows peer-to-peer transactions.',
    mission_zh: '您的目標是：了解去中心化平台的運作方式與安全特性，學會識別真正的去中心化平台。',
    mission_en: 'Your goal is to understand how decentralized platforms work and their security features.',
    warning_zh: '注意：請仔細檢查平台的去中心化特性、智能合約審計與用戶資產控制權。',
    warning_en: 'Warning: Please carefully check the decentralization features, smart contract audits, and user asset control.',
    icon_type: 'dex',
    display_order: 6,
    config_data: {
      difficulty: 'medium',
      nextLevel: 'malicious-auth'
    },
    is_active: true
  },
  // Phase 2 Scenarios
  {
    scenario_code: 'malicious-auth',
    phase_code: 'phase2',
    type_code: 'maliciousAuth',
    title_zh: '判別惡意授權',
    title_en: 'Identify Malicious Authorization',
    story_zh: '在 Web3 去中心化平台中，授權是用戶與智能合約或第三方應用互動的核心機制之一。',
    story_en: 'In Web3 decentralized platforms, Authorization is one of the core mechanisms for users to interact with smart contracts.',
    mission_zh: '您的目標是：拆解授權內容，了解授權機制，判別惡意授權。',
    mission_en: 'Your goal is to deconstruct authorization content, understand authorization mechanisms, and identify malicious authorization.',
    warning_zh: '注意：請仔細檢查網站的域名、拼寫和結構，識別釣魚網站的特徵。',
    warning_en: 'Warning: Please carefully check the website domain, spelling, and structure to identify phishing site characteristics.',
    icon_type: 'cex',
    display_order: 1,
    config_data: {
      difficulty: 'medium',
      nextLevel: 'judge-auth'
    },
    is_active: true
  },
  {
    scenario_code: 'judge-auth',
    phase_code: 'phase2',
    type_code: 'judgeAuth',
    title_zh: '判斷授權內容',
    title_en: 'Judge Authorization Content',
    story_zh: '透過上一關的策略拆解，你已經對授權內容有了一定的了解，現在需要你判斷授權內容是否合法或只是騙局。',
    story_en: 'Through the previous strategy decomposition, you have a certain understanding of the authorization content.',
    mission_zh: '您的目標是：判斷授權內容是否合法或只是騙局。',
    mission_en: 'Your goal is to judge whether the authorization content is legal or just a scam.',
    warning_zh: '注意：每個授權內容的場景設置都不相同，需要你仔細判斷。',
    warning_en: 'Warning: Each authorization content has a different scenario, you need to carefully judge.',
    icon_type: 'judge',
    display_order: 2,
    config_data: {
      difficulty: 'medium',
      nextLevel: 'phase2-danger-auth'
    },
    is_active: true
  },
  {
    scenario_code: 'phase2-danger-auth',
    phase_code: 'phase2',
    type_code: 'dangerAuthWeb3',
    title_zh: '混合詐騙實戰',
    title_en: 'Hybrid Scam Drill',
    story_zh: '你剛完成了授權內容判斷的挑戰，現在來到一個自稱「QuantumFi」的高收益平台。這個頁面同時混合了 Web3 去中心化關鍵字、中心化金融服務、以及各種監管與安全標籤。',
    story_en: 'You have just completed the authorization judgment challenge and now arrive at a platform called "QuantumFi" claiming extremely high returns.',
    mission_zh: '你的目標是：使用紅筆工具，在頁面上標出所有可疑或矛盾的地方，並理解每一個紅旗背後代表的風險。',
    mission_en: 'Your goal is to use the red-pen tool to mark all suspicious or contradictory elements on the page.',
    warning_zh: '注意：許多詐騙網站會同時混合真實資訊與虛假承諾，請特別留意不合理的「零風險高收益」。',
    warning_en: 'Warning: Many scam sites mix real information with fake promises. Pay special attention to unreasonable "risk-free high yields".',
    icon_type: 'judge',
    display_order: 3,
    config_data: {
      difficulty: 'medium',
      nextLevel: null
    },
    is_active: true
  }
];

// ===== 執行導入 =====
async function seedDatabase() {
  console.log('🌱 開始導入資料...\n');

  try {
    // 1. 清空現有資料（可選，注意順序）
    console.log('🗑️  清空現有資料...');
    await supabase.from('user_attempts').delete().neq('attempt_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_progress').delete().neq('progress_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('scenarios').delete().neq('scenario_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('scenario_types').delete().neq('type_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('phases').delete().neq('phase_id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ 清空完成\n');

    // 2. 插入 Phases
    console.log('📁 插入 Phases...');
    const { data: phasesData, error: phasesError } = await supabase
      .from('phases')
      .insert(phases)
      .select();

    if (phasesError) throw phasesError;
    console.log(`✅ 插入 ${phasesData.length} 個 Phases\n`);

    // 建立 phase_code -> phase_id 的映射
    const phaseMap = {};
    phasesData.forEach(p => {
      phaseMap[p.phase_code] = p.phase_id;
    });

    // 3. 插入 Scenario Types
    console.log('🏷️  插入 Scenario Types...');
    const { data: typesData, error: typesError } = await supabase
      .from('scenario_types')
      .insert(scenarioTypes)
      .select();

    if (typesError) throw typesError;
    console.log(`✅ 插入 ${typesData.length} 個 Scenario Types\n`);

    // 建立 type_code -> type_id 的映射
    const typeMap = {};
    typesData.forEach(t => {
      typeMap[t.type_code] = t.type_id;
    });

    // 4. 插入 Scenarios（需要替換 phase_code 和 type_code 為 UUID）
    console.log('🎮 插入 Scenarios...');
    const scenariosToInsert = scenarios.map(s => ({
      scenario_code: s.scenario_code,
      phase_id: phaseMap[s.phase_code],
      type_id: typeMap[s.type_code],
      title_zh: s.title_zh,
      title_en: s.title_en,
      story_zh: s.story_zh,
      story_en: s.story_en,
      mission_zh: s.mission_zh,
      mission_en: s.mission_en,
      warning_zh: s.warning_zh,
      warning_en: s.warning_en,
      icon_type: s.icon_type,
      display_order: s.display_order,
      config_data: s.config_data,
      is_active: s.is_active
    }));

    const { data: scenariosData, error: scenariosError } = await supabase
      .from('scenarios')
      .insert(scenariosToInsert)
      .select();

    if (scenariosError) throw scenariosError;
    console.log(`✅ 插入 ${scenariosData.length} 個 Scenarios\n`);

    // 5. 顯示結果
    console.log('========================================');
    console.log('🎉 資料導入完成！');
    console.log('========================================');
    console.log('\n📊 導入統計：');
    console.log(`   - Phases: ${phasesData.length}`);
    console.log(`   - Scenario Types: ${typesData.length}`);
    console.log(`   - Scenarios: ${scenariosData.length}`);
    console.log('\n🔗 你可以在 Supabase Dashboard 查看資料：');
    console.log(`   ${process.env.SUPABASE_URL?.replace(/\/\/(.+?)@/, '//*****@').slice(0, 40)}...`);

  } catch (error) {
    console.error('❌ 導入失敗:', error.message);
    process.exit(1);
  }
}

// 執行
seedDatabase();
