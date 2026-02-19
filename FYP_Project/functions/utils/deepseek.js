import OpenAI from 'openai';

/**
 * 初始化 DeepSeek 客戶端
 */
const initDeepSeek = () => {
  // Vite 必須使用 import.meta.env，且變數名須以 VITE_ 開頭
  const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
  
  if (!DEEPSEEK_API_KEY) {
    console.warn('⚠️ Missing VITE_DEEPSEEK_API_KEY environment variable');
    return null;
  }

  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
    dangerouslyAllowBrowser: true, // Vite/前端環境必須開啟此項
  });
};

/**
 * 生成個人化分析報告
 */
export const generateAIAnalysis = async (reportData) => {
  const client = initDeepSeek();
  if (!client) return getFallbackReport(null); // 如果沒 API Key，直接返回後備數據

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

  // ... (保留你原本的 ERROR_NAMES, SKILL_NAMES, LEVEL_NAMES 映射邏輯)

  // 構建數據文本 (這裡使用你原本的轉換邏輯)
  const performanceText = (reportData.performance_summary || []).map(ps => {
    const name = SCENARIO_NAMES[ps.scenario_code] || { zh: ps.scenario_code, en: ps.scenario_code };
    const avgTimeSec = Math.round((ps.avg_time_ms || 0) / 1000);
    return {
      zh: `${name.zh}：${ps.final_success ? '已通過' : '未通過'}，平均用時 ${avgTimeSec} 秒`,
      en: `${name.en}: ${ps.final_success ? 'Passed' : 'Failed'}, avg ${avgTimeSec}s`,
    };
  });

  const prompt = `你是一位 Web3 安全專家。分析以下數據並輸出純 JSON... (保留你原本的 Prompt 內容)`;

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
    console.error('❌ DeepSeek AI analysis failed:', error.message);
    return getFallbackReport(error.message);
  }
};

// 提取後備數據邏輯，保持代碼乾淨
function getFallbackReport(errorMsg) {
  return {
    summary_zh: '由於服務連線問題，暫時無法生成 AI 報告。',
    summary_en: 'AI analysis temporarily unavailable due to connection issues.',
    recommendations_zh: ['建議參考統計數據進行自我優化'],
    recommendations_en: ['Please refer to statistics for improvement'],
    risk_profile: { overall_risk_level: 'unknown' },
    ai_error: errorMsg
  };
}