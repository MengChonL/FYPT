import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BrowserFrame from './BrowserFrame';
import ChallengeTemplate from './ChallengeTemplate';
import ChallengeResultScreen from './ChallengeResultScreen';
import PhaseRoadmap from '../PhaseRoadmap';
import MetaMaskFox from '../../assets/MetaMask_Fox.png';

const CreateWalletChallenge = ({ config }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('chinese');
  const [view, setView] = useState('map');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [selectedBackupOption, setSelectedBackupOption] = useState(null);
  const [backupError, setBackupError] = useState('');
  
  const t = config?.content?.[language];
  const introData = config?.intro?.[language];

  // 语言内容对象
  const content = {
    chinese: {
      intro: {
        missionUnlocked: '新任務解鎖',
        background: 'Background',
        objective: 'Objective',
        btn: '開始創建錢包'
      },
      onboarding: {
        title: '歡迎來到 MetaMask',
        subtitle: '連接您與去中心化網絡的橋樑',
        description: 'MetaMask 是一個加密貨幣錢包，讓您可以安全地存儲、發送和接收以太坊及其他代幣。',
        createWalletBtn: '創建錢包',
        importWalletBtn: '導入錢包'
      },
      password: {
        title: '創建密碼',
        subtitle: '此密碼將用於解鎖您的 MetaMask 錢包',
        passwordLabel: '新密碼',
        confirmPasswordLabel: '確認密碼',
        passwordPlaceholder: '至少 8 個字符',
        confirmPasswordPlaceholder: '再次輸入密碼',
        createBtn: '創建',
        passwordTooShort: '密碼至少需要 8 個字符',
        passwordsNotMatch: '密碼不一致',
        passwordEmpty: '請輸入密碼',
        confirmPasswordEmpty: '請確認密碼',
        passwordHint: '請記住此密碼，我們無法為您恢復。'
      },
      mnemonic: {
        title: '備份您的助記詞',
        subtitle: '請妥善保管您的助記詞，這是恢復錢包的唯一方式',
        warning: '請勿分享你的助憶詞給任何用戶',
        backupOptions: {
          write: '用紙和筆抄寫',
          screenshot: '截圖保存到相冊',
          email: '寫在郵件備忘錄'
        },
        continueBtn: '我已備份，繼續',
        errorScreenshot: '截圖保存不安全！如果您的裝置被入侵，助記詞可能會被泄露。',
        errorEmail: '郵件備份不安全！黑客可能透過入侵郵件系統獲取您的助記詞。',
        errorNoSelection: '請選擇備份方式'
      },
      walletCreated: {
        title: '錢包創建成功！',
        addressLabel: '您的公開地址',
        mnemonicLabel: '助記詞 (請勿截圖)',
        warning: '請妥善保管您的助記詞，丟失將無法恢復錢包！',
        continueBtn: '繼續'
      }
    },
    english: {
      intro: {
        missionUnlocked: 'New Mission Unlocked',
        background: 'Background',
        objective: 'Objective',
        btn: 'Start Creating Wallet'
      },
      onboarding: {
        title: 'Welcome to MetaMask',
        subtitle: 'Connecting you to the decentralized web',
        description: 'MetaMask is a cryptocurrency wallet that allows you to securely store, send, and receive Ethereum and other tokens.',
        createWalletBtn: 'Create a New Wallet',
        importWalletBtn: 'Import Wallet'
      },
      password: {
        title: 'Create Password',
        subtitle: 'This password will be used to unlock your MetaMask wallet',
        passwordLabel: 'New Password',
        confirmPasswordLabel: 'Confirm Password',
        passwordPlaceholder: 'At least 8 characters',
        confirmPasswordPlaceholder: 'Re-enter password',
        createBtn: 'Create',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordsNotMatch: 'Passwords do not match',
        passwordEmpty: 'Please enter password',
        confirmPasswordEmpty: 'Please confirm password',
        passwordHint: 'Remember this password. We cannot recover it for you.'
      },
      mnemonic: {
        title: 'Backup Your Recovery Phrase',
        subtitle: 'Please keep your recovery phrase safe. This is the only way to restore your wallet.',
        warning: 'Do not share your recovery phrase with anyone',
        backupOptions: {
          write: 'Write with Pen and Paper',
          screenshot: 'Screenshot to Gallery',
          email: 'Save to Email Notes'
        },
        continueBtn: 'I\'ve Backed Up, Continue',
        errorScreenshot: 'Screenshot is not secure! If your device is compromised, your recovery phrase may be leaked.',
        errorEmail: 'Email backup is not secure! Hackers may access your recovery phrase by compromising your email system.',
        errorNoSelection: 'Please select a backup method'
      },
      walletCreated: {
        title: 'Wallet Created Successfully',
        addressLabel: 'Your Public Address',
        mnemonicLabel: 'Secret Recovery Phrase',
        warning: 'Please keep your recovery phrase safe. Losing it will result in permanent loss of your wallet!',
        continueBtn: 'Continue'
      }
    }
  };

  const currentContent = content[language] || content.chinese;

  useEffect(() => {
    setView('map');
    setShowResult(false);
    setWalletCreated(false);
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setMnemonic('');
    setSelectedBackupOption(null);
    setBackupError('');
  }, [location.pathname]);

  const handleStartLevel = (stepId) => {
    if (stepId === 'create') setView('intro');
  };

  // 处理创建钱包 - 跳转到密码输入界面
  const handleCreateWallet = () => {
    setView('password');
  };

  // 处理密码提交
  const handlePasswordSubmit = () => {
    // 验证密码是否输入
    if (!password || password.trim() === '') {
      setPasswordError(language === 'chinese' ? '請輸入密碼' : 'Please enter password');
      return;
    }

    if (!confirmPassword || confirmPassword.trim() === '') {
      setPasswordError(language === 'chinese' ? '請確認密碼' : 'Please confirm password');
      return;
    }

    // 验证密码长度
    if (password.length < 8) {
      setPasswordError(language === 'chinese' ? '密碼至少需要 8 個字符' : 'Password must be at least 8 characters');
      return;
    }
    
    // 验证密码是否一致
    if (password !== confirmPassword) {
      setPasswordError(language === 'chinese' ? '密碼不一致' : 'Passwords do not match');
      return;
    }

    // 密码验证通过，生成助记词并跳转到助记词界面
    setPasswordError('');
    // 使用配置中的助记词，如果没有则使用默认值
    const defaultMnemonic = config?.wallet?.mnemonic || 'ocean hidden verify unfair ripple master harvest bitter galaxy eternal badge mountain';
    setMnemonic(defaultMnemonic);
    setView('mnemonic');
  };

  // 获取当前错误信息（根据语言和选中的选项动态计算）
  const getBackupError = () => {
    if (!selectedBackupOption) {
      return currentContent.mnemonic.errorNoSelection;
    }
    if (selectedBackupOption === 'screenshot') {
      return currentContent.mnemonic.errorScreenshot;
    }
    if (selectedBackupOption === 'email') {
      return currentContent.mnemonic.errorEmail;
    }
    return '';
  };

  // 处理下一关导航
  const handleNextLevel = () => {
    if (config?.nextLevel) {
      // 根据 nextLevel 确定路由路径
      // nextLevel 格式应该是 'phase1-3'，需要转换为 '/challenge/phase1/phase1-3'
      const phase = config.nextLevel.split('-')[0]; // 提取 'phase1'
      navigate(`/challenge/${phase}/${config.nextLevel}`);
    }
  };

  // 处理助记词备份完成
  const handleMnemonicBackupComplete = () => {
    // 检查是否选择了备份方式
    if (!selectedBackupOption) {
      setBackupError(currentContent.mnemonic.errorNoSelection);
      return;
    }

    // 只有"用纸和笔抄写"是正确的选择
    if (selectedBackupOption === 'write') {
      setBackupError('');
      setWalletCreated(true);
      setIsCorrect(true);
      setShowResult(true);
    } else if (selectedBackupOption === 'screenshot') {
      setBackupError(currentContent.mnemonic.errorScreenshot);
      setWalletCreated(false);
      setIsCorrect(false);
      setShowResult(true);
    } else if (selectedBackupOption === 'email') {
      setBackupError(currentContent.mnemonic.errorEmail);
      setWalletCreated(false);
      setIsCorrect(false);
      setShowResult(true);
    }
  };

  const roadmapSteps = [
    { id: 'search', iconType: 'search', status: 'completed', title: { chinese: '下載錢包', english: 'Download Wallet' } },
    { id: 'create', iconType: 'create', status: 'current', title: { chinese: '創建錢包', english: 'Create Wallet' } },
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
          {introData?.title || (language === 'chinese' ? '任務 2：創建您的錢包' : 'Mission 2: Create Your Wallet')}
        </h1>
        <div className="space-y-6 text-left mb-10">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">{currentContent.intro.background}</p>
            <p className="text-white text-lg leading-relaxed">
              {introData?.story || (language === 'chinese' 
                ? '您已經成功下載了 MetaMask 錢包。現在需要創建一個新的錢包來開始您的 Web3 之旅。' 
                : 'You have successfully downloaded MetaMask. Now you need to create a new wallet to begin your Web3 journey.')}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-cyan-100/70 text-sm mb-1 uppercase font-bold">{currentContent.intro.objective}</p>
            <p className="text-white text-lg leading-relaxed">
              {introData?.mission || (language === 'chinese' 
                ? '您的目標是：按照 MetaMask 的引導流程，安全地創建一個新的加密貨幣錢包。' 
                : 'Your goal is to safely create a new cryptocurrency wallet following MetaMask\'s onboarding process.')}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setView('onboarding')}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] transform hover:scale-[1.02]"
        >
          {introData?.btn || currentContent.intro.btn}
        </button>
      </div>
    </div>
  );

  const renderOnboardingPage = () => (
    <div className="w-full min-h-full flex items-center justify-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1] py-8">
      <div className="w-full max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] p-8 text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={MetaMaskFox} 
                alt="MetaMask" 
                className="w-32 h-32 object-contain"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#7c3aed' }}>
              {currentContent.onboarding.title}
            </h1>
            <p className="text-xl" style={{ color: '#7c3aed', opacity: 0.8 }}>
              {currentContent.onboarding.subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pt-8 pb-0">
            <p className="text-gray-600 text-lg text-center leading-relaxed">
              {currentContent.onboarding.description}
            </p>
          </div>

          {/* Separator */}
          <div className="px-8 pt-8 pb-0">
            <div className="border-t border-gray-300"></div>
          </div>
        </div> {/* <-- close .bg-white card here */}

        {/* Buttons (放在卡片外，透明背景) */}
        <div className="w-full px-8 pb-8" style={{ paddingTop: '3rem' }}>
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <button
              onClick={handleCreateWallet}
              className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: '#000000',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
            >
              {currentContent.onboarding.createWalletBtn}
            </button>

            <button
              className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: '#000000',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
            >
              {currentContent.onboarding.importWalletBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPasswordPage = () => (
    <div className="w-full min-h-full flex items-center justify-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1] py-8">
      <div className="w-full max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] p-8 text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={MetaMaskFox} 
                alt="MetaMask" 
                className="w-24 h-24 object-contain"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
              />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#7c3aed' }}>
              {currentContent.password.title}
            </h1>
            <p className="text-lg" style={{ color: '#7c3aed', opacity: 0.8 }}>
              {currentContent.password.subtitle}
            </p>
          </div>

          {/* Password Form */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  {currentContent.password.passwordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder={currentContent.password.passwordPlaceholder}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  {currentContent.password.confirmPasswordLabel}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder={currentContent.password.confirmPasswordPlaceholder}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  style={{ fontSize: '16px' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                />
              </div>

              {/* Error Message */}
              {passwordError && (
                <div className="text-red-500 text-sm font-medium">
                  {passwordError}
                </div>
              )}

              {/* Password Hint */}
              <p className="text-sm text-gray-500 text-center">
                {currentContent.password.passwordHint}
              </p>

              {/* Create Button */}
              <button
                onClick={handlePasswordSubmit}
                className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: '#000000',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                {currentContent.password.createBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMnemonicPage = () => {
    // 将助记词字符串分割成数组
    const mnemonicWords = mnemonic.split(' ').filter(word => word.trim() !== '');

    return (
      <div className="w-full min-h-full flex items-center justify-center bg-gradient-to-br from-[#f7f9fc] to-[#e8ecf1] py-8">
        <div className="w-full max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] p-8 text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src={MetaMaskFox} 
                  alt="MetaMask" 
                  className="w-24 h-24 object-contain"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                />
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#7c3aed' }}>
                {currentContent.mnemonic.title}
              </h1>
              <p className="text-lg mb-4" style={{ color: '#7c3aed', opacity: 0.8 }}>
                {currentContent.mnemonic.subtitle}
              </p>
              <div className="flex items-center justify-center">
                <div className="bg-yellow-100 border-2 border-yellow-500 p-3 rounded text-yellow-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {currentContent.mnemonic.warning}
                </div>
              </div>
            </div>

            {/* Mnemonic Words */}
            <div className="p-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {mnemonicWords.map((word, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:border-purple-400 transition-colors"
                  >
                    <span className="text-gray-500 font-bold text-sm w-6">{index + 1}</span>
                    <span className="text-gray-800 font-semibold text-base flex-1">{word}</span>
                  </div>
                ))}
              </div>

              {/* Backup Options */}
              <div className="border-t border-gray-300 pt-6 pb-0">
                <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
                  {language === 'chinese' ? '選擇備份方式' : 'Choose Backup Method'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Option 1: Write with Pen and Paper */}
                  <button
                    type="button"
                    className={`p-6 border-2 rounded-xl transition-all text-left cursor-pointer ${
                      selectedBackupOption === 'write'
                        ? 'border-purple-500 bg-purple-100 ring-2 ring-purple-300'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedBackupOption('write');
                      setBackupError('');
                    }}
                  >
                    <div className="mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div className="font-bold text-gray-800 mb-1">
                      {currentContent.mnemonic.backupOptions.write}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === 'chinese' ? '最安全的方式' : 'Most secure method'}
                    </div>
                  </button>

                  {/* Option 2: Screenshot */}
                  <button
                    type="button"
                    className={`p-6 border-2 rounded-xl transition-all text-left cursor-pointer ${
                      selectedBackupOption === 'screenshot'
                        ? 'border-purple-500 bg-purple-100 ring-2 ring-purple-300'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedBackupOption('screenshot');
                      setBackupError('');
                    }}
                  >
                    <div className="mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="font-bold text-gray-800 mb-1">
                      {currentContent.mnemonic.backupOptions.screenshot}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === 'chinese' ? '快速保存' : 'Quick save'}
                    </div>
                  </button>

                  {/* Option 3: Email Notes */}
                  <button
                    type="button"
                    className={`p-6 border-2 rounded-xl transition-all text-left cursor-pointer ${
                      selectedBackupOption === 'email'
                        ? 'border-purple-500 bg-purple-100 ring-2 ring-purple-300'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedBackupOption('email');
                      setBackupError('');
                    }}
                  >
                    <div className="mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="font-bold text-gray-800 mb-1">
                      {currentContent.mnemonic.backupOptions.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === 'chinese' ? '雲端備份' : 'Cloud backup'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {backupError && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {getBackupError()}
                </div>
              )}

              {/* Separator - 增加间距 */}
              <div className="border-t border-gray-300" style={{ marginTop: '3rem', marginBottom: '2rem' }}></div>

              {/* Continue Button - 独立出来 */}
              <div>
                <button
                  onClick={handleMnemonicBackupComplete}
                  className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#000000',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                  }}
                >
                  {currentContent.mnemonic.continueBtn}
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
      title={t?.title}
      containerMaxWidth="100vw"
      containerMaxHeight="100vh"
    >
      {view === 'map' && <PhaseRoadmap steps={roadmapSteps} onStartLevel={handleStartLevel} language={language} />}
      {view === 'intro' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderMissionIntro()}
        </div>
      )}
      {view === 'onboarding' && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url="metamask.io/onboarding"
            className="w-full max-w-4xl h-[85vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            {renderOnboardingPage()}
          </BrowserFrame>
        </div>
      )}
      {view === 'password' && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url="metamask.io/create-password"
            className="w-full max-w-4xl h-[85vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            {renderPasswordPage()}
          </BrowserFrame>
        </div>
      )}
      {view === 'mnemonic' && !showResult && (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-900">
          <BrowserFrame 
            url="metamask.io/backup-mnemonic"
            className="w-full max-w-5xl h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-white" 
            showControls={true}
          >
            {renderMnemonicPage()}
          </BrowserFrame>
        </div>
      )}
      {showResult && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChallengeResultScreen 
            isSuccess={isCorrect}
            title={isCorrect ? (language === 'chinese' ? "錢包創建成功！" : "Wallet Created Successfully!") : (language === 'chinese' ? "備份方式不安全" : "Unsafe Backup Method")}
            description={isCorrect ? (language === 'chinese' ? "您已成功創建 MetaMask 錢包！" : "You have successfully created a MetaMask wallet!") : getBackupError()}
            successMessage={isCorrect ? (language === 'chinese' ? "恭喜！錢包已創建" : "Congratulations! Wallet Created") : undefined}
            failureMessage={!isCorrect ? (language === 'chinese' ? "備份方式不安全" : "Unsafe Backup Method") : undefined}
            successExplanation={isCorrect ? (language === 'chinese' ? "您已成功完成錢包創建流程。請記住妥善保管您的助記詞，這是恢復錢包的唯一方式。" : "You have successfully completed the wallet creation process. Remember to keep your recovery phrase safe, as it is the only way to restore your wallet.") : undefined}
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
                label: language === 'chinese' ? '錢包創建' : 'Wallet Creation',
                value: language === 'chinese' ? '已完成' : 'Completed',
                isCorrect: true,
                showValue: true
              },
              {
                label: language === 'chinese' ? '備份方式' : 'Backup Method',
                value: language === 'chinese' ? '用紙和筆抄寫（安全）' : 'Pen and Paper (Secure)',
                isCorrect: true,
                showValue: true
              },
              {
                label: language === 'chinese' ? '地址生成' : 'Address Generated',
                value: config?.wallet?.address ? `${config.wallet.address.slice(0, 10)}...${config.wallet.address.slice(-8)}` : '0x742d35Cc6634C0532925a3b8D4C9Fb2f2e2f0891',
                isCorrect: true,
                showValue: true
              }
            ] : [
              {
                label: language === 'chinese' ? '備份方式' : 'Backup Method',
                value: selectedBackupOption === 'screenshot' 
                  ? (language === 'chinese' ? '截圖保存到相冊' : 'Screenshot to Gallery')
                  : (language === 'chinese' ? '寫在郵件備忘錄' : 'Save to Email Notes'),
                isCorrect: false,
                showValue: true,
                details: getBackupError()
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

export default CreateWalletChallenge;

