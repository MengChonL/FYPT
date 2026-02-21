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

  const SKILL_NAMES = {
    reaction_speed: { zh: '反應速度', en: 'Reaction Speed' },
    accuracy: { zh: '準確度', en: 'Accuracy' },
    consistency: { zh: '一致性', en: 'Consistency' },
  };

  const LEVEL_NAMES = {
    excellent: { zh: '優秀', en: 'Excellent' },
    good: { zh: '良好', en: 'Good' },
    average: { zh: '普通', en: 'Average' },
    needs_improvement: { zh: '待加強', en: 'Needs Improvement' },
  };

  // 1. 構建各關表現文本
  const performanceText = (reportData.performance_summary || [])
    .map(ps => {
      const name = SCENARIO_NAMES[ps.scenario_code] || { zh: ps.scenario_code, en: ps.scenario_code };
      const avgTimeSec = Math.round((ps.avg_time_ms || 0) / 1000);
      return `- ${name.zh}（${name.en}）：${ps.final_success ? '已通過' : '未通過'}，嘗試 ${ps.total_attempts} 次，平均用時 ${avgTimeSec} 秒`;
    })
    .join('\n');

  // 2. 構建錯誤分佈文本
  const errorEntries = Object.entries(reportData.error_distribution || {});
  const errorText = errorEntries.length > 0
    ? errorEntries.map(([key, val]) => {
        const name = ERROR_NAMES[key] || { zh: key, en: key };
        return `- ${name.zh}（${name.en}）：${val.count} 次（${val.percentage}%）`;
      }).join('\n')
    : '- 無錯誤記錄';

  // 3. 構建能力評分文本
  const skillText = Object.entries(reportData.skill_grading || {})
    .map(([key, val]) => {
      const name = SKILL_NAMES[key] || { zh: key, en: key };
      const level = LEVEL_NAMES[val.level] || { zh: val.level, en: val.level };
      return `- ${name.zh}（${name.en}）：${val.score} 分（${level.zh} / ${level.en}）`;
    })
    .join('\n');

  // 4. 構建 Prompt
  const prompt = `你是一位 Web3 安全教育專家。以下是一位用戶在「Web3 釣魚攻擊識別訓練平台」上的完整訓練數據。請根據數據生成專業的分析報告。

## 用戶訓練數據

### 基本統計
- 完成關卡數：${reportData.total_scenarios_completed} / 9
- 總用時：${Math.round((reportData.total_time_ms || 0) / 1000)} 秒
- 總體成功率：${reportData.overall_success_rate}%

### 能力評分
${skillText || '- 無評分數據'}

### 各關表現摘要
${performanceText}

### 錯誤類型分佈
${errorText}

---

請輸出以下結構的純 JSON（不要加任何 markdown 標記、不要加 \`\`\`）：

{
  "summary_zh": "（繁體中文，300-500字）詳細的整體表現分析，包含用戶的優勢和弱點分析、各關卡表現點評、能力評分解讀、錯誤類型分析。必須具體引用上方數據中的關卡名稱和分數。",
  "summary_en": "（English, 200-400 words）Same detailed analysis in English.",
  "recommendations_zh": ["具體建議1", "具體建議2", "具體建議3", "具體建議4"],
  "recommendations_en": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"],
  "risk_profile": {
    "overall_risk_level": "low 或 medium 或 high",
    "strongest_area_zh": "用戶表現最好的具體領域（繁體中文）",
    "strongest_area_en": "User's strongest area (English)",
    "weakest_area_zh": "用戶表現最差的具體領域（繁體中文）",
    "weakest_area_en": "User's weakest area (English)",
    "vulnerability_summary_zh": "脆弱點分析摘要（繁體中文，50-100字）",
    "vulnerability_summary_en": "Vulnerability summary (English, 50-100 words)"
  }
}

重要規則：
1. 只輸出純 JSON，不要任何額外文字、不要 markdown 標記
2. summary 必須詳細且具體，引用實際的關卡名稱、分數和錯誤類型
3. risk_profile 中所有欄位都必須填寫，不能留空或寫 N/A
4. overall_risk_level 只能是 low、medium、high 三選一
5. strongest_area 和 weakest_area 必須根據通過/失敗的關卡來判斷
6. recommendations 必須是字串陣列，每個建議針對具體的弱點`;

  try {
    // deepseek-reasoner 不支持 temperature、response_format、system role 等參數
    const completion = await client.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        { role: 'user', content: '你是一位專業的 Web3 安全分析師。請必須嚴格按照要求輸出純淨的 JSON 格式，確保繁體中文字符正確編碼。recommendations 必須是字串陣列格式。只輸出 JSON，不要輸出任何其他文字。\n\n' + prompt }
      ],
    });

    const rawContent = completion.choices[0].message.content;
    console.log('[generateAIAnalysis] Raw AI response length:', rawContent?.length);
    console.log('[generateAIAnalysis] Raw content (first 300 chars):', rawContent?.substring(0, 300));
    
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
      // deepseek-reasoner 可能在 JSON 前後輸出思考文字，需要提取 JSON
      let cleaned = cleanContent.trim();
      
      // 移除 markdown code block
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();
      
      // 嘗試直接解析清理後的內容
      try {
        parsed = JSON.parse(cleaned);
        console.log('[generateAIAnalysis] Parsed after cleaning markdown');
      } catch (retryErr) {
        // 最後嘗試：用正則提取第一個完整的 JSON 物件
        const jsonMatch = cleanContent.match(/\{[\s\S]*"summary_zh"[\s\S]*"risk_profile"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            console.log('[generateAIAnalysis] Parsed via regex extraction');
          } catch (regexErr) {
            console.error('[generateAIAnalysis] All parse attempts failed');
            console.error('[generateAIAnalysis] Raw content:', cleanContent?.substring(0, 1000));
            return getFallbackReport(`JSON parse error: ${parseErr.message}`);
          }
        } else {
          console.error('[generateAIAnalysis] No JSON object found in response');
          console.error('[generateAIAnalysis] Raw content:', cleanContent?.substring(0, 1000));
          return getFallbackReport(`JSON parse error: ${parseErr.message}`);
        }
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
      risk_profile: {
        overall_risk_level: parsed.risk_profile?.overall_risk_level || 'medium',
        strongest_area_zh: sanitizeString(parsed.risk_profile?.strongest_area_zh || ''),
        strongest_area_en: sanitizeString(parsed.risk_profile?.strongest_area_en || ''),
        weakest_area_zh: sanitizeString(parsed.risk_profile?.weakest_area_zh || ''),
        weakest_area_en: sanitizeString(parsed.risk_profile?.weakest_area_en || ''),
        vulnerability_summary_zh: sanitizeString(parsed.risk_profile?.vulnerability_summary_zh || ''),
        vulnerability_summary_en: sanitizeString(parsed.risk_profile?.vulnerability_summary_en || ''),
      }
    };

    console.log('[generateAIAnalysis] Processed result:', {
      summary_zh_length: result.summary_zh?.length,
      summary_en_length: result.summary_en?.length,
      recommendations_zh_count: result.recommendations_zh?.length,
      recommendations_en_count: result.recommendations_en?.length,
      risk_level: result.risk_profile?.overall_risk_level,
      has_strongest: !!result.risk_profile?.strongest_area_zh,
      has_weakest: !!result.risk_profile?.weakest_area_zh,
      has_vulnerability: !!result.risk_profile?.vulnerability_summary_zh
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
