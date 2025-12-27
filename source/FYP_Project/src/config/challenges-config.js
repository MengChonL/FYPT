// src/config/challenges-config.js

/**
 * Phase 1: 基礎設施與資產安全 (Infrastructure & Asset Security)
 * 包含：下載錢包、助記詞備份、首次入金等新手流程
 */
export const phase1Challenges = {
  // ============================================================
  // Level 1-1: 下載錢包陷阱 (Google 搜尋模擬)
  // ============================================================
  'phase1-1': {
    id: 'phase1-1',
    type: 'phishing', // 對應組件: PhishingEmailChallenge.jsx
    difficulty: 'easy',
    nextLevel: 'phase1-2', // 預留：通關後跳轉到備份關卡

    // roadmap 顯示用 meta
    title: { chinese: '下載錢包', english: 'Download Wallet' },
    iconType: 'search', // 對應 PixelIcon 的 'search'
    status: 'locked',   // 預設狀態，可由上層 page 覆蓋為 'current' / 'unlocked'

    // --- 任務引導 (Mission Brief) ---
    intro: {
      chinese: {
        title: "任務 1：初入 Web3 世界",
        story: "作為一位剛剛接觸web3的用戶，你需要創建一個web3錢包。並利用web3錢包去參加web3上面的區塊鏈活動。",
        mission: "你的目標是：在充滿陷阱的網路搜尋結果中，安全地下載並安裝 MetaMask 錢包。",
        warning: "注意：必須要細心留意官方網站的域名是否正確。",
        btn: "開啟瀏覽器搜尋"
      },
      english: {
        title: "Mission 1: Entering Web3",
        story: "You are a Web3 novice looking to join a hot NFT project. To participate, you first need to set up a crypto wallet.",
        mission: "Your Goal: Safely download and install the MetaMask wallet from Google search results.",
        warning: "Warning: Search ads may be purchased by attackers to promote fake wallets. Verify the official domain.",
        btn: "Open Browser"
      }
    },

    // --- 遊戲內文本內容 (Google Search & Wallet UI) ---
    content: {
      chinese: {
        // 搜尋頁面
        pageTitle: "Google 搜尋",
        searchQuery: "MetaMask 下載",
        ad: "贊助商廣告",
        
        // 搜尋結果 - 官方
        officialTitle: "MetaMask - The Crypto Wallet for Defi, Web3 Dapps and NFTs",
        officialDesc: "MetaMask 是一個加密錢包與閘道，讓你在瀏覽器中安全地儲存、傳送與接收 Ethereum 及其他代幣。全球數百萬用戶信賴。",
        
        // 錢包安裝頁面
        onboardingTitle: "歡迎來到 MetaMask",
        onboardingSubtitle: "連接您與去中心化網絡的橋樑",
        createBtn: "創建新錢包",
        submitBtn: "創建",
        walletCreatedTitle: "錢包創建成功！",
        addressLabel: "您的公開地址",
        mnemonicLabel: "助記詞 (請勿截圖)",
        passwordPlaceholder: "設置密碼",
        confirmPasswordPlaceholder: "確認密碼"
      },
      english: {
        pageTitle: "Google Search",
        searchQuery: "MetaMask Download",
        ad: "Sponsored",
        officialTitle: "MetaMask - The Crypto Wallet for Defi, Web3 Dapps and NFTs",
        officialDesc: "A crypto wallet & gateway to blockchain apps. Start exploring blockchain applications in seconds. Trusted by over 30 million users worldwide.",
        onboardingTitle: "Welcome to MetaMask",
        onboardingSubtitle: "Connecting you to the decentralized web",
        createBtn: "Create a New Wallet",
        submitBtn: "Create",
        walletCreatedTitle: "Wallet Created Successfully",
        addressLabel: "Your Public Address",
        mnemonicLabel: "Secret Recovery Phrase",
        passwordPlaceholder: "New Password",
        confirmPasswordPlaceholder: "Confirm Password"
      }
    },

    // 預設生成的錢包數據
    wallet: {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      mnemonic: 'ocean hidden verify unfair ripple master harvest bitter galaxy eternal badge mountain'
    }
  },

  // ============================================================
  // Level 1-2: 創建錢包 (Create Wallet Challenge)
  // ============================================================
  'phase1-2': {
    id: 'phase1-2',
    type: 'createWallet', // 對應組件: CreateWalletChallenge.jsx
    difficulty: 'easy',
    nextLevel: 'phase1-3', // 預留：通關後跳轉到備份關卡

    // roadmap 顯示用 meta
    title: { chinese: '創建錢包', english: 'Create Wallet' },
    iconType: 'create', // 對應 PixelIcon 的 'create'
    status: 'locked',   // 預設狀態，可由上層 page 覆蓋為 'current' / 'unlocked'

    // --- 任務引導 (Mission Brief) ---
    intro: {
      chinese: {
        title: "任務 2：創建您的錢包",
        story: "您已經成功下載了 MetaMask 錢包。現在需要創建一個新的錢包來開始您的 Web3 之旅。",
        mission: "您的目標是：按照 MetaMask 的引導流程，安全地創建一個新的加密貨幣錢包。",
        warning: "注意：創建錢包後，請務必妥善保管您的助記詞，這是恢復錢包的唯一方式。",
        btn: "開始創建錢包"
      },
      english: {
        title: "Mission 2: Create Your Wallet",
        story: "You have successfully downloaded MetaMask. Now you need to create a new wallet to begin your Web3 journey.",
        mission: "Your goal is to safely create a new cryptocurrency wallet following MetaMask's onboarding process.",
        warning: "Warning: After creating your wallet, make sure to securely store your recovery phrase, as it is the only way to restore your wallet.",
        btn: "Start Creating Wallet"
      }
    },

    // --- 遊戲內文本內容 ---
    content: {
      chinese: {
        title: "創建錢包",
        onboardingTitle: "歡迎來到 MetaMask",
        onboardingSubtitle: "連接您與去中心化網絡的橋樑",
        createBtn: "創建錢包",
        importBtn: "導入錢包"
      },
      english: {
        title: "Create Wallet",
        onboardingTitle: "Welcome to MetaMask",
        onboardingSubtitle: "Connecting you to the decentralized web",
        createBtn: "Create a New Wallet",
        importBtn: "Import Wallet"
      }
    },

    // 預設生成的錢包數據
    wallet: {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      mnemonic: 'ocean hidden verify unfair ripple master harvest bitter galaxy eternal badge mountain'
    }
  },

  // ============================================================
  // Level 1-3: 首次入金 (First Deposit Challenge)
  // ============================================================
  'phase1-3': {
    id: 'phase1-3',
    type: 'firstDeposit', // 對應組件: FirstDepositChallenge.jsx
    difficulty: 'easy',
    nextLevel: 'phase1-4',

    // roadmap 顯示用 meta
    title: { chinese: '首次入金', english: 'First Deposit' },
    iconType: 'deposit',
    status: 'locked',

    // --- 任務引導 (Mission Brief) ---
    intro: {
      chinese: {
        title: "任務 3：首次入金",
        story: "您已經成功創建了 MetaMask 錢包。現在需要為錢包充值，才能開始進行 Web3 交易。",
        mission: "您的目標是：安全地為您的錢包進行首次充值。",
        warning: "注意：請確保使用正確的充值方式，避免資金損失。",
        btn: "開始充值"
      },
      english: {
        title: "Mission 3: First Deposit",
        story: "You have successfully created your MetaMask wallet. Now you need to top up your wallet to start Web3 transactions.",
        mission: "Your goal is to safely make your first deposit to your wallet.",
        warning: "Warning: Make sure to use the correct deposit method to avoid fund loss.",
        btn: "Start Deposit"
      }
    },

    // --- 遊戲內文本內容 ---
    content: {
      chinese: {
        title: "首次入金",
        account: "帳戶 1",
        balance: "US$0.00",
        balanceChange: "+$0 (+0.00%)",
        buy: "買入",
        exchange: "兌換",
        send: "發送",
        receive: "接收",
        tokens: "代幣",
        perpetual: "永續合約",
        defi: "去中心化金融",
        collectibles: "收藏品",
        ethereum: "Ethereum",
        ethBalance: "0 ETH",
        earn: "賺取",
        usdValue: "US$0.00",
        dailyChange: "+2.18%",
        topUpMessage: "為錢包充值,開啟您的Web3 之旅",
        topUpBtn: "充值"
      },
      english: {
        title: "First Deposit",
        account: "Account 1",
        balance: "US$0.00",
        balanceChange: "+$0 (+0.00%)",
        buy: "Buy",
        exchange: "Swap",
        send: "Send",
        receive: "Receive",
        tokens: "Tokens",
        perpetual: "Perpetual",
        defi: "DeFi",
        collectibles: "Collectibles",
        ethereum: "Ethereum",
        ethBalance: "0 ETH",
        earn: "Earn",
        usdValue: "US$0.00",
        dailyChange: "+2.18%",
        topUpMessage: "Top up your wallet, start your Web3 journey",
        topUpBtn: "Top Up"
      }
    },

    // 錢包信息
    wallet: {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      balance: '0.00'
    }
  },

  // ============================================================
  // Level 1-4: 錢包轉帳挑戰 (Wallet Transfer Challenge)
  // ============================================================
  'phase1-4': {
    id: 'phase1-4',
    type: 'addressPoisoning', // 對應組件: WalletTransferChallenge.jsx (mode: wallet)
    mode: 'wallet', // 使用錢包轉帳模式
    difficulty: 'easy',
    nextLevel: 'phase1-5',

    // roadmap 顯示用 meta
    title: { chinese: '錢包轉帳', english: 'Wallet Transfer' },
    iconType: 'transfer',
    status: 'locked',

    // --- 任務引導 (Mission Brief) ---
    intro: {
      chinese: {
        title: "任務 4：首次轉帳",
        story: "您已經成功為錢包充值。現在需要向朋友 Ryan 轉帳 0.25 ETH。請仔細核對收款地址、網絡和金額。",
        mission: "您的目標是：正確地完成轉帳操作，包括選擇正確的網絡、資產、地址和金額。",
        warning: "注意：請仔細核對完整地址，避免地址投毒攻擊。",
        btn: "開始轉帳"
      },
      english: {
        title: "Mission 4: First Transfer",
        story: "You have successfully topped up your wallet. Now you need to transfer 0.25 ETH to your friend Ryan. Please carefully verify the recipient address, network, and amount.",
        mission: "Your goal is to correctly complete the transfer operation, including selecting the correct network, asset, address, and amount.",
        warning: "Warning: Please carefully verify the complete address to avoid address poisoning attacks.",
        btn: "Start Transfer"
      }
    },

    // --- 遊戲內文本內容 ---
    content: {
      chinese: {
        title: "任務 4：向 Ben 轉帳",
        scenario: "轉帳任務",
        scenarioText: "您需要向朋友 Ryan 轉帳 0.25 ETH。Ryan 使用的是 Ethereum 主網。請在交易記錄中找到正確的收款地址，並完成轉帳。",
        networkLabel: "網絡",
        assetLabel: "幣種",
        timeRemaining: "剩餘時間"
      },
      english: {
        title: "Mission 4: Transfer to Ben",
        scenario: "Transfer Task",
        scenarioText: "You need to transfer 0.25 ETH to your friend Ryan. Ryan is using Ethereum Mainnet. Please find the correct recipient address in the transaction history and complete the transfer.",
        networkLabel: "Network",
        assetLabel: "Currency",
        timeRemaining: "Time Remaining"
      }
    },

    // 收款人信息
    recipient: {
      username: 'Ryan',
      avatar: 'R',
      address: '0x1a2b3c4d5e6f781012345978901234567890abcb', // 正確地址
      relationship: {
        chinese: '朋友',
        english: 'Friend'
      }
    },

    // 地址信息
    addresses: {
      correct: '0x1a2b3c4d5e6f781012345978901234567890abcb', // 正確地址
      poisoned: '0x1a2b3c4d5e6f781012345978901234567890abcf' // 投毒地址（可選，用於教育）
    },

    // 轉帳配置
    transfer: {
      amount: '0.25',
      currency: 'ETH',
      correctNetwork: 'ethereum', // 正確網絡
      correctAsset: 'eth', // 正確資產
      requireNetworkSelection: true, // 需要選擇網絡
      requireAssetSelection: true // 需要選擇資產
    },

    // 網絡列表
    networks: [
      {
        id: 'ethereum',
        name: 'Ethereum Mainnet',
        icon: 'ethereum',
        description: {
          chinese: '以太坊主網',
          english: 'Ethereum Mainnet'
        }
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum One',
        icon: 'arbitrum',
        description: {
          chinese: 'Layer 2 擴容解決方案',
          english: 'Layer 2 Scaling Solution'
        }
      }
    ],

    // 資產列表
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

    // 錢包信息
    wallet: {
      defaultNetwork: 'ethereum', // 默認網絡
      defaultAsset: 'eth', // 默認資產
      transactions: [
        {
          type: 'received',
          from: '0x8ba1f109551bD432803a645D4CEfc718b5c8B8C2',
          fromName: 'Ben',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '1.0',
          currency: 'ETH',
          timeAgo: {
            chinese: '2 小時前',
            english: '2 hours ago'
          }
        },
        {
          type: 'sent',
          to: '0x8ba1f109551bD432803a645D4CEfc718b5c8B8C2',
          toName: 'Ben',
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '0.2',
          currency: 'ETH',
          timeAgo: {
            chinese: '1 天前',
            english: '1 day ago'
          }
        },
        {
          type: 'received',
          from: '0x8ba1f109551bD432803a645D4CEfc718b5c8B8C2',
          fromName: 'Ben',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '0.5',
          currency: 'ETH',
          timeAgo: {
            chinese: '3 天前',
            english: '3 days ago'
          }
        },
        {
          type: 'sent',
          to: '0x8ba1f109551bD432803a645D4CEfc718b5c8B8C2',
          toName: 'Ben',
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '0.1',
          currency: 'ETH',
          timeAgo: {
            chinese: '1 週前',
            english: '1 week ago'
          }
        },
        {
          type: 'received',
          from: '0x8ba1f109551bD432803a645D4CEfc718b5c8B8C2',
          fromName: 'Ben',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '0.3',
          currency: 'ETH',
          timeAgo: {
            chinese: '2 週前',
            english: '2 weeks ago'
          }
        }
      ]
    }
  },

  // ============================================================
  // Level 1-5: 中心化平台判別 (Centralized Platform Challenge)
  // ============================================================
  'phase1-5': {
    id: 'phase1-5',
    type: 'centralizedPlatform', // 對應組件: CentralizedPlatform.jsx
    difficulty: 'medium',
    nextLevel: 'phase1-6', // 下一關：去中心化平台判別

    // roadmap 顯示用 meta
    title: { chinese: '中心化平台判別', english: 'CEX Check' },
    iconType: 'cex',
    status: 'locked',

    // --- 任務引導 (Mission Brief) ---
    intro: {
      chinese: {
        title: "任務 5：中心化平台判別",
        story: "隨著 Web3 概念的興起，許多中心化平台相繼出現。這些平台的運作模式更接近 Web2，類似傳統金融中的中心化交易中介，主要提供 Web3 資產（如加密貨幣）的交易服務。由於其由營運商集中管理，在合規的司法管轄區內，營運商通常需對平台安全與用戶資產承擔一定程度的法律責任。然而，這類平台本質上偏離了 Web3 去中心化、用戶自主掌控資產的核心理念。",
        mission: "您的目標是：透過對中心化平台的了解，判斷中心化平台是否合法或只是騙局。",
        warning: "注意：請仔細檢查平台的合法性、營運商資訊和用戶評價。",
        btn: "開始挑戰"
      },
      english: {
        title: "Mission 5: Centralized Platform Check",
        story: "With the rise of Web3 concepts, many centralized platforms have emerged. These platforms operate more like Web2, similar to centralized trading intermediaries in traditional finance, primarily providing transaction services for Web3 assets (such as cryptocurrencies). Due to their centralized management by operators, in compliant jurisdictions, operators generally bear legal responsibility for platform security and user asset security. However, these platforms inherently deviate from the core principles of Web3, which is decentralized and user-controlled asset ownership.",
        mission: "Your goal is to understand centralized platforms and determine whether a centralized platform is legitimate or just a scam.",
        warning: "Warning: Please carefully check the platform's legitimacy, operator information, and user reviews.",
        btn: "Start Challenge"
      }
    },

    // --- 遊戲內文本內容 ---
    content: {
      chinese: {
        title: "任務 5：中心化平台判別",
        scenario: "中心化平台挑戰",
        scenarioText: "你需要透過對中心化平台的了解，判斷中心化平台是否合法或只是騙局。"
      },
      english: {
        title: "Mission 5: Centralized Platform Check",
        scenario: "Centralized Platform Challenge",
        scenarioText: "You need to understand centralized platforms and determine whether a centralized platform is legitimate or just a scam."
      }
    }
  },

  // ============================================================
  // Level 1-6: 去中心化平台判別 (Decentralized Platform Challenge)
  // ============================================================
  'phase1-6': {
    id: 'phase1-6',
    type: 'decentralizedPlatform', // 對應組件: Decentralizedplatform.jsx
    difficulty: 'medium',
    nextLevel: null, // Phase 1 最後一關

    // roadmap 顯示用 meta
    title: { chinese: '去中心化平台判別', english: 'DEX Check' },
    iconType: 'dex',
    status: 'locked',

    // --- 任務引導 (Mission Brief) ---
    intro: {
      chinese: {
        title: "任務 6：去中心化平台判別",
        story: "去中心化平台（DEX，Decentralized Exchange）是 Web3 生態系統的核心組成部分。與中心化平台不同，去中心化平台允許用戶直接進行點對點交易，無需通過中介機構。用戶始終保持對資產的控制權，交易通過智能合約自動執行。",
        mission: "您的目標是：了解去中心化平台的運作方式與安全特性，學會識別真正的去中心化平台。",
        warning: "注意：請仔細檢查平台的去中心化特性、智能合約審計與用戶資產控制權。",
        btn: "開始挑戰"
      },
      english: {
        title: "Mission 6: Decentralized Platform Check",
        story: "Decentralized platforms (DEX, Decentralized Exchange) are core components of the Web3 ecosystem. Unlike centralized platforms, decentralized platforms allow users to conduct peer-to-peer transactions directly without intermediaries. Users always maintain control over their assets, and transactions are automatically executed through smart contracts.",
        mission: "Your goal is to understand how decentralized platforms work and their security features, and learn to identify truly decentralized platforms.",
        warning: "Warning: Please carefully check the platform's decentralization features, smart contract audits, and user asset control.",
        btn: "Start Challenge"
      }
    },

    // --- 遊戲內文本內容 ---
    content: {
      chinese: {
        title: "任務 6：去中心化平台判別",
        scenario: "去中心化平台挑戰",
        scenarioText: "你需要了解去中心化平台的運作方式與安全特性，學會識別真正的去中心化平台。"
      },
      english: {
        title: "Mission 6: Decentralized Platform Check",
        scenario: "Decentralized Platform Challenge",
        scenarioText: "You need to understand how decentralized platforms work and their security features, and learn to identify truly decentralized platforms."
      }
    }
  }
};

/**
 * 合併所有挑戰配置
 */
const allChallenges = {
  ...phase1Challenges
};

/**
 * 根據挑戰 ID 獲取配置
 * @param {string} id - 挑戰 ID (例如: 'phase1-1', 'phase2-1')
 * @returns {object|null} 挑戰配置對象，如果找不到則返回 null
 */
export const getChallengeConfig = (id) => {
  if (!id) return null;
  return allChallenges[id] || null;
};

/**
 * 導出所有挑戰配置（用於調試或其他用途）
 */
export default allChallenges;