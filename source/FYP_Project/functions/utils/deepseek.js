import OpenAI from 'openai';

/**
 * 初始化 DeepSeek 客戶端
 * @param {Object} env - 從 Cloudflare Functions 傳入的環境變數物件
 */
const initDeepSeek = (env) => {
  // Cloudflare Pages Functions 只能使用 context.env；本機 Node 測試可 fallback 到 process.env
  const apiKey =
    env?.DEEPSEEK_API_KEY ||
    (typeof process !== 'undefined' ? process.env.DEEPSEEK_API_KEY : undefined);
  
  if (!apiKey) {
    console.warn('⚠️ 找不到 DEEPSEEK_API_KEY，請檢查 Cloudflare 變數設定');
    return null;
  }

  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // 允許前端直接調用（測試用）
  });
};

/**
 * 生成個人化分析報告
 * @param {Object} reportData - 報告數據
 * @param {Object} env - (選填) 後端環境變數
 */
export const generateAIAnalysis = async (reportData, env) => {
  const client = initDeepSeek(env);
  if (!client) return getFallbackReport('Missing API Key');

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

  // 1. 構建數據文本 (維持原本邏輯)
  const performanceText = (reportData.performance_summary || []).map(ps => {
    const name = SCENARIO_NAMES[ps.scenario_code] || { zh: ps.scenario_code, en: ps.scenario_code };
    const avgTimeSec = Math.round((ps.avg_time_ms || 0) / 1000);
    return {
      zh: `- ${name.zh}：${ps.final_success ? '已通過' : '未通過'}，平均用時 ${avgTimeSec} 秒`,
      en: `- ${name.en}: ${ps.final_success ? 'Passed' : 'Failed'}, avg ${avgTimeSec}s`,
    };
  }).join('\n');

  // 2. 構建 Prompt
  const prompt = `
你是一位 Web3 安全專家。請分析以下用戶訓練數據並輸出純 JSON 格式報告。
${performanceText}
(其餘數據: 成功率 ${reportData.overall_success_rate}%)

請嚴格輸出包含 summary_zh, summary_en, recommendations_zh, recommendations_en 的 JSON 物件。
`;

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位專業的 Web3 安全分析師，請嚴格輸出繁體中文和英文雙語 JSON。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ DeepSeek AI 請求失敗:', error.message);
    return getFallbackReport(error.message);
  }
};

function getFallbackReport(errorMsg) {
  return {
    summary_zh: '由於 AI 服務暫時不可用，請參考上方統計數據。',
    summary_en: 'AI analysis is temporarily unavailable, please refer to the statistics above.',
    recommendations_zh: ['建議重新練習失敗頻率較高的關卡'],
    recommendations_en: ['Re-run scenarios with high failure rates'],
    risk_profile: { overall_risk_level: 'medium' },
    ai_error: errorMsg
  };
}