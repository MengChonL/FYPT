import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import FixedBackground from '../components/FixedBackground';

// 關卡代碼中英對照
const SCENARIO_NAMES = {
  'phase1-1': { zh: '下載錢包', en: 'Download Wallet' },
  'phase1-2': { zh: '創建錢包', en: 'Create Wallet' },
  'phase1-3': { zh: '首次入金', en: 'First Deposit' },
  'phase1-4': { zh: '錢包轉帳', en: 'Wallet Transfer' },
  'phase1-5': { zh: '中心化平台判別', en: 'CEX Check' },
  'phase1-6': { zh: '去中心化平台判別', en: 'DEX Check' },
  'phase2-1': { zh: '判別惡意授權', en: 'Identify Malicious Authorization' },
  'phase2-2': { zh: '判斷授權內容', en: 'Judge Authorization Content' },
  'phase2-3': { zh: '混合詐騙實戰', en: 'Hybrid Scam Drill' },
};

// 錯誤類別中英對照
const ERROR_CATEGORY_NAMES = {
  phishing_technique: { zh: '釣魚手法', en: 'Phishing Technique' },
  ui_deception: { zh: 'UI 欺騙', en: 'UI Deception' },
  fake_data: { zh: '偽造數據', en: 'Fake Data' },
  impossible_returns: { zh: '不可能回報', en: 'Impossible Returns' },
  regulatory_contradiction: { zh: '監管矛盾', en: 'Regulatory Contradiction' },
  regulatory_fraud: { zh: '監管欺詐', en: 'Regulatory Fraud' },
  fake_endorsement: { zh: '虛假背書', en: 'Fake Endorsement' },
  wrong_choice: { zh: '錯誤選擇', en: 'Wrong Choice' },
  skipped_verification: { zh: '跳過驗證', en: 'Skipped Verification' },
  wrong_backup_method: { zh: '錯誤備份方式', en: 'Wrong Backup Method' },
  wrong_categorization: { zh: '錯誤分類', en: 'Wrong Categorization' },
  address_poisoning_trap: { zh: '地址投毒陷阱', en: 'Address Poisoning Trap' },
  wrong_function_matching: { zh: '功能匹配錯誤', en: 'Wrong Function Matching' },
  wrong_domain_classification: { zh: '域名分類錯誤', en: 'Wrong Domain Classification' },
  wrong_anomaly_identification: { zh: '異常識別錯誤', en: 'Wrong Anomaly Identification' },
  wrong_authorization_judgment: { zh: '授權判斷錯誤', en: 'Wrong Authorization Judgment' },
  wrong_contract_identification: { zh: '合約識別錯誤', en: 'Wrong Contract Identification' },
  wrong_connection_method: { zh: '錯誤連接方式', en: 'Wrong Connection Method' },
  wrong_license_selection: { zh: '錯誤許可選擇', en: 'Wrong License Selection' },
  wrong_transfer_details: { zh: '轉帳細節錯誤', en: 'Wrong Transfer Details' },
  wrong_deposit_method: { zh: '錯誤存款方式', en: 'Wrong Deposit Method' },
};

