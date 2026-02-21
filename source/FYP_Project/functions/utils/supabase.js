import { createClient } from '@supabase/supabase-js';

/**
 * ?�部工具：�?始�? Supabase 客戶�?
 * Cloudflare Pages Functions ?�能使用 context.env；本�?Node 測試??fallback ??process.env
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

  // 一?�用?�客?�端
  const supabase = createClient(url, anonKey);
  
  // 管�??�客?�端（�??��? service key�?
  const supabaseAdmin = serviceKey ? createClient(url, serviceKey) : supabase;

  return { supabase, supabaseAdmin };
};

// 使用標�? UTC ISO 字串，避?��??�導致?��???duration_ms
export const getLocalTimestamp = () => {
  return new Date().toISOString();
};

// ===== 1. ?�戲?�場?�相??(GET) =====

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

// ===== 2. ?�戶?��? =====

export const checkUsernameExists = async (username, env) => {
  try {
    const { supabaseAdmin } = getSupabase(env);
    const { data, error } = await supabaseAdmin.from('users').select('user_id').eq('username', username).single();
    // PGRST116 ??"not found" ?�誤，這是�?��?��??�戶?��?存在�?
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
  if (error) throw error;
  return data;
};

export const getAllUsers = async (env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const searchUsers = async (query, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('*').ilike('username', `%${query}%`);
  if (error) throw error;
  return data;
};

// ===== 3. ?�度?��?試相??=====

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

  const { data: attempt, error: fetchError } = await supabaseAdmin
    .from('user_attempts')
    .select('start_time, error_details')
    .eq('attempt_id', attemptId)
    .single();

  if (fetchError || !attempt) throw fetchError || new Error('Attempt not found');

  const startTime = new Date(attempt.start_time);
  let durationMs = endTimeDate.getTime() - startTime.getTime();
  // ?�止負數 duration（�?資�??��??�?��?�?
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
  if (error) throw error;
  return data;
};

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

// ===== 3.5 統�? API =====

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

  // ?��?算正??duration_ms，避?��??�影??
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

// ===== 4. ?��??��??�管??=====

export const getAllFinalReports = async (env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('user_final_reports').select('*, users(username)');
  if (error) throw error;
  return data;
};

export const getUserFinalReport = async (userId, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('user_final_reports').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateReportAIAnalysis = async (userId, aiAnalysis, env) => {
  const { supabaseAdmin } = getSupabase(env);
  
  // 確�? aiAnalysis ?��??��? JSON 對象
  if (!aiAnalysis || typeof aiAnalysis !== 'object') {
    throw new Error('Invalid AI analysis data: must be an object');
  }
  
  // 檢查?��?大�?（PostgreSQL JSONB ?�大小�??��?
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
  
  // 如�?沒�??�新任�?行�??�能?�報?��?存在
  if (!data || data.length === 0) {
    console.warn(`[updateReportAIAnalysis] No report found for user ${userId}, update had no effect`);
    // 不�??�錯誤�??�為?��??�能�?��?��?�?
  }
  
  return data;
};

// scenario_code ?��?對�?（�??��? -> ?�格式�?
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
    // 返�?一?�空?�報?�而�??��??�錯�?
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

  const allScenarioCodes = [
    'phase1-1', 'phase1-2', 'phase1-3', 'phase1-4', 'phase1-5', 'phase1-6',
    'phase2-1', 'phase2-2', 'phase2-3'
  ];

  const scenarioMap = {};
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

  attempts.forEach(attempt => {
    const rawCode = attempt.scenarios?.scenario_code || 'unknown';
    const code = normalizeScenarioCode(rawCode);
    if (!scenarioMap[code]) return;

    scenarioMap[code].scenario_title = attempt.scenarios?.title_zh || code;
    scenarioMap[code].attempts.push(attempt);
    scenarioMap[code].total_attempts++;
    scenarioMap[code].total_time_ms += Math.max(0, attempt.duration_ms || 0);
    if (attempt.is_success) {
      scenarioMap[code].successful_attempts++;
      scenarioMap[code].final_success = true;
    }
  });

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

  const errorCounts = {};
  let totalErrors = 0;
  attempts.forEach(attempt => {
    const details = attempt.error_details;
    if (!details) return;

    if (details.missing_targets && details.missing_targets.length > 0) {
      details.missing_targets.forEach(mt => {
        const cat = mt.category || 'unknown';
        errorCounts[cat] = errorCounts[cat] || { count: 0, targets: [] };
        errorCounts[cat].count += 1;
        if (!errorCounts[cat].targets.includes(mt.id)) errorCounts[cat].targets.push(mt.id);
        totalErrors++;
      });
    }
    if (details.stage_errors) {
      details.stage_errors.forEach(se => {
        if (se.error_type) {
          errorCounts[se.error_type] = errorCounts[se.error_type] || { count: 0 };
          errorCounts[se.error_type].count += 1;
          totalErrors++;
        }
      });
    }
    if (details.error_type && details.error_type !== 'incomplete_red_flag_detection' && details.error_type !== 'none') {
      errorCounts[details.error_type] = errorCounts[details.error_type] || { count: 0 };
      errorCounts[details.error_type].count += 1;
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

  const skill_grading = {
    reaction_speed: { score: reactionScore, level: getLevel(reactionScore) },
    accuracy: { score: Math.round(successRate), level: getLevel(successRate) },
    consistency: { score: Math.round((firstTrySuccess / allScenarioCodes.length) * 100), level: getLevel((firstTrySuccess / allScenarioCodes.length) * 100) }
  };

  const firstAttempt = attempts[0];
  const lastAttempt = attempts[attempts.length - 1];
  
  // 安全?��??��?
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

  const now = getLocalTimestamp();
  const reportData = {
    user_id: userId,
    total_scenarios_completed: allScenarioCodes.filter(c => scenarioMap[c].final_success).length,
    total_time_ms: totalTimeMs,
    total_days_to_complete: totalDays,
    first_attempt_at: firstAttemptAt,
    last_completed_at: lastCompletedAt,
    overall_success_rate: parseFloat(successRate.toFixed(2)),
    performance_summary,
    error_distribution,
    skill_grading,
    generated_at: now,
    updated_at: now
  };

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

export const deleteUserAttempts = async (userId, env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { error, count } = await supabaseAdmin
    .from('user_attempts')
    .delete({ count: 'exact' })
    .eq('user_id', userId);
  if (error) throw error;
  console.log(`[deleteUserAttempts] Deleted ${count ?? 'unknown'} attempts for user ${userId}`);
  return { success: true, deleted_count: count };
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
