// Cloudflare Functions API 路由处理器
// 这个文件处理所有 /api/* 路径的请求

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

// ===== Allowed CORS origins =====
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

// ===== UUID validation =====
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id) {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

// ===== JWT verification for admin routes =====
async function verifyAdminJWT(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    // Cloudflare Workers: use Web Crypto API for HMAC-SHA256 JWT verification
    const secret = env.JWT_SECRET;
    if (!secret) return null;
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;
    // Decode header and validate algorithm
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (header.alg !== 'HS256') return null;
    // Verify signature using Web Crypto
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    // Convert base64url signature to ArrayBuffer
    const sigStr = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const sigBin = Uint8Array.from(atob(sigStr), c => c.charCodeAt(0));
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const valid = await crypto.subtle.verify('HMAC', key, sigBin, data);
    if (!valid) return null;
    // Decode payload and check expiry
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}

// 处理 CORS 预检请求
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

// 创建 JSON 响应
function jsonResponse(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

// 创建错误响应 — sanitized, no internal details
function errorResponse(message, status = 500, request) {
  // Never leak internal error messages in 500s
  const safeMsg = status >= 500 ? 'An internal error occurred' : message;
  return jsonResponse({ error: safeMsg }, status, request);
}

// 解析请求体
async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// 从 URL 路径中提取参数
function extractParams(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const params = {};
  
  // 提取路径参数
  if (parts.includes('users') && parts.length > 2) {
    params.userId = parts[parts.indexOf('users') + 1];
  }
  if (parts.includes('scenarios') && parts.length > 2) {
    const scenarioIndex = parts.indexOf('scenarios');
    if (parts[scenarioIndex + 1] && parts[scenarioIndex + 1] !== 'phase') {
      params.scenarioCode = parts[scenarioIndex + 1];
    }
  }
  if (parts.includes('phase') && parts.length > 3) {
    const phaseIndex = parts.indexOf('phase');
    params.phaseId = parts[phaseIndex + 1];
  }
  
  return params;
}

export async function onRequest(context) {
  const { request, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  const method = request.method;

  // 处理 CORS 预检请求
  if (method === 'OPTIONS') {
    return handleOptions(request);
  }

  // 获取环境变量
  const envVars = {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
  };

  try {
    // Health check
    if (pathname === '/api/health') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, request);
    }

    // ===== 公開 API =====

    // GET /api/phases
    if (pathname === '/api/phases' && method === 'GET') {
      const data = await getPhases(envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/scenarios
    if (pathname === '/api/scenarios' && method === 'GET') {
      const data = await getAllScenarios(envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/scenario-types
    if (pathname === '/api/scenario-types' && method === 'GET') {
      const data = await getScenarioTypes(envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/scenarios/:code
    if (pathname.startsWith('/api/scenarios/') && method === 'GET') {
      const parts = pathname.split('/');
      const code = parts[parts.length - 1];
      if (code !== 'scenarios' && code !== 'phase') {
        if (!code || code.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(code)) {
          return errorResponse('Invalid scenario code', 400, request);
        }
        const data = await getScenario(code, envVars);
        return jsonResponse(data, 200, request);
      }
    }

    // GET /api/scenarios/phase/:phaseId
    if (pathname.startsWith('/api/scenarios/phase/') && method === 'GET') {
      const parts = pathname.split('/');
      const phaseId = parts[parts.length - 1];
      if (!isValidUUID(phaseId)) {
        return errorResponse('Invalid phase ID', 400, request);
      }
      const data = await getScenariosByPhase(phaseId, envVars);
      return jsonResponse(data, 200, request);
    }

    // ===== User API =====

    // GET /api/users/check/:username
    if (pathname.startsWith('/api/users/check/') && method === 'GET') {
      const parts = pathname.split('/');
      const username = parts[parts.length - 1];
      if (!username || username.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
        return errorResponse('Invalid username format', 400, request);
      }
      const exists = await checkUsernameExists(username, envVars);
      return jsonResponse({ exists }, 200, request);
    }

    // POST /api/users/login
    if (pathname === '/api/users/login' && method === 'POST') {
      const body = await parseBody(request);
      const { username } = body || {};
      if (!username || typeof username !== 'string' || username.length > 50) {
        return errorResponse('Invalid credentials', 400, request);
      }
      const user = await getUserByUsername(username.trim(), envVars);
      if (!user) {
        // Generic message to prevent username enumeration
        return errorResponse('Invalid credentials', 401, request);
      }
      return jsonResponse(user, 200, request);
    }

    // POST /api/users
    if (pathname === '/api/users' && method === 'POST') {
      const body = await parseBody(request);
      const { username, language, consent, hasExperience } = body || {};
      // Validate username
      if (!username || typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 50) {
        return errorResponse('Username must be 1-50 characters', 400, request);
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
        return errorResponse('Username can only contain letters, numbers, hyphens and underscores', 400, request);
      }
      if (language && !['en', 'zh'].includes(language)) {
        return errorResponse('Invalid language', 400, request);
      }
      if (consent !== undefined && typeof consent !== 'boolean') {
        return errorResponse('Invalid consent value', 400, request);
      }
      if (hasExperience !== undefined && typeof hasExperience !== 'boolean') {
        return errorResponse('Invalid hasExperience value', 400, request);
      }
      try {
        const data = await createUser(username.trim(), language, consent, hasExperience, envVars);
        return jsonResponse(data, 200, request);
      } catch (error) {
        if (error.message === 'Username already exists') {
          return errorResponse(error.message, 409, request);
        }
        throw error;
      }
    }

    // GET /api/users/:userId
    if (pathname.startsWith('/api/users/') && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 1];
      
      // 检查是否是子路径
      if (parts.includes('check') || parts.includes('login') || parts.includes('statistics') || parts.includes('attempts') || parts.includes('progress') || parts.includes('report')) {
        // 这些是特殊路径，需要特殊处理
      } else {
        if (!isValidUUID(userId)) {
          return errorResponse('Invalid user ID', 400, request);
        }
        const data = await getUser(userId, envVars);
        return jsonResponse(data, 200, request);
      }
    }

    // GET /api/users/:userId/progress
    if (pathname.match(/^\/api\/users\/[^/]+\/progress$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const data = await getUserProgress(userId, envVars);
      return jsonResponse(data, 200, request);
    }

    // POST /api/users/:userId/progress
    if (pathname.match(/^\/api\/users\/[^/]+\/progress$/) && method === 'POST') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const body = await parseBody(request);
      const { scenarioId, status } = body || {};
      if (!scenarioId || typeof scenarioId !== 'string' || scenarioId.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(scenarioId)) {
        return errorResponse('Invalid scenario ID', 400, request);
      }
      if (!status || !['completed', 'in_progress', 'not_started', 'current'].includes(status)) {
        return errorResponse('Invalid status', 400, request);
      }
      const data = await updateProgress(userId, scenarioId, status, envVars);
      return jsonResponse(data, 200, request);
    }

    // ===== Attempt API =====

    // POST /api/attempts/start
    if (pathname === '/api/attempts/start' && method === 'POST') {
      const body = await parseBody(request);
      const { userId, scenarioId, sessionId } = body || {};
      if (!userId || !isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      if (!scenarioId || !isValidUUID(scenarioId)) {
        return errorResponse('Invalid scenario ID', 400, request);
      }
      if (sessionId && (typeof sessionId !== 'string' || sessionId.length > 100)) {
        return errorResponse('Invalid session ID', 400, request);
      }
      const data = await startAttempt(userId, scenarioId, sessionId, envVars);
      return jsonResponse(data, 200, request);
    }

    // POST /api/attempts/complete
    if (pathname === '/api/attempts/complete' && method === 'POST') {
      const body = await parseBody(request);
      const { attemptId, isSuccess, errorDetails } = body || {};
      if (!attemptId || !isValidUUID(attemptId)) {
        return errorResponse('Invalid attempt ID', 400, request);
      }
      if (typeof isSuccess !== 'boolean') {
        return errorResponse('isSuccess must be a boolean', 400, request);
      }
      if (errorDetails) {
        if (typeof errorDetails !== 'object' || Array.isArray(errorDetails)) {
          return errorResponse('errorDetails must be an object', 400, request);
        }
        if (JSON.stringify(errorDetails).length > 5000) {
          return errorResponse('errorDetails too large (max 5KB)', 400, request);
        }
      }
      const data = await completeAttempt(attemptId, isSuccess, errorDetails, envVars);
      return jsonResponse(data, 200, request);
    }

    // POST /api/attempts/stage-error
    if (pathname === '/api/attempts/stage-error' && method === 'POST') {
      const body = await parseBody(request);
      const { attemptId, stageError } = body || {};
      if (!attemptId || !isValidUUID(attemptId)) {
        return errorResponse('Invalid attempt ID', 400, request);
      }
      if (!stageError || typeof stageError !== 'object' || Array.isArray(stageError)) {
        return errorResponse('stageError must be an object', 400, request);
      }
      if (JSON.stringify(stageError).length > 5000) {
        return errorResponse('stageError too large (max 5KB)', 400, request);
      }
      const data = await recordStageError(attemptId, stageError, envVars);
      return jsonResponse(data, 200, request);
    }

    // ===== Admin API (all routes require JWT auth) =====

    // Admin login endpoint (no JWT required)
    if (pathname === '/api/admin/login' && method === 'POST') {
      const body = await parseBody(request);
      const { username, password } = body || {};
      if (!username || !password) {
        return errorResponse('Username and password required', 400, request);
      }
      // Verify credentials using env vars
      const ADMIN_USERNAME = env.ADMIN_USERNAME || 'admin';
      const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD_HASH;
      if (!ADMIN_PASSWORD_HASH) {
        return errorResponse('Admin auth not configured', 500, request);
      }
      // Use bcryptjs is not available in CF Workers — compare via subtle crypto
      // For CF, we use a simple constant-time comparison with pre-shared password hash
      // Import bcryptjs alternative or use env-stored plain check
      // Since CF Workers don't have bcryptjs, we verify by importing from utils
      const { verifyAdminPassword } = await import('../utils/auth.js').catch(() => ({ verifyAdminPassword: null }));
      let token = null;
      if (verifyAdminPassword) {
        token = await verifyAdminPassword(username, password, env);
      }
      if (!token) {
        return errorResponse('Invalid credentials', 401, request);
      }
      return jsonResponse({ token }, 200, request);
    }

    // All other admin routes require JWT
    if (pathname.startsWith('/api/admin/')) {
      const admin = await verifyAdminJWT(request, env);
      if (!admin) {
        return errorResponse('Authentication required', 401, request);
      }
    }

    // GET /api/admin/users
    if (pathname === '/api/admin/users' && method === 'GET') {
      const data = await getAllUsers(envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/admin/users/search
    if (pathname === '/api/admin/users/search' && method === 'GET') {
      const query = searchParams.get('q');
      if (!query || typeof query !== 'string' || query.trim().length === 0 || query.length > 100) {
        return errorResponse('Invalid search query', 400, request);
      }
      const data = await searchUsers(query.trim(), envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/admin/users/:userId/progress
    if (pathname.match(/^\/api\/admin\/users\/[^/]+\/progress$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const data = await getUserProgress(userId, envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/admin/users/:userId/attempts
    if (pathname.match(/^\/api\/admin\/users\/[^/]+\/attempts$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const data = await getUserAttempts(userId, envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/admin/users/:userId/report
    if (pathname.match(/^\/api\/admin\/users\/[^/]+\/report$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const data = await getUserFinalReport(userId, envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/admin/reports
    if (pathname === '/api/admin/reports' && method === 'GET') {
      const data = await getAllFinalReports(envVars);
      return jsonResponse(data, 200, request);
    }

    // POST /api/admin/scenarios — whitelist allowed fields
    if (pathname === '/api/admin/scenarios' && method === 'POST') {
      const body = await parseBody(request);
      const { scenario_code, phase_id, type_id, title_zh, title_en, description_zh, description_en, difficulty, order_index, config_data } = body || {};
      if (!scenario_code || typeof scenario_code !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(scenario_code) || scenario_code.length > 50) {
        return errorResponse('Invalid scenario_code', 400, request);
      }
      if (!phase_id || !isValidUUID(phase_id)) {
        return errorResponse('Invalid phase_id', 400, request);
      }
      if (!type_id || !isValidUUID(type_id)) {
        return errorResponse('Invalid type_id', 400, request);
      }
      if (!title_zh || typeof title_zh !== 'string' || title_zh.length > 200) {
        return errorResponse('Invalid title_zh', 400, request);
      }
      if (!title_en || typeof title_en !== 'string' || title_en.length > 200) {
        return errorResponse('Invalid title_en', 400, request);
      }
      const sanitizedData = {
        scenario_code, phase_id, type_id, title_zh, title_en,
        ...(description_zh && typeof description_zh === 'string' ? { description_zh: description_zh.slice(0, 1000) } : {}),
        ...(description_en && typeof description_en === 'string' ? { description_en: description_en.slice(0, 1000) } : {}),
        ...(difficulty !== undefined && Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 10 ? { difficulty } : {}),
        ...(order_index !== undefined && Number.isInteger(order_index) ? { order_index } : {}),
        ...(config_data && typeof config_data === 'object' && !Array.isArray(config_data) && JSON.stringify(config_data).length <= 10000 ? { config_data } : {}),
      };
      const data = await createScenario(sanitizedData, envVars);
      return jsonResponse(data, 200, request);
    }

    // DELETE /api/admin/users/:userId
    if (pathname.match(/^\/api\/admin\/users\/[^/]+$/) && method === 'DELETE') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const result = await deleteUserAndData(userId, envVars);
      return jsonResponse(result, 200, request);
    }

    // ===== 用戶統計分析端點 =====

    // GET /api/users/:userId/attempts
    if (pathname.match(/^\/api\/users\/[^/]+\/attempts$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const data = await getUserAttempts(userId, envVars);
      return jsonResponse(data, 200, request);
    }

    // GET /api/users/:userId/statistics
    if (pathname.match(/^\/api\/users\/[^/]+\/statistics$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const attempts = await getUserAttempts(userId, envVars);
      
      // 計算整體統計
      const totalAttempts = attempts.length;
      const successAttempts = attempts.filter(a => a.is_success).length;
      const failedAttempts = totalAttempts - successAttempts;
      const successRate = totalAttempts > 0 ? (successAttempts / totalAttempts * 100).toFixed(2) : 0;
      
      // 計算平均答題時間
      const totalTime = attempts.reduce((sum, a) => sum + (a.duration_ms || 0), 0);
      const avgTimeMs = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0;
      
      // 按關卡分組統計
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
          
          // 統計錯誤類型
          if (attempt.error_details?.error_type) {
            const errorType = attempt.error_details.error_type;
            stat.error_types[errorType] = (stat.error_types[errorType] || 0) + 1;
          }
        }
        
        // 計算時間統計
        if (attempt.duration_ms) {
          stat.total_time_ms += attempt.duration_ms;
          if (stat.fastest_time_ms === null || attempt.duration_ms < stat.fastest_time_ms) {
            stat.fastest_time_ms = attempt.duration_ms;
          }
          if (stat.slowest_time_ms === null || attempt.duration_ms > stat.slowest_time_ms) {
            stat.slowest_time_ms = attempt.duration_ms;
          }
        }
      });
      
      // 計算各關卡平均時間
      Object.values(scenarioStats).forEach(stat => {
        if (stat.total_attempts > 0) {
          stat.avg_time_ms = Math.round(stat.total_time_ms / stat.total_attempts);
          stat.success_rate = ((stat.success_count / stat.total_attempts) * 100).toFixed(2);
        }
      });
      
      return jsonResponse({
        overall: {
          total_attempts: totalAttempts,
          success_attempts: successAttempts,
          failed_attempts: failedAttempts,
          success_rate: parseFloat(successRate),
          avg_time_ms: avgTimeMs,
          total_time_ms: totalTime
        },
        by_scenario: Object.values(scenarioStats)
      }, 200, request);
    }

    // GET /api/users/:userId/statistics/:scenarioCode
    if (pathname.match(/^\/api\/users\/[^/]+\/statistics\/[^/]+$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      const scenarioCode = parts[parts.indexOf('statistics') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      if (!scenarioCode || scenarioCode.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(scenarioCode)) {
        return errorResponse('Invalid scenario code', 400, request);
      }
      const attempts = await getUserAttempts(userId, envVars);
      const scenarioAttempts = attempts.filter(a => 
        a.scenarios?.scenario_code === scenarioCode
      );
      
      if (scenarioAttempts.length === 0) {
        return jsonResponse({
          scenario_code: scenarioCode,
          total_attempts: 0,
          success_count: 0,
          fail_count: 0,
          attempts: []
        }, 200, request);
      }
      
      const successCount = scenarioAttempts.filter(a => a.is_success).length;
      const failCount = scenarioAttempts.length - successCount;
      
      return jsonResponse({
        scenario_code: scenarioCode,
        scenario_title_zh: scenarioAttempts[0]?.scenarios?.title_zh,
        scenario_title_en: scenarioAttempts[0]?.scenarios?.title_en,
        total_attempts: scenarioAttempts.length,
        success_count: successCount,
        fail_count: failCount,
        success_rate: ((successCount / scenarioAttempts.length) * 100).toFixed(2),
        attempts: scenarioAttempts.map(a => ({
          attempt_id: a.attempt_id,
          start_time: a.start_time,
          end_time: a.end_time,
          duration_ms: a.duration_ms,
          is_success: a.is_success,
          error_details: a.error_details
        }))
      }, 200, request);
    }

    // POST /api/users/:userId/report/generate
    if (pathname.match(/^\/api\/users\/[^/]+\/report\/generate$/) && method === 'POST') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      
      // 1. 先生成基礎統計報告並存入 DB
      const report = await generateFinalReport(userId, envVars);
      
      // 2. 呼叫 DeepSeek AI 生成分析
      let aiAnalysis = null;
      try {
        aiAnalysis = await generateAIAnalysis(report, envVars);
        // 3. 將 AI 分析結果存入 DB
        try {
          await updateReportAIAnalysis(userId, aiAnalysis, envVars);
        } catch (saveErr) {
          // Non-blocking — log silently
        }
      } catch (aiErr) {
        // Non-blocking — AI analysis failure shouldn't break report generation
      }
      
      // 4. 返回合併結果
      return jsonResponse({
        ...report,
        ai_analysis: aiAnalysis
      }, 200, request);
    }

    // GET /api/users/:userId/report
    if (pathname.match(/^\/api\/users\/[^/]+\/report$/) && method === 'GET') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const data = await getUserFinalReport(userId, envVars);
      if (!data) {
        return errorResponse('Report not found', 404, request);
      }
      // Normalize field name for frontend compatibility
      const { ai_analysis_result, ...rest } = data;
      return jsonResponse({ ...rest, ai_analysis: ai_analysis_result || null }, 200, request);
    }

    // POST /api/users/:userId/report/ai-analyze
    if (pathname.match(/^\/api\/users\/[^/]+\/report\/ai-analyze$/) && method === 'POST') {
      const parts = pathname.split('/');
      const userId = parts[parts.indexOf('users') + 1];
      if (!isValidUUID(userId)) {
        return errorResponse('Invalid user ID', 400, request);
      }
      const report = await getUserFinalReport(userId, envVars);
      if (!report) {
        return errorResponse('No report found for this user', 404, request);
      }
      const aiAnalysis = await generateAIAnalysis(report, envVars);
      return jsonResponse({ ai_analysis: aiAnalysis }, 200, request);
    }

    // 404 - 未找到路由
    return errorResponse('Not Found', 404, request);

  } catch (error) {
    // Sanitized error — never leak internal details
    console.error('API Error:', error);
    return errorResponse('An internal error occurred', 500, request);
  }
}

