import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 設定時區 (香港時間 UTC+8)
const TIMEZONE_OFFSET = 8; // 小時

// 獲取帶時區的時間戳字符串
const getLocalTimestamp = () => {
  const now = new Date();
  // 加上時區偏移
  const localTime = new Date(now.getTime() + TIMEZONE_OFFSET * 60 * 60 * 1000);
  return localTime.toISOString().replace('Z', '+08:00');
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.warn('⚠️ Missing SUPABASE_SERVICE_ROLE_KEY - admin operations may fail!');
}

// 一般用戶操作（受 RLS 限制）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin 操作（繞過 RLS）
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase; // Fallback to anon if no service key

// ===== 用戶相關操作 =====

// 根據用戶名查找用戶（用於檢查唯一性和登入）
export const getUserByUsername = async (username) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = 沒有找到記錄
  return data;
};

// 檢查用戶名是否已存在
export const checkUsernameExists = async (username) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('user_id')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

export const createUser = async (username, language = 'chinese', consent = true, hasExperience = false) => {
  // 檢查用戶名是否已存在
  const exists = await checkUsernameExists(username);
  if (exists) {
    throw new Error('Username already exists');
  }

  // 1. 創建用戶 - 直接設置 current_scenario_code
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      username,
      preferred_language: language,
      consent_given: consent,
      has_experience: hasExperience,
      current_scenario_code: 'phase1-1'  // 新用戶從第一關開始
    })
    .select()
    .single();

  if (userError) throw userError;

  return userData;
};

