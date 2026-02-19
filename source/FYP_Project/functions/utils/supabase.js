import { createClient } from '@supabase/supabase-js';

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

  return { supabase, supabaseAdmin };
};

// 設定時區 (香港 UTC+8)
export const getLocalTimestamp = () => {
  const now = new Date();
  const localTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return localTime.toISOString().replace('Z', '+08:00');
};

// ===== 1. 遊戲與場景相關 (GET) =====

export const getPhases = async (env) => {
  const { supabase } = getSupabase(env);
  const { data, error } = await supabase.from('phases').select('*').eq('is_active', true).order('display_order');
  if (error) throw error;
  return data;
};

export const getAllScenarios = async (env) => {
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('scenarios').select('*, phases(title_zh, title_en)').order('display_order');
  if (error) throw error;
  return data;
};

export const getScenario = async (code, env) => {
  const { supabase } = getSupabase(env);
  const { data, error } = await supabase.from('scenarios').select('*, phases(*)').eq('scenario_code', code).single();
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
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('users').select('user_id').eq('username', username).single();
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
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
  const { data, error } = await supabaseAdmin.from('user_attempts').select('*, scenarios(title_zh, title_en)').eq('user_id', userId).order('created_at', { ascending: false });
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
  const { data, error } = await supabaseAdmin.from('user_attempts').update({
    end_time: getLocalTimestamp(), is_success: isSuccess, error_details: errorDetails
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

// ===== 4. 報告與後台管理 =====

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
  const { data, error } = await supabaseAdmin.from('user_final_reports').update({ 
    ai_analysis_result: aiAnalysis, updated_at: getLocalTimestamp() 
  }).eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const generateFinalReport = async (userId, env) => {
  // 簡化版邏輯，確保能匯出
  const attempts = await getUserAttempts(userId, env);
  const reportData = { user_id: userId, total_scenarios_completed: attempts.length, generated_at: getLocalTimestamp() };
  const { supabaseAdmin } = getSupabase(env);
  const { data, error } = await supabaseAdmin.from('user_final_reports').upsert(reportData).select().single();
  if (error) throw error;
  return data;
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