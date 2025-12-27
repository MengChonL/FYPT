import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConsentModal = ({ isOpen, onClose, onConsent }) => {
  const [web3Experience, setWeb3Experience] = useState(null);
  const [dataConsent, setDataConsent] = useState(null);
  const [language, setLanguage] = useState('chinese');
  const [userName, setUserName] = useState('');

  const handleSubmit = () => {
    if (web3Experience !== null && dataConsent !== null && userName.trim()) {
      // 將選擇結果存儲到 localStorage（前端存儲）
      localStorage.setItem('web3Experience', web3Experience);
      localStorage.setItem('dataConsent', dataConsent);
      localStorage.setItem('userName', userName.trim());
      localStorage.setItem('consentTimestamp', new Date().toISOString());
      
      onConsent({ web3Experience, dataConsent, userName: userName.trim() });
      onClose();
    }
  };

  const isFormValid = web3Experience !== null && dataConsent !== null && userName.trim();

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
                {/* 語言切換 */}
                <div className="flex justify-end mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLanguage('chinese')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease',
                        backgroundColor: language === 'chinese' ? '#22d3ee' : 'transparent',
                        color: language === 'chinese' ? '#ffffff' : '#9ca3af',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        if (language !== 'chinese') {
                          e.target.style.color = '#ffffff';
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
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>|</span>
                    <button
                      onClick={() => setLanguage('english')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease',
                        backgroundColor: language === 'english' ? '#22d3ee' : 'transparent',
                        color: language === 'english' ? '#ffffff' : '#9ca3af',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        if (language !== 'english') {
                          e.target.style.color = '#ffffff';
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

                {/* 中文內容 */}
                {language === 'chinese' && (
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
                        用戶信息
                      </h3>
                      <p className="text-gray-300 mb-4">
                        請輸入您的姓名（可選）：
                      </p>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="請輸入您的姓名"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '2px solid #6b7280',
                          backgroundColor: '#374151',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          marginBottom: '16px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#22d3ee';
                          e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#6b7280';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
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

                {/* 英文內容 */}
                {language === 'english' && (
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
                        User Information
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Please enter your name (optional):
                      </p>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '2px solid #6b7280',
                          backgroundColor: '#374151',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          marginBottom: '16px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#22d3ee';
                          e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#6b7280';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
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

                {/* 提交按鈕 */}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsentModal;