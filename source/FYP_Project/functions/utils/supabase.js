import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
// Cloudflare Functions 使用 env 变量，不需要 dotenv
// 从环境变量获取配置（在 Cloudflare Pages 中设置）
const getEnv = () => {
  // 在 Cloudflare Functions 中，环境变量通过 env 参数传递
  // 这里我们使用全局的 process.env 或通过函数参数传入
  return {
    SUPABASE_URL: typeof process !== 'undefined' ? process.env.SUPABASE_URL : null,
    SUPABASE_ANON_KEY: typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : null,
    SUPABASE_SERVICE_ROLE_KEY: typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : null,
  };
};

// 設定時區 (香港時間 UTC+8)
const TIMEZONE_OFFSET = 8; // 小時

// 獲取帶時區的時間戳字符串
export const getLocalTimestamp = () => {
  const now = new Date();
  // 加上時區偏移
  const localTime = new Date(now.getTime() + TIMEZONE_OFFSET * 60 * 60 * 1000);
  return localTime.toISOString().replace('Z', '+08:00');
};

// 初始化 Supabase 客户端（需要传入 env）
export const initSupabase = (env) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = env || getEnv();
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables!');
  }

  // 一般用戶操作（受 RLS 限制）
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Admin 操作（繞過 RLS）
  const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : supabase; // Fallback to anon if no service key
=======
/**
 * 內部工具：初始化 Supabase 客戶端
 * Cloudflare Pages Functions 只能使用 context.env；本機 Node 測試可 fallback 到 process.env
 */
const getSupabase = (env) => {
  const url =
    env?.SUPABASE_URL ||
    (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined);
  const anonKey =
    env?.SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined);
  const serviceKey =
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);

  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration!');
  }

  // 一般用戶客戶端
  const supabase = createClient(url, anonKey);
  
  // 管理員客戶端（如果有 service key）
  const supabaseAdmin = serviceKey ? createClient(url, serviceKey) : supabase;
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517

  return { supabase, supabaseAdmin };
};

<<<<<<< HEAD
// ===== 用戶相關操作 =====

// 根據用戶名查找用戶（用於檢查唯一性和登入）
export const getUserByUsername = async (username, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = 沒有找到記錄
  return data;
};

