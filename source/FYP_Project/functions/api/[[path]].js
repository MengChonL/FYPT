<<<<<<< HEAD
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
=======
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
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  'https://fyp-dadab.pages.dev',
  'https://fyp-admin.pages.dev',
  'http://localhost:5173',
  'http://localhost:5174',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
<<<<<<< HEAD
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
=======
  // 支援所有 Cloudflare Pages 域名（*.pages.dev）
  const isCloudflarePages = origin.includes('.pages.dev');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) || isCloudflarePages 
    ? origin 
    : ALLOWED_ORIGINS[0];
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

<<<<<<< HEAD
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

=======
// ===== 工具函數 =====
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const jsonResponse = (data, status = 200, request) => new Response(JSON.stringify(data), {
  status,
  headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json; charset=utf-8' },
});

const errorResponse = (message, status = 500, request, details = null) => {
  // 判斷是否為開發環境（Cloudflare Pages 或 localhost）
  const isDevelopment = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('.pages.dev') ||
                       request.headers.get('referer')?.includes('localhost') ||
                       request.headers.get('referer')?.includes('.pages.dev');
  
  const safeMsg = status >= 500 && !isDevelopment ? 'Internal Server Error' : message;
  
  const errorData = {
    error: safeMsg,
    status,
    timestamp: new Date().toISOString()
  };
  
  // 在開發環境中，添加詳細錯誤信息
  if (isDevelopment && details) {
    errorData.details = details;
  }
  
  return jsonResponse(errorData, status, request);
};

const parseBody = async (request) => {
  try { return await request.json(); } catch { return null; }
};

