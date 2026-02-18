import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 使用 Gemini AI 分析用戶的訓練報告數據，生成個人化的分析報告
 * @param {Object} reportData - user_final_reports 中的完整報告數據
 * @returns {Object} AI 分析結果 { summary_zh, summary_en, recommendations_zh, recommendations_en, risk_profile }
 */
export const generateAIAnalysis = async (reportData) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // 構建 prompt — 將結構化數據交給 AI 做深度分析
  const prompt = `
你是一位 Web3 安全教育專家。以下是一位用戶在「Web3 釣魚攻擊識別訓練平台」上的完整訓練數據。
請根據數據生成專業的分析報告。

## 用戶訓練數據

### 基本統計
- 完成關卡數：${reportData.total_scenarios_completed} / 9
- 總用時：${Math.round((reportData.total_time_ms || 0) / 1000)} 秒
- 總體成功率：${reportData.overall_success_rate}%
- 挫折指數：${reportData.frustration_index} / 100

### 各關表現摘要
${JSON.stringify(reportData.performance_summary, null, 2)}

### 錯誤類型分佈
${JSON.stringify(reportData.error_distribution, null, 2)}

### 能力評分
${JSON.stringify(reportData.skill_grading, null, 2)}

## 請輸出以下結構的 JSON（不要加 markdown code block）：

{
  "summary_zh": "（中文）2-3段的整體表現分析摘要，包含用戶的優勢和弱點",
  "summary_en": "（English）Same analysis in English",
  "recommendations_zh": ["建議1", "建議2", "建議3", "建議4"],
  "recommendations_en": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"],
  "risk_profile": {
    "overall_risk_level": "low / medium / high",
    "strongest_area": "用戶最擅長的安全領域",
    "weakest_area": "用戶最薄弱的安全領域",
    "vulnerability_summary_zh": "一句話總結用戶最容易受到的攻擊類型",
    "vulnerability_summary_en": "One sentence summary in English"
  }
}

重要規則：
1. 只輸出純 JSON，不要任何額外文字或 markdown 標記
2. 分析要具體，引用實際數據（如哪些關卡失敗、哪些錯誤類型最多）
3. 建議要可操作，針對用戶的具體弱點
4. 如果 error_distribution 中有 phishing_technique / ui_deception / fake_data / impossible_returns / regulatory_contradiction / regulatory_fraud / fake_endorsement 等類別，請在分析中具體指出用戶在這些方面的表現
`;

  try {
    let lastError = null;
    // 最多重試 3 次（處理 429 限流）
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // 嘗試解析 JSON（移除可能的 markdown code block 標記）
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.slice(7);
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.slice(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.slice(0, -3);
        }
        cleanText = cleanText.trim();

        const analysis = JSON.parse(cleanText);
        if (process.env.NODE_ENV !== 'production') console.log('✅ Gemini AI analysis generated successfully');
        return analysis;
      } catch (err) {
        lastError = err;
        // 如果是 429 限流錯誤，等待後重試
        if (err.message && err.message.includes('429')) {
          const waitSec = (attempt + 1) * 6;
          if (process.env.NODE_ENV !== 'production') console.log(`⏳ Rate limited, retrying in ${waitSec}s... (attempt ${attempt + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
          continue;
        }
        throw err; // 非限流錯誤直接拋出
      }
    }
    throw lastError; // 3 次重試後仍失敗
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('❌ Gemini AI analysis failed:', error.message);
    // 返回 fallback 結構，不影響主流程
    return {
      summary_zh: '由於 AI 服務暫時不可用，無法生成詳細分析。請參考上方的統計數據。',
      summary_en: 'AI analysis is temporarily unavailable. Please refer to the statistics above.',
      recommendations_zh: ['建議重做失敗的關卡以鞏固知識', '特別注意錯誤分佈中佔比最高的類別'],
      recommendations_en: ['Retry failed scenarios to reinforce learning', 'Pay attention to the most common error categories'],
      risk_profile: {
        overall_risk_level: 'unknown',
        strongest_area: 'N/A',
        weakest_area: 'N/A',
        vulnerability_summary_zh: 'AI 分析暫不可用',
        vulnerability_summary_en: 'AI analysis temporarily unavailable'
      },
      ai_error: error.message
    };
  }
};
