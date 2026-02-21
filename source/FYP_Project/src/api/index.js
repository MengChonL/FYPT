<<<<<<< HEAD
// src/api/index.js
// 前端 API 連接層

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to post ${endpoint}:`, error.message);
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
=======
// src/api/index.js
// 前端 API 連接層

// In production on Cloudflare Pages, Functions live under the same origin at `/api`.
// In local dev you can still override with VITE_API_URL (e.g. http://localhost:3001/api).
// Note: if VITE_API_URL is set to an empty string in the build environment, treat it as "not set".
const API_BASE = (import.meta.env.VITE_API_URL || '').trim() || '/api';

// ===== 通用 fetch 函數 =====
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    // 嘗試讀取響應體（無論成功或失敗）
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseErr) {
      responseData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || `API Error: ${response.status}`;
      const error = new Error(errorMessage);
      
      if (import.meta.env.DEV && responseData.details) {
        error.details = responseData.details;
        error.fullResponse = responseData;
      }
      
      console.error(`[API Error] ${endpoint}:`, {
        status: response.status,
        message: errorMessage,
        response: responseData
      });
      
      throw error;
    }
    
    return responseData;
  } catch (error) {
    if (error.message && (error.message.includes('API Error') || error.message.includes('HTTP'))) {
      throw error;
    }
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

async function postAPI(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    // 嘗試讀取響應體（無論成功或失敗）
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseErr) {
      // 如果無法解析 JSON，使用默認錯誤
      responseData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    if (!response.ok) {
      // 構建詳細的錯誤信息
      const errorMessage = responseData.error || responseData.message || `API Error: ${response.status}`;
      const error = new Error(errorMessage);
      
      // 在開發環境中，附加詳細信息
      if (import.meta.env.DEV && responseData.details) {
        error.details = responseData.details;
        error.fullResponse = responseData;
        console.error(`[API Error] ${endpoint}:`, {
          status: response.status,
          message: errorMessage,
          details: responseData.details,
          fullResponse: responseData
        });
      } else {
        console.error(`[API Error] ${endpoint}:`, {
          status: response.status,
          message: errorMessage,
          response: responseData
        });
      }
      
      throw error;
    }
    
    return responseData;
  } catch (error) {
    // 如果已經是我們構造的錯誤，直接拋出
    if (error.message && error.message.includes('API Error') || error.message.includes('HTTP')) {
      throw error;
    }
    // 否則是網絡錯誤或其他錯誤
    console.error(`Failed to post ${endpoint}:`, error);
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
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