export const getUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const searchUsers = async (query) => {
  const trimmed = (query || '').trim();
  if (!trimmed) return getAllUsers();

  // Search by username (ilike for partial match)
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .ilike('username', `%${trimmed}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Also try exact/partial user_id match (UUID is not ilike-able, so try eq)
  if (data.length === 0) {
    const { data: idData, error: idError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', trimmed);

    if (!idError && idData && idData.length > 0) return idData;
  }

  return data;
};

export const updateLastLogin = async (userId) => {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
};

// 刪除用戶及其所有關聯數據
export const deleteUserAndData = async (userId) => {
  // 1. 刪除 user_final_reports
  const { error: reportErr } = await supabaseAdmin
    .from('user_final_reports')
    .delete()
    .eq('user_id', userId);
  if (reportErr) console.warn('⚠️ Delete reports:', reportErr.message);

  // 2. 刪除 user_attempts
  const { error: attemptErr } = await supabaseAdmin
    .from('user_attempts')
    .delete()
    .eq('user_id', userId);
  if (attemptErr) console.warn('⚠️ Delete attempts:', attemptErr.message);

  // 3. 刪除 user_progress
  const { error: progressErr } = await supabaseAdmin
    .from('user_progress')
    .delete()
    .eq('user_id', userId);
  if (progressErr) console.warn('⚠️ Delete progress:', progressErr.message);

  // 4. 最後刪除用戶本身
  const { error: userErr } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('user_id', userId);
  if (userErr) throw userErr;

  return { deleted: true, user_id: userId };
};

// ===== Phase 相關操作 =====

export const getPhases = async () => {
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
};

export const createPhase = async (phaseData) => {
  const { data, error } = await supabaseAdmin
    .from('phases')
    .insert(phaseData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePhase = async (phaseId, phaseData) => {
  const { data, error } = await supabaseAdmin
    .from('phases')
    .update(phaseData)
    .eq('phase_id', phaseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ===== 場景相關操作 =====

export const getScenariosByPhase = async (phaseId) => {
  const { data, error } = await supabase
    .from('scenarios')
    .select(`
      *,
      scenario_types (type_code, component_name)
    `)
    .eq('phase_id', phaseId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
};

export const getScenario = async (scenarioCode) => {
  const { data, error } = await supabase
    .from('scenarios')
    .select(`
      *,
      scenario_types (type_code, component_name),
      phases (phase_code, title_zh, title_en)
    `)
    .eq('scenario_code', scenarioCode)
    .single();

  if (error) throw error;
  return data;
};

export const getAllScenarios = async () => {
  const { data, error } = await supabaseAdmin
    .from('scenarios')
    .select(`
      *,
      scenario_types (type_code, name_zh, name_en),
      phases (phase_code, title_zh, title_en)
    `)
    .order('display_order');

  if (error) throw error;
  return data;
};

export const createScenario = async (scenarioData) => {
  const { data, error } = await supabaseAdmin
    .from('scenarios')
    .insert(scenarioData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateScenario = async (scenarioId, scenarioData) => {
  const { data, error } = await supabaseAdmin
    .from('scenarios')
    .update(scenarioData)
    .eq('scenario_id', scenarioId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteScenario = async (scenarioId) => {
  const { error } = await supabaseAdmin
    .from('scenarios')
    .delete()
    .eq('scenario_id', scenarioId);

  if (error) throw error;
};

// ===== 場景類型操作 =====

export const getScenarioTypes = async () => {
  const { data, error } = await supabase
    .from('scenario_types')
    .select('*');

  if (error) throw error;
  return data;
};

// ===== 用戶進度操作 =====

export const getUserProgress = async (userId) => {
  // 從 users 表獲取 current_scenario_code
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('current_scenario_code')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  
  // 返回格式與前端兼容
  return {
    current_scenario_code: user?.current_scenario_code || 'phase1-1'
  };
};

export const updateProgress = async (userId, scenarioId, status) => {
  console.log(`🔄 Supabase updateProgress: userId=${userId}, scenarioCode=${scenarioId}, status=${status}`);
  
  // 只有當 status 為 'current' 時才更新 users 表的 current_scenario_code
  // scenarioId 這裡實際上傳的是 scenario_code
  if (status === 'current') {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        current_scenario_code: scenarioId
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase updateProgress error:', error);
      throw error;
    }
    
    console.log('✅ Supabase updateProgress success:', data);
    return data;
  }
  
  // 如果是 'completed' 狀態，不需要特別處理，因為下一個關卡會設為 'current'
  console.log('ℹ️ Status is completed, no update needed for users table');
  return { status: 'ok' };
};

// ===== 嘗試記錄操作 =====

export const startAttempt = async (userId, scenarioId, sessionId) => {
  // 使用本地時區時間 (香港 UTC+8)
  const startTime = getLocalTimestamp();
  
  console.log('🎬 Creating attempt:', { userId, scenarioId, sessionId, startTime });
  
  const { data, error } = await supabaseAdmin
    .from('user_attempts')
    .insert({
      user_id: userId,
      scenario_id: scenarioId,
      session_id: sessionId,
      start_time: startTime
    })
    .select()
    .single();

  if (error) throw error;
  
  console.log('✅ Attempt created:', data.attempt_id, 'start_time:', data.start_time);
  return data;
};

export const completeAttempt = async (attemptId, isSuccess, errorDetails = null) => {
  // 使用本地時區時間 (香港 UTC+8)
  const endTime = getLocalTimestamp();
  const endTimeDate = new Date();
  
  const { data: attempt, error: fetchError } = await supabaseAdmin
    .from('user_attempts')
    .select('start_time, error_details')
    .eq('attempt_id', attemptId)
    .single();

  if (fetchError || !attempt) {
    console.error('❌ Failed to fetch attempt:', fetchError);
    throw fetchError || new Error('Attempt not found');
  }

  // 解析 start_time (可能帶有 +08:00 時區)
  let startTimeStr = attempt.start_time;
  const startTime = new Date(startTimeStr);
  const durationMs = endTimeDate.getTime() - startTime.getTime();
  
  console.log('⏱️ Duration calculation:', {
    attemptId,
    rawStartTime: attempt.start_time,
    parsedStartTime: startTime.toISOString(),
    endTime: endTime,
    durationMs,
    durationSeconds: Math.round(durationMs / 1000)
  });

  // 合併現有的 stage 錯誤與最終錯誤
  let finalErrorDetails = null;
  const existingErrors = attempt.error_details || {};
  const hasStageErrors = existingErrors.stage_errors && existingErrors.stage_errors.length > 0;
  
  if (hasStageErrors || errorDetails) {
    // 如果有 stage 錯誤或最終錯誤，合併它們
    finalErrorDetails = {
      ...(errorDetails || {}),
      stage_errors: existingErrors.stage_errors || [],
      total_stage_errors: (existingErrors.stage_errors || []).length
    };
    
    console.log('📝 Merging error details:', {
      hasStageErrors,
      stageErrorCount: (existingErrors.stage_errors || []).length,
      hasFinalError: !!errorDetails
    });
  }

  const { data, error } = await supabaseAdmin
    .from('user_attempts')
    .update({
      end_time: endTime,
      duration_ms: durationMs,
      is_success: isSuccess,
      error_details: finalErrorDetails
    })
    .eq('attempt_id', attemptId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 記錄 stage 錯誤（不結束 attempt）
export const recordStageError = async (attemptId, stageError) => {
  // 獲取現有的錯誤記錄
  const { data: attempt, error: fetchError } = await supabaseAdmin
    .from('user_attempts')
    .select('error_details')
    .eq('attempt_id', attemptId)
    .single();

  if (fetchError) {
    console.error('❌ Failed to fetch attempt for stage error:', fetchError);
    throw fetchError;
  }

  // 構建新的錯誤記錄
  const existingErrors = attempt.error_details || {};
  const stageErrors = existingErrors.stage_errors || [];
  
  // 添加新的 stage 錯誤
  stageErrors.push({
    ...stageError,
    recorded_at: new Date().toISOString()
  });

  const updatedErrorDetails = {
    ...existingErrors,
    stage_errors: stageErrors
  };

  console.log('📝 Recording stage error:', {
    attemptId,
    stage: stageError.stage,
    errorType: stageError.error_type,
    totalStageErrors: stageErrors.length
  });

  // 更新 error_details，但不結束 attempt
  const { data, error } = await supabaseAdmin
    .from('user_attempts')
    .update({
      error_details: updatedErrorDetails
    })
    .eq('attempt_id', attemptId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserAttempts = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('user_attempts')
    .select(`
      *,
      scenarios (scenario_code, title_zh, title_en)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// ===== 最終報告操作 =====

export const getAllFinalReports = async () => {
  const { data, error } = await supabaseAdmin
    .from('user_final_reports')
    .select('*, users(username)')
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserFinalReport = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('user_final_reports')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateReportAIAnalysis = async (userId, aiAnalysis) => {
  const { data, error } = await supabaseAdmin
    .from('user_final_reports')
    .update({
      ai_analysis_result: aiAnalysis,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const generateFinalReport = async (userId) => {
  // 1. 取得該用戶所有答題紀錄（含關卡資訊）
  const { data: attempts, error: attemptsError } = await supabaseAdmin
    .from('user_attempts')
    .select(`
      *,
      scenarios (scenario_id, scenario_code, title_zh, title_en, phase_id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (attemptsError) throw attemptsError;
  if (!attempts || attempts.length === 0) {
    throw new Error('No attempts found for this user');
  }

  console.log(`📊 Generating final report for user ${userId}, total attempts: ${attempts.length}`);

  // 2. 按 scenario_code 分組統計
  const scenarioMap = {};
  const allScenarioCodes = [
    'phase1-1', 'phase1-2', 'phase1-3', 'phase1-4', 'phase1-5', 'phase1-6',
    'phase2-1', 'phase2-2', 'phase2-3'
  ];
  
  // 初始化所有9關
  allScenarioCodes.forEach(code => {
    scenarioMap[code] = {
      scenario_code: code,
      scenario_title: '',
      attempts: [],
      total_attempts: 0,
      successful_attempts: 0,
      total_time_ms: 0,
      final_success: false
    };
  });

  // 填充實際數據
  attempts.forEach(attempt => {
    const code = attempt.scenarios?.scenario_code || 'unknown';
    if (!scenarioMap[code]) return;
    
    scenarioMap[code].scenario_title = attempt.scenarios?.title_zh || code;
    scenarioMap[code].attempts.push(attempt);
    scenarioMap[code].total_attempts++;
    scenarioMap[code].total_time_ms += (attempt.duration_ms || 0);
    
    if (attempt.is_success) {
      scenarioMap[code].successful_attempts++;
      scenarioMap[code].final_success = true;
    }
  });

  // 3. 生成 performance_summary（每關表現摘要）
  const performance_summary = allScenarioCodes.map(code => {
    const s = scenarioMap[code];
    const successAttemptIndex = s.attempts.findIndex(a => a.is_success);
    return {
      scenario_code: code,
      scenario_title: s.scenario_title,
      total_attempts: s.total_attempts,
      successful_attempt_number: successAttemptIndex >= 0 ? successAttemptIndex + 1 : null,
      total_time_ms: s.total_time_ms,
      avg_time_ms: s.total_attempts > 0 ? Math.round(s.total_time_ms / s.total_attempts) : 0,
      final_success: s.final_success
    };
  });

  // 4. 生成 error_distribution（錯誤類型分佈 — 按紅旗類別細分）
  const errorCounts = {};
  let totalErrors = 0;
  
  attempts.forEach(attempt => {
    const details = attempt.error_details;
    if (!details) return;

    // phase2-3: 若有 missing_targets，按每個紅旗的 category 分類計數
    if (details.missing_targets && details.missing_targets.length > 0) {
      details.missing_targets.forEach(mt => {
        const cat = mt.category || 'unknown';
        errorCounts[cat] = errorCounts[cat] || { count: 0, targets: [] };
        errorCounts[cat].count += 1;
        // 記錄具體漏掉的 target id（去重）
        if (!errorCounts[cat].targets.includes(mt.id)) {
          errorCounts[cat].targets.push(mt.id);
        }
        totalErrors++;
      });
    }

    // 其他關卡: 統計 stage_errors 中的 error_type
    if (details.stage_errors) {
      details.stage_errors.forEach(se => {
        if (se.error_type) {
          const errType = se.error_type;
          errorCounts[errType] = errorCounts[errType] || { count: 0 };
          errorCounts[errType].count += 1;
          totalErrors++;
        }
      });
    }

    // 其他關卡: 統計頂層 error_type（排除 incomplete_red_flag_detection 和 none）
    if (details.error_type && details.error_type !== 'incomplete_red_flag_detection' && details.error_type !== 'none') {
      const errType = details.error_type;
      errorCounts[errType] = errorCounts[errType] || { count: 0 };
      errorCounts[errType].count += 1;
      totalErrors++;
    }
  });
  
  const error_distribution = {};
  Object.entries(errorCounts).forEach(([key, val]) => {
    error_distribution[key] = {
      count: val.count,
      percentage: totalErrors > 0 ? parseFloat(((val.count / totalErrors) * 100).toFixed(2)) : 0,
      ...(val.targets ? { targets: val.targets } : {}),
    };
  });

  // 5. 生成 skill_grading（能力維度評分）
  const totalAttempts = attempts.length;
  const successAttempts = attempts.filter(a => a.is_success);
  const totalTimeMs = attempts.reduce((sum, a) => sum + (a.duration_ms || 0), 0);
  
  // 計算各維度
  const successRate = totalAttempts > 0 ? (successAttempts.length / totalAttempts) * 100 : 0;
  
  // 反應速度：平均答題時間，越短越好
  const avgTimeMs = totalAttempts > 0 ? totalTimeMs / totalAttempts : 0;
  // 假設 < 30s = 100分, 30-60s = 80分, 60-120s = 60分, > 120s = 40分
  let reactionScore;
  if (avgTimeMs < 30000) reactionScore = 95;
  else if (avgTimeMs < 60000) reactionScore = 80;
  else if (avgTimeMs < 120000) reactionScore = 65;
  else if (avgTimeMs < 180000) reactionScore = 50;
  else reactionScore = 35;
  
  // 準確度：成功率為主
  const accuracyScore = Math.round(successRate);
  
  // 一致性：首次通過率（每關第一次就通過的比率）
  let firstTrySuccess = 0;
  allScenarioCodes.forEach(code => {
    const s = scenarioMap[code];
    if (s.attempts.length > 0 && s.attempts[0].is_success) {
      firstTrySuccess++;
    }
  });
  const consistencyScore = Math.round((firstTrySuccess / allScenarioCodes.length) * 100);
  
  const getLevel = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'needs_improvement';
  };

  const skill_grading = {
    reaction_speed: { score: reactionScore, level: getLevel(reactionScore) },
    accuracy: { score: accuracyScore, level: getLevel(accuracyScore) },
    consistency: { score: consistencyScore, level: getLevel(consistencyScore) }
  };

  // 6. 計算挫折指數（越多重複失敗越高）
  let totalRepeatedFails = 0;
  allScenarioCodes.forEach(code => {
    const s = scenarioMap[code];
    const fails = s.total_attempts - s.successful_attempts;
    if (fails > 1) totalRepeatedFails += (fails - 1);
  });
  const frustration_index = parseFloat(Math.min(totalRepeatedFails * 10, 100).toFixed(2));

  // 7. 計算時間跨度
  const firstAttempt = attempts[0]; // 已按 created_at 排序
  const lastAttempt = attempts[attempts.length - 1];
  const firstDate = new Date(firstAttempt.start_time);
  const lastDate = new Date(lastAttempt.end_time || lastAttempt.start_time);
  const totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  // 8. 組裝報告數據
  const now = getLocalTimestamp();
  const reportData = {
    user_id: userId,
    total_scenarios_completed: allScenarioCodes.filter(c => scenarioMap[c].final_success).length,
    total_time_ms: totalTimeMs,
    total_days_to_complete: totalDays,
    first_attempt_at: firstAttempt.start_time,
    last_completed_at: lastAttempt.end_time || lastAttempt.start_time,
    overall_success_rate: parseFloat(successRate.toFixed(2)),
    performance_summary,
    error_distribution,
    skill_grading,
    generated_at: now,
    updated_at: now
  };

  console.log('📝 Report data prepared:', {
    total_scenarios_completed: reportData.total_scenarios_completed,
    total_time_ms: reportData.total_time_ms,
    overall_success_rate: reportData.overall_success_rate,
    total_days: totalDays
  });

  // 9. 寫入 user_final_reports（upsert）
  const { data: report, error: reportError } = await supabaseAdmin
    .from('user_final_reports')
    .upsert(reportData, { onConflict: 'user_id' })
    .select()
    .single();

  if (reportError) throw reportError;
  console.log('✅ Final report saved, report_id:', report.report_id);

  // 10. 刪除該用戶的 user_attempts 紀錄
  const { error: deleteAttemptsError } = await supabaseAdmin
    .from('user_attempts')
    .delete()
    .eq('user_id', userId);

  if (deleteAttemptsError) {
    console.error('⚠️ Failed to delete user_attempts:', deleteAttemptsError);
  } else {
    console.log('🗑️ Deleted user_attempts for user:', userId);
  }

  // 11. 刪除該用戶的 user_progress 紀錄
  const { error: deleteProgressError } = await supabaseAdmin
    .from('user_progress')
    .delete()
    .eq('user_id', userId);

  if (deleteProgressError) {
    console.error('⚠️ Failed to delete user_progress:', deleteProgressError);
  } else {
    console.log('🗑️ Deleted user_progress for user:', userId);
  }

  return report;
};

export default supabase;