// 檢查用戶名是否已存在
export const checkUsernameExists = async (username, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('user_id')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

export const createUser = async (username, language = 'chinese', consent = true, hasExperience = false, env) => {
  const { supabaseAdmin } = initSupabase(env);
  // 檢查用戶名是否已存在
  const exists = await checkUsernameExists(username, env);
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

export const getUser = async (userId, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

=======
// 使用標準 UTC ISO 字串，避免時區導致的負數 duration_ms
export const getLocalTimestamp = () => {
  return new Date().toISOString();
};

// ===== 1. 遊戲與場景相關 (GET) =====

export const getPhases = async (env) => {
  try {
    const { supabase } = getSupabase(env);
    const { data, error } = await supabase.from('phases').select('*').eq('is_active', true).order('display_order');
    if (error) {
      console.error('[getPhases] Supabase error:', error);
      throw new Error(`Failed to fetch phases: ${error.message || JSON.stringify(error)}`);
    }
    return data || [];
  } catch (err) {
    console.error('[getPhases] Error:', err);
    throw err;
  }
};

export const getAllScenarios = async (env) => {
  try {
    const { supabaseAdmin } = getSupabase(env);
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .select(`
        *,
        scenario_types (type_code, name_zh, name_en),
        phases (phase_code, title_zh, title_en)
      `)
      .order('display_order');
    if (error) {
      console.error('[getAllScenarios] Supabase error:', error);
      throw new Error(`Failed to fetch scenarios: ${error.message || JSON.stringify(error)}`);
    }
    return data || [];
  } catch (err) {
    console.error('[getAllScenarios] Error:', err);
    throw err;
  }
};

export const getScenario = async (code, env) => {
  const { supabase } = getSupabase(env);
  const { data, error } = await supabase
    .from('scenarios')
    .select(`
      *,
      scenario_types (type_code, name_zh, name_en, component_name),
      phases (phase_code, title_zh, title_en)
    `)
    .eq('scenario_code', code)
    .single();
  if (error) throw error;
  return data;
};

export const getScenariosByPhase = async (phaseId, env) => {
  const { supabase } = getSupabase(env);
  const { data, error } = await supabase.from('scenarios').select('*').eq('phase_id', phaseId).order('display_order');
  if (error) throw error;
  return data;
};

export const getScenarioTypes = async (env) => {
  const { supabase } = getSupabase(env);
  const { data, error } = await supabase.from('scenario_types').select('*');
  if (error) throw error;
  return data;
};

// ===== 2. 用戶相關 =====

export const checkUsernameExists = async (username, env) => {
  try {
    const { supabaseAdmin } = getSupabase(env);
    const { data, error } = await supabaseAdmin.from('users').select('user_id').eq('username', username).single();
    // PGRST116 是 "not found" 錯誤，這是正常的（用戶名不存在）
    if (error && error.code !== 'PGRST116') {
      console.error('[checkUsernameExists] Supabase error:', error);
      throw new Error(`Failed to check username: ${error.message || JSON.stringify(error)}`);
    }
    return !!data;
  } catch (err) {
    console.error('[checkUsernameExists] Error:', err);
    throw err;
  }
};

export const getUserByUsername = async (username, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('username', username).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createUser = async (username, language, consent, hasExperience, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').insert({
    username, preferred_language: language, consent_given: consent, has_experience: hasExperience, current_scenario_code: 'phase1-1'
  }).select().single();
  if (error) throw error;
  return data;
};

export const getUser = async (userId, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('user_id', userId).single();
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  if (error) throw error;
  return data;
};

export const getAllUsers = async (env) => {
<<<<<<< HEAD
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

=======
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  if (error) throw error;
  return data;
};

export const searchUsers = async (query, env) => {
<<<<<<< HEAD
  const { supabaseAdmin } = initSupabase(env);
  const trimmed = (query || '').trim();
  if (!trimmed) return getAllUsers(env);

  // Escape ilike wildcard characters to prevent pattern injection
  const escaped = trimmed.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

  // Search by username (ilike for partial match)
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .ilike('username', `%${escaped}%`)
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

export const updateLastLogin = async (userId, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { error } = await supabaseAdmin
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
};

// 刪除用戶及其所有關聯數據
export const deleteUserAndData = async (userId, env) => {
  const { supabaseAdmin } = initSupabase(env);
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

export const getPhases = async (env) => {
  const { supabase } = initSupabase(env);
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

=======
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('*').ilike('username', `%${query}%`);
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  if (error) throw error;
  return data;
};

<<<<<<< HEAD
export const createPhase = async (phaseData, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('phases')
    .insert(phaseData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePhase = async (phaseId, phaseData, env) => {
  const { supabaseAdmin } = initSupabase(env);
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

export const getScenariosByPhase = async (phaseId, env) => {
  const { supabase } = initSupabase(env);
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

export const getScenario = async (scenarioCode, env) => {
  const { supabase } = initSupabase(env);
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

export const getAllScenarios = async (env) => {
  const { supabaseAdmin } = initSupabase(env);
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

export const createScenario = async (scenarioData, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('scenarios')
    .insert(scenarioData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateScenario = async (scenarioId, scenarioData, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('scenarios')
    .update(scenarioData)
    .eq('scenario_id', scenarioId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteScenario = async (scenarioId, env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { error } = await supabaseAdmin
    .from('scenarios')
    .delete()
    .eq('scenario_id', scenarioId);

  if (error) throw error;
};

// ===== 場景類型操作 =====

export const getScenarioTypes = async (env) => {
  const { supabase } = initSupabase(env);
  const { data, error } = await supabase
    .from('scenario_types')
    .select('*');

  if (error) throw error;
  return data;
};

// ===== 用戶進度操作 =====

export const getUserProgress = async (userId, env) => {
  const { supabaseAdmin } = initSupabase(env);
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

export const updateProgress = async (userId, scenarioId, status, env) => {
  console.log(`🔄 Supabase updateProgress: userId=${userId}, scenarioCode=${scenarioId}, status=${status}`);
  const { supabaseAdmin } = initSupabase(env);
  
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

export const startAttempt = async (userId, scenarioId, sessionId, env) => {
  const { supabaseAdmin } = initSupabase(env);
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

export const completeAttempt = async (attemptId, isSuccess, errorDetails = null, env) => {
  const { supabaseAdmin } = initSupabase(env);
  // 使用本地時區時間 (香港 UTC+8)
  const endTime = getLocalTimestamp();
  const endTimeDate = new Date();
  
=======
// ===== 3. 進度與嘗試相關 =====

export const getUserProgress = async (userId, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('current_scenario_code').eq('user_id', userId).single();
  if (error) throw error;
  return data;
};

export const updateProgress = async (userId, scenarioId, status, env) => {
  if (status !== 'current') return { success: true };
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').update({ current_scenario_code: scenarioId }).eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const getUserAttempts = async (userId, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('user_attempts')
    .select('*, scenarios(scenario_id, scenario_code, title_zh, title_en)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const startAttempt = async (userId, scenarioId, sessionId, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('user_attempts').insert({
    user_id: userId, scenario_id: scenarioId, session_id: sessionId, start_time: getLocalTimestamp()
  }).select().single();
  if (error) throw error;
  return data;
};

export const completeAttempt = async (attemptId, isSuccess, errorDetails, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const endTime = getLocalTimestamp();
  const endTimeDate = new Date();

>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  const { data: attempt, error: fetchError } = await supabaseAdmin
    .from('user_attempts')
    .select('start_time, error_details')
    .eq('attempt_id', attemptId)
    .single();

<<<<<<< HEAD
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

=======
  if (fetchError || !attempt) throw fetchError || new Error('Attempt not found');

  const startTime = new Date(attempt.start_time);
  let durationMs = endTimeDate.getTime() - startTime.getTime();
  // 防止負數 duration（舊資料或時區問題）
  if (durationMs < 0) durationMs = 0;

  const existingErrors = attempt.error_details || {};
  const hasStageErrors = existingErrors.stage_errors && existingErrors.stage_errors.length > 0;
  const finalErrorDetails = (hasStageErrors || errorDetails)
    ? { ...(errorDetails || {}), stage_errors: existingErrors.stage_errors || [] }
    : errorDetails;

  const { data, error } = await supabaseAdmin.from('user_attempts').update({
    end_time: endTime,
    duration_ms: durationMs,
    is_success: isSuccess,
    error_details: finalErrorDetails
  }).eq('attempt_id', attemptId).select().single();
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  if (error) throw error;
  return data;
};

<<<<<<< HEAD
// 記錄 stage 錯誤（不結束 attempt）
export const recordStageError = async (attemptId, stageError, env) => {
  const { supabaseAdmin } = initSupabase(env);
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

export const getUserAttempts = async (userId, env) => {
  const { supabaseAdmin } = initSupabase(env);
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

export const getAllFinalReports = async (env) => {
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('user_final_reports')
    .select('*, users(username)')
    .order('generated_at', { ascending: false });

=======
export const recordStageError = async (attemptId, stageError, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data: current } = await supabaseAdmin.from('user_attempts').select('error_details').eq('attempt_id', attemptId).single();
  const newErrors = [...(current?.error_details?.stage_errors || []), stageError];
  const { data, error } = await supabaseAdmin.from('user_attempts').update({ 
    error_details: { ...current?.error_details, stage_errors: newErrors } 
  }).eq('attempt_id', attemptId);
  if (error) throw error;
  return data;
};

// ===== 3.5 統計 API =====

export const getUserStatistics = async (userId, env) => {
  const attempts = await getUserAttempts(userId, env);
  if (!attempts || attempts.length === 0) {
    return {
      overall: {
        total_attempts: 0,
        success_attempts: 0,
        failed_attempts: 0,
        success_rate: 0,
        avg_time_ms: 0,
        total_time_ms: 0
      },
      by_scenario: []
    };
  }

  const totalAttempts = attempts.length;
  const successAttempts = attempts.filter(a => a.is_success).length;
  const failedAttempts = totalAttempts - successAttempts;
  const successRate = totalAttempts > 0 ? parseFloat((successAttempts / totalAttempts * 100).toFixed(2)) : 0;

  // 只計算正數 duration_ms，避免負數影響
  const totalTime = attempts.reduce((sum, a) => {
    const d = a.duration_ms || 0;
    return sum + (d > 0 ? d : 0);
  }, 0);
  const avgTimeMs = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0;

  const scenarioStats = {};
  attempts.forEach(attempt => {
    const code = attempt.scenarios?.scenario_code || 'unknown';
    if (!scenarioStats[code]) {
      scenarioStats[code] = {
        scenario_code: code,
        scenario_title_zh: attempt.scenarios?.title_zh,
        scenario_title_en: attempt.scenarios?.title_en,
        total_attempts: 0,
        success_count: 0,
        fail_count: 0,
        total_time_ms: 0,
        avg_time_ms: 0,
        fastest_time_ms: null,
        slowest_time_ms: null,
        error_types: {}
      };
    }

    const stat = scenarioStats[code];
    stat.total_attempts++;

    if (attempt.is_success) {
      stat.success_count++;
    } else {
      stat.fail_count++;
      if (attempt.error_details?.error_type) {
        const errorType = attempt.error_details.error_type;
        stat.error_types[errorType] = (stat.error_types[errorType] || 0) + 1;
      }
    }

    const d = attempt.duration_ms || 0;
    if (d > 0) {
      stat.total_time_ms += d;
      if (stat.fastest_time_ms === null || d < stat.fastest_time_ms) {
        stat.fastest_time_ms = d;
      }
      if (stat.slowest_time_ms === null || d > stat.slowest_time_ms) {
        stat.slowest_time_ms = d;
      }
    }
  });

  Object.values(scenarioStats).forEach(stat => {
    if (stat.total_attempts > 0) {
      stat.avg_time_ms = Math.round(stat.total_time_ms / stat.total_attempts);
      stat.success_rate = parseFloat(((stat.success_count / stat.total_attempts) * 100).toFixed(2));
    }
  });

  return {
    overall: {
      total_attempts: totalAttempts,
      success_attempts: successAttempts,
      failed_attempts: failedAttempts,
      success_rate: successRate,
      avg_time_ms: avgTimeMs,
      total_time_ms: totalTime
    },
    by_scenario: Object.values(scenarioStats)
  };
};

export const getScenarioStatistics = async (userId, scenarioCode, env) => {
  const attempts = await getUserAttempts(userId, env);
  const scenarioAttempts = attempts.filter(a => a.scenarios?.scenario_code === scenarioCode);

  if (scenarioAttempts.length === 0) {
    return {
      scenario_code: scenarioCode,
      total_attempts: 0,
      success_count: 0,
      fail_count: 0,
      attempts: []
    };
  }

  const attemptsList = scenarioAttempts.map(a => ({
    attempt_id: a.attempt_id,
    is_success: a.is_success,
    start_time: a.start_time,
    end_time: a.end_time,
    duration_ms: a.duration_ms > 0 ? a.duration_ms : null,
    error_details: a.error_details
  }));

  return {
    scenario_code: scenarioCode,
    total_attempts: scenarioAttempts.length,
    success_count: scenarioAttempts.filter(a => a.is_success).length,
    fail_count: scenarioAttempts.filter(a => !a.is_success).length,
    attempts: attemptsList
  };
};

// ===== 4. 報告與後台管理 =====

export const getAllFinalReports = async (env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('user_final_reports').select('*, users(username)');
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  if (error) throw error;
  return data;
};

export const getUserFinalReport = async (userId, env) => {
<<<<<<< HEAD
  const { supabaseAdmin } = initSupabase(env);
  const { data, error } = await supabaseAdmin
    .from('user_final_reports')
    .select('*')
    .eq('user_id', userId)
    .single();

=======
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('user_final_reports').select('*').eq('user_id', userId).single();
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateReportAIAnalysis = async (userId, aiAnalysis, env) => {
<<<<<<< HEAD
  const { supabaseAdmin } = initSupabase(env);
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

export const generateFinalReport = async (userId, env) => {
  const { supabaseAdmin } = initSupabase(env);
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
=======
  const { supabaseAdmin } = getSupabase(env);
  
  // 確保 aiAnalysis 是有效的 JSON 對象
  if (!aiAnalysis || typeof aiAnalysis !== 'object') {
    throw new Error('Invalid AI analysis data: must be an object');
  }
  
  // 檢查數據大小（PostgreSQL JSONB 有大小限制）
  const jsonSize = JSON.stringify(aiAnalysis).length;
  if (jsonSize > 1000000) { // 1MB limit
    console.warn(`[updateReportAIAnalysis] AI analysis data is large: ${jsonSize} bytes`);
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_final_reports')
    .update({ 
      ai_analysis_result: aiAnalysis, 
      updated_at: getLocalTimestamp() 
    })
    .eq('user_id', userId)
    .select();
    
  if (error) {
    console.error('[updateReportAIAnalysis] Database error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      userId
    });
    throw error;
  }
  
  // 如果沒有更新任何行，可能是報告不存在
  if (!data || data.length === 0) {
    console.warn(`[updateReportAIAnalysis] No report found for user ${userId}, update had no effect`);
    // 不拋出錯誤，因為報告可能正在生成中
  }
  
  return data;
};

// scenario_code 別名對應（舊格式 -> 新格式）
const SCENARIO_CODE_ALIASES = {
  'malicious-auth': 'phase2-1',
  'judge-auth': 'phase2-2',
  'phase2-danger-auth': 'phase2-3',
};

const normalizeScenarioCode = (code) => SCENARIO_CODE_ALIASES[code] || code;

export const generateFinalReport = async (userId, env) => {
  const { supabaseAdmin } = getSupabase(env);

  const { data: attempts, error: attemptsError } = await supabaseAdmin
    .from('user_attempts')
    .select('*, scenarios(scenario_id, scenario_code, title_zh, title_en, phase_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (attemptsError) {
    console.error('[generateFinalReport] Error fetching attempts:', attemptsError);
    throw attemptsError;
  }
  
  if (!attempts || attempts.length === 0) {
    console.warn('[generateFinalReport] No attempts found for user:', userId);
    // 返回一個空的報告而不是拋出錯誤
    const now = getLocalTimestamp();
    const emptyReport = {
      user_id: userId,
      total_scenarios_completed: 0,
      total_time_ms: 0,
      total_days_to_complete: 0,
      first_attempt_at: null,
      last_completed_at: null,
      overall_success_rate: 0,
      performance_summary: [],
      error_distribution: {},
      skill_grading: {
        reaction_speed: { score: 0, level: 'needs_improvement' },
        accuracy: { score: 0, level: 'needs_improvement' },
        consistency: { score: 0, level: 'needs_improvement' }
      },
      frustration_index: 0,
      generated_at: now,
      updated_at: now
    };
    
    const { data: report, error: reportError } = await supabaseAdmin
      .from('user_final_reports')
      .upsert(emptyReport, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (reportError) throw reportError;
    return report;
  }

>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  const allScenarioCodes = [
    'phase1-1', 'phase1-2', 'phase1-3', 'phase1-4', 'phase1-5', 'phase1-6',
    'phase2-1', 'phase2-2', 'phase2-3'
  ];
<<<<<<< HEAD
  
  // 初始化所有9關
=======

  const scenarioMap = {};
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
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

<<<<<<< HEAD
  // 填充實際數據
  attempts.forEach(attempt => {
    const code = attempt.scenarios?.scenario_code || 'unknown';
    if (!scenarioMap[code]) return;
    
    scenarioMap[code].scenario_title = attempt.scenarios?.title_zh || code;
    scenarioMap[code].attempts.push(attempt);
    scenarioMap[code].total_attempts++;
    scenarioMap[code].total_time_ms += (attempt.duration_ms || 0);
    
=======
  attempts.forEach(attempt => {
    const rawCode = attempt.scenarios?.scenario_code || 'unknown';
    const code = normalizeScenarioCode(rawCode);
    if (!scenarioMap[code]) return;

    scenarioMap[code].scenario_title = attempt.scenarios?.title_zh || code;
    scenarioMap[code].attempts.push(attempt);
    scenarioMap[code].total_attempts++;
    scenarioMap[code].total_time_ms += Math.max(0, attempt.duration_ms || 0);
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
    if (attempt.is_success) {
      scenarioMap[code].successful_attempts++;
      scenarioMap[code].final_success = true;
    }
  });

<<<<<<< HEAD
  // 3. 生成 performance_summary（每關表現摘要）
=======
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
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

<<<<<<< HEAD
  // 4. 生成 error_distribution（錯誤類型分佈 — 按紅旗類別細分）
  const errorCounts = {};
  let totalErrors = 0;
  
=======
  const errorCounts = {};
  let totalErrors = 0;
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  attempts.forEach(attempt => {
    const details = attempt.error_details;
    if (!details) return;

<<<<<<< HEAD
    // phase2-3: 若有 missing_targets，按每個紅旗的 category 分類計數
=======
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
    if (details.missing_targets && details.missing_targets.length > 0) {
      details.missing_targets.forEach(mt => {
        const cat = mt.category || 'unknown';
        errorCounts[cat] = errorCounts[cat] || { count: 0, targets: [] };
        errorCounts[cat].count += 1;
<<<<<<< HEAD
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
=======
        if (!errorCounts[cat].targets.includes(mt.id)) errorCounts[cat].targets.push(mt.id);
        totalErrors++;
      });
    }
    if (details.stage_errors) {
      details.stage_errors.forEach(se => {
        if (se.error_type) {
          errorCounts[se.error_type] = errorCounts[se.error_type] || { count: 0 };
          errorCounts[se.error_type].count += 1;
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
          totalErrors++;
        }
      });
    }
<<<<<<< HEAD

    // 其他關卡: 統計頂層 error_type（排除 incomplete_red_flag_detection 和 none）
    if (details.error_type && details.error_type !== 'incomplete_red_flag_detection' && details.error_type !== 'none') {
      const errType = details.error_type;
      errorCounts[errType] = errorCounts[errType] || { count: 0 };
      errorCounts[errType].count += 1;
      totalErrors++;
    }
  });
  
=======
    if (details.error_type && details.error_type !== 'incomplete_red_flag_detection' && details.error_type !== 'none') {
      errorCounts[details.error_type] = errorCounts[details.error_type] || { count: 0 };
      errorCounts[details.error_type].count += 1;
      totalErrors++;
    }
  });

>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  const error_distribution = {};
  Object.entries(errorCounts).forEach(([key, val]) => {
    error_distribution[key] = {
      count: val.count,
      percentage: totalErrors > 0 ? parseFloat(((val.count / totalErrors) * 100).toFixed(2)) : 0,
      ...(val.targets ? { targets: val.targets } : {}),
    };
  });

<<<<<<< HEAD
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
=======
  const totalTimeMs = attempts.reduce((sum, a) => sum + Math.max(0, a.duration_ms || 0), 0);
  const successAttempts = attempts.filter(a => a.is_success);
  const successRate = attempts.length > 0 ? (successAttempts.length / attempts.length) * 100 : 0;

  let firstTrySuccess = 0;
  allScenarioCodes.forEach(code => {
    const s = scenarioMap[code];
    if (s.attempts.length > 0 && s.attempts[0].is_success) firstTrySuccess++;
  });
  const avgTimeMs = attempts.length > 0 ? totalTimeMs / attempts.length : 0;
  let reactionScore = avgTimeMs < 30000 ? 95 : avgTimeMs < 60000 ? 80 : avgTimeMs < 120000 ? 65 : avgTimeMs < 180000 ? 50 : 35;
  const getLevel = (score) => score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'average' : 'needs_improvement';

>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  let totalRepeatedFails = 0;
  allScenarioCodes.forEach(code => {
    const s = scenarioMap[code];
    const fails = s.total_attempts - s.successful_attempts;
    if (fails > 1) totalRepeatedFails += (fails - 1);
  });
  const frustration_index = parseFloat(Math.min(totalRepeatedFails * 10, 100).toFixed(2));

<<<<<<< HEAD
  // 7. 計算時間跨度
  const firstAttempt = attempts[0]; // 已按 created_at 排序
  const lastAttempt = attempts[attempts.length - 1];
  const firstDate = new Date(firstAttempt.start_time);
  const lastDate = new Date(lastAttempt.end_time || lastAttempt.start_time);
  const totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  // 8. 組裝報告數據
=======
  const skill_grading = {
    reaction_speed: { score: reactionScore, level: getLevel(reactionScore) },
    accuracy: { score: Math.round(successRate), level: getLevel(successRate) },
    consistency: { score: Math.round((firstTrySuccess / allScenarioCodes.length) * 100), level: getLevel((firstTrySuccess / allScenarioCodes.length) * 100) }
  };

  const firstAttempt = attempts[0];
  const lastAttempt = attempts[attempts.length - 1];
  
  // 安全處理日期
  let firstAttemptAt = null;
  let lastCompletedAt = null;
  let totalDays = 0;
  
  if (firstAttempt?.start_time) {
    try {
      firstAttemptAt = firstAttempt.start_time;
      const firstDate = new Date(firstAttemptAt);
      if (lastAttempt?.end_time || lastAttempt?.start_time) {
        lastCompletedAt = lastAttempt.end_time || lastAttempt.start_time;
        const lastDate = new Date(lastCompletedAt);
        if (!isNaN(firstDate.getTime()) && !isNaN(lastDate.getTime())) {
          totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
        }
      }
    } catch (dateError) {
      console.error('[generateFinalReport] Date parsing error:', dateError);
    }
  }

>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  const now = getLocalTimestamp();
  const reportData = {
    user_id: userId,
    total_scenarios_completed: allScenarioCodes.filter(c => scenarioMap[c].final_success).length,
    total_time_ms: totalTimeMs,
    total_days_to_complete: totalDays,
<<<<<<< HEAD
    first_attempt_at: firstAttempt.start_time,
    last_completed_at: lastAttempt.end_time || lastAttempt.start_time,
=======
    first_attempt_at: firstAttemptAt,
    last_completed_at: lastCompletedAt,
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
    overall_success_rate: parseFloat(successRate.toFixed(2)),
    performance_summary,
    error_distribution,
    skill_grading,
<<<<<<< HEAD
=======
    frustration_index,
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
    generated_at: now,
    updated_at: now
  };

<<<<<<< HEAD
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

=======
  try {
    const { data: report, error: reportError } = await supabaseAdmin
      .from('user_final_reports')
      .upsert(reportData, { onConflict: 'user_id' })
      .select()
      .single();

    if (reportError) {
      console.error('[generateFinalReport] Error saving report:', reportError);
      throw reportError;
    }
    
    return report;
  } catch (error) {
    console.error('[generateFinalReport] Failed to generate report:', error);
    throw error;
  }
};

export const deleteUserAndData = async (userId, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { error } = await supabaseAdmin.from('users').delete().eq('user_id', userId);
  if (error) throw error;
  return { success: true };
};

export const createScenario = async (data, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data: res, error } = await supabaseAdmin.from('scenarios').insert(data).select().single();
  if (error) throw error;
  return res;
};
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