// 風險等級顏色
const RISK_COLORS = {
  low: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#4ade80' },
  medium: { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#facc15' },
  high: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#f87171' },
  unknown: { bg: 'rgba(156, 163, 175, 0.2)', border: '#9ca3af', text: '#d1d5db' },
};

// 能力等級標籤
const SKILL_LEVEL_LABELS = {
  excellent: { zh: '優秀', en: 'Excellent', color: '#22c55e' },
  good: { zh: '良好', en: 'Good', color: '#3b82f6' },
  average: { zh: '普通', en: 'Average', color: '#eab308' },
  needs_improvement: { zh: '待加強', en: 'Needs Work', color: '#ef4444' },
};

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, logout } = useGame();
  const [reportData, setReportData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // 從 navigation state 獲取報告數據
    if (location.state?.report) {
      setReportData(location.state.report);
      setAiAnalysis(location.state.report?.ai_analysis || null);
    } else {
      // 沒有數據，跳回首頁
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-cyan-400 text-xl pixel-font">載入報告中...</div>
      </div>
    );
  }

  const t = language === 'chinese' ? {
    title: '🎓 訓練完成報告',
    subtitle: 'Web3 釣魚攻擊識別訓練',
    tabOverview: '📊 總覽',
    tabDetails: '📋 詳細數據',
    tabAI: '🤖 AI 分析',
    scenariosCompleted: '完成關卡',
    totalTime: '總用時',
    successRate: '成功率',
    skillGrading: '能力評分',
    reactionSpeed: '反應速度',
    accuracy: '準確度',
    consistency: '一致性',
    errorDistribution: '錯誤類型分佈',
    performanceSummary: '各關表現',
    aiSummary: 'AI 分析摘要',
    recommendations: '改進建議',
    riskProfile: '風險檔案',
    overallRisk: '整體風險等級',
    strongestArea: '最強領域',
    weakestArea: '最弱領域',
    vulnerabilitySummary: '脆弱點摘要',
    backToHome: '返回首頁',
    logoutAndExit: '登出並結束',
    seconds: '秒',
    minutes: '分',
    attempts: '次嘗試',
    passed: '已通過',
    failed: '未通過',
  } : {
    title: '🎓 Training Report',
    subtitle: 'Web3 Phishing Attack Recognition Training',
    tabOverview: '📊 Overview',
    tabDetails: '📋 Details',
    tabAI: '🤖 AI Analysis',
    scenariosCompleted: 'Scenarios Completed',
    totalTime: 'Total Time',
    successRate: 'Success Rate',
    skillGrading: 'Skill Grading',
    reactionSpeed: 'Reaction Speed',
    accuracy: 'Accuracy',
    consistency: 'Consistency',
    errorDistribution: 'Error Distribution',
    performanceSummary: 'Performance Summary',
    aiSummary: 'AI Analysis Summary',
    recommendations: 'Recommendations',
    riskProfile: 'Risk Profile',
    overallRisk: 'Overall Risk Level',
    strongestArea: 'Strongest Area',
    weakestArea: 'Weakest Area',
    vulnerabilitySummary: 'Vulnerability Summary',
    backToHome: 'Back to Home',
    logoutAndExit: 'Logout & Exit',
    seconds: 's',
    minutes: 'm',
    attempts: ' attempts',
    passed: 'Passed',
    failed: 'Failed',
  };

  const formatTime = (ms) => {
    const totalSec = Math.round(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min > 0) {
      return `${min}${t.minutes} ${sec}${t.seconds}`;
    }
    return `${sec}${t.seconds}`;
  };

  const riskLevel = aiAnalysis?.risk_profile?.overall_risk_level || 'unknown';
  const riskColor = RISK_COLORS[riskLevel] || RISK_COLORS.unknown;

  return (
    <div className="min-h-screen w-screen bg-[#0f172a] text-white relative overflow-x-hidden overflow-y-auto">
      <FixedBackground />
      
      {/* 語言切換 - 左上角 */}
      <div className="absolute top-6 left-8 z-20 flex gap-4 text-base tracking-widest pixel-font">
        <span
          onClick={() => setLanguage('chinese')}
          className="cursor-pointer transition-all"
          style={{
            color: '#22d3ee',
            opacity: language === 'chinese' ? 1 : 0.4,
            borderBottom: language === 'chinese' ? '2px solid #22d3ee' : '2px solid transparent',
            paddingBottom: '4px',
            textShadow: language === 'chinese' ? '0 0 10px rgba(34,211,238,0.5)' : 'none'
          }}
        >
          中文
        </span>
        <span
          onClick={() => setLanguage('english')}
          className="cursor-pointer transition-all"
          style={{
            color: '#22d3ee',
            opacity: language === 'english' ? 1 : 0.4,
            borderBottom: language === 'english' ? '2px solid #22d3ee' : '2px solid transparent',
            paddingBottom: '4px',
            textShadow: language === 'english' ? '0 0 10px rgba(34,211,238,0.5)' : 'none'
          }}
        >
          ENGLISH
        </span>
      </div>

      {/* 頂部標題區 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 pt-10 pb-6 px-8"
      >
        <h1 className="text-4xl font-bold text-center pixel-font text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
          {t.title}
        </h1>
        <p className="text-center text-gray-400 mt-2">{t.subtitle}</p>
      </motion.div>

      {/* Tab 導航 */}
      <div className="relative z-10 flex justify-center gap-8 mb-14 px-8">
        {['overview', 'details', 'ai'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-4 rounded-xl font-bold transition-all pixel-font text-lg ${
              activeTab === tab
                ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-gray-500'
            }`}
          >
            {tab === 'overview' ? t.tabOverview : tab === 'details' ? t.tabDetails : t.tabAI}
          </button>
        ))}
      </div>

      {/* 內容區 */}
      <div className="relative z-10 px-8 md:px-20 lg:px-32 pb-36 w-full flex justify-center" style={{ paddingTop: '32px' }}>
        <div className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* 核心數據卡片 */}
              <div className="flex flex-wrap justify-center gap-12" style={{ marginBottom: '44px' }}>
                <StatCard
                  label={t.scenariosCompleted}
                  value={`${reportData.total_scenarios_completed}/9`}
                  icon="🎯"
                  color="#22c55e"
                />
                <StatCard
                  label={t.totalTime}
                  value={formatTime(reportData.total_time_ms)}
                  icon="⏱️"
                  color="#3b82f6"
                />
                <StatCard
                  label={t.successRate}
                  value={`${reportData.overall_success_rate}%`}
                  icon="✅"
                  color="#eab308"
                />

              </div>

              {/* 能力評分 */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-700" style={{ marginBottom: '36px' }}>
                <h3 className="text-xl font-bold text-cyan-300 mb-10 pixel-font">{t.skillGrading}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {reportData.skill_grading && Object.entries(reportData.skill_grading).map(([key, val]) => {
                    const levelInfo = SKILL_LEVEL_LABELS[val.level] || SKILL_LEVEL_LABELS.average;
                    const labelMap = {
                      reaction_speed: t.reactionSpeed,
                      accuracy: t.accuracy,
                      consistency: t.consistency,
                    };
                    return (
                      <div key={key} className="bg-gray-900/50 rounded-xl p-8 border border-gray-600">
                        <div className="text-gray-300 text-lg mb-3 font-medium">{labelMap[key] || key}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-bold" style={{ color: levelInfo.color }}>
                            {val.score}
                          </span>
                          <span
                            className="px-4 py-2 rounded-lg text-base font-bold"
                            style={{ backgroundColor: levelInfo.color + '30', color: levelInfo.color }}
                          >
                            {language === 'chinese' ? levelInfo.zh : levelInfo.en}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-5 h-4 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${val.score}%`, backgroundColor: levelInfo.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 風險檔案（來自 AI） */}
              <div
                className="rounded-2xl p-12 border-2"
                style={{ backgroundColor: aiAnalysis?.risk_profile ? riskColor.bg : 'rgba(55, 65, 81, 0.5)', borderColor: aiAnalysis?.risk_profile ? riskColor.border : '#4b5563', marginBottom: '60px' }}
              >
                  <h3 className="text-2xl font-bold mb-10 pixel-font" style={{ color: aiAnalysis?.risk_profile ? riskColor.text : '#9ca3af' }}>
                    {t.riskProfile}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-black/20 rounded-xl p-6 border border-gray-600/30">
                      <div className="text-gray-300 text-base mb-3 font-medium">{t.overallRisk}</div>
                      <div className="text-4xl font-bold uppercase" style={{ color: aiAnalysis?.risk_profile ? riskColor.text : '#d1d5db' }}>
                        {riskLevel}
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-6 border border-gray-600/30">
                      <div className="text-gray-300 text-base mb-3 font-medium">{t.strongestArea}</div>
                      <div className="text-xl text-green-400 font-semibold">
                        {language === 'chinese'
                          ? (aiAnalysis?.risk_profile?.strongest_area_zh || aiAnalysis?.risk_profile?.strongest_area || 'N/A')
                          : (aiAnalysis?.risk_profile?.strongest_area_en || aiAnalysis?.risk_profile?.strongest_area || 'N/A')}
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-6 border border-gray-600/30">
                      <div className="text-gray-300 text-base mb-3 font-medium">{t.weakestArea}</div>
                      <div className="text-xl text-red-400 font-semibold">
                        {language === 'chinese'
                          ? (aiAnalysis?.risk_profile?.weakest_area_zh || aiAnalysis?.risk_profile?.weakest_area || 'N/A')
                          : (aiAnalysis?.risk_profile?.weakest_area_en || aiAnalysis?.risk_profile?.weakest_area || 'N/A')}
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-6 border border-gray-600/30">
                      <div className="text-gray-300 text-base mb-3 font-medium">{t.vulnerabilitySummary}</div>
                      <div className="text-lg text-yellow-300 leading-relaxed">
                        {aiAnalysis?.risk_profile 
                          ? (language === 'chinese'
                              ? aiAnalysis.risk_profile.vulnerability_summary_zh
                              : aiAnalysis.risk_profile.vulnerability_summary_en)
                          : (language === 'chinese' ? 'AI 分析暫時不可用' : 'AI analysis temporarily unavailable')}
                      </div>
                    </div>
                  </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* 錯誤類型分佈 */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-700" style={{ marginBottom: '36px' }}>
                <h3 className="text-xl font-bold text-cyan-300 mb-10 pixel-font">{t.errorDistribution}</h3>
                {reportData.error_distribution && Object.keys(reportData.error_distribution).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(reportData.error_distribution).map(([key, val]) => {
                      const categoryName = ERROR_CATEGORY_NAMES[key] || { zh: key, en: key };
                      return (
                        <div key={key} className="bg-gray-900/40 rounded-xl p-6 border border-gray-600/50">
                          <div className="flex items-center gap-6">
                            <div className="w-52 text-gray-200 text-base font-medium">
                              {language === 'chinese' ? categoryName.zh : categoryName.en}
                            </div>
                            <div className="flex-1 h-7 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                style={{ width: `${val.percentage}%` }}
                              />
                            </div>
                            <div className="w-28 text-right text-gray-300 text-base font-semibold">
                              {val.count}x ({val.percentage}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-green-400 py-12 text-lg">
                    🎉 {language === 'chinese' ? '沒有任何錯誤！完美通關！' : 'No errors! Perfect run!'}
                  </div>
                )}
              </div>

              {/* 各關表現 */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-700" style={{ marginBottom: '60px' }}>
                <h3 className="text-xl font-bold text-cyan-300 mb-10 pixel-font">{t.performanceSummary}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {reportData.performance_summary?.map((ps) => (
                    <div
                      key={ps.scenario_code}
                      className={`rounded-xl p-9 border-2 ${
                        ps.final_success
                          ? 'bg-green-900/30 border-green-600'
                          : 'bg-red-900/30 border-red-600'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-5">
                        <span className="font-bold text-white text-xl">{(SCENARIO_NAMES[ps.scenario_code] ? (language === 'chinese' ? SCENARIO_NAMES[ps.scenario_code].zh : SCENARIO_NAMES[ps.scenario_code].en) : ps.scenario_code)}</span>
                        <span
                          className={`text-base px-4 py-2 rounded-lg font-bold ${
                            ps.final_success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}
                        >
                          {ps.final_success ? t.passed : t.failed}
                        </span>
                      </div>
                      <div className="text-gray-300 text-lg mt-3">
                        {ps.total_attempts}{t.attempts} • {formatTime(ps.total_time_ms)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {aiAnalysis ? (
                <>
                  {/* AI 摘要 */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/50" style={{ marginBottom: '36px' }}>
                    <h3 className="text-2xl font-bold text-purple-300 mb-8 pixel-font flex items-center gap-3">
                      🤖 {t.aiSummary}
                    </h3>
                    <div className="text-gray-200 leading-loose whitespace-pre-line text-xl px-4">
                      {language === 'chinese' ? aiAnalysis.summary_zh : aiAnalysis.summary_en}
                    </div>
                  </div>

                  {/* 改進建議 */}
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-700" style={{ marginBottom: '60px' }}>
                    <h3 className="text-2xl font-bold text-cyan-300 mb-8 pixel-font">💡 {t.recommendations}</h3>
                    <ul className="space-y-6">
                      {(() => {
                        const rawRecs =
                          language === 'chinese'
                            ? aiAnalysis.recommendations_zh
                            : aiAnalysis.recommendations_en;

                        // 確保為陣列，避免 AI 回傳單一字串或其他型別時造成 .map 錯誤
                        const recsArray = Array.isArray(rawRecs)
                          ? rawRecs
                          : rawRecs
                            ? [String(rawRecs)]
                            : [];

                        if (recsArray.length === 0) {
                          return (
                            <li className="bg-gray-900/40 rounded-xl p-7 border border-gray-600/50 text-gray-400 text-lg">
                              {language === 'chinese'
                                ? '目前沒有可顯示的具體建議，請先參考上方統計與 AI 摘要內容。'
                                : 'No specific recommendations are available; please refer to the stats and AI summary above.'}
                            </li>
                          );
                        }

                        return recsArray.map((rec, idx) => (
                          <li key={idx} className="bg-gray-900/40 rounded-xl p-7 border border-gray-600/50">
                            <div className="flex items-start gap-5">
                              <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-cyan-500/30 text-cyan-300 rounded-full text-lg font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-gray-200 text-xl leading-relaxed pt-1">{rec}</span>
                            </div>
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-16 border border-gray-700 text-center">
                  <div className="text-7xl mb-6">🤖</div>
                  <div className="text-gray-400 text-lg">
                    {language === 'chinese'
                      ? 'AI 分析暫時不可用'
                      : 'AI analysis is temporarily unavailable'}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="relative z-20 flex justify-center gap-8 pb-24" style={{ paddingTop: '80px' }}>
        <button
          onClick={() => navigate('/game')}
          className="px-24 py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all pixel-font border-2 border-cyan-400 text-xl shadow-[0_0_15px_rgba(0,255,255,0.3)]"
        >
          {t.backToHome}
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="px-24 py-6 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-2xl transition-all pixel-font border-2 border-gray-500 text-xl"
        >
          {t.logoutAndExit}
        </button>
      </div>
    </div>
  );
};

// 統計卡片組件
const StatCard = ({ label, value, icon, color }) => (
  <div
    className="w-full sm:w-[280px] bg-gray-800/60 backdrop-blur-sm rounded-2xl p-9 border-2 border-gray-700 text-center"
    style={{ boxShadow: `0 0 20px ${color}20` }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <div className="text-3xl font-bold mb-3" style={{ color }}>
      {value}
    </div>
    <div className="text-gray-300 text-base mt-2 font-medium">{label}</div>
  </div>
);

export default ReportPage;
