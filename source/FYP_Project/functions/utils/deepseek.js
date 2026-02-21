<<<<<<< HEAD
import OpenAI from 'openai';

/**
 * 初始化 DeepSeek 客户端
 * @param {Object} env - 环境变量对象
 */
const initDeepSeek = (env) => {
  const DEEPSEEK_API_KEY = env?.DEEPSEEK_API_KEY || (typeof process !== 'undefined' ? process.env.DEEPSEEK_API_KEY : null);
  
  if (!DEEPSEEK_API_KEY) {
    throw new Error('Missing DEEPSEEK_API_KEY environment variable');
  }

  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
  });
};

/**
 * 使用 DeepSeek V3 AI 分析用戶的訓練報告數據，生成個人化的分析報告
 * @param {Object} reportData - user_final_reports 中的完整報告數據
 * @param {Object} env - 环境变量对象
 * @returns {Object} AI 分析結果 { summary_zh, summary_en, recommendations_zh, recommendations_en, risk_profile }
 */
export const generateAIAnalysis = async (reportData, env) => {
  const client = initDeepSeek(env);
  
  // 關卡代碼 → 中英名稱對照
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

  // 錯誤類型代碼 → 中英名稱對照
  const ERROR_NAMES = {
    phishing_technique: { zh: '釣魚手法', en: 'Phishing Technique' },
    ui_deception: { zh: '介面欺騙', en: 'UI Deception' },
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

  // 能力維度代碼 → 中英名稱對照
  const SKILL_NAMES = {
    reaction_speed: { zh: '反應速度', en: 'Reaction Speed' },
    accuracy: { zh: '準確度', en: 'Accuracy' },
    consistency: { zh: '一致性', en: 'Consistency' },
  };

  // 能力等級代碼 → 中英名稱對照
  const LEVEL_NAMES = {
    excellent: { zh: '優秀', en: 'Excellent' },
    good: { zh: '良好', en: 'Good' },
    average: { zh: '普通', en: 'Average' },
    needs_improvement: { zh: '待加強', en: 'Needs Improvement' },
  };

  // === 將原始數據轉換為人類可讀的中英文格式 ===

  // 各關表現（已翻譯）
  const performanceText = (reportData.performance_summary || []).map(ps => {
    const name = SCENARIO_NAMES[ps.scenario_code] || { zh: ps.scenario_code, en: ps.scenario_code };
    const avgTimeSec = Math.round((ps.avg_time_ms || 0) / 1000);
    const status_zh = ps.final_success ? '已通過' : '未通過';
    const status_en = ps.final_success ? 'Passed' : 'Failed';
    return {
      zh: `${name.zh}：${status_zh}，嘗試 ${ps.total_attempts} 次，第 ${ps.successful_attempt_number || '-'} 次成功，平均用時 ${avgTimeSec} 秒`,
      en: `${name.en}: ${status_en}, ${ps.total_attempts} attempts, succeeded on attempt #${ps.successful_attempt_number || 'N/A'}, avg ${avgTimeSec}s`,
    };
  });

  // 錯誤分佈（已翻譯）
  const errorEntries = Object.entries(reportData.error_distribution || {});
  const errorText = errorEntries.map(([key, val]) => {
    const name = ERROR_NAMES[key] || { zh: key, en: key };
    return {
      zh: `${name.zh}：${val.count} 次（${val.percentage}%）`,
      en: `${name.en}: ${val.count} times (${val.percentage}%)`,
    };
  });

  // 能力評分（已翻譯）
  const skillEntries = Object.entries(reportData.skill_grading || {});
  const skillText = skillEntries.map(([key, val]) => {
    const name = SKILL_NAMES[key] || { zh: key, en: key };
    const level = LEVEL_NAMES[val.level] || { zh: val.level, en: val.level };
    return {
      zh: `${name.zh}：${val.score} 分（${level.zh}）`,
      en: `${name.en}: ${val.score} (${level.en})`,
    };
  });

  // 構建 prompt — 將結構化數據交給 AI 做深度分析
  const prompt = `
你是一位 Web3 安全教育專家。以下是一位用戶在「Web3 釣魚攻擊識別訓練平台」上的完整訓練數據。
請根據數據生成專業的分析報告。

## 用戶訓練數據

### 基本統計
- 完成關卡數：${reportData.total_scenarios_completed} / 9
- 總用時：${Math.round((reportData.total_time_ms || 0) / 1000)} 秒
- 總體成功率：${reportData.overall_success_rate}%

### 能力評分
${skillText.map(s => `- ${s.zh}`).join('\n')}

### 各關表現摘要
${performanceText.map(p => `- ${p.zh}`).join('\n')}

### 錯誤類型分佈
${errorText.length > 0 ? errorText.map(e => `- ${e.zh}`).join('\n') : '- 無錯誤記錄'}

---

Below is the same data in English for generating English output:

### Skill Grading
${skillText.map(s => `- ${s.en}`).join('\n')}

### Performance Summary
${performanceText.map(p => `- ${p.en}`).join('\n')}

### Error Distribution
${errorText.length > 0 ? errorText.map(e => `- ${e.en}`).join('\n') : '- No errors recorded'}

## 請輸出以下結構的 JSON（不要加 markdown code block）：

{
  "summary_zh": "（純繁體中文，禁止夾雜任何英文單詞或代碼）2-3段的整體表現分析摘要，包含用戶的優勢和弱點。必須使用上方的中文關卡名稱和中文錯誤類型名稱",
  "summary_en": "（Pure English, no Chinese characters allowed）Same analysis in English. Must use the English scenario names and error type names from above",
  "recommendations_zh": ["純中文建議1", "純中文建議2", "純中文建議3", "純中文建議4"],
  "recommendations_en": ["Pure English recommendation 1", "Pure English recommendation 2", "Pure English recommendation 3", "Pure English recommendation 4"],
  "risk_profile": {
    "overall_risk_level": "low / medium / high",
    "strongest_area_zh": "（純中文）用戶最擅長的安全領域",
    "strongest_area_en": "（Pure English）User's strongest security area",
    "weakest_area_zh": "（純中文）用戶最薄弱的安全領域",
    "weakest_area_en": "（Pure English）User's weakest security area",
    "vulnerability_summary_zh": "（純中文）一句話總結用戶最容易受到的攻擊類型",
    "vulnerability_summary_en": "（Pure English）One sentence summary"
  }
}

重要規則：
1. 只輸出純 JSON，不要任何額外文字或 markdown 標記
2. 分析必須具體引用上方提供的實際數據，包括：哪些關卡失敗了（用中文/英文關卡名稱）、哪些錯誤類型出現最多（用中文/英文錯誤名稱）、能力評分各項的具體分數和等級
3. 建議要可操作，具體針對用戶犯錯最多的錯誤類型和失敗的關卡
4. **語言嚴格分離**：所有 _zh 結尾的欄位必須是純繁體中文，絕對不能包含任何英文單詞、代碼名稱（如 phase1-1、wrong_backup_method 等）或英文術語；所有 _en 結尾的欄位必須是純英文，絕對不能包含任何中文字
5. 不要使用任何代碼名稱（如 phase1-1、wrong_categorization），必須使用上方已翻譯的中英文名稱
`;

  try {
    let lastError = null;
    // 最多重試 3 次（處理限流）
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const completion = await client.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位專業的 Web3 安全分析師。請嚴格按照要求輸出純 JSON 格式的分析報告，不要包含任何額外文字或 markdown 標記。語言必須嚴格分離：_zh 欄位只能包含繁體中文，_en 欄位只能包含英文，絕對不允許中英夾雜。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: 'json_object' },
        });

        const text = completion.choices[0].message.content;

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
        console.log('✅ DeepSeek AI analysis generated successfully');
        return analysis;
      } catch (err) {
        lastError = err;
        // 如果是 429 限流錯誤，等待後重試
        if (err.status === 429 || (err.message && err.message.includes('429'))) {
          const waitSec = (attempt + 1) * 6;
          console.log(`⏳ Rate limited, retrying in ${waitSec}s... (attempt ${attempt + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
          continue;
        }
        throw err; // 非限流錯誤直接拋出
      }
    }
    throw lastError; // 3 次重試後仍失敗
  } catch (error) {
    console.error('❌ DeepSeek AI analysis failed:', error.message);
    // 返回 fallback 結構，不影響主流程
    return {
      summary_zh: '由於 AI 服務暫時不可用，無法生成詳細分析。請參考上方的統計數據。',
      summary_en: 'AI analysis is temporarily unavailable. Please refer to the statistics above.',
      recommendations_zh: ['建議重做失敗的關卡以鞏固知識', '特別注意錯誤分佈中佔比最高的類別'],
      recommendations_en: ['Retry failed scenarios to reinforce learning', 'Pay attention to the most common error categories'],
      risk_profile: {
        overall_risk_level: 'unknown',
        strongest_area_zh: '暫無資料',
        strongest_area_en: 'N/A',
        weakest_area_zh: '暫無資料',
        weakest_area_en: 'N/A',
        vulnerability_summary_zh: 'AI 分析暫不可用',
        vulnerability_summary_en: 'AI analysis temporarily unavailable'
      },
      ai_error: error.message
    };
  }
};

=======
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

    // 驗證和清理返回的數據，確保所有字符串都是有效的 UTF-8
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return String(str || '');
      // 確保字符串是有效的 UTF-8，移除無效字符
      try {
        return str.normalize('NFC'); // 正規化 Unicode
      } catch {
        return str;
      }
    };

    const result = {
      summary_zh: sanitizeString(parsed.summary_zh || '分析摘要暫時不可用'),
      summary_en: sanitizeString(parsed.summary_en || 'Analysis summary temporarily unavailable'),
      recommendations_zh: Array.isArray(parsed.recommendations_zh) 
        ? parsed.recommendations_zh.map(sanitizeString)
        : (typeof parsed.recommendations_zh === 'string' ? [sanitizeString(parsed.recommendations_zh)] : ['建議重新練習失敗頻率較高的關卡']),
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
    summary_zh: '由於 AI 服務暫時不可用，請參考上方統計數據。',
    summary_en: 'AI analysis is temporarily unavailable, please refer to the statistics above.',
    recommendations_zh: ['建議重新練習失敗頻率較高的關卡'],
    recommendations_en: ['Re-run scenarios with high failure rates'],
    risk_profile: { overall_risk_level: 'medium' },
    ai_error: errorMsg
  };
}
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
