import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// 先載入 dotenv
dotenv.config();

const IS_DEV = process.env.NODE_ENV !== 'production';

if (IS_DEV) {
  console.log('🔍 Starting server (dev mode)...');
  console.log('🔍 SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('🔍 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
}

import {
  getPhases,
  getAllScenarios,
  getScenario,
  getScenariosByPhase,
  getAllUsers,
  searchUsers,
  getUser,
  createUser,
  getUserByUsername,
  checkUsernameExists,
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
  getScenarioTypes,
  deleteUserAndData,
  createScenario
} from './config/supabase.js';
import { generateAIAnalysis } from './config/deepseek.js';
import { authenticateAdmin, requireAdmin } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust first proxy hop (required for rate limiting behind nginx/reverse proxy)
app.set('trust proxy', 1);

// ===== Security Middleware =====

// Helmet — HTTP security headers (CSP, HSTS, etc.)
app.use(helmet());

// CORS — restrict to allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Global rate limiter — 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});
app.use(globalLimiter);

// Strict rate limiter for auth endpoints — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' }
});

// Strict rate limiter for destructive operations — 5 per minute
const destructiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

// ===== Sanitized error handler =====
function safeError(res, error, statusCode = 500) {
  // Log detailed error server-side for debugging (dev only)
  if (IS_DEV) console.error('Server error:', error);
  // Return generic message to client (no internal details)
  const message = statusCode === 404
    ? 'Resource not found'
    : 'An internal error occurred';
  res.status(statusCode).json({ error: message });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Admin Auth Endpoint =====
app.post('/api/admin/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const token = await authenticateAdmin(username, password);
    if (!token) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ token });
  } catch (error) {
    safeError(res, error);
  }
});

// ===== UUID validation helper =====
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id) {
  return UUID_REGEX.test(id);
}

// ===== 公開 API =====

