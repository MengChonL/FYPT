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
  const performanceText = (reportData.performance_summary || [])
    .map(ps => {
      const name = SCENARIO_NAMES[ps.scenario_code] || { zh: ps.scenario_code, en: ps.scenario_code };
      const avgTimeSec = Math.round((ps.avg_time_ms || 0) / 1000);
      return `- ${name.zh}：${ps.final_success ? '已通過' : '未通過'}，平均用時 ${avgTimeSec} 秒`;
    })
    .join('\n');

  // 2. 構建 Prompt
  const prompt = `你是一位 Web3 安全專家。請分析以下用戶訓練數據並輸出純 JSON 格式報告。

訓練數據：
${performanceText}
整體成功率：${reportData.overall_success_rate}%

請輸出以下格式的 JSON 物件（必須是有效的 JSON，recommendations 必須是字串陣列）：
{
  "summary_zh": "繁體中文摘要（100-200字）",
  "summary_en": "English summary (100-200 words)",
  "recommendations_zh": ["建議1", "建議2", "建議3", "建議4"],
  "recommendations_en": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"]
}

重要：recommendations_zh 和 recommendations_en 必須是字串陣列，每個建議不超過50字。`;

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: '你是一位專業的 Web3 安全分析師。你必須嚴格按照要求輸出有效的 JSON 格式，確保所有中文字符正確編碼，recommendations 必須是字串陣列格式。' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0].message.content;
    console.log('[generateAIAnalysis] Raw AI response length:', rawContent?.length);
    
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error('[generateAIAnalysis] JSON parse error:', parseErr.message);
      console.error('[generateAIAnalysis] Raw content (first 500 chars):', rawContent?.substring(0, 500));
      return getFallbackReport(`JSON parse error: ${parseErr.message}`);
    }

    // 驗證和清理返回的數據
    const result = {
      summary_zh: parsed.summary_zh || '分析摘要暫時不可用',
      summary_en: parsed.summary_en || 'Analysis summary temporarily unavailable',
      recommendations_zh: Array.isArray(parsed.recommendations_zh) 
        ? parsed.recommendations_zh 
        : (typeof parsed.recommendations_zh === 'string' ? [parsed.recommendations_zh] : ['建議重新練習失敗頻率較高的關卡']),
      recommendations_en: Array.isArray(parsed.recommendations_en)
        ? parsed.recommendations_en
        : (typeof parsed.recommendations_en === 'string' ? [parsed.recommendations_en] : ['Re-run scenarios with high failure rates']),
      risk_profile: parsed.risk_profile || { overall_risk_level: 'medium' }
    };

    console.log('[generateAIAnalysis] Processed result:', {
      summary_zh_length: result.summary_zh?.length,
      summary_en_length: result.summary_en?.length,
      recommendations_zh_count: result.recommendations_zh?.length,
      recommendations_en_count: result.recommendations_en?.length
    });

    return result;
  } catch (error) {
    console.error('❌ DeepSeek AI 請求失敗:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
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