import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkUsernameExists } from '../api';

const ConsentModal = ({ isOpen, onClose, onConsent, onLogin }) => {
  const [web3Experience, setWeb3Experience] = useState(null);
  const [dataConsent, setDataConsent] = useState(null);
  const [language, setLanguage] = useState('chinese');
  const [userName, setUserName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false); // 新增：登入模式
  const [loginUsername, setLoginUsername] = useState(''); // 登入用戶名
  const [usernameError, setUsernameError] = useState(''); // 用戶名錯誤訊息
  const [isCheckingUsername, setIsCheckingUsername] = useState(false); // 正在檢查用戶名
  const [usernameAvailable, setUsernameAvailable] = useState(null); // 用戶名是否可用

  // 防抖檢查用戶名是否存在
  useEffect(() => {
    if (!userName.trim() || isLoginMode) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const result = await checkUsernameExists(userName.trim());
        if (result.exists) {
          setUsernameAvailable(false);
          setUsernameError(language === 'chinese' 
            ? '❌ 此用戶名已被使用，請選擇其他名稱' 
            : '❌ This username is already taken, please choose another');
        } else {
          setUsernameAvailable(true);
          setUsernameError('');
        }
      } catch (error) {
        console.error('檢查用戶名失敗:', error);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500); // 500ms 防抖

    return () => clearTimeout(timeoutId);
  }, [userName, language, isLoginMode]);

  const handleSubmit = () => {
    if (web3Experience !== null && dataConsent !== null && userName.trim() && usernameAvailable !== false) {
      // 將選擇結果存儲到 localStorage（前端存儲）
      localStorage.setItem('web3Experience', web3Experience);
      localStorage.setItem('dataConsent', dataConsent);
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem('consentTimestamp', new Date().toISOString());
      localStorage.setItem('preferredLanguage', language);
      
      onConsent({ 
        web3Experience, 
        dataConsent, 
        userName: userName.trim(),
        language  // 傳遞語言設定
      });
      onClose();
    }
  };

  const handleLogin = () => {
    if (loginUsername.trim()) {
      setUsernameError('');
      onLogin({ 
        username: loginUsername.trim(),
        language 
      });
    }
  };

  const isFormValid = web3Experience !== null && dataConsent !== null && userName.trim() && usernameAvailable === true;
  const isLoginValid = loginUsername.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="bg-gray-900 rounded-lg p-6 max-h-[90vh] overflow-y-auto"
              style={{
                border: '2px solid #3b82f6',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
                {/* 偏好語言選擇 / Preferred Language Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                    偏好語言 / Preferred Language <span className="text-red-400">*</span>
                  </h3>
                  <div className="flex gap-6">
                    <button
                      onClick={() => setLanguage('chinese')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: language === 'chinese' ? 'bold' : 'normal',
                        color: language === 'chinese' ? '#22d3ee' : '#9ca3af',
                        textDecoration: language === 'chinese' ? 'underline' : 'none',
                        textDecorationColor: language === 'chinese' ? '#22d3ee' : 'transparent',
                        textUnderlineOffset: '4px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (language !== 'chinese') {
                          e.target.style.color = '#e5e7eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== 'chinese') {
                          e.target.style.color = '#9ca3af';
                        }
                      }}
                    >
                      中文
                    </button>
                    <button
                      onClick={() => setLanguage('english')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: language === 'english' ? 'bold' : 'normal',
                        color: language === 'english' ? '#22d3ee' : '#9ca3af',
                        textDecoration: language === 'english' ? 'underline' : 'none',
                        textDecorationColor: language === 'english' ? '#22d3ee' : 'transparent',
                        textUnderlineOffset: '4px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (language !== 'english') {
                          e.target.style.color = '#e5e7eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== 'english') {
                          e.target.style.color = '#9ca3af';
                        }
                      }}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* 模式切換 - 新用戶 / 已有賬戶 */}
                <div className="mb-6 flex gap-4">
                  <button
                    onClick={() => setIsLoginMode(false)}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: !isLoginMode ? '#10b981' : '#374151',
                      color: !isLoginMode ? '#ffffff' : '#e5e7eb',
                      border: !isLoginMode ? '2px solid #10b981' : '2px solid #6b7280',
                      boxShadow: !isLoginMode ? '0 10px 25px rgba(16, 185, 129, 0.3)' : 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {language === 'chinese' ? '🆕 新用戶註冊' : '🆕 New User Registration'}
                  </button>
                  <button
                    onClick={() => setIsLoginMode(true)}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: isLoginMode ? '#8b5cf6' : '#374151',
                      color: isLoginMode ? '#ffffff' : '#e5e7eb',
                      border: isLoginMode ? '2px solid #8b5cf6' : '2px solid #6b7280',
                      boxShadow: isLoginMode ? '0 10px 25px rgba(139, 92, 246, 0.3)' : 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {language === 'chinese' ? '🔑 已有賬戶登入' : '🔑 Login with Existing Account'}
                  </button>
                </div>

                {/* 已有賬戶登入模式 */}
                {isLoginMode && (
                  <div className="space-y-6">
                    <div 
                      className="p-6 rounded-lg"
                      style={{
                        backgroundColor: '#1f2937',
                        border: '2px solid #8b5cf6'
                      }}
                    >
                      <h3 className="text-xl font-bold text-purple-400 mb-4">
                        {language === 'chinese' ? '歡迎回來！' : 'Welcome Back!'}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {language === 'chinese' 
                          ? '請輸入您的用戶名稱以繼續遊戲：' 
                          : 'Please enter your username to continue:'}
                      </p>
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => {
                          setLoginUsername(e.target.value);
                          setUsernameError('');
                        }}
                        placeholder={language === 'chinese' ? '請輸入您的用戶名稱' : 'Enter your username'}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: usernameError ? '2px solid #ef4444' : '2px solid #8b5cf6',
                          backgroundColor: '#374151',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          marginBottom: '8px'
                        }}
                      />
                      {usernameError && (
                        <p className="text-red-400 text-sm mb-4">{usernameError}</p>
                      )}
                    </div>

                    {/* 登入按鈕 */}
                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        onClick={onClose}
                        style={{
                          padding: '8px 24px',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          backgroundColor: '#374151',
                          color: '#e5e7eb',
                          border: '1px solid #6b7280'
                        }}
                      >
                        {language === 'chinese' ? '取消' : 'Cancel'}
                      </button>
                      <button
                        onClick={handleLogin}
                        disabled={!isLoginValid}
                        style={{
                          padding: '8px 24px',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          backgroundColor: isLoginValid ? '#8b5cf6' : '#4b5563',
                          color: isLoginValid ? '#ffffff' : '#9ca3af',
                          border: '1px solid #6b7280',
                          boxShadow: isLoginValid ? '0 10px 25px rgba(139, 92, 246, 0.3)' : 'none',
                          cursor: isLoginValid ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {language === 'chinese' ? '登入' : 'Login'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 新用戶註冊模式 - 中文內容 */}
                {!isLoginMode && language === 'chinese' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                        項目介紹
                      </h2>
                      <p className="text-gray-300 leading-relaxed">
                        本項目為中文版本澳門大學科技學院的畢業設計作品，旨在透過互動遊戲形式提升玩家對 Web3 網絡釣魚詐騙的認識。遊戲內容涵蓋常見的 Web3 騙局類型，包括「地址投毒」與「授權釣魚」等，並提供相應的安全操作指引。
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        數據收集說明
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        玩家在遊戲過程中的操作數據將由澳門大學科技學院進行分析與處理，僅用於學術研究及項目優化之目的。本遊戲無需提供任何個人身份資料即可遊玩，因此無需擔心個人資料洩漏問題。
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        用戶名稱 <span className="text-red-400">*</span>
                      </h3>
                      <p className="text-gray-300 mb-4">
                        請輸入您的姓名（必填）：
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="請輸入您的姓名"
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingRight: '40px',
                            borderRadius: '8px',
                            border: usernameAvailable === false ? '2px solid #ef4444' : 
                                   usernameAvailable === true ? '2px solid #10b981' : 
                                   userName.trim() ? '2px solid #22d3ee' : '2px solid #ef4444',
                            backgroundColor: '#374151',
                            color: '#ffffff',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                            marginBottom: '8px'
                          }}
                        />
                        {isCheckingUsername && (
                          <span className="absolute right-3 top-3 text-gray-400">⏳</span>
                        )}
                        {!isCheckingUsername && usernameAvailable === true && (
                          <span className="absolute right-3 top-3 text-green-400">✓</span>
                        )}
                        {!isCheckingUsername && usernameAvailable === false && (
                          <span className="absolute right-3 top-3 text-red-400">✗</span>
                        )}
                      </div>
                      {!userName.trim() && (
                        <p className="text-red-400 text-sm">✱ 此欄位為必填項</p>
                      )}
                      {usernameError && (
                        <p className="text-red-400 text-sm">{usernameError}</p>
                      )}
                      {usernameAvailable === true && userName.trim() && (
                        <p className="text-green-400 text-sm">✓ 用戶名可用</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        背景調查
                      </h3>
                      <p className="text-gray-300 mb-4">
                        為幫助我們更好地了解玩家背景並優化教學內容，我們誠摯邀請您回答以下問題：
                      </p>
                      <p className="text-gray-300 mb-4">
                        您是否有在 Web3 相關平台（如去中心化交易所、錢包、NFT 市場等）進行過投資或操作經驗？
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setWeb3Experience('yes')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: web3Experience === 'yes' ? '#22d3ee' : '#374151',
                            color: web3Experience === 'yes' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: web3Experience === 'yes' ? '0 10px 25px rgba(34, 211, 238, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (web3Experience !== 'yes') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (web3Experience !== 'yes') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          有
                        </button>
                        <button
                          onClick={() => setWeb3Experience('no')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: web3Experience === 'no' ? '#22d3ee' : '#374151',
                            color: web3Experience === 'no' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: web3Experience === 'no' ? '0 10px 25px rgba(34, 211, 238, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (web3Experience !== 'no') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (web3Experience !== 'no') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          沒有
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        數據收集同意
                      </h3>
                      <p className="text-gray-300 mb-4">
                        我們誠摯希望您能在遊戲過程中學習到實用的 Web3 安全知識，提高防詐意識，避免日後因釣魚攻擊而蒙受財產損失！
                      </p>
                      <p className="text-gray-300 mb-4">
                        請於下方選擇是否同意我們收集您的遊戲操作數據：
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setDataConsent('agree')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: dataConsent === 'agree' ? '#10b981' : '#374151',
                            color: dataConsent === 'agree' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: dataConsent === 'agree' ? '0 10px 25px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (dataConsent !== 'agree') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (dataConsent !== 'agree') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          同意
                        </button>
                        <button
                          onClick={() => setDataConsent('disagree')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: dataConsent === 'disagree' ? '#ef4444' : '#374151',
                            color: dataConsent === 'disagree' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: dataConsent === 'disagree' ? '0 10px 25px rgba(239, 68, 68, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (dataConsent !== 'disagree') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (dataConsent !== 'disagree') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          不同意
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 新用戶註冊模式 - 英文內容 */}
                {!isLoginMode && language === 'english' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                        Project Introduction
                      </h2>
                      <p className="text-gray-300 leading-relaxed">
                        This project is a graduation capstone developed by the Faculty of Science and Technology at the University of Macau. It is an interactive educational game designed to raise awareness about common Web3 phishing scams. The game covers typical attack vectors such as "address poisoning" and "approval phishing," and provides practical guidance on safe practices.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        Data Collection Information
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Gameplay data collected during your session will be analyzed and processed by the Faculty of Science and Technology at the University of Macau solely for academic research and project improvement purposes. No personal identifying information is required to play the game, so there is no risk of personal data leakage.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        Username <span className="text-red-400">*</span>
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Please enter your name (required):
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your name"
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingRight: '40px',
                            borderRadius: '8px',
                            border: usernameAvailable === false ? '2px solid #ef4444' : 
                                   usernameAvailable === true ? '2px solid #10b981' : 
                                   userName.trim() ? '2px solid #22d3ee' : '2px solid #ef4444',
                            backgroundColor: '#374151',
                            color: '#ffffff',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                            marginBottom: '8px'
                          }}
                        />
                        {isCheckingUsername && (
                          <span className="absolute right-3 top-3 text-gray-400">⏳</span>
                        )}
                        {!isCheckingUsername && usernameAvailable === true && (
                          <span className="absolute right-3 top-3 text-green-400">✓</span>
                        )}
                        {!isCheckingUsername && usernameAvailable === false && (
                          <span className="absolute right-3 top-3 text-red-400">✗</span>
                        )}
                      </div>
                      {!userName.trim() && (
                        <p className="text-red-400 text-sm">✱ This field is required</p>
                      )}
                      {usernameError && (
                        <p className="text-red-400 text-sm">{usernameError}</p>
                      )}
                      {usernameAvailable === true && userName.trim() && (
                        <p className="text-green-400 text-sm">✓ Username is available</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        Background Survey
                      </h3>
                      <p className="text-gray-300 mb-4">
                        To help us better understand our players' backgrounds and improve the educational content, we kindly invite you to answer the following question:
                      </p>
                      <p className="text-gray-300 mb-4">
                        Do you have any prior experience using Web3 platforms (e.g., decentralized exchanges, crypto wallets, NFT marketplaces) or engaging in related investments or transactions?
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setWeb3Experience('yes')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: web3Experience === 'yes' ? '#22d3ee' : '#374151',
                            color: web3Experience === 'yes' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: web3Experience === 'yes' ? '0 10px 25px rgba(34, 211, 238, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (web3Experience !== 'yes') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (web3Experience !== 'yes') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setWeb3Experience('no')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: web3Experience === 'no' ? '#22d3ee' : '#374151',
                            color: web3Experience === 'no' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: web3Experience === 'no' ? '0 10px 25px rgba(34, 211, 238, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (web3Experience !== 'no') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (web3Experience !== 'no') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                        Data Collection Consent
                      </h3>
                      <p className="text-gray-300 mb-4">
                        We sincerely hope that through this experience, you will gain valuable knowledge about Web3 security, enhance your ability to recognize phishing attempts, and avoid potential financial losses in the future.
                      </p>
                      <p className="text-gray-300 mb-4">
                        Please select your consent below regarding the collection of your gameplay data:
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setDataConsent('agree')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: dataConsent === 'agree' ? '#10b981' : '#374151',
                            color: dataConsent === 'agree' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: dataConsent === 'agree' ? '0 10px 25px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (dataConsent !== 'agree') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (dataConsent !== 'agree') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          I agree
                        </button>
                        <button
                          onClick={() => setDataConsent('disagree')}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            backgroundColor: dataConsent === 'disagree' ? '#ef4444' : '#374151',
                            color: dataConsent === 'disagree' ? '#ffffff' : '#e5e7eb',
                            border: '1px solid #6b7280',
                            boxShadow: dataConsent === 'disagree' ? '0 10px 25px rgba(239, 68, 68, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (dataConsent !== 'disagree') {
                              e.target.style.backgroundColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (dataConsent !== 'disagree') {
                              e.target.style.backgroundColor = '#374151';
                            }
                          }}
                        >
                          I do not agree
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 提交按鈕 - 只在新用戶註冊模式顯示 */}
                {!isLoginMode && (
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
                  <button
                    onClick={onClose}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#374151',
                      color: '#e5e7eb',
                      border: '1px solid #6b7280'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#4b5563';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#374151';
                    }}
                  >
                    {language === 'chinese' ? '取消' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: isFormValid ? '#22d3ee' : '#4b5563',
                      color: isFormValid ? '#ffffff' : '#9ca3af',
                      border: '1px solid #6b7280',
                      boxShadow: isFormValid ? '0 10px 25px rgba(34, 211, 238, 0.3)' : 'none',
                      cursor: isFormValid ? 'pointer' : 'not-allowed'
                    }}
                    onMouseEnter={(e) => {
                      if (isFormValid) {
                        e.target.style.backgroundColor = '#06b6d4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isFormValid) {
                        e.target.style.backgroundColor = '#22d3ee';
                      }
                    }}
                  >
                    {language === 'chinese' ? '開始遊戲' : 'Start Game'}
                  </button>
                </div>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsentModal;