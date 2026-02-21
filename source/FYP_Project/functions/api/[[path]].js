/**
 * Cloudflare Functions API 路由處理器
 * 處理所有 /api/* 請求並與 Supabase / DeepSeek 互動
 */

import * as supabase from '../utils/supabase.js';
import { generateAIAnalysis } from '../utils/deepseek.js';
import { verifyToken, verifyAdminPassword } from '../utils/auth.js'; // 引入修正後的 auth 模組

// ===== 跨域 (CORS) 設定 =====
const ALLOWED_ORIGINS = [
  'https://d168758a.fypt-2re.pages.dev',
  'https://fyp-dadab.pages.dev',
  'https://fyp-admin.pages.dev',
  'http://localhost:5173',
  'http://localhost:5174',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  // 支援所有 Cloudflare Pages 域名（*.pages.dev）
  const isCloudflarePages = origin.includes('.pages.dev');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) || isCloudflarePages 
    ? origin 
    : ALLOWED_ORIGINS[0];
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

  // 檢查模組是否正確導入（在 try-catch 外先檢查，避免模組導入失敗）
  try {
    if (typeof supabase === 'undefined' || typeof supabase.getPhases !== 'function') {
      console.error('[MODULE CHECK] supabase module not loaded correctly:', {
        supabase: typeof supabase,
        hasGetPhases: typeof supabase?.getPhases,
      });
      return errorResponse('Server configuration error: Supabase module not loaded', 500, request);
    }
  } catch (moduleErr) {
    console.error('[MODULE IMPORT ERROR]', moduleErr);
    return errorResponse('Server configuration error: Failed to import modules', 500, request);
  }

  // 1. 封裝環境變數：確保 Supabase 工具能同時在前後端運行
  const envVars = {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
  };

  // 檢查必要的環境變數（健康檢查除外）
  const checkEnvVars = () => {
    if (!envVars.SUPABASE_URL || !envVars.SUPABASE_ANON_KEY) {
      const errorMsg = `Missing Supabase configuration: SUPABASE_URL=${!!envVars.SUPABASE_URL}, SUPABASE_ANON_KEY=${!!envVars.SUPABASE_ANON_KEY}`;
      console.error('[ENV CHECK FAILED]', errorMsg);
      throw new Error(errorMsg);
    }
  };

  try {
    // 健康檢查
    if (pathname === '/api/health') {
      // 健康檢查時也檢查環境變數狀態和模組狀態
      const envStatus = {
        SUPABASE_URL: !!envVars.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!envVars.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!envVars.SUPABASE_SERVICE_ROLE_KEY,
        urlLength: envVars.SUPABASE_URL?.length || 0,
        anonKeyLength: envVars.SUPABASE_ANON_KEY?.length || 0,
      };
      
      // 檢查模組
      const moduleStatus = {
        supabaseModuleLoaded: typeof supabase !== 'undefined',
        hasGetPhases: typeof supabase?.getPhases === 'function',
        hasGetAllScenarios: typeof supabase?.getAllScenarios === 'function',
        hasCheckUsernameExists: typeof supabase?.checkUsernameExists === 'function',
      };
      
      return jsonResponse({ 
        status: 'ok', 
        env: envStatus,
        modules: moduleStatus,
        timestamp: new Date().toISOString()
      }, 200, request);
    }

    // 診斷端點 - 測試 Supabase 連線
    if (pathname === '/api/debug/test-supabase' && method === 'GET') {
      try {
        checkEnvVars();
        // 測試 getPhases 函數
        const phases = await supabase.getPhases(envVars);
        return jsonResponse({
          success: true,
          message: 'Supabase connection successful',
          phasesCount: phases?.length || 0,
          env: {
            hasUrl: !!envVars.SUPABASE_URL,
            hasAnonKey: !!envVars.SUPABASE_ANON_KEY,
            urlLength: envVars.SUPABASE_URL?.length || 0,
            keyLength: envVars.SUPABASE_ANON_KEY?.length || 0,
          }
        }, 200, request);
      } catch (testErr) {
        return jsonResponse({
          success: false,
          error: {
            message: testErr.message,
            stack: testErr.stack,
            name: testErr.name
          },
          env: {
            hasUrl: !!envVars.SUPABASE_URL,
            hasAnonKey: !!envVars.SUPABASE_ANON_KEY,
            urlLength: envVars.SUPABASE_URL?.length || 0,
            keyLength: envVars.SUPABASE_ANON_KEY?.length || 0,
          }
        }, 500, request);
      }
    }

    // 其他 API 需要檢查環境變數
    checkEnvVars();

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

    // ===== 認證與用戶相關 API =====

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
      const user = await supabase.getUserByUsername(username?.trim(), envVars);
      if (!user) return errorResponse('User not found', 404, request);
      return jsonResponse(user, 200, request);
    }

    // GET /api/users/check/:username － 檢查用戶名是否已存在
    const usernameCheckMatch = pathname.match(/^\/api\/users\/check\/([^/]+)$/);
    if (usernameCheckMatch && method === 'GET') {
      try {
        const rawUsername = usernameCheckMatch[1];
        const username = decodeURIComponent(rawUsername).trim();
        if (!username) return errorResponse('Username required', 400, request);

        const exists = await supabase.checkUsernameExists(username, envVars);
        return jsonResponse({ exists }, 200, request);
      } catch (err) {
        console.error('[GET /api/users/check/:username] Error:', err);
        throw err; // 重新拋出，讓外層 catch 處理
      }
    }

    // POST /api/users － 建立新用戶
    if (pathname === '/api/users' && method === 'POST') {
      const { username, language, consent = true, hasExperience = false } = await parseBody(request) || {};
      if (!username || !language) return errorResponse('Invalid payload', 400, request);

      const user = await supabase.createUser(username.trim(), language, consent, hasExperience, envVars);
      return jsonResponse(user, 201, request);
    }

    // GET /api/users/:userId － 取得用戶資料
    const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
    if (userMatch && method === 'GET') {
      const userId = userMatch[1];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);

      const user = await supabase.getUser(userId, envVars);
      if (!user) return errorResponse('User not found', 404, request);
      return jsonResponse(user, 200, request);
    }

    // ===== 遊戲與場景公開 API =====

    if (pathname === '/api/phases' && method === 'GET') {
      try {
        const phases = await supabase.getPhases(envVars);
        return jsonResponse(phases, 200, request);
      } catch (err) {
        console.error('[GET /api/phases] Error:', err);
        throw err; // 重新拋出，讓外層 catch 處理
      }
    }
    
    if (pathname === '/api/scenarios' && method === 'GET') {
      try {
        const scenarios = await supabase.getAllScenarios(envVars);
        return jsonResponse(scenarios, 200, request);
      } catch (err) {
        console.error('[GET /api/scenarios] Error:', err);
        throw err; // 重新拋出，讓外層 catch 處理
      }
    }

    // ===== 用戶與進度 API =====

    // GET /api/users/:userId/progress
    const progressMatch = pathname.match(/^\/api\/users\/([^/]+)\/progress$/);
    if (progressMatch && method === 'GET') {
      const userId = progressMatch[1];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);
      return jsonResponse(await supabase.getUserProgress(userId, envVars), 200, request);
    }

    // POST /api/users/:userId/progress
    if (progressMatch && method === 'POST') {
      const userId = progressMatch[1];
      const { scenarioId, status } = await parseBody(request) || {};
      return jsonResponse(await supabase.updateProgress(userId, scenarioId, status, envVars), 200, request);
    }

    // ===== Attempts API =====

    // POST /api/attempts/start
    if (pathname === '/api/attempts/start' && method === 'POST') {
      const { userId, scenarioId, sessionId } = await parseBody(request) || {};
      if (!userId || !isValidUUID(userId)) return errorResponse('Invalid user ID', 400, request);
      if (!scenarioId || !isValidUUID(scenarioId)) return errorResponse('Invalid scenario ID', 400, request);
      if (sessionId && (typeof sessionId !== 'string' || sessionId.length > 100)) {
        return errorResponse('Invalid session ID', 400, request);
      }
      return jsonResponse(await supabase.startAttempt(userId, scenarioId, sessionId, envVars), 200, request);
    }

    // POST /api/attempts/complete
    if (pathname === '/api/attempts/complete' && method === 'POST') {
      const { attemptId, isSuccess, errorDetails } = await parseBody(request) || {};
      if (!attemptId || !isValidUUID(attemptId)) return errorResponse('Invalid attempt ID', 400, request);
      if (typeof isSuccess !== 'boolean') return errorResponse('isSuccess must be a boolean', 400, request);
      if (errorDetails) {
        if (typeof errorDetails !== 'object' || Array.isArray(errorDetails)) {
          return errorResponse('errorDetails must be an object', 400, request);
        }
        if (JSON.stringify(errorDetails).length > 5000) {
          return errorResponse('errorDetails too large (max 5KB)', 400, request);
        }
      }
      return jsonResponse(await supabase.completeAttempt(attemptId, isSuccess, errorDetails, envVars), 200, request);
    }

    // POST /api/attempts/stage-error
    if (pathname === '/api/attempts/stage-error' && method === 'POST') {
      const { attemptId, stageError } = await parseBody(request) || {};
      if (!attemptId || !isValidUUID(attemptId)) return errorResponse('Invalid attempt ID', 400, request);
      if (!stageError || typeof stageError !== 'object' || Array.isArray(stageError)) {
        return errorResponse('stageError must be an object', 400, request);
      }
      if (JSON.stringify(stageError).length > 5000) {
        return errorResponse('stageError too large (max 5KB)', 400, request);
      }
      return jsonResponse(await supabase.recordStageError(attemptId, stageError, envVars), 200, request);
    }

    // ===== 訓練報告與 AI 分析 (關鍵修正點) =====

    // POST /api/users/:userId/report/generate
    const reportGenMatch = pathname.match(/^\/api\/users\/([^/]+)\/report\/generate$/);
    if (reportGenMatch && method === 'POST') {
      const userId = reportGenMatch[1];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);

      try {
        // 第一步：生成基礎數據報告 (不可失敗)
        const report = await supabase.generateFinalReport(userId, envVars);

        // 第二步：異步生成 AI 分析，但不應阻塞主要報告回傳
        let aiResult = null;
        try {
          aiResult = await generateAIAnalysis(report, envVars);
          if (aiResult) await supabase.updateReportAIAnalysis(userId, aiResult, envVars);
        } catch (e) {
          console.error("AI Generation failed, returning base report:", e.message);
        }

        return jsonResponse({ ...report, ai_analysis: aiResult }, 200, request);
      } catch (err) {
        console.error('[POST /api/users/:userId/report/generate] Error:', err);
        return errorResponse(`Failed to generate report: ${err.message || 'Unknown error'}`, 500, request);
      }
    }

    // GET /api/users/:userId/report (獲取已生成的報告)
    const reportGetMatch = pathname.match(/^\/api\/users\/([^/]+)\/report$/);
    if (reportGetMatch && method === 'GET') {
      const userId = reportGetMatch[1];
      const data = await supabase.getUserFinalReport(userId, envVars);
      if (!data) return errorResponse('Report not found', 404, request);
      return jsonResponse({ ...data, ai_analysis: data.ai_analysis_result }, 200, request);
    }

    // ===== Admin 專屬 API (由中間件攔截驗證) =====

    if (pathname === '/api/admin/users' && method === 'GET') return jsonResponse(await supabase.getAllUsers(envVars), 200, request);
    
    if (pathname === '/api/admin/users/search' && method === 'GET') {
      const query = searchParams.get('q');
      return jsonResponse(await supabase.searchUsers(query, envVars), 200, request);
    }

    if (pathname.match(/^\/api\/admin\/users\/[^/]+$/) && method === 'DELETE') {
      const userId = pathname.split('/').pop();
      return jsonResponse(await supabase.deleteUserAndData(userId, envVars), 200, request);
    }

    // 404 處理
    return errorResponse('Endpoint not found', 404, request);

  } catch (err) {
    // 記錄詳細錯誤資訊
    const errorDetails = {
      pathname,
      method,
      message: err.message,
      stack: err.stack,
      name: err.name,
      // 記錄環境變數狀態（不記錄實際值）
      env: {
        hasUrl: !!envVars.SUPABASE_URL,
        hasAnonKey: !!envVars.SUPABASE_ANON_KEY,
        hasServiceKey: !!envVars.SUPABASE_SERVICE_ROLE_KEY,
        urlLength: envVars.SUPABASE_URL?.length || 0,
        anonKeyLength: envVars.SUPABASE_ANON_KEY?.length || 0,
      },
      // 記錄模組狀態
      modules: {
        supabaseModuleLoaded: typeof supabase !== 'undefined',
        hasGetPhases: typeof supabase?.getPhases === 'function',
      },
    };
    console.error(`[API ERROR] ${pathname}:`, JSON.stringify(errorDetails, null, 2));
    
    // 如果是 Supabase 相關錯誤，記錄更多資訊
    if (err.message?.includes('Supabase') || err.message?.includes('Missing') || err.message?.includes('configuration')) {
      console.error('[ENV CHECK DETAIL]', {
        hasUrl: !!envVars.SUPABASE_URL,
        hasAnonKey: !!envVars.SUPABASE_ANON_KEY,
        hasServiceKey: !!envVars.SUPABASE_SERVICE_ROLE_KEY,
        urlPrefix: envVars.SUPABASE_URL?.substring(0, 20) || 'N/A',
        anonKeyPrefix: envVars.SUPABASE_ANON_KEY?.substring(0, 20) || 'N/A',
      });
    }
    
    // 返回錯誤（不暴露敏感資訊，但在開發環境可以返回更多資訊）
    const safeMessage = err.message || 'Server error';
    return errorResponse(safeMessage, 500, request);
  }
}