app.get('/api/phases', async (req, res) => {
  try {
    const data = await getPhases();
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/scenarios', async (req, res) => {
  try {
    const data = await getAllScenarios();
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/scenarios/:code', async (req, res) => {
  try {
    const code = req.params.code;
    if (!code || code.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(code)) {
      return res.status(400).json({ error: 'Invalid scenario code' });
    }
    const data = await getScenario(code);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/scenario-types', async (req, res) => {
  try {
    const data = await getScenarioTypes();
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 根據 Phase 取得場景
app.get('/api/scenarios/phase/:phaseId', async (req, res) => {
  try {
    const phaseId = req.params.phaseId;
    if (!isValidUUID(phaseId)) {
      return res.status(400).json({ error: 'Invalid phase ID' });
    }
    const data = await getScenariosByPhase(phaseId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// ===== User API =====

// 檢查用戶名是否存在
app.get('/api/users/check/:username', async (req, res) => {
  try {
    const username = req.params.username;
    if (!username || username.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Invalid username format' });
    }
    const exists = await checkUsernameExists(username);
    res.json({ exists });
  } catch (error) {
    safeError(res, error);
  }
});

// 根據用戶名登入（獲取現有用戶）
app.post('/api/users/login', authLimiter, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || username.length > 50) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = await getUserByUsername(username.trim());
    if (!user) {
      // Generic message to prevent username enumeration
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    safeError(res, error);
  }
});

// 建立用戶
app.post('/api/users', async (req, res) => {
  try {
    const { username, language, consent, hasExperience } = req.body;
    // Validate username
    if (!username || typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 50) {
      return res.status(400).json({ error: 'Username must be 1-50 characters' });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens and underscores' });
    }
    // Validate language
    if (language && !['en', 'zh'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }
    // Validate consent
    if (consent !== undefined && typeof consent !== 'boolean') {
      return res.status(400).json({ error: 'Invalid consent value' });
    }
    // Validate hasExperience
    if (hasExperience !== undefined && typeof hasExperience !== 'boolean') {
      return res.status(400).json({ error: 'Invalid hasExperience value' });
    }
    const data = await createUser(username.trim(), language, consent, hasExperience);
    res.json(data);
  } catch (error) {
    // 如果是用戶名重複錯誤，返回 409 Conflict
    if (error.message === 'Username already exists') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    safeError(res, error);
  }
});

// 取得用戶
app.get('/api/users/:userId', async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const data = await getUser(req.params.userId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 取得用戶進度
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const data = await getUserProgress(req.params.userId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 更新用戶進度
app.post('/api/users/:userId/progress', async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const { scenarioId, status } = req.body;
    if (!scenarioId || typeof scenarioId !== 'string' || scenarioId.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(scenarioId)) {
      return res.status(400).json({ error: 'Invalid scenario ID' });
    }
    if (!status || !['completed', 'in_progress', 'not_started', 'current'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const data = await updateProgress(req.params.userId, scenarioId, status);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// ===== Attempt API =====

// 開始嘗試
app.post('/api/attempts/start', async (req, res) => {
  try {
    const { userId, scenarioId, sessionId } = req.body;
    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (!scenarioId || !isValidUUID(scenarioId)) {
      return res.status(400).json({ error: 'Invalid scenario ID' });
    }
    // Validate sessionId format and length
    if (sessionId && (typeof sessionId !== 'string' || sessionId.length > 100)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    const data = await startAttempt(userId, scenarioId, sessionId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 完成嘗試
app.post('/api/attempts/complete', async (req, res) => {
  try {
    const { attemptId, isSuccess, errorDetails } = req.body;
    if (!attemptId || !isValidUUID(attemptId)) {
      return res.status(400).json({ error: 'Invalid attempt ID' });
    }
    if (typeof isSuccess !== 'boolean') {
      return res.status(400).json({ error: 'isSuccess must be a boolean' });
    }
    // Validate errorDetails size to prevent data pollution / storage DoS
    if (errorDetails) {
      if (typeof errorDetails !== 'object' || Array.isArray(errorDetails)) {
        return res.status(400).json({ error: 'errorDetails must be an object' });
      }
      if (JSON.stringify(errorDetails).length > 5000) {
        return res.status(400).json({ error: 'errorDetails too large (max 5KB)' });
      }
    }
    const data = await completeAttempt(attemptId, isSuccess, errorDetails);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 記錄 stage 錯誤（不結束 attempt）
app.post('/api/attempts/stage-error', async (req, res) => {
  try {
    const { attemptId, stageError } = req.body;
    if (!attemptId || !isValidUUID(attemptId)) {
      return res.status(400).json({ error: 'Invalid attempt ID' });
    }
    // Validate stageError shape and size
    if (!stageError || typeof stageError !== 'object' || Array.isArray(stageError)) {
      return res.status(400).json({ error: 'stageError must be an object' });
    }
    if (JSON.stringify(stageError).length > 5000) {
      return res.status(400).json({ error: 'stageError too large (max 5KB)' });
    }
    const data = await recordStageError(attemptId, stageError);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// ===== Admin API (all routes require JWT auth) =====

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const data = await getAllUsers();
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/admin/users/search', requireAdmin, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || typeof query !== 'string' || query.trim().length === 0 || query.length > 100) {
      return res.status(400).json({ error: 'Invalid search query' });
    }
    const data = await searchUsers(query.trim());
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/admin/users/:userId/progress', requireAdmin, async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const data = await getUserProgress(req.params.userId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/admin/users/:userId/attempts', requireAdmin, async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const data = await getUserAttempts(req.params.userId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/admin/users/:userId/report', requireAdmin, async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const data = await getUserFinalReport(req.params.userId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

app.get('/api/admin/reports', requireAdmin, async (req, res) => {
  try {
    const data = await getAllFinalReports();
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 新增關卡 — whitelist allowed fields only
app.post('/api/admin/scenarios', requireAdmin, async (req, res) => {
  try {
    const { scenario_code, phase_id, type_id, title_zh, title_en, description_zh, description_en, difficulty, order_index, config_data } = req.body;
    // Required fields validation
    if (!scenario_code || typeof scenario_code !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(scenario_code) || scenario_code.length > 50) {
      return res.status(400).json({ error: 'Invalid scenario_code (alphanumeric, hyphens, underscores, max 50 chars)' });
    }
    if (!phase_id || !isValidUUID(phase_id)) {
      return res.status(400).json({ error: 'Invalid phase_id' });
    }
    if (!type_id || !isValidUUID(type_id)) {
      return res.status(400).json({ error: 'Invalid type_id' });
    }
    if (!title_zh || typeof title_zh !== 'string' || title_zh.length > 200) {
      return res.status(400).json({ error: 'Invalid title_zh' });
    }
    if (!title_en || typeof title_en !== 'string' || title_en.length > 200) {
      return res.status(400).json({ error: 'Invalid title_en' });
    }
    // Only pass whitelisted fields
    const sanitizedData = {
      scenario_code, phase_id, type_id, title_zh, title_en,
      ...(description_zh && typeof description_zh === 'string' ? { description_zh: description_zh.slice(0, 1000) } : {}),
      ...(description_en && typeof description_en === 'string' ? { description_en: description_en.slice(0, 1000) } : {}),
      ...(difficulty !== undefined && Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 10 ? { difficulty } : {}),
      ...(order_index !== undefined && Number.isInteger(order_index) ? { order_index } : {}),
      ...(config_data && typeof config_data === 'object' && !Array.isArray(config_data) && JSON.stringify(config_data).length <= 10000 ? { config_data } : {}),
    };
    const data = await createScenario(sanitizedData);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 刪除用戶及所有關聯數據 (destructive — extra rate limiting)
app.delete('/api/admin/users/:userId', requireAdmin, destructiveLimiter, async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const result = await deleteUserAndData(req.params.userId);
    res.json(result);
  } catch (error) {
    safeError(res, error);
  }
});

// ===== 用戶統計分析端點 =====

// 獲取用戶的所有答題記錄
app.get('/api/users/:userId/attempts', async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const data = await getUserAttempts(req.params.userId);
    res.json(data);
  } catch (error) {
    safeError(res, error);
  }
});

// 獲取用戶整體統計
app.get('/api/users/:userId/statistics', async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const attempts = await getUserAttempts(req.params.userId);
    
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
    
    res.json({
      overall: {
        total_attempts: totalAttempts,
        success_attempts: successAttempts,
        failed_attempts: failedAttempts,
        success_rate: parseFloat(successRate),
        avg_time_ms: avgTimeMs,
        total_time_ms: totalTime
      },
      by_scenario: Object.values(scenarioStats)
    });
  } catch (error) {
    safeError(res, error);
  }
});

// 獲取特定關卡的統計
app.get('/api/users/:userId/statistics/:scenarioCode', async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const scenarioCode = req.params.scenarioCode;
    if (!scenarioCode || scenarioCode.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(scenarioCode)) {
      return res.status(400).json({ error: 'Invalid scenario code' });
    }
    const attempts = await getUserAttempts(req.params.userId);
    const scenarioAttempts = attempts.filter(a => 
      a.scenarios?.scenario_code === req.params.scenarioCode
    );
    
    if (scenarioAttempts.length === 0) {
      return res.json({
        scenario_code: req.params.scenarioCode,
        total_attempts: 0,
        success_count: 0,
        fail_count: 0,
        attempts: []
      });
    }
    
    const successCount = scenarioAttempts.filter(a => a.is_success).length;
    const failCount = scenarioAttempts.length - successCount;
    
    res.json({
      scenario_code: req.params.scenarioCode,
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
    });
  } catch (error) {
    safeError(res, error);
  }
});

// AI cost rate limiter — 3 calls per hour per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI analysis rate limit exceeded, try again later' }
});

// 生成最終報告（含 AI 分析）— rate limited (destructive: deletes raw attempts after report)
// NOTE: Called by frontend when user completes all scenarios — no admin auth required
app.post('/api/users/:userId/report/generate', destructiveLimiter, async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    // 1. 先生成基礎統計報告並存入 DB
    const report = await generateFinalReport(req.params.userId);
    
    // 2. 呼叫 DeepSeek AI 生成分析
    let aiAnalysis = null;
    try {
      aiAnalysis = await generateAIAnalysis(report);

      // 3. 將 AI 分析結果存入 DB
      try {
        await updateReportAIAnalysis(req.params.userId, aiAnalysis);
      } catch (saveErr) {
        if (IS_DEV) console.error('Failed to save AI analysis to DB:', saveErr);
      }
    } catch (aiErr) {
      if (IS_DEV) console.error('AI analysis failed (non-blocking):', aiErr);
    }
    
    // 4. 返回合併結果
    res.json({
      ...report,
      ai_analysis: aiAnalysis
    });
  } catch (error) {
    safeError(res, error);
  }
});

// 獲取最終報告（讀取已存儲數據，並標準化欄位名）
app.get('/api/users/:userId/report', async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const data = await getUserFinalReport(req.params.userId);
    if (!data) {
      return res.status(404).json({ error: 'Report not found' });
    }
    // 標準化：將 DB 欄位 ai_analysis_result 映射為前端期望的 ai_analysis
    const { ai_analysis_result, ...rest } = data;
    res.json({
      ...rest,
      ai_analysis: ai_analysis_result || null
    });
  } catch (error) {
    safeError(res, error);
  }
});

// 單獨呼叫 AI 分析（用於已有報告的重新分析）— requires admin auth + rate limited
app.post('/api/users/:userId/report/ai-analyze', requireAdmin, aiLimiter, async (req, res) => {
  try {
    if (!isValidUUID(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const report = await getUserFinalReport(req.params.userId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const aiAnalysis = await generateAIAnalysis(report);
    res.json({ ai_analysis: aiAnalysis });
  } catch (error) {
    safeError(res, error);
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});