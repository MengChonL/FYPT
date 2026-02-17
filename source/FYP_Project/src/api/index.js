// src/api/index.js
// 前端 API 連接層

const API_BASE = 'http://localhost:3001/api';

// ===== 通用 fetch 函數 =====
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

async function postAPI(endpoint, data) {
  console.log(`📡 POST ${API_BASE}${endpoint}`, data);
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    console.log(`📡 Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const result = await response.json();
    console.log(`📡 Response data:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to post ${endpoint}:`, error);
    throw error;
  }
}

// ===== Health =====
export const checkHealth = () => fetchAPI('/health');

// ===== Phases =====
export const getPhases = () => fetchAPI('/phases');

// ===== Scenarios =====
export const getScenarios = () => fetchAPI('/scenarios');
export const getScenario = (code) => fetchAPI(`/scenarios/${code}`);
export const getScenariosByPhase = (phaseId) => fetchAPI(`/scenarios/phase/${phaseId}`);
export const getScenarioTypes = () => fetchAPI('/scenario-types');

// ===== User =====
export const createUser = (username, language, consent = true, hasExperience = false) => 
  postAPI('/users', { username, language, consent, hasExperience });
export const getUser = (userId) => fetchAPI(`/users/${userId}`);
export const checkUsernameExists = (username) => fetchAPI(`/users/check/${encodeURIComponent(username)}`);
export const loginByUsername = (username) => postAPI('/users/login', { username });

// ===== Progress =====
export const getUserProgress = (userId) => fetchAPI(`/users/${userId}/progress`);
export const updateProgress = (userId, scenarioId, status) => {
  console.log('🌐 API updateProgress called:', { userId, scenarioId, status });
  return postAPI(`/users/${userId}/progress`, { scenarioId, status });
};

// ===== Attempts =====
export const startAttempt = (userId, scenarioId, sessionId) => 
  postAPI('/attempts/start', { userId, scenarioId, sessionId });

export const completeAttempt = (attemptId, isSuccess, errorDetails = null) => 
  postAPI('/attempts/complete', { attemptId, isSuccess, errorDetails });

// 記錄 stage 錯誤（不結束 attempt）
export const recordStageError = (attemptId, stageError) =>
  postAPI('/attempts/stage-error', { attemptId, stageError });

export const getUserAttempts = (userId) => fetchAPI(`/users/${userId}/attempts`);

// ===== Statistics =====
export const getUserStatistics = async (userId) => {
  return fetchAPI(`/users/${userId}/statistics`);
};

export const getScenarioStatistics = async (userId, scenarioCode) => {
  return fetchAPI(`/users/${userId}/statistics/${scenarioCode}`);
};

// ===== Reports =====
export const getUserFinalReport = (userId) => fetchAPI(`/users/${userId}/report`);
export const generateFinalReport = (userId) => postAPI(`/users/${userId}/report/generate`, {});

export default {
  checkHealth,
  getPhases,
  getScenarios,
  getScenario,
  getScenariosByPhase,
  getScenarioTypes,
  createUser,
  getUser,
  checkUsernameExists,
  loginByUsername,
  getUserProgress,
  updateProgress,
  startAttempt,
  completeAttempt,
  recordStageError,
  getUserAttempts,
  getUserStatistics,
  getScenarioStatistics,
  getUserFinalReport,
  generateFinalReport
};
