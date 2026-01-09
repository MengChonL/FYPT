import React, { useState, useEffect, useRef } from 'react';
import MetaMaskFox from '../../assets/MetaMask_Fox.png';
import BinanceLogo from '../../assets/BNB.png';
import CoinbaseLogo from '../../assets/coinbase.png';
import SequoiaLogo from '../../assets/sequoia.png';
import A16zLogo from '../../assets/a16z.png';
import ChallengeResultScreen from './ChallengeResultScreen';

// ==========================================
// 0. 樣式定義 (CSS)
// ==========================================
const CustomStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    
    .font-inter { font-family: 'Inter', sans-serif; }
    
    /* 自定義紅筆光標 */
    .cursor-pen {
      cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>') 0 24, crosshair;
    }

    /* 已發現目標的持續高亮效果 */
    .found-highlight {
      position: relative;
    }
    .found-highlight::after {
      content: "✅ 已發現";
      position: absolute;
      top: -12px;
      right: -10px;
      background: #22c55e;
      color: white;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: bold;
      pointer-events: none;
      z-index: 50;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      white-space: nowrap;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    .found-highlight::before {
      content: "";
      position: absolute;
      inset: -6px;
      border: 3px solid #22c55e;
      border-radius: 12px;
      pointer-events: none;
      z-index: 49;
      background: rgba(34, 197, 94, 0.05);
    }

    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `}</style>
);

// ==========================================
// 1. 核心邏輯：碰撞檢測
// ==========================================
const checkCollision = (strokeBounds, targetId) => {
  const target = document.getElementById(targetId);
  if (!target) return { found: false };

  const tRect = target.getBoundingClientRect();
  const scrollContainer = document.getElementById('scam-scroll-container');
  const scrollX = scrollContainer ? scrollContainer.scrollLeft : window.scrollX;
  const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

  const tBounds = {
    left: tRect.left + scrollX,
    top: tRect.top + scrollY,
    right: tRect.right + scrollX,
    bottom: tRect.bottom + scrollY,
    width: tRect.width,
    height: tRect.height,
    centerX: (tRect.left + scrollX) + (tRect.width / 2),
    centerY: (tRect.top + scrollY) + (tRect.height / 2),
    area: tRect.width * tRect.height,
  };

  const x_overlap = Math.max(0, Math.min(strokeBounds.right, tBounds.right) - Math.max(strokeBounds.left, tBounds.left));
  const y_overlap = Math.max(0, Math.min(strokeBounds.bottom, tBounds.bottom) - Math.max(strokeBounds.top, tBounds.top));
  const overlapArea = x_overlap * y_overlap;
  const strokeArea = strokeBounds.width * strokeBounds.height;

  if (strokeArea < 100) return { found: false, reason: 'too_small' };
  if (strokeArea > tBounds.area * 20) return { found: false, reason: 'too_big' };

  const coverageRatio = overlapArea / tBounds.area;
  const isCenterIncluded =
    tBounds.centerX >= strokeBounds.left &&
    tBounds.centerX <= strokeBounds.right &&
    tBounds.centerY >= strokeBounds.top &&
    tBounds.centerY <= strokeBounds.bottom;

  if (coverageRatio > 0.05 || isCenterIncluded) {
    return { found: true };
  }

  return { found: false, reason: 'miss' };
};

// ==========================================
// 2. 目標註冊表
// ==========================================
const TARGETS = [
  { id: 'target-url', reason: '偽造網域 (URL Spoofing)' },
  { id: 'target-spender', reason: '惡意授權地址 (Malicious Spender)' },
  { id: 'target-unlimited', reason: '惡意的無限授權 (Unlimited Approval)' },
  { id: 'target-tvl', reason: '虛假價格數據：比特幣價格固定不變 (Fake Static Price)' },
  { id: 'target-apy', reason: '不可能的無風險收益' },
  { id: 'target-kyc', reason: '矛盾的 KYC 機制：中心化業務卻免 KYC' },
  { id: 'target-mas', reason: '虛假 MAS 牌照：無法在新加坡金管局官網查詢到此平台' },
  { id: 'target-partners', reason: '虛假合作夥伴' },
];

// ==========================================
// 3. 畫布組件
// ==========================================
const DrawingCanvas = ({ isEnabled, width, height, targets, onValidation }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const contextRef = useRef(null);
  const currentStrokeMin = useRef({ x: Infinity, y: Infinity });
  const currentStrokeMax = useRef({ x: -Infinity, y: -Infinity });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 5;
    contextRef.current = ctx;
  }, [width, height]);

  const getCoords = (e) => {
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const startDrawing = (e) => {
    if (!isEnabled || !contextRef.current) return;
    const { x, y } = getCoords(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    currentStrokeMin.current = { x, y };
    currentStrokeMax.current = { x, y };
  };

  const draw = (e) => {
    if (!isDrawing || !isEnabled || !contextRef.current) return;
    const { x, y } = getCoords(e);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    currentStrokeMin.current.x = Math.min(currentStrokeMin.current.x, x);
    currentStrokeMin.current.y = Math.min(currentStrokeMin.current.y, y);
    currentStrokeMax.current.x = Math.max(currentStrokeMax.current.x, x);
    currentStrokeMax.current.y = Math.max(currentStrokeMax.current.y, y);
  };

  const finishDrawing = () => {
    if (!isDrawing || !contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);

    const strokeBounds = {
      left: currentStrokeMin.current.x,
      top: currentStrokeMin.current.y,
      right: currentStrokeMax.current.x,
      bottom: currentStrokeMax.current.y,
      width: currentStrokeMax.current.x - currentStrokeMin.current.x,
      height: currentStrokeMax.current.y - currentStrokeMin.current.y,
    };

    let hit = false;

    for (const target of targets) {
      const result = checkCollision(strokeBounds, target.id);
      if (result.found) {
        onValidation(target.id, true, `發現：${target.reason}`);
        hit = true;

        const ctx = contextRef.current;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(strokeBounds.left, strokeBounds.top, strokeBounds.width, strokeBounds.height);

        setTimeout(() => {
          ctx.clearRect(strokeBounds.left - 5, strokeBounds.top - 5, strokeBounds.width + 10, strokeBounds.height + 10);
        }, 800);
        break;
      }
    }

    if (!hit) {
      onValidation(null, false, '未命中任何特徵');
      setTimeout(() => {
        const ctx = contextRef.current;
        if (!ctx) return;
        ctx.clearRect(strokeBounds.left - 5, strokeBounds.top - 5, strokeBounds.width + 10, strokeBounds.height + 10);
      }, 500);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      className={`absolute top-0 left-0 z-[70] ${isEnabled ? 'pointer-events-auto cursor-pen' : 'pointer-events-none'}`}
      style={{ width, height }}
    />
  );
};

// ==========================================
// 4. 模擬 MetaMask 組件
// ==========================================
const FakeMetaMask = ({ step, onConfirm, onCancel, foundTargets }) => {
  if (step === 'idle') return null;

  const isFound = (id) =>
    foundTargets.includes(id)
      ? 'found-highlight ring-2 ring-green-500 rounded bg-green-50/10'
      : '';

  return (
    <div className="fixed top-24 right-10 z-[60] w-[360px] bg-white text-black rounded-xl overflow-hidden shadow-2xl border border-gray-300 font-inter animate-fade-in text-left">
      <div className="bg-gray-100 p-2 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img
            src={MetaMaskFox}
            alt="MetaMask"
            className="w-6 h-6 rounded-full border-2 border-orange-200"
          />
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Ethereum Mainnet</span>
        </div>
        <div className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Connected</div>
      </div>

      {step === 'signature' && (
        <div>
          <div className="p-4 text-center border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">O</div>
            <h3 className="font-bold text-lg">Signature Request</h3>
            <p className="text-gray-500 text-sm">opensea.io</p>
          </div>
          <div className="p-4 bg-gray-50 text-xs font-mono text-gray-600 break-words border-b border-gray-200 max-h-48 overflow-y-auto text-left space-y-1">
            <p className="font-bold mb-1">
              opensea.io wants you to sign in with your account:
            </p>
            <p>0x742d35Cc6634C0532925a3b8D4C9Fb2f2e2f0891</p>
            <p className="mt-2">
              Click to sign in and accept the OpenSea Terms of Service (https://opensea-tos.io) and
              Privacy Policy (https://Opensea-privacy.io).
            </p>
            <div
              id="target-url"
              className={`mt-3 p-2 border border-dashed border-gray-300 rounded hover:bg-red-50 transition-colors ${isFound('target-url')}`}
            >
              <p className="font-bold text-red-600">URI: https://opensea-verify-reward.io</p>
              <p>Version: 1</p>
              <p>Chain ID: 1</p>
              <p>Nonce: 6rrg7il05ub2slhdcquidmqe83</p>
              <p>Issued At: 2026-01-05T12:26:08.289Z</p>
            </div>
          </div>
          <div className="p-4 flex gap-4">
            <button onClick={onCancel} className="flex-1 py-2 border rounded-full font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2 bg-blue-600 text-black rounded-full font-bold hover:bg-blue-700">Sign</button>
          </div>
        </div>
      )}

      {step === 'approval' && (
        <div>
          <div className="p-4 text-center border-b border-gray-200">
            <div className="w-10 h-10 border-2 border-red-500 rounded-full mx-auto mb-2 flex items-center justify-center text-red-500 font-bold">
              !
            </div>
            <h3 className="font-bold text-lg">Spending Cap Request</h3>
            <p className="text-gray-500 text-sm">https://Opensea-Sign.io</p>
          </div>
          <div className="bg-gray-50 p-4 border-b border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Asset</span>
              <span className="font-bold text-sm text-green-600">USDC (Permit)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Spender</span>
              <span
                id="target-spender"
                className={`text-xs font-mono text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 inline-block ${isFound(
                  'target-spender'
                )}`}
              >
                0x9110...0666
              </span>
            </div>
            <div className="mt-2">
              <span className="text-sm font-bold block mb-1">Custom spending cap</span>
              <div
                id="target-unlimited"
                className={`text-xs font-mono px-2 py-1 rounded border inline-block ${
                  isFound('target-unlimited')
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                Unlimited
              </div>
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              <p>Gas estimate: 0 (signature only)</p>
              <p>Network: Ethereum Mainnet (Chain ID: 1)</p>
            </div>
          </div>
          <div className="p-4 flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-2 border rounded-full font-bold text-gray-600 hover:bg-gray-50"
            >
              Reject
            </button>
            <button
              onClick={() => alert('【演練結束】')}
              className="flex-1 py-2 bg-blue-600 text-black rounded-full font-bold hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. 核心場景組件 (QuantumFi)
// ==========================================
const QuantumFiScam = () => {
  const [status, setStatus] = useState('idle');
  const [educationMode, setEducationMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [foundTargets, setFoundTargets] = useState([]);
  const [attempts, setAttempts] = useState(10); // 10 次機會
  const [isFinished, setIsFinished] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [docSize, setDocSize] = useState({ w: 0, h: 0 });
  const [language, setLanguage] = useState('chinese'); // 單獨語言選擇

  useEffect(() => {
    const updateSize = () => {
      const scrollContainer = document.getElementById('scam-scroll-container');
      if (scrollContainer) {
        setDocSize({ w: scrollContainer.scrollWidth, h: scrollContainer.scrollHeight });
      } else {
        setDocSize({ w: window.innerWidth, h: window.innerHeight });
      }
    };
    
    setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [status]);

  const handleValidation = (targetId, isHit, msg) => {
    if (attempts <= 0 || isFinished) {
      return;
    }

    let newAttempts = attempts - 1;
    let newFoundTargets = [...foundTargets];

    if (isHit) {
      if (newFoundTargets.includes(targetId)) {
        setToast({
          msg:
            language === 'chinese'
              ? '⚠️ 這個已經發現過了！試試找別的紅旗指標'
              : '⚠️ You already found this one. Try another red flag.',
          type: 'warning',
        });
      } else {
        newFoundTargets.push(targetId);
        setFoundTargets(newFoundTargets);
        setToast({ msg: `🎉 ${msg}`, type: 'success' });
      }
    } else {
      setToast({ msg, type: 'info' });
    }
    setAttempts(newAttempts);
    setTimeout(() => setToast(null), 2500);

    const totalTargets = TARGETS.length;
    const foundCount = newFoundTargets.length;

    // 成功：在剩餘次數內找到所有紅旗
    if (foundCount === totalTargets) {
      setIsFinished(true);
      setIsSuccess(true);
      setEducationMode(false);
      return;
    }

    // 失敗：用完所有次數但未找齊
    if (newAttempts === 0 && foundCount < totalTargets) {
      setIsFinished(true);
      setIsSuccess(false);
      setEducationMode(false);
    }
  };

  const handleTrigger = () => {
    if (!educationMode && status === 'idle') setStatus('signature');
  };

  const handleSign = () => {
    setStatus('processing');
    setTimeout(() => setStatus('approval'), 1500);
  };

  const isFound = (id) => (foundTargets.includes(id) ? 'found-highlight' : '');

  // 文案根據語言
  const t = language === 'chinese'
    ? {
        riskFound: 'Risk Found',
        attempts: 'Attempts',
        toggleOn: '✏️ 標註模式 (ON)',
        toggleOff: '🛡️ 開啟紅筆檢測',
        title: 'QuantumFi 混合詐騙檢測',
        description: '請使用紅筆工具，在頁面上標記所有可疑或矛盾的紅旗指標。',
        successMessage: '恭喜你完成所有挑戰！',
        failureMessage: '挑戰失敗',
        successExplanation:
          '你已成功找出此頁面中的所有紅旗指標，未來遇到類似高收益平台時，請優先檢查網址、授權對象、授權金額與監管牌照等關鍵資訊。',
        failureExplanation: '你尚未找齊所有紅旗，特別留意下方列出的危險特徵。',
        successSubtitle: '完成 QuantumFi 紅旗檢測',
        completionLabel: '紅旗完成度',
        completionTextPrefix: '已找到',
        completionTextSuffix: '個紅旗指標',
      }
    : {
        riskFound: 'Risk Found',
        attempts: 'Attempts',
        toggleOn: '✏️ Marking Mode (ON)',
        toggleOff: '🛡️ Enable Red-Pen Scan',
        title: 'QuantumFi Hybrid Scam Detection',
        description:
          'Use the red-pen tool to highlight all suspicious or contradictory red flags on this page.',
        successMessage: 'Congratulations! Challenge Completed!',
        failureMessage: 'Challenge Failed',
        successExplanation:
          'You have successfully identified all red flags on this page. In the future, always double-check URLs, spender addresses, approval amounts and regulatory claims on similar high-yield platforms.',
        failureExplanation:
          'You did not find all red flags. Pay special attention to the dangerous patterns listed below.',
        successSubtitle: 'QuantumFi Red-Flag Detection Completed',
        completionLabel: 'Red-flag Completion',
        completionTextPrefix: 'Found',
        completionTextSuffix: 'red flags',
      };

  // 完成後：使用共用 ChallengeResultScreen 顯示結果
  if (isFinished) {
    const missingTargets = TARGETS.filter((t) => !foundTargets.includes(t.id));
    const allFoundText =
      language === 'chinese'
        ? `${t.completionTextPrefix} ${foundTargets.length} / ${TARGETS.length} ${t.completionTextSuffix}`
        : `${t.completionTextPrefix} ${foundTargets.length} / ${TARGETS.length} ${t.completionTextSuffix}`;

    const checkItems = [
      {
        label: t.completionLabel,
        value: allFoundText,
        isCorrect: isSuccess,
        showValue: true,
        details:
          !isSuccess && missingTargets.length > 0 ? (
            <div className="mt-4 space-y-2 text-left">
              {missingTargets.map((t) => (
                <p key={t.id} className="text-sm text-gray-200">
                  • {t.reason}
                </p>
              ))}
            </div>
          ) : null,
      },
    ];

    return (
      <div className="relative w-screen h-screen bg-slate-950 text-white overflow-hidden">
        {/* 語言切換 + 返回 / 背包（沿用 ChallengeTemplate / JudgeAuth 的 pixel-button 風格） */}
        <div className="absolute top-4 left-4 z-[110] flex gap-2">
          <button
            onClick={() => setLanguage('chinese')}
            className="pixel-button"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: language === 'chinese' ? '#22d3ee' : 'transparent',
              color: language === 'chinese' ? '#ffffff' : '#9ca3af',
              border: '2px solid #000',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '2px 2px 0px #000',
              WebkitFontSmoothing: 'none',
              MozOsxFontSmoothing: 'unset',
            }}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage('english')}
            className="pixel-button"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: language === 'english' ? '#22d3ee' : 'transparent',
              color: language === 'english' ? '#ffffff' : '#9ca3af',
              border: '2px solid #000',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '2px 2px 0px #000',
              WebkitFontSmoothing: 'none',
              MozOsxFontSmoothing: 'unset',
            }}
          >
            EN
          </button>
        </div>
        <div className="absolute top-4 right-4 z-[110] flex gap-2">
          <button
            onClick={() => window.history.back()}
            className="pixel-button"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: '2px solid #000',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '2px 2px 0px #000',
              WebkitFontSmoothing: 'none',
              MozOsxFontSmoothing: 'unset',
            }}
          >
            {language === 'chinese' ? '返回遊戲' : 'Back to Game'}
          </button>
          <button
            onClick={() => (window.location.href = '/game')}
            className="pixel-button"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: '2px solid #000',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '2px 2px 0px #000',
              WebkitFontSmoothing: 'none',
              MozOsxFontSmoothing: 'unset',
            }}
          >
            {language === 'chinese' ? '背包' : 'Backpack'}
          </button>
        </div>

        <ChallengeResultScreen
          isSuccess={isSuccess}
          title={t.title}
          description={t.description}
          successMessage={t.successMessage}
          failureMessage={t.failureMessage}
          successExplanation={t.successExplanation}
          failureExplanation={t.failureExplanation}
          successSubtitle={t.successSubtitle}
          retryButtonText=""
          nextLevelButtonText=""
          checkItems={checkItems}
          onRetry={null}
          onNextLevel={null}
        />
      </div>
    );
  }

  return (
    // ★ 關鍵修正：保留 w-screen 和 relative left-1/2... 以確保強制置中
    <div id="scam-scroll-container" className="w-screen h-screen bg-slate-950 relative overflow-y-auto cursor-default font-inter text-white scroll-smooth">
      <CustomStyles />

      {/* 語言切換 - 單獨給此關卡使用 */}
      <div className="fixed top-4 left-4 z-[95] flex gap-2">
        <button
          onClick={() => setLanguage('chinese')}
          className={`px-3 py-1 text-xs font-bold rounded border-2 ${
            language === 'chinese'
              ? 'bg-cyan-500 text-black border-black'
              : 'bg-transparent text-slate-300 border-slate-500'
          }`}
        >
          中文
        </button>
        <button
          onClick={() => setLanguage('english')}
          className={`px-3 py-1 text-xs font-bold rounded border-2 ${
            language === 'english'
              ? 'bg-cyan-500 text-black border-black'
              : 'bg-transparent text-slate-300 border-slate-500'
          }`}
        >
          EN
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-12 left-1/2 -translate-x-1/2 z-[90] px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 animate-fade-in ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'warning'
              ? 'bg-yellow-500 text-black'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          {toast.type === 'success' ? '🎉' : toast.type === 'warning' ? '⚠️' : '💡'} {toast.msg}
        </div>
      )}

      {/* 控制台 (增加 Attempts 顯示) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 flex gap-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] items-center">
        {/* Risk Found */}
        <div className="pl-2 pr-4 text-xs text-slate-400 border-r border-slate-600 flex flex-col items-center">
          <span className="uppercase tracking-widest text-[10px] font-bold text-slate-500">
            {t.riskFound}
          </span>
          <span className={`font-black text-2xl ${foundTargets.length === 8 ? 'text-green-400' : 'text-white'}`}>
            {foundTargets.length} <span className="text-slate-600 text-base">/ 8</span>
          </span>
        </div>

        {/* Attempts */}
        <div className="pl-2 pr-4 text-xs text-slate-400 border-r border-slate-600 flex flex-col items-center">
          <span className="uppercase tracking-widest text-[10px] font-bold text-slate-500">
            {t.attempts}
          </span>
          <span className={`font-black text-2xl ${attempts < 3 ? 'text-red-500' : 'text-white'}`}>
            {attempts} <span className="text-slate-600 text-base">/ 10</span>
          </span>
        </div>
        
        <button
          onClick={() => setEducationMode(!educationMode)}
          disabled={attempts <= 0 || isFinished}
          className={`px-8 py-3 rounded-xl font-black text-lg transition-all flex items-center gap-2 shadow-lg transform active:scale-95 ${
            attempts <= 0 || isFinished
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : educationMode
              ? 'bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-500/30'
              : 'bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105'
          }`}
        >
          {educationMode ? t.toggleOn : t.toggleOff}
        </button>
        
      </div>

      <DrawingCanvas
        isEnabled={educationMode && attempts > 0 && !isFinished}
        width={docSize.w}
        height={docSize.h}
        targets={TARGETS}
        onValidation={handleValidation}
      />

      <FakeMetaMask
        step={status === 'processing' ? 'idle' : status}
        onConfirm={handleSign}
        onCancel={() => setStatus('idle')}
        foundTargets={foundTargets}
      />

      {/* 導航欄 */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40 w-screen flex justify-center">
        <div className="w-full max-w-[90rem] px-12 h-24 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200 tracking-tight">
              QuantumFi
            </span>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded border border-yellow-500/30 uppercase tracking-wider">
              Beta
            </span>
          </div>
          <button
            onClick={handleTrigger}
            className={`bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-lg px-8 py-3 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all ${
              educationMode ? 'opacity-50 cursor-crosshair' : 'hover:scale-105 active:scale-95'
            }`}
          >
            連接錢包
          </button>
        </div>
      </nav>

      {/* 主要內容區：★ 使用強制置中 CSS Hack */}
      <main className="w-screen relative left-1/2 -translate-x-1/2 flex flex-col items-center gap-40 py-24 pb-60">
        
        {/* Section 1: Hero & TVL */}
        <div className="w-full max-w-7xl px-6 flex flex-col items-center text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight relative z-10 drop-shadow-2xl mx-auto">
            {language === 'chinese' ? '全球首創 ' : 'World-first '}
            <span id="target-desc" className="text-yellow-400">
              {language === 'chinese' ? 'AI 量子套利' : 'AI Quantum Arbitrage'}
            </span>
            <br />
            {language === 'chinese' ? '實現 ' : 'Delivering '}
            <span
              id="target-apy"
              className={`inline-block rounded px-2 transition-all ${isFound('target-apy')}`}
            >
              <span className="underline decoration-yellow-400 decoration-4 underline-offset-8">
                {language === 'chinese' ? '零風險' : 'Zero‑Risk'}
              </span>{' '}
              {language === 'chinese' ? '被動收入' : 'Passive Yield'}
            </span>
          </h1>

          <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-16 relative z-10 text-center">
            {language === 'chinese'
              ? '慶祝主網上線，前 10,000 名連接用戶可獲得 '
              : 'To celebrate mainnet launch, the first 10,000 connected wallets receive '}
            <strong className="text-white border-b-2 border-yellow-400">1,500 USDC</strong>
            {language === 'chinese' ? ' 空投獎勵。' : ' in a limited airdrop reward.'}
          </p>

          <div
            id="target-tvl"
            className={`inline-block rounded-3xl transition-all relative z-10 mx-auto ${isFound('target-tvl')}`}
          >
            <div className="inline-flex flex-col items-center bg-slate-900/80 border border-slate-700/50 p-10 rounded-[2rem] backdrop-blur-md shadow-2xl">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-4 text-center">
                Current Bitcoin Price
              </span>
              <span className="text-6xl md:text-7xl font-mono font-bold text-white tabular-nums tracking-tighter text-center">
                $90,000.00 USD
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Company Desc (About Us) - 容器擴大與置中 */}
        <div className="w-full max-w-[90rem] px-6">
          <div className="w-full bg-slate-900/60 rounded-[3rem] p-12 md:p-16 border border-slate-800 relative overflow-hidden backdrop-blur-sm shadow-2xl mx-auto">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/10 to-transparent pointer-events-none"></div>
            
            <div className="grid md:grid-cols-2 gap-16 relative z-10 items-center">
              {/* 左側：文字 */}
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-4 ml-[2em]">
                  <span className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center text-xl shadow-lg ml-[2em]">
                    ⚡
                  </span>
                  {language === 'chinese' ? '關於 QuantumFi 生態' : 'About the QuantumFi Ecosystem'}
                </h2>
                
                {/* Target: 矛盾的 KYC */}
                <div
                  id="target-kyc"
                  className={`space-y-6 text-slate-300 leading-relaxed text-base md:text-lg text-justify p-8 rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 transition-all ${isFound('target-kyc')}`}
                >
                  <p className="indent-[2em]">
                    {language === 'chinese' ? (
                      <>
                        QuantumFi 堅持 <strong className="text-white">Web3 原生去中心化精神</strong>。為了最大程度保障用戶隱私，我們提供{' '}
                        <em className="text-yellow-400 not-italic font-bold bg-yellow-400/10 px-2 py-0.5 rounded">
                          「免 KYC (無需身份驗證)」
                        </em>{' '}
                        的快速註冊通道，只需連接錢包，30 秒即可開啟交易。
                      </>
                    ) : (
                      <>
                        QuantumFi claims to follow{' '}
                        <strong className="text-white">native Web3 decentralization</strong>. To
                        “protect user privacy”, we offer a{' '}
                        <em className="text-yellow-400 not-italic font-bold bg-yellow-400/10 px-2 py-0.5 rounded">
                          “no‑KYC (no identity verification)”
                        </em>{' '}
                        fast‑track: just connect your wallet and start trading in 30 seconds.
                      </>
                    )}
                  </p>
                  
                  <p className="indent-[2em]">
                    {language === 'chinese' ? (
                      <>
                        同時，為了方便用戶，我們整合了全球 <strong className="text-white">法幣信用卡出入金系統</strong> (Visa/Mastercard)，並提供由 AI 算法驅動的 <strong className="text-white">資產託管服務</strong>，將您的資金集中管理以實現穩定的高頻套利收益。
                      </>
                    ) : (
                      <>
                        At the same time, for “user convenience”, we integrate global{' '}
                        <strong className="text-white">fiat credit‑card on/off‑ramp systems</strong>{' '}
                        (Visa/Mastercard) and provide AI‑driven{' '}
                        <strong className="text-white">asset custody services</strong>, pooling your
                        funds centrally to generate “stable” high‑frequency arbitrage returns.
                      </>
                    )}
                  </p>
                  
                  <div className="flex items-start gap-3 text-sm text-slate-500 bg-slate-900 p-4 rounded-xl border border-slate-800 mt-2">
                    <span className="text-base shrink-0"></span>
                    <span className="indent-[2em] block">
                      {language === 'chinese'
                        ? '(提示：需要連接錢包去找出其他錯誤。)'
                        : '(Hint: You need to connect your wallet to find other errors.)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右側：牌照與安全 (MAS) */}
              <div className="space-y-8 flex flex-col justify-center">
                {/* Target: MAS 誤導 */}
                <div
                  id="target-mas"
                  className={`bg-slate-950/90 p-10 rounded-3xl flex items-start gap-6 border border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer group shadow-xl ${isFound('target-mas')}`}
                >
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                    ✓
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1 font-bold tracking-wide uppercase">
                      {language === 'chinese' ? '合規監管牌照' : 'Regulatory License'}
                    </div>
                    <div className="font-bold text-white text-2xl mb-2">
                      {language === 'chinese' ? '新加坡 MAS 金融牌照' : 'Singapore MAS Financial License'}
                    </div>
                    <div className="text-sm text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg inline-block font-mono">License: MPI-2026-88XXX</div>
                    <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                      {language === 'chinese'
                        ? '已通過新加坡金融管理局審核'
                        : 'Approved by the Monetary Authority of Singapore'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800">
                  <h4 className="text-slate-400 text-sm mb-4 font-bold uppercase tracking-wide">
                    {language === 'chinese' ? '資產安全保障' : 'Asset Safety Guarantees'}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white flex items-center gap-2">
                      🛡️ 100% Reserve
                    </span>
                    <span className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white flex items-center gap-2">
                      🔒 SSL Encrypted
                    </span>
                    <span className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white flex items-center gap-2">
                      ❄️ Cold Storage
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Partners */}
        <div className="w-full max-w-7xl px-6">
          <div
            id="target-partners"
            className={`text-center transition-all p-10 border border-transparent rounded-3xl w-full mx-auto ${isFound('target-partners')}`}
          >
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.4em] mb-12 text-center">
              Strategic Partners
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <div className="flex flex-col items-center">
                <img src={BinanceLogo} alt="Binance Labs" className="h-12 object-contain mb-2" />
                <span className="text-xs text-slate-400">BINANCE Labs</span>
              </div>
              <div className="flex flex-col items-center">
                <img src={CoinbaseLogo} alt="Coinbase Ventures" className="h-12 object-contain mb-2" />
                <span className="text-xs text-slate-400">COINBASE Ventures</span>
              </div>
              <div className="flex flex-col items-center">
                <img src={SequoiaLogo} alt="Sequoia" className="h-12 object-contain mb-2" />
                <span className="text-xs text-slate-400">SEQUOIA</span>
              </div>
              <div className="flex flex-col items-center">
                <img src={A16zLogo} alt="a16z crypto" className="h-12 object-contain mb-2" />
                <span className="text-xs text-slate-400">a16z crypto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 pt-10 text-center w-full max-w-7xl mx-auto">
          <p className="text-sm text-slate-600 leading-relaxed text-center">
            © 2026 QuantumFi Protocol. All rights reserved. <br/>
            Disclaimer: Information provided is for educational purposes only. High Yield Products involve risk.
          </p>
        </footer>

      </main>
    </div>
  );
};

// ==========================================
// 6. 導出組件
// ==========================================
const Web3DangerAuth = ({ config }) => {
  return <QuantumFiScam />;
};

export default Web3DangerAuth;