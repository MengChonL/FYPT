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
    console.warn('⚠️ 缺少 DEEPSEEK_API_KEY，請檢查 Cloudflare 變數設定');
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

  // 1. 構建表現文本 (維持文本邏輯)
  const performanceText = (reportData.performance_summary || [])
    .map(ps => {
      const name = SCENARIO_NAMES[ps.scenario_code] || { zh: ps.scenario_code, en: ps.scenario_code };
      const avgTimeSec = Math.round((ps.avg_time_ms || 0) / 1000);
      return `- ${name.zh}：${ps.final_success ? '已通過' : '未通過'}，平均用時 ${avgTimeSec} 秒`;
    })
    .join('\n');

  // 2. 構建 Prompt
  const prompt = `你是一位 Web3 安全專家，請分析以下用戶訓練數據並輸出純 JSON 格式報告。

訓練數據：
${performanceText}
總體成功率：${reportData.overall_success_rate}%

請輸出以下格式的 JSON 物件（必須是純淨的 JSON，recommendations 必須是字串陣列）：
{
  "summary_zh": "繁體中文摘要（100-200字）",
  "summary_en": "English summary (100-200 words)",
  "recommendations_zh": ["建議1", "建議2", "建議3", "建議4"],
  "recommendations_en": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"]
}

注意：recommendations_zh 和 recommendations_en 必須是字串陣列，每個建議不超過50字。`;

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: '你是一位專業的 Web3 安全分析師。請必須嚴格按照要求輸出純淨的 JSON 格式，確保繁體中文字符正確編碼。recommendations 必須是字串陣列格式。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0].message.content;
    console.log('[generateAIAnalysis] Raw AI response length:', rawContent?.length);
    
    // 確保內容是有效的 UTF-8 字符串
    let cleanContent = rawContent;
    if (typeof cleanContent !== 'string') {
      cleanContent = String(cleanContent);
    }
    
    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (parseErr) {
      console.error('[generateAIAnalysis] JSON parse error:', parseErr.message);
      console.error('[generateAIAnalysis] Raw content (first 500 chars):', cleanContent?.substring(0, 500));
      // 嘗試清理可能的 markdown code block
      let cleaned = cleanContent.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();
      
      try {
        parsed = JSON.parse(cleaned);
        console.log('[generateAIAnalysis] Successfully parsed after cleaning markdown');
      } catch (retryErr) {
        console.error('[generateAIAnalysis] Retry parse also failed:', retryErr.message);
        return getFallbackReport(`JSON parse error: ${parseErr.message}`);
      }
    }

    // 驗證並標準化結果，確保所有字符串是有效的 UTF-8
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return String(str || '');
      // 確保字符串是有效的 UTF-8，移除無效字符
      try {
        return str.normalize('NFC'); // 標準化 Unicode
      } catch {
        return str;
      }
    };

    const result = {
      summary_zh: sanitizeString(parsed.summary_zh || '分析摘要暫時不可用'),
      summary_en: sanitizeString(parsed.summary_en || 'Analysis summary temporarily unavailable'),
      recommendations_zh: Array.isArray(parsed.recommendations_zh) 
        ? parsed.recommendations_zh.map(sanitizeString)
        : (typeof parsed.recommendations_zh === 'string' ? [sanitizeString(parsed.recommendations_zh)] : ['建議重新練習失敗率較高的關卡']),
      recommendations_en: Array.isArray(parsed.recommendations_en)
        ? parsed.recommendations_en.map(sanitizeString)
        : (typeof parsed.recommendations_en === 'string' ? [sanitizeString(parsed.recommendations_en)] : ['Re-run scenarios with high failure rates']),
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
    summary_zh: '由於 AI 分析暫時不可用，請參考上方統計數據。',
    summary_en: 'AI analysis is temporarily unavailable, please refer to the statistics above.',
    recommendations_zh: ['建議重新練習失敗率較高的關卡'],
    recommendations_en: ['Re-run scenarios with high failure rates'],
    risk_profile: { overall_risk_level: 'medium' },
    ai_error: errorMsg
  };
}
