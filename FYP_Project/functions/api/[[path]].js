/**
 * Cloudflare Functions API 路由處理器
 * 處理所有 /api/* 請求並與 Supabase / DeepSeek 互動
 */

import {
  getPhases,
  getAllScenarios,
  getScenario,
  getScenariosByPhase,
  getScenarioTypes,
  getUserByUsername,
  checkUsernameExists,
  createUser,
  getUser,
  getAllUsers,
  searchUsers,
  getUserProgress,
  updateProgress,
  getUserAttempts,
  startAttempt,
  completeAttempt,
  recordStageError,
  getAllFinalReports,
  getUserFinalReport,
  updateReportAIAnalysis,
  generateFinalReport,
  deleteUserAndData,
  createScenario
} from '../utils/supabase.js';
import { generateAIAnalysis } from '../utils/deepseek.js';
import { verifyToken, verifyAdminPassword } from '../utils/auth.js'; // 引入修正後的 auth 模組

// ===== 跨域 (CORS) 設定 =====
const ALLOWED_ORIGINS = [
  'https://fyp-dadab.pages.dev',
  'https://fyp-admin.pages.dev',
  'http://localhost:5173',
  'http://localhost:5174',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ===== 工具函數 =====
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const jsonResponse = (data, status = 200, request) => new Response(JSON.stringify(data), {
  status,
  headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
});

const errorResponse = (message, status = 500, request) => {
  const safeMsg = status >= 500 ? 'Internal Server Error' : message;
  return jsonResponse({ error: safeMsg }, status, request);
};

const parseBody = async (request) => {
  try { return await request.json(); } catch { return null; }
};

// ===== 主入口函數 =====
export async function onRequest(context) {
  const { request, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: getCorsHeaders(request) });

  // 1. 封裝環境變數：確保 Supabase 工具能同時在前後端運行
  const envVars = {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
  };

  try {
    // 健康檢查
    if (pathname === '/api/health') return jsonResponse({ status: 'ok' }, 200, request);

    // 2. Admin 權限驗證 (排除登入接口)
    const isAdminRoute = pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login';
    if (isAdminRoute) {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      const adminPayload = await verifyToken(token, env.JWT_SECRET);
      
      if (!adminPayload || adminPayload.role !== 'admin') {
        return errorResponse('Admin authentication required', 401, request);
      }
    }

    // ===== 認證相關 API =====

    // POST /api/admin/login
    if (pathname === '/api/admin/login' && method === 'POST') {
      const { username, password } = await parseBody(request) || {};
      const token = await verifyAdminPassword(username, password, env);
      if (!token) return errorResponse('Invalid admin credentials', 401, request);
      return jsonResponse({ token }, 200, request);
    }

    // POST /api/users/login (一般用戶登入)
    if (pathname === '/api/users/login' && method === 'POST') {
      const { username } = await parseBody(request) || {};
      const user = await getUserByUsername(username?.trim(), envVars);
      if (!user) return errorResponse('User not found', 404, request);
      return jsonResponse(user, 200, request);
    }

    // ===== 遊戲與場景公開 API =====

    if (pathname === '/api/phases' && method === 'GET') return jsonResponse(await getPhases(envVars), 200, request);
    if (pathname === '/api/scenarios' && method === 'GET') return jsonResponse(await getAllScenarios(envVars), 200, request);

    // ===== 用戶與進度 API =====

    // GET /api/users/:userId/progress
    const progressMatch = pathname.match(/^\/api\/users\/([^/]+)\/progress$/);
    if (progressMatch && method === 'GET') {
      const userId = progressMatch[1];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);
      return jsonResponse(await getUserProgress(userId, envVars), 200, request);
    }

    // POST /api/users/:userId/progress
    if (progressMatch && method === 'POST') {
      const userId = progressMatch[1];
      const { scenarioId, status } = await parseBody(request) || {};
      return jsonResponse(await updateProgress(userId, scenarioId, status, envVars), 200, request);
    }

    // ===== 訓練報告與 AI 分析 (關鍵修正點) =====

    // POST /api/users/:userId/report/generate
    const reportGenMatch = pathname.match(/^\/api\/users\/([^/]+)\/report\/generate$/);
    if (reportGenMatch && method === 'POST') {
      const userId = reportGenMatch[1];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);

      // 第一步：生成基礎數據報告 (不可失敗)
      const report = await generateFinalReport(userId, envVars);

      // 第二步：異步生成 AI 分析，但不應阻塞主要報告回傳
      let aiResult = null;
      try {
        aiResult = await generateAIAnalysis(report, envVars);
        if (aiResult) await updateReportAIAnalysis(userId, aiResult, envVars);
      } catch (e) {
        console.error("AI Generation failed, returning base report:", e.message);
      }

      return jsonResponse({ ...report, ai_analysis: aiResult }, 200, request);
    }

    // GET /api/users/:userId/report (獲取已生成的報告)
    const reportGetMatch = pathname.match(/^\/api\/users\/([^/]+)\/report$/);
    if (reportGetMatch && method === 'GET') {
      const userId = reportGetMatch[1];
      const data = await getUserFinalReport(userId, envVars);
      if (!data) return errorResponse('Report not found', 404, request);
      return jsonResponse({ ...data, ai_analysis: data.ai_analysis_result }, 200, request);
    }

    // ===== Admin 專屬 API (由中間件攔截驗證) =====

    if (pathname === '/api/admin/users' && method === 'GET') return jsonResponse(await getAllUsers(envVars), 200, request);
    
    if (pathname === '/api/admin/users/search' && method === 'GET') {
      const query = searchParams.get('q');
      return jsonResponse(await searchUsers(query, envVars), 200, request);
    }

    if (pathname.match(/^\/api\/admin\/users\/[^/]+$/) && method === 'DELETE') {
      const userId = pathname.split('/').pop();
      return jsonResponse(await deleteUserAndData(userId, envVars), 200, request);
    }

    // 404 處理
    return errorResponse('Endpoint not found', 404, request);

  } catch (err) {
    console.error(`[API ERROR] ${pathname}:`, err);
    return errorResponse(err.message || 'Server error', 500, request);
  }
}