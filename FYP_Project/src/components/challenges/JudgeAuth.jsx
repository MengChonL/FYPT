import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChallengeTemplate from './ChallengeTemplate';
import ChallengeResultScreen from './ChallengeResultScreen';
import BrowserFrame from './BrowserFrame';
import MetaMaskFox from '../../assets/MetaMask_Fox.png';
import UniswapIcon from '../../assets/Uniswap.png';
import USDCIcon from '../../assets/USDC.png';
import RandomIcon from '../../assets/random.png';
import Permission01 from '../../assets/permission01.png';
import Permission02 from '../../assets/permission02.png';
import Permission03 from '../../assets/permission03.png';
import Permission04 from '../../assets/permission04.png';

const JudgeAuth = ({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('intro');
  const [language, setLanguage] = useState('chinese');
  const [openBackpack, setOpenBackpack] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  // 场景数据
  const scenarios = [
    {
      id: 1,
      type: 'legit', // 合法
      title: {
        chinese: '場景一: Uniswap網站',
        english: 'Scenario 1: Uniswap Website'
      },
      description: {
        chinese: '你在Google搜索中找到了一個Uniswap網站，想要將 317 USDC 兌換成 ETH。在兌換之前出現了一個授權內容，請你判斷一下是合法還是釣魚',
        english: 'You found a Uniswap website in Google search and want to swap 1,000 USDC for ETH. Before the swap, a authoriz ation request appeared, please judge whether it is legitimate or phishing.'
      },
      authorization: {
        url: 'https://app.uniswap.org',
        title: {
          chinese: '支出上限請求',
          english: 'Spending Cap Request'
        },
        question: {
          chinese: '允許 Uniswap V3: Router 2 存取您的 USDC？',
          english: 'Allow Uniswap V3: Router 2 to access your USDC?'
        },
        recipient: {
          name: 'Uniswap V3: Router 2',
          address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
          isIdentified: true
        },
        asset: 'USDC',
        spendingCap: '1000',
        isUnlimited: false,
        gasEstimate: '0.00143 ETH',
        maxFee: '0.0021 ETH',
        buttonText: {
          reject: { chinese: '拒絕', english: 'Reject' },
          next: { chinese: '下一步', english: 'Next' }
        }
      },
      characteristics: {
        legit: [
          {
            chinese: '有顯示名稱：MetaMask 認得這是 Uniswap V3，所以顯示了名字和圖示（🦄）。',
            english: 'Has display name: MetaMask recognizes this as Uniswap V3, so it shows the name and icon (🦄).'
          },
          {
            chinese: '網址：乾淨的 app.uniswap.org。',
            english: 'URL: Clean app.uniswap.org.'
          }
        ],
        phishing: []
      }
    },
    {
      id: 2,
      type: 'phishing', // 釣魚
      title: {
        chinese: '場景二: Telegram Uniswap空投領取',
        english: 'Scenario 2: Telegram Uniswap Airdrop Claim'
      },
      description: {
        chinese:
          '你在 Telegram 群組看到「Uniswap USDT 補償領取」的連結。點進去網頁後，按下了領取空投的按鈕，然之後彈出一個授權介面請你判斷一下這個授權是釣魚還是合法的。',
        english:
          'You see a link in a Telegram group claiming "Uniswap USDT Compensation Claim". On the website, you click the button "Claim Airdrop". Then a authorization request appeared, please judge whether it is legitimate or phishing.'
      },  
      authorization: {
        url: 'https://usdt-claims-gift.net',
        title: {
          chinese: '支出上限請求',
          english: 'Spending Cap Request'
        },
        question: {
          chinese: '允許 0x82a...91b 存取您的 USDT？',
          english: 'Allow 0x82a...91b to access your USDT?'
        },
        recipient: {
          name: '0x82a91b...34c1',
          address: '0x82a91b00000000000000000000000000000034c1',
          isIdentified: false
        },
        asset: 'USDT',
        spendingCap: '1157920892373161954235709850086879078532699...',
        isUnlimited: true,
        gasEstimate: '0.0025 ETH',
        maxFee: '0.0035 ETH',
        buttonText: {
          reject: { chinese: '拒絕', english: 'Reject' },
          next: { chinese: '下一步', english: 'Next' }
        }
      },
      characteristics: {
        legit: [],
        phishing: [
          {
            chinese:
              '沒有Uniswap官方圖標,MetaMask無法識別',
            english:
              'No Uniswap official icon, MetaMask cannot recognize it.'
          },
          {
            chinese:
              '授權內容中實質是Uniswapp而並非Uniswap',
            english:
              'The authorization content is actually Uniswapp rather than Uniswap.'
          }
        ]
      }
    },
    {
      id: 3,
      type: 'legit', // 合法（高權限但正規）
      title: {
        chinese: '場景三：NFT 交易掛單（正規全域授權）',
        english: 'Scenario 3: NFT Listing (Legitimate Global Approval)'
      },
      description: {
        chinese:
          '你正在 OpenSea 想要出售你的 Azuki NFT。需要你簽署「全權委託（SetApprovalForAll）」,請你判斷一下是合法還是釣魚。',
        english:
          'You are on OpenSea listing your Azuki NFT for sale. You need to sign a "SetApprovalForAll" so it can transfer the NFT to the buyer once a sale happens.'
      },
      authorization: {
        url: 'https://opensea.io',
        title: {
          chinese: '全部授權',
          english: 'Full Approval'
        },
        question: {
          chinese: '允許 OpenSea: Seaport 1.5 存取您所有的 Azuki？',
          english: 'Allow OpenSea: Seaport 1.5 to access all of your Azuki?'
        },
        recipient: {
          name: 'OpenSea: Seaport 1.5',
          address: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
          isIdentified: true
        },
        asset: 'Azuki (All)',
        spendingCap: 'All Azuki (SetApprovalForAll)',
        isUnlimited: true,
        gasEstimate: '0.0042 ETH',
        maxFee: '0.0055 ETH',
        buttonText: {
          reject: { chinese: '拒絕', english: 'Reject' },
          next: { chinese: '確認', english: 'Confirm' }
        }
      },
      characteristics: {
        legit: [
          {
            chinese: '在opensea之中，確實需要全權授權來出售ETF以便更加容易找到買家  。',
            english: 'In opensea, it actually needs full authorization to sell ETFs to make it easier to find buyers。'
          },
          {
            chinese: '合約名稱：顯示 OpenSea: Seaport（公認的市場合約），名稱與網址一致且可信。',
            english: 'Contract name: Shows OpenSea: Seaport (a well-known marketplace contract), matching the official site and considered safe.'
          }
        ],
        phishing: []
      }
    },
    {
      id: 4,
      type: 'phishing', // 釣魚（偽裝成登入的 Permit 簽名）
      title: {
        chinese: '場景四：新興Defi網站登入需要使用你的Uniswap錢包地址簽署登入 ',
        english: 'Scenario 4: New DeFi Site Login with Uniswap Wallet Address'
      },
      description: {
        chinese:
          '你在一個新興 DeFi 網站上，跳出視窗看起來像登入。需要你簽署一個請求，請你判斷一下是合法還是釣魚',
        english:
          'You are on a new DeFi site, and a popup appears that looks like a login.'
      },
      authorization: {
        url: 'https://security-verify-web3.io',
        title: {
          chinese: '簽署請求',
          english: 'Signature Request'
        },
        question: {
          chinese: '您正在簽署一項請求',
          english: 'You are signing a request'
        },
        recipient: {
          name: '0x911...666',
          address: '0x9110000000000000000000000000000000000666',
          isIdentified: false
        },
        asset: 'USDC (Permit)',
        spendingCap: '1157920892373161954235709850086879078532...',
        isUnlimited: true,
        gasEstimate: '0 (簽署無 Gas)',
        maxFee: '0',
        buttonText: {
          reject: { chinese: '拒絕', english: 'Reject' },
          next: { chinese: '簽署', english: 'Sign' }
        }
      },
      characteristics: {
        legit: [],
        phishing: [
          {
            chinese: '沒有 Gas 費：因為是簽署，顯示 0 Gas，容易降低警覺。',
            english: 'No gas cost: It is just a signature, showing 0 gas, which lowers vigilance.'
          },
          {
            chinese: '程式碼裸露：彈窗出現大段 JSON（types/domain/message），不像一般登入提示。',
            english: 'Exposed JSON: The popup shows large JSON blocks (types/domain/message), unlike typical login prompts.'
          },
          {
            chinese: '關鍵字藏在細節：Message 裡有 Permit / spender / value(無限大)，代表在授權花費，而不是登入。',
            english: 'Key terms hidden: Message contains Permit / spender / value (unlimited), meaning spending approval not login.'
          }
        ]
      }
    }
  ];

  const [answers, setAnswers] = useState(Array(scenarios.length).fill(null)); // 每個場景的答案 'legit' | 'phishing' | null

  // 初始化：路由变化时重置状态
  useEffect(() => {
    setView('intro');
    setOpenBackpack(false);
    setShowResult(false);
    setIsCorrect(false);
    setCurrentScenarioIndex(0);
    setAnswers(Array(scenarios.length).fill(null));
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
      const parts = config.nextLevel.split('-');
      if (parts[0].startsWith('phase')) {
        // 提取 phase（如 'phase2'）
        const phase = parts[0];
        // 使用完整的 nextLevel 作为 id（如 'phase2-danger-auth'）
        navigate(`/challenge/${phase}/${config.nextLevel}`);
      } else {
        const currentPhase = location.pathname.split('/')[2] || 'phase2';
        navigate(`/challenge/${currentPhase}/${config.nextLevel}`);
      }
    }
  };

  // 处理答案选择
  const handleSelectAnswer = (answer) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentScenarioIndex] = answer;
      return next;
    });
  };

  // 检查答案
  const checkAnswer = () => {
    // 所有題目都必須已作答
    const allAnswered = answers.every((ans) => ans !== null);
    if (!allAnswered) return;

    const allCorrect = scenarios.every((scenario, index) => {
      return answers[index] === scenario.type;
    });

    setIsCorrect(allCorrect);
    setShowResult(true);
  };

  // 切换场景
  const handlePreviousScenario = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex((prev) => prev - 1);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const handleNextScenarioQuestion = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  // 渲染任务介绍页面
  const renderMissionIntro = () => {
    const introData = config?.intro?.[language];

    return (
      <div className="flex items-center justify-center w-full min-h-screen p-8 relative z-10">
        <div className="bg-[#0f172a] rounded-3xl p-10 max-w-2xl text-center backdrop-blur-xl shadow-2xl border border-gray-800">
          <div className="mb-6 flex justify-center">
            <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-cyan-500/30">
              {language === 'chinese' ? '新任務解鎖' : 'New Mission Unlocked'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-6 tracking-tighter font-mono">
            {introData?.title || (language === 'chinese' ? '判斷授權內容' : 'Judge Authorization Content')}
          </h1>
          <div className="space-y-6 text-left mb-10">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">
                {language === 'chinese' ? '背景' : 'Background'}
              </p>
              <p className="text-white text-lg leading-relaxed">
                {introData?.story || ''}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">
                {language === 'chinese' ? '目標' : 'Objective'}
              </p>
              <p className="text-white text-lg leading-relaxed">
                {introData?.mission || ''}
              </p>
            </div>
            {introData?.warning && (
              <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30">
                <p className="text-yellow-100/70 text-sm mb-1 uppercase font-bold">
                  {language === 'chinese' ? '注意' : 'Warning'}
                </p>
                <p className="text-yellow-100 text-lg leading-relaxed">
                  {introData.warning}
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setView('challenge')}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
          >
            {introData?.btn || (language === 'chinese' ? '開始挑戰' : 'Start Challenge')}
          </button>
        </div>
      </div>
    );
  };

  // 渲染 MetaMask 授权界面 - 使用 permission 圖片
  const renderMetaMaskAuthorization = () => {
    // 根據場景索引選擇對應的 permission 圖片
    const permissionImages = [Permission01, Permission02, Permission03, Permission04];
    const currentPermissionImage = permissionImages[currentScenarioIndex];

    return (
      <div className="w-full max-w-md mx-auto flex items-center justify-center">
        <img 
          src={currentPermissionImage} 
          alt={`Permission ${currentScenarioIndex + 1}`}
          className="w-full h-auto rounded-2xl shadow-2xl"
          style={{ maxHeight: '80vh', objectFit: 'contain' }}
        />
      </div>
    );
  };

  // 渲染挑战视图
  const renderChallenge = () => {
    const scenario = scenarios[currentScenarioIndex];
    const selectedAnswer = answers[currentScenarioIndex];
    const allAnswered = answers.every((ans) => ans !== null);

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-900">
        <BrowserFrame 
          url="metamask.io/notification"
          className="w-full max-w-5xl h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
          showControls={true}
        >
          <div className="w-full h-full flex flex-col items-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1] p-8 overflow-y-auto">
            {/* 场景描述 - 放在最上方 */}
            <div className="w-full max-w-2xl mb-8 mt-4 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {scenario.title[language]}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {scenario.description[language]}
                </p>
              </div>
            </div>

            {/* MetaMask 授权界面 - 居中显示，与场景描述分开 */}
            <div className="flex-1 flex items-center justify-center w-full my-8">
              <div className="w-full max-w-md">
                {renderMetaMaskAuthorization()}
              </div>
            </div>

            {/* 选择按钮区域 */}
            <div className="w-full max-w-2xl flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <p className="text-gray-700 text-lg font-semibold mb-6 text-center">
                  {language === 'chinese' 
                    ? '請判斷此授權請求是合法還是釣魚：' 
                    : 'Please determine if this authorization request is legitimate or phishing:'}
                </p>

                {/* 空白區域，增加判斷說明與提交答案之間的距離 */}
                <div className="h-4" />

                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => handleSelectAnswer('legit')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl transition-all transform text-white relative overflow-hidden ${
                      selectedAnswer === 'legit'
                        ? 'bg-gradient-to-br from-green-600 to-green-700 border-4 border-green-400'
                        : 'bg-black border-2 border-transparent hover:border-gray-400'
                    }`}
                    style={selectedAnswer === 'legit' ? {
                      boxShadow: '0 0 30px rgba(34, 197, 94, 0.8), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                      animation: 'pulse-glow-judge 2s ease-in-out infinite'
                    } : {
                      backgroundColor: '#000000'
                    }}
                  >
                    {selectedAnswer === 'legit' && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-xl font-bold mb-2">
                      {language === 'chinese' ? '✓ 合法' : '✓ Legitimate'}
                    </div>
                    <div className={`text-sm ${selectedAnswer === 'legit' ? 'text-white opacity-95' : 'opacity-90'}`}>
                      {language === 'chinese' 
                        ? '正規平台的授權請求'
                        : 'Legitimate platform authorization'}
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleSelectAnswer('phishing')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl transition-all transform text-white relative overflow-hidden ${
                      selectedAnswer === 'phishing'
                        ? 'bg-gradient-to-br from-red-600 to-red-700 border-4 border-red-400'
                        : 'bg-black border-2 border-transparent hover:border-gray-400'
                    }`}
                    style={selectedAnswer === 'phishing' ? {
                      boxShadow: '0 0 30px rgba(239, 68, 68, 0.8), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                      animation: 'pulse-glow-red-judge 2s ease-in-out infinite'
                    } : {
                      backgroundColor: '#000000'
                    }}
                  >
                    {selectedAnswer === 'phishing' && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-xl font-bold mb-2">
                      {language === 'chinese' ? '⚠ 釣魚' : '⚠ Phishing'}
                    </div>
                    <div className={`text-sm ${selectedAnswer === 'phishing' ? 'text-white opacity-95' : 'opacity-90'}`}>
                      {language === 'chinese' 
                        ? '可疑或惡意的授權請求'
                        : 'Suspicious or malicious authorization'}
                    </div>
                  </motion.button>
                </div>

                {/* 上一題 / 提交答案 / 下一題 按鈕列 */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  <button
                    onClick={handlePreviousScenario}
                    disabled={currentScenarioIndex === 0}
                    className="flex-1 px-4 py-3 text-black font-bold text-base rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border-2 border-black hover:border-gray-500 bg-white"
                  >
                    {language === 'chinese' ? '上一題' : 'Previous'}
                  </button>

                  <button
                    onClick={checkAnswer}
                    disabled={!allAnswered}
                    className="flex-1 px-4 py-3 text-black font-bold text-base rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black hover:border-gray-500 bg-white"
                  >
                    {language === 'chinese' ? '提交答案' : 'Submit Answer'}
                  </button>

                  <button
                    onClick={handleNextScenarioQuestion}
                    disabled={currentScenarioIndex === scenarios.length - 1}
                    className="flex-1 px-4 py-3 text-black font-bold text-base rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border-2 border-black hover:border-gray-500 bg-white"
                  >
                    {language === 'chinese' ? '下一題' : 'Next'}
                  </button>
                </div>
              </div>
            </div>

            {/* 现实特征提示（仅在显示结果时） */}
            {showResult && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-2xl mt-6 flex-shrink-0"
                >
                  <div className={`bg-white rounded-xl p-6 shadow-lg border-2 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}>
                    <h3 className={`text-xl font-bold mb-4 ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCorrect 
                        ? (language === 'chinese' ? '✓ 正確！' : '✓ Correct!')
                        : (language === 'chinese' ? '✗ 錯誤' : '✗ Incorrect')}
                    </h3>
                    <div className="space-y-3">
                      {scenario.characteristics[scenario.type].map((char, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className={isCorrect ? 'text-green-500' : 'text-gray-400'}>
                            {isCorrect ? '✓' : '○'}
                          </span>
                          <p className={`text-sm ${
                            isCorrect ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {char[language]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </BrowserFrame>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes pulse-glow-judge {
          0%, 100% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 50px rgba(34, 197, 94, 1), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
          }
        }
        @keyframes pulse-glow-red-judge {
          0%, 100% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.8), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 50px rgba(239, 68, 68, 1), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
          }
        }
      `}</style>
      <ChallengeTemplate
        language={language}
        setLanguage={setLanguage}
        containerMaxWidth="100vw"
        containerMaxHeight="100vh"
        openBackpack={openBackpack}
      >
      {/* 任务介绍视图 */}
      {view === 'intro' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderMissionIntro()}
        </div>
      )}

      {/* 挑战视图 */}
      {view === 'challenge' && !showResult && (
        renderChallenge()
      )}

      {/* 结果显示 */}
      {view === 'challenge' && showResult && (
        <ChallengeResultScreen
          isSuccess={isCorrect}
          title={isCorrect 
            ? (language === 'chinese' ? '判斷正確！' : 'Correct Judgment!')
            : (language === 'chinese' ? '判斷錯誤' : 'Incorrect Judgment')}
          description={isCorrect 
            ? (language === 'chinese' 
                ? '您已成功做出正確判斷。' 
                : 'You have successfully made the correct judgment.')
            : (language === 'chinese' 
                ? '請重新檢查授權請求的特徵。' 
                : 'Please recheck the characteristics of the authorization request.')}
          successMessage={language === 'chinese' ? '驗證通過' : 'Verification Passed'}
          failureMessage={language === 'chinese' ? '驗證失敗' : 'Verification Failed'}
          successExplanation={language === 'chinese' 
            ? '請特別記住本題的關鍵特徵，未來遇到類似畫面時就能更快做出判斷。'
            : 'Remember the key characteristics from this scenario so you can judge similar prompts faster in the future.'}
          failureExplanation={language === 'chinese' 
            ? '請仔細檢查授權請求的特徵：平台識別、金額限制、網址等。'
            : 'Please carefully check the characteristics of the authorization request: platform identification, spending limits, URL, etc.'}
          successSubtitle={language === 'chinese' ? '恭喜' : 'Congratulations'}
          checkItems={[
            {
              label: language === 'chinese' ? '判斷結果' : 'Judgment Result',
              value: isCorrect 
                ? (language === 'chinese' 
                    ? (scenarios[currentScenarioIndex].type === 'legit' 
                        ? '正確識別為合法授權' 
                        : '正確識別為釣魚授權')
                    : (scenarios[currentScenarioIndex].type === 'legit'
                        ? 'Correctly identified as legitimate'
                        : 'Correctly identified as phishing'))
                : (language === 'chinese' ? '判斷錯誤' : 'Incorrect judgment'),
              isCorrect: isCorrect,
              showValue: true,
              details: (
                <div className="mt-2 space-y-2">
                  {scenarios.map((scenario, sIndex) => (
                    <div key={sIndex} className="space-y-1">
                      <p
                        className={`text-sm font-semibold ${
                          answers[sIndex] === scenario.type ? 'text-green-200' : 'text-red-200'
                        }`}
                      >
                        {language === 'chinese'
                          ? `場景 ${sIndex + 1}（${answers[sIndex] === scenario.type ? '判斷正確' : '判斷錯誤'}，正確答案：${scenario.type === 'legit' ? '合法' : '釣魚'}）`
                          : `Scenario ${sIndex + 1} (${answers[sIndex] === scenario.type ? 'correct' : 'incorrect'}, correct: ${scenario.type === 'legit' ? 'legit' : 'phishing'})`}
                      </p>
                      {scenario.characteristics[scenario.type].map((char, index) => (
                        <p key={index} className="text-gray-300 text-sm">
                          • {char[language]}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )
            }
          ]}
          onRetry={() => {
            setShowResult(false);
            setAnswers(Array(scenarios.length).fill(null));
            setCurrentScenarioIndex(0);
            setIsCorrect(false);
          }}
          onNextLevel={handleNextLevel}
          nextLevelButtonText={language === 'chinese' ? '下一關' : 'Next Level'}
          customStyles={{
            container: {
              width: '100vw',
              height: '100vh',
              maxHeight: '100vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'fixed',
              top: 0,
              left: 0,
              paddingTop: '20px',
              paddingBottom: '20px'
            }
          }}
        />
      )}
      </ChallengeTemplate>
    </>
  );
};

export default JudgeAuth;