// ===== 主入口函數 =====
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
export async function onRequest(context) {
  const { request, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  const method = request.method;

<<<<<<< HEAD
  // 处理 CORS 预检请求
  if (method === 'OPTIONS') {
    return handleOptions(request);
  }

  // 获取环境变量
=======
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
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
  const envVars = {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
  };

<<<<<<< HEAD
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
=======
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

    // 診斷端點 - 測試報告生成流程
    if (pathname === '/api/debug/test-report-generation' && method === 'GET') {
      const userId = searchParams.get('userId');
      if (!userId || !isValidUUID(userId)) {
        return jsonResponse({ 
          success: false, 
          error: 'Valid userId parameter required (UUID format)' 
        }, 400, request);
      }

      const debugInfo = {
        userId,
        timestamp: new Date().toISOString(),
        steps: {}
      };

      try {
        // Step 1: 測試生成基礎報告
        debugInfo.steps.step1_generateReport = { status: 'testing' };
        try {
          const report = await supabase.generateFinalReport(userId, envVars);
          debugInfo.steps.step1_generateReport = {
            status: 'success',
            hasReport: !!report,
            reportKeys: report ? Object.keys(report) : [],
            totalScenarios: report?.total_scenarios_completed,
            successRate: report?.overall_success_rate,
            hasPerformanceSummary: !!report?.performance_summary,
            performanceSummaryLength: Array.isArray(report?.performance_summary) ? report.performance_summary.length : 0
          };
        } catch (step1Err) {
          debugInfo.steps.step1_generateReport = {
            status: 'failed',
            error: {
              message: step1Err.message,
              code: step1Err.code,
              details: step1Err.details,
              hint: step1Err.hint
            }
          };
          return jsonResponse(debugInfo, 500, request);
        }

        // Step 2: 測試 AI 分析
        debugInfo.steps.step2_aiAnalysis = { status: 'testing' };
        try {
          const report = await supabase.generateFinalReport(userId, envVars);
          const aiResult = await generateAIAnalysis(report, envVars);
          debugInfo.steps.step2_aiAnalysis = {
            status: 'success',
            hasResult: !!aiResult,
            hasSummaryZh: !!aiResult?.summary_zh,
            hasSummaryEn: !!aiResult?.summary_en,
            hasRecommendations: !!(aiResult?.recommendations_zh || aiResult?.recommendations_en),
            hasError: !!aiResult?.ai_error,
            errorMessage: aiResult?.ai_error || null,
            summaryZhLength: aiResult?.summary_zh?.length || 0,
            summaryEnLength: aiResult?.summary_en?.length || 0
          };
        } catch (step2Err) {
          debugInfo.steps.step2_aiAnalysis = {
            status: 'failed',
            error: {
              message: step2Err.message,
              stack: step2Err.stack,
              name: step2Err.name
            }
          };
        }

        // Step 3: 測試數據庫保存
        debugInfo.steps.step3_saveToDatabase = { status: 'testing' };
        try {
          const report = await supabase.generateFinalReport(userId, envVars);
          const aiResult = await generateAIAnalysis(report, envVars);
          if (aiResult && !aiResult.ai_error) {
            await supabase.updateReportAIAnalysis(userId, aiResult, envVars);
            debugInfo.steps.step3_saveToDatabase = {
              status: 'success',
              message: 'AI analysis saved successfully'
            };
          } else {
            debugInfo.steps.step3_saveToDatabase = {
              status: 'skipped',
              reason: 'AI analysis has error or is null'
            };
          }
        } catch (step3Err) {
          debugInfo.steps.step3_saveToDatabase = {
            status: 'failed',
            error: {
              message: step3Err.message,
              code: step3Err.code,
              details: step3Err.details,
              hint: step3Err.hint
            }
          };
        }

        // Step 4: 測試完整流程
        debugInfo.steps.step4_fullFlow = { status: 'testing' };
        try {
          const report = await supabase.generateFinalReport(userId, envVars);
          const aiResult = await generateAIAnalysis(report, envVars);
          const safeAiResult = aiResult ? {
            summary_zh: aiResult.summary_zh || '',
            summary_en: aiResult.summary_en || '',
            recommendations_zh: aiResult.recommendations_zh || [],
            recommendations_en: aiResult.recommendations_en || [],
            risk_profile: aiResult.risk_profile || { overall_risk_level: 'medium' },
            ai_error: aiResult.ai_error || null
          } : null;
          const responseData = { ...report, ai_analysis: safeAiResult };
          const jsonString = JSON.stringify(responseData);
          
          debugInfo.steps.step4_fullFlow = {
            status: 'success',
            responseSize: jsonString.length,
            canSerialize: true
          };
        } catch (step4Err) {
          debugInfo.steps.step4_fullFlow = {
            status: 'failed',
            error: {
              message: step4Err.message,
              stack: step4Err.stack
            }
          };
        }

        debugInfo.success = true;
        return jsonResponse(debugInfo, 200, request);
      } catch (err) {
        debugInfo.success = false;
        debugInfo.error = {
          message: err.message,
          stack: err.stack,
          name: err.name
        };
        return jsonResponse(debugInfo, 500, request);
      }
    }

    // 診斷端點 - 測試 DeepSeek API
    if (pathname === '/api/debug/test-deepseek' && method === 'GET') {
      try {
        const { generateAIAnalysis } = await import('../utils/deepseek.js');
        
        // 創建一個測試報告數據
        const testReport = {
          performance_summary: [
            { scenario_code: 'phase1-1', final_success: true, avg_time_ms: 30000 },
            { scenario_code: 'phase1-2', final_success: false, avg_time_ms: 45000 }
          ],
          overall_success_rate: 50
        };

        const aiResult = await generateAIAnalysis(testReport, envVars);
        
        return jsonResponse({
          success: true,
          message: 'DeepSeek API connection successful',
          hasApiKey: !!envVars.DEEPSEEK_API_KEY,
          apiKeyLength: envVars.DEEPSEEK_API_KEY?.length || 0,
          apiKeyPrefix: envVars.DEEPSEEK_API_KEY?.substring(0, 10) || 'N/A',
          testResult: {
            hasSummary: !!(aiResult?.summary_zh || aiResult?.summary_en),
            hasRecommendations: !!(aiResult?.recommendations_zh || aiResult?.recommendations_en),
            hasError: !!aiResult?.ai_error,
            errorMessage: aiResult?.ai_error || null
          },
          sampleResponse: {
            summary_zh: aiResult?.summary_zh?.substring(0, 100) || 'N/A',
            summary_en: aiResult?.summary_en?.substring(0, 100) || 'N/A',
            recommendations_zh_type: Array.isArray(aiResult?.recommendations_zh) ? 'array' : typeof aiResult?.recommendations_zh,
            recommendations_en_type: Array.isArray(aiResult?.recommendations_en) ? 'array' : typeof aiResult?.recommendations_en,
            recommendations_zh_count: Array.isArray(aiResult?.recommendations_zh) ? aiResult.recommendations_zh.length : (typeof aiResult?.recommendations_zh === 'string' ? aiResult.recommendations_zh.length : 0),
            recommendations_en_count: Array.isArray(aiResult?.recommendations_en) ? aiResult.recommendations_en.length : (typeof aiResult?.recommendations_en === 'string' ? aiResult.recommendations_en.length : 0),
            recommendations_zh_sample: Array.isArray(aiResult?.recommendations_zh) ? aiResult.recommendations_zh.slice(0, 2) : aiResult?.recommendations_zh?.substring(0, 100)
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
            hasApiKey: !!envVars.DEEPSEEK_API_KEY,
            apiKeyLength: envVars.DEEPSEEK_API_KEY?.length || 0,
            apiKeyPrefix: envVars.DEEPSEEK_API_KEY?.substring(0, 10) || 'N/A',
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

    // GET /api/users/:userId/statistics
    const statisticsMatch = pathname.match(/^\/api\/users\/([^/]+)\/statistics$/);
    if (statisticsMatch && method === 'GET') {
      const userId = statisticsMatch[1];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);
      return jsonResponse(await supabase.getUserStatistics(userId, envVars), 200, request);
    }

    // GET /api/users/:userId/statistics/:scenarioCode
    const scenarioStatsMatch = pathname.match(/^\/api\/users\/([^/]+)\/statistics\/([^/]+)$/);
    if (scenarioStatsMatch && method === 'GET') {
      const userId = scenarioStatsMatch[1];
      const scenarioCode = scenarioStatsMatch[2];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);
      if (!scenarioCode || scenarioCode.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(scenarioCode)) {
        return errorResponse('Invalid scenario code', 400, request);
      }
      return jsonResponse(await supabase.getScenarioStatistics(userId, scenarioCode, envVars), 200, request);
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
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
    }

    // POST /api/attempts/complete
    if (pathname === '/api/attempts/complete' && method === 'POST') {
<<<<<<< HEAD
      const body = await parseBody(request);
      const { attemptId, isSuccess, errorDetails } = body || {};
      if (!attemptId || !isValidUUID(attemptId)) {
        return errorResponse('Invalid attempt ID', 400, request);
      }
      if (typeof isSuccess !== 'boolean') {
        return errorResponse('isSuccess must be a boolean', 400, request);
      }
=======
      const { attemptId, isSuccess, errorDetails } = await parseBody(request) || {};
      if (!attemptId || !isValidUUID(attemptId)) return errorResponse('Invalid attempt ID', 400, request);
      if (typeof isSuccess !== 'boolean') return errorResponse('isSuccess must be a boolean', 400, request);
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
      if (errorDetails) {
        if (typeof errorDetails !== 'object' || Array.isArray(errorDetails)) {
          return errorResponse('errorDetails must be an object', 400, request);
        }
        if (JSON.stringify(errorDetails).length > 5000) {
          return errorResponse('errorDetails too large (max 5KB)', 400, request);
        }
      }
<<<<<<< HEAD
      const data = await completeAttempt(attemptId, isSuccess, errorDetails, envVars);
      return jsonResponse(data, 200, request);
=======
      return jsonResponse(await supabase.completeAttempt(attemptId, isSuccess, errorDetails, envVars), 200, request);
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
    }

    // POST /api/attempts/stage-error
    if (pathname === '/api/attempts/stage-error' && method === 'POST') {
<<<<<<< HEAD
      const body = await parseBody(request);
      const { attemptId, stageError } = body || {};
      if (!attemptId || !isValidUUID(attemptId)) {
        return errorResponse('Invalid attempt ID', 400, request);
      }
=======
      const { attemptId, stageError } = await parseBody(request) || {};
      if (!attemptId || !isValidUUID(attemptId)) return errorResponse('Invalid attempt ID', 400, request);
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
      if (!stageError || typeof stageError !== 'object' || Array.isArray(stageError)) {
        return errorResponse('stageError must be an object', 400, request);
      }
      if (JSON.stringify(stageError).length > 5000) {
        return errorResponse('stageError too large (max 5KB)', 400, request);
      }
<<<<<<< HEAD
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

=======
      return jsonResponse(await supabase.recordStageError(attemptId, stageError, envVars), 200, request);
    }

    // ===== 訓練報告與 AI 分析 (關鍵修正點) =====

    // POST /api/users/:userId/report/generate
    const reportGenMatch = pathname.match(/^\/api\/users\/([^/]+)\/report\/generate$/);
    if (reportGenMatch && method === 'POST') {
      const userId = reportGenMatch[1];
      if (!isValidUUID(userId)) return errorResponse('Invalid ID', 400, request);

      const startTime = Date.now();
      console.log(`[report/generate] Starting report generation for user: ${userId}`);

      try {
        // 第一步：生成基礎數據報告 (不可失敗)
        let report;
        try {
          console.log('[report/generate] Step 1: Generating base report...');
          report = await supabase.generateFinalReport(userId, envVars);
          console.log('[report/generate] Base report generated successfully', {
            hasReport: !!report,
            reportKeys: report ? Object.keys(report) : [],
            totalScenarios: report?.total_scenarios_completed,
            successRate: report?.overall_success_rate
          });
        } catch (reportErr) {
          console.error('[report/generate] Failed to generate base report:', {
            message: reportErr.message,
            stack: reportErr.stack,
            name: reportErr.name,
            code: reportErr.code,
            details: reportErr.details,
            hint: reportErr.hint,
            userId
          });
          throw new Error(`Failed to generate base report: ${reportErr.message || 'Unknown error'}`);
        }

        // 第二步：異步生成 AI 分析，但不應阻塞主要報告回傳
        let aiResult = null;
        try {
          console.log('[report/generate] Starting AI analysis...');
          aiResult = await generateAIAnalysis(report, envVars);
          console.log('[report/generate] AI analysis completed:', {
            hasSummary: !!(aiResult?.summary_zh || aiResult?.summary_en),
            hasRecommendations: !!(aiResult?.recommendations_zh || aiResult?.recommendations_en),
            hasError: !!aiResult?.ai_error
          });
          
          if (aiResult && !aiResult.ai_error) {
            // 嘗試保存到數據庫，但失敗不應影響響應
            try {
              await supabase.updateReportAIAnalysis(userId, aiResult, envVars);
              console.log('[report/generate] AI analysis saved to database');
            } catch (saveErr) {
              console.warn('[report/generate] Failed to save AI analysis to database (non-blocking):', {
                message: saveErr.message,
                code: saveErr.code,
                details: saveErr.details
              });
              // 保存失敗不影響響應，AI 結果仍會包含在響應中
            }
          } else if (aiResult?.ai_error) {
            console.warn('[report/generate] AI analysis returned with error:', aiResult.ai_error);
          }
        } catch (aiErr) {
          console.error('[report/generate] AI Generation failed:', {
            message: aiErr.message,
            stack: aiErr.stack,
            name: aiErr.name
          });
          // AI 失敗不應影響報告回傳，使用 fallback
          aiResult = {
            summary_zh: 'AI 分析暫時不可用，請參考上方統計數據。',
            summary_en: 'AI analysis is temporarily unavailable, please refer to the statistics above.',
            recommendations_zh: ['建議重新練習失敗頻率較高的關卡'],
            recommendations_en: ['Re-run scenarios with high failure rates'],
            risk_profile: { overall_risk_level: 'medium' },
            ai_error: aiErr.message
          };
        }

        // 確保 AI 結果中的中文字符正確編碼
        const safeAiResult = aiResult ? {
          summary_zh: aiResult.summary_zh || '',
          summary_en: aiResult.summary_en || '',
          recommendations_zh: aiResult.recommendations_zh || [],
          recommendations_en: aiResult.recommendations_en || [],
          risk_profile: aiResult.risk_profile || { overall_risk_level: 'medium' },
          ai_error: aiResult.ai_error || null
        } : null;

        const responseData = { ...report, ai_analysis: safeAiResult };
        
        // 測試 JSON 序列化是否成功
        console.log('[report/generate] Step 3: Validating response data...');
        try {
          const jsonString = JSON.stringify(responseData);
          console.log('[report/generate] JSON serialization successful', {
            responseSize: jsonString.length,
            hasReport: !!responseData,
            hasAiAnalysis: !!responseData.ai_analysis
          });
        } catch (serializeErr) {
          console.error('[report/generate] JSON serialization error:', {
            error: serializeErr.message,
            stack: serializeErr.stack,
            reportKeys: report ? Object.keys(report) : [],
            aiResult: aiResult ? {
              summary_zh_length: aiResult.summary_zh?.length,
              summary_en_length: aiResult.summary_en?.length,
              hasRecommendations: !!(aiResult.recommendations_zh || aiResult.recommendations_en),
              keys: Object.keys(aiResult)
            } : null
          });
          throw new Error(`JSON serialization failed: ${serializeErr.message}`);
        }

        const duration = Date.now() - startTime;
        console.log(`[report/generate] Report generation completed successfully in ${duration}ms`);
        return jsonResponse(responseData, 200, request);
      } catch (err) {
        const duration = Date.now() - startTime;
        const errorDetails = {
          message: err.message,
          stack: err.stack,
          name: err.name,
          userId,
          duration: `${duration}ms`,
          cause: err.cause?.message || null,
          code: err.code || null,
          details: err.details || null,
          hint: err.hint || null
        };
        
        console.error('[POST /api/users/:userId/report/generate] Error:', JSON.stringify(errorDetails, null, 2));
        
        // 使用改進的 errorResponse 函數，它會自動判斷是否為開發環境
        return errorResponse(
          `Failed to generate report: ${err.message || 'Unknown error'}`,
          500,
          request,
          errorDetails
        );
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
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
