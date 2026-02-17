import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 先載入 dotenv
dotenv.config();

console.log('🔍 Starting server...');
console.log('🔍 SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('🔍 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== 公開 API =====

app.get('/api/phases', async (req, res) => {
  try {
    const data = await getPhases();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scenarios', async (req, res) => {
  try {
    const data = await getAllScenarios();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scenarios/:code', async (req, res) => {
  try {
    const data = await getScenario(req.params.code);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scenario-types', async (req, res) => {
  try {
    const data = await getScenarioTypes();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根據 Phase 取得場景
app.get('/api/scenarios/phase/:phaseId', async (req, res) => {
  try {
    const data = await getScenariosByPhase(req.params.phaseId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== User API =====

// 檢查用戶名是否存在
app.get('/api/users/check/:username', async (req, res) => {
  try {
    const exists = await checkUsernameExists(req.params.username);
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根據用戶名登入（獲取現有用戶）
app.post('/api/users/login', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 建立用戶
app.post('/api/users', async (req, res) => {
  try {
    const { username, language, consent, hasExperience } = req.body;
    const data = await createUser(username, language, consent, hasExperience);
    res.json(data);
  } catch (error) {
    // 如果是用戶名重複錯誤，返回 409 Conflict
    if (error.message === 'Username already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// 取得用戶
app.get('/api/users/:userId', async (req, res) => {
  try {
    const data = await getUser(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 取得用戶進度
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const data = await getUserProgress(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新用戶進度
app.post('/api/users/:userId/progress', async (req, res) => {
  try {
    const { scenarioId, status } = req.body;
    console.log(`📝 更新進度: userId=${req.params.userId}, scenarioId=${scenarioId}, status=${status}`);
    const data = await updateProgress(req.params.userId, scenarioId, status);
    console.log(`✅ 進度更新成功:`, data);
    res.json(data);
  } catch (error) {
    console.error(`❌ 進度更新失敗:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ===== Attempt API =====

// 開始嘗試
app.post('/api/attempts/start', async (req, res) => {
  try {
    const { userId, scenarioId, sessionId } = req.body;
    const data = await startAttempt(userId, scenarioId, sessionId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 完成嘗試
app.post('/api/attempts/complete', async (req, res) => {
  try {
    const { attemptId, isSuccess, errorDetails } = req.body;
    const data = await completeAttempt(attemptId, isSuccess, errorDetails);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 記錄 stage 錯誤（不結束 attempt）
app.post('/api/attempts/stage-error', async (req, res) => {
  try {
    const { attemptId, stageError } = req.body;
    console.log('📝 Recording stage error:', { attemptId, stage: stageError?.stage });
    const data = await recordStageError(attemptId, stageError);
    res.json(data);
  } catch (error) {
    console.error('❌ Failed to record stage error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== Admin API =====

app.get('/api/admin/users', async (req, res) => {
  try {
    const data = await getAllUsers();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/search', async (req, res) => {
  try {
    const data = await searchUsers(req.query.q);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/:userId/progress', async (req, res) => {
  try {
    const data = await getUserProgress(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/:userId/attempts', async (req, res) => {
  try {
    const data = await getUserAttempts(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/:userId/report', async (req, res) => {
  try {
    const data = await getUserFinalReport(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/reports', async (req, res) => {
  try {
    const data = await getAllFinalReports();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增關卡
app.post('/api/admin/scenarios', async (req, res) => {
  try {
    const data = await createScenario(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 刪除用戶及所有關聯數據
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const result = await deleteUserAndData(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== 用戶統計分析端點 =====

// 獲取用戶的所有答題記錄
app.get('/api/users/:userId/attempts', async (req, res) => {
  try {
    const data = await getUserAttempts(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取用戶整體統計
app.get('/api/users/:userId/statistics', async (req, res) => {
  try {
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
    res.status(500).json({ error: error.message });
  }
});

// 獲取特定關卡的統計
app.get('/api/users/:userId/statistics/:scenarioCode', async (req, res) => {
  try {
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
    res.status(500).json({ error: error.message });
  }
});

// 生成最終報告（含 AI 分析）
app.post('/api/users/:userId/report/generate', async (req, res) => {
  try {
    // 1. 先生成基礎統計報告並存入 DB
    const report = await generateFinalReport(req.params.userId);
    
    // 2. 呼叫 DeepSeek AI 生成分析
    let aiAnalysis = null;
    try {
      console.log('🤖 Calling DeepSeek AI for report analysis...');
      aiAnalysis = await generateAIAnalysis(report);
      console.log('✅ AI analysis completed');

      // 3. 將 AI 分析結果存入 DB
      try {
        await updateReportAIAnalysis(req.params.userId, aiAnalysis);
        console.log('💾 AI analysis saved to DB');
      } catch (saveErr) {
        console.error('⚠️ Failed to save AI analysis to DB:', saveErr.message);
      }
    } catch (aiErr) {
      console.error('⚠️ AI analysis failed (non-blocking):', aiErr.message);
    }
    
    // 4. 返回合併結果
    res.json({
      ...report,
      ai_analysis: aiAnalysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取最終報告（不含 AI 分析，僅讀取已存儲數據）
app.get('/api/users/:userId/report', async (req, res) => {
  try {
    const data = await getUserFinalReport(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 單獨呼叫 AI 分析（用於已有報告的重新分析）
app.post('/api/users/:userId/report/ai-analyze', async (req, res) => {
  try {
    const report = await getUserFinalReport(req.params.userId);
    if (!report) {
      return res.status(404).json({ error: 'No report found for this user' });
    }
    const aiAnalysis = await generateAIAnalysis(report);
    res.json({ ai_analysis: aiAnalysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});