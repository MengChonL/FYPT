// src/context/GameContext.jsx
// 遊戲狀態管理 - 連接後端 API

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getPhases, getScenarios, getUserProgress, updateProgress as apiUpdateProgress, startAttempt as apiStartAttempt, completeAttempt as apiCompleteAttempt, recordStageError as apiRecordStageError } from '../api';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [phases, setPhases] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioCode, setCurrentScenarioCode] = useState('phase1-1'); // 簡化：只追蹤當前關卡
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [language, setLanguageState] = useState('chinese'); // 新增語言狀態
  
  // 當前答題記錄 ID（用於追蹤答題過程）
  // 使用 state + ref 雙重追蹤，確保即時更新和異步操作的一致性
  const [currentAttemptId, setCurrentAttemptId] = useState(null);
  const currentAttemptIdRef = useRef(null);
  const [attemptStartTime, setAttemptStartTime] = useState(null);
  
  // 防止並發創建 attempt
  const isCreatingAttempt = useRef(false);

  // Ref 追蹤最新的 currentScenarioCode（供 useCallback 中使用，避免 stale closure）
  const currentScenarioCodeRef = useRef(currentScenarioCode);
  useEffect(() => { currentScenarioCodeRef.current = currentScenarioCode; }, [currentScenarioCode]);

  // 從 scenarios 動態計算順序（按 display_order 排序）
  const getScenarioOrder = () => {
    if (scenarios.length === 0) return [];
    return [...scenarios]
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map(s => s.scenario_code);
  };

  // 別名映射：舊 scenario code -> 新 scenario code
  const scenarioAliases = {
    'malicious-auth': 'phase2-1',
    'judge-auth': 'phase2-2',
    'phase2-danger-auth': 'phase2-3'
  };

  // 反向映射：新 scenario code -> 舊 scenario code（用於資料庫查詢）
  const reverseAliases = {
    'phase2-1': 'malicious-auth',
    'phase2-2': 'judge-auth',
    'phase2-3': 'phase2-danger-auth'
  };

  // 標準化 scenario code（將舊的別名轉換為新格式）
  const normalizeScenarioCode = (code) => {
    return scenarioAliases[code] || code;
  };

  // 反向轉換：新格式轉舊格式（用於資料庫查詢）
  const denormalizeScenarioCode = (code) => {
    return reverseAliases[code] || code;
  };

  // 初始化時從 localStorage 讀取 userId 和 language
  useEffect(() => {
    const storedUserId = localStorage.getItem('fyp_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage) {
      setLanguageState(storedLanguage);
    }
  }, []);

  // 設定語言
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // 載入 Phases 和 Scenarios
  // 初始載入 phases 和 scenarios
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        if (import.meta.env.DEV) console.log('📦 Loading game data...');
        const [phasesData, scenariosData] = await Promise.all([
          getPhases(),
          getScenarios()
        ]);

        if (import.meta.env.DEV) console.log('📦 Phases loaded:', phasesData?.length);
        if (import.meta.env.DEV) console.log('📦 Scenarios loaded:', scenariosData?.length);
        setPhases(phasesData || []);
        setScenarios(scenariosData || []);
      } catch (err) {
        console.error('Failed to load game data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  // 當 userId 改變時載入用戶進度
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!userId) return;
      
      try {
        if (import.meta.env.DEV) console.log('📊 Loading user progress for:', userId);
        const progressData = await getUserProgress(userId);
        if (import.meta.env.DEV) console.log('📊 Progress data:', progressData);
        
        // 新格式：{ current_scenario_code: 'phase1-2' }
        if (progressData?.current_scenario_code) {
          setCurrentScenarioCode(progressData.current_scenario_code);
          if (import.meta.env.DEV) console.log('📊 Current scenario:', progressData.current_scenario_code);
        }
      } catch (err) {
        console.error('Failed to load user progress:', err);
      }
    };

    loadUserProgress();
  }, [userId]);

  // 設定用戶
  const setUser = (id) => {
    setUserId(id);
    localStorage.setItem('fyp_user_id', id);
  };

  // 登出用戶
  const logout = () => {
    setUserId(null);
    setCurrentScenarioCode('phase1-1');
    localStorage.removeItem('fyp_user_id');
    localStorage.removeItem('fyp_user_data');
    localStorage.removeItem('preferredLanguage');
    localStorage.removeItem('dataConsent');
    localStorage.removeItem('web3Experience');
    localStorage.removeItem('consentTimestamp');
    if (import.meta.env.DEV) console.log('🚪 User logged out');
  };

  // 更新進度 - 只更新當前關卡到下一關
  const updateProgress = async (nextScenarioCode) => {
    if (import.meta.env.DEV) console.log('📝 GameContext updateProgress called:', { userId, nextScenarioCode });
    
    // 已完成所有關卡的用戶，不允許更改 current_scenario_code
    if (currentScenarioCodeRef.current === 'completed') {
      if (import.meta.env.DEV) console.log('ℹ️ User already completed, current_scenario_code stays as completed');
      return;
    }

    if (!userId) {
      if (import.meta.env.DEV) console.warn('⚠️ No userId in updateProgress');
      return;
    }
    
    try {
      if (import.meta.env.DEV) console.log('🌐 Calling API updateProgress...');
      const result = await apiUpdateProgress(userId, nextScenarioCode, 'current');
      if (import.meta.env.DEV) console.log('✅ API response:', result);
      
      setCurrentScenarioCode(nextScenarioCode);
      if (import.meta.env.DEV) console.log('✅ Local state updated to:', nextScenarioCode);
    } catch (err) {
      console.error('❌ Failed to update progress:', err);
    }
  };

  // 完成關卡並解鎖下一關 - 簡化版本
  const completeScenarioAndUnlockNext = useCallback(async (scenarioCode, nextScenarioCode, isSuccess = true, errorDetails = null) => {
    if (import.meta.env.DEV) console.log('🎯 completeScenarioAndUnlockNext called:', { scenarioCode, nextScenarioCode, userId, isSuccess });
    
    // 已完成所有關卡的用戶，不記錄任何資料到 DB
    if (currentScenarioCodeRef.current === 'completed') {
      if (import.meta.env.DEV) console.log('ℹ️ User already completed all scenarios, skipping DB record');
      return;
    }

    if (!userId) {
      if (import.meta.env.DEV) console.warn('⚠️ No userId, cannot update progress');
      return;
    }

    try {
      // 使用 ref 來獲取最新的 attemptId（避免 closure 問題）
      const attemptId = currentAttemptIdRef.current;
      
      // 記錄答題結果到 user_attempts
      if (attemptId) {
        if (import.meta.env.DEV) console.log('📝 Recording attempt result:', { attemptId, isSuccess, errorDetails });
        await apiCompleteAttempt(attemptId, isSuccess, errorDetails);
        if (import.meta.env.DEV) console.log('✅ Attempt result recorded successfully');
        // 清除 attempt ID
        currentAttemptIdRef.current = null;
        setCurrentAttemptId(null);
        setAttemptStartTime(null);
      } else {
        console.error('❌ No current attempt ID! Cannot record attempt. This usually means:');
        console.error('   1. startTracking() was not called before completing');
        console.error('   2. startTracking() API request is still in progress');
        console.error('   3. The attempt was already completed');
        console.error('   Current state:', { 
          refValue: currentAttemptIdRef.current,
          scenarioCode,
          userId 
        });
      }

      // 只有成功時才更新進度，除非設置了 force_progress_update（用於最後一關）
      const shouldUpdateProgress = isSuccess || errorDetails?.force_progress_update;
      
      if (shouldUpdateProgress) {
        if (nextScenarioCode) {
          // 更新到下一關
          await updateProgress(nextScenarioCode);
          if (import.meta.env.DEV) console.log(`✅ 已完成 ${scenarioCode}，進入 ${nextScenarioCode}`);
        } else {
          // 沒有下一關，表示全部完成，設置為 'completed'
          await updateProgress('completed');
          if (import.meta.env.DEV) console.log(`🎉 已完成所有關卡！最後完成: ${scenarioCode}`);
        }
      } else {
        if (import.meta.env.DEV) console.log(`❌ 關卡失敗: ${scenarioCode}，錯誤: ${errorDetails?.error_type || 'unknown'}`);
      }
    } catch (err) {
      console.error('❌ Failed to complete scenario:', err);
    }
  }, [userId]);

  // 記錄 stage 錯誤（不結束 attempt，用於多階段關卡）
  const recordStageError = useCallback(async (stageError) => {
    // 已完成所有關卡的用戶，不記錄
    if (currentScenarioCodeRef.current === 'completed') {
      if (import.meta.env.DEV) console.log('ℹ️ User already completed, skipping stage error record');
      return;
    }

    const attemptId = currentAttemptIdRef.current;
    
    if (!attemptId) {
      if (import.meta.env.DEV) console.warn('⚠️ No current attempt ID, cannot record stage error');
      return;
    }

    try {
      if (import.meta.env.DEV) console.log('📝 Recording stage error:', { attemptId, stage: stageError?.stage, error_type: stageError?.error_type });
      await apiRecordStageError(attemptId, stageError);
      if (import.meta.env.DEV) console.log('✅ Stage error recorded');
    } catch (err) {
      console.error('❌ Failed to record stage error:', err);
    }
  }, []);

  // 開始答題（在進入關卡時調用）
  // 根據 scenario_code 獲取場景 ID（需要放在 startScenarioAttempt 之前）
  const getScenarioIdByCode = useCallback((scenarioCode) => {
    const scenario = scenarios.find(s => s.scenario_code === scenarioCode);
    return scenario?.scenario_id || null;
  }, [scenarios]);

  const startScenarioAttempt = useCallback(async (scenarioCode) => {
    // 已完成所有關卡的用戶，不建立 attempt 記錄
    if (currentScenarioCodeRef.current === 'completed') {
      console.log('ℹ️ User already completed all scenarios, skipping attempt creation');
      return null;
    }

    if (!userId) {
      console.warn('⚠️ No userId, cannot start attempt');
      return null;
    }

    // 防止重複創建 attempt - 檢查 ref（最新值）
    if (currentAttemptIdRef.current) {
      console.log('⚠️ Already have active attempt (ref):', currentAttemptIdRef.current, '- skipping');
      return currentAttemptIdRef.current;
    }
    
    // 防止並發創建
    if (isCreatingAttempt.current) {
      console.log('⚠️ Already creating attempt - skipping');
      return null;
    }

    isCreatingAttempt.current = true;

    try {
      // 直接在 scenarios 中查找，避免依賴問題
      const scenario = scenarios.find(s => s.scenario_code === scenarioCode);
      const scenarioId = scenario?.scenario_id || null;
      
      if (!scenarioId) {
        console.error('❌ Scenario not found:', scenarioCode);
        return null;
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🎬 Starting attempt:', { userId, scenarioId, scenarioCode, sessionId });
      
      const attemptData = await apiStartAttempt(userId, scenarioId, sessionId);
      
      // 同時更新 state 和 ref
      currentAttemptIdRef.current = attemptData.attempt_id;
      setCurrentAttemptId(attemptData.attempt_id);
      setAttemptStartTime(new Date());
      
      console.log('✅ Attempt started:', attemptData.attempt_id);
      return attemptData.attempt_id;
    } catch (err) {
      console.error('❌ Failed to start attempt:', err);
      return null;
    } finally {
      isCreatingAttempt.current = false;
    }
  }, [userId, scenarios]);

  // 根據 phase_code 取得該 phase 的所有 scenarios
  const getScenariosByPhase = (phaseCode) => {
    const phase = phases.find(p => p.phase_code === phaseCode);
    if (!phase) return [];
    return scenarios.filter(s => s.phase_id === phase.phase_id);
  };

  // 取得場景狀態 - 基於 currentScenarioCode 計算
  const getScenarioStatus = (scenarioCode) => {
    // 如果所有關卡已完成，所有場景都是 completed
    if (currentScenarioCode === 'completed') return 'completed';

    // 標準化輸入和當前的 scenario code（都轉為新格式）
    const normalizedQuery = normalizeScenarioCode(scenarioCode);
    const normalizedCurrent = normalizeScenarioCode(currentScenarioCode);
    
    // 獲取舊格式（用於在資料庫順序中查找）
    const dbQuery = denormalizeScenarioCode(normalizedQuery);
    const dbCurrent = denormalizeScenarioCode(normalizedCurrent);
    
    const scenarioOrder = getScenarioOrder(); // 這返回資料庫中的舊代碼
    
    // 在順序中查找（嘗試多種格式）
    let currentIndex = scenarioOrder.indexOf(dbCurrent);
    if (currentIndex < 0) currentIndex = scenarioOrder.indexOf(currentScenarioCode);
    if (currentIndex < 0) currentIndex = scenarioOrder.indexOf(normalizedCurrent);
    
    let scenarioIndex = scenarioOrder.indexOf(dbQuery);
    if (scenarioIndex < 0) scenarioIndex = scenarioOrder.indexOf(scenarioCode);
    if (scenarioIndex < 0) scenarioIndex = scenarioOrder.indexOf(normalizedQuery);
    
    // 如果場景不在順序列表中，檢查是否是當前場景
    if (scenarioIndex < 0) {
      // 如果查詢的場景就是當前場景，返回 current
      if (normalizedQuery === normalizedCurrent) return 'current';
      return 'locked';
    }
    
    if (currentIndex < 0) {
      // 如果當前場景不在列表中，使用顯示順序來判斷
      return scenarioIndex === 0 ? 'current' : 'locked';
    }
    
    if (scenarioIndex < currentIndex) return 'completed';
    if (scenarioIndex === currentIndex) return 'current';
    return 'locked';
  };

  // 獲取用戶當前應該進入的關卡
  const getCurrentScenario = () => {
    // 先標準化 scenario code（將舊格式轉為新格式）
    const normalizedCode = normalizeScenarioCode(currentScenarioCode);
    // 然後獲取舊格式（用於查詢資料庫中的 scenarios）
    const dbCode = denormalizeScenarioCode(normalizedCode);
    
    console.log('🎯 getCurrentScenario:', { 
      currentScenarioCode, 
      normalizedCode, 
      dbCode,
      scenariosCount: scenarios.length,
      availableCodes: scenarios.map(s => s.scenario_code)
    });
    
    // 按優先順序查找：1. 直接匹配 2. 舊格式匹配 3. 反向映射匹配 4. 預設 phase1-1
    return scenarios.find(s => s.scenario_code === currentScenarioCode) || 
           scenarios.find(s => s.scenario_code === dbCode) ||
           scenarios.find(s => s.scenario_code === normalizedCode) ||
           scenarios.find(s => s.scenario_code === 'phase1-1') || null;
  };

  // 獲取用戶當前關卡的路由路徑
  const getCurrentScenarioPath = () => {
    const currentScenario = getCurrentScenario();
    if (!currentScenario) return null;
    
    const scenarioCode = currentScenario.scenario_code;
    const phaseCode = getPhaseByScenarioCode(scenarioCode);
    
    if (phaseCode && scenarioCode) {
      return `/challenge/${phaseCode}/${scenarioCode}`;
    }
    return null;
  };

  // 檢查場景是否可以開始
  const canStartScenario = (scenarioCode) => {
    // 如果所有關卡已完成，所有場景都可以開始
    if (currentScenarioCode === 'completed') return true;

    // 標準化 scenario code
    const normalizedCode = normalizeScenarioCode(scenarioCode);
    const normalizedCurrent = normalizeScenarioCode(currentScenarioCode);
    
    // 如果查詢的場景就是當前場景，可以開始
    if (normalizedCode === normalizedCurrent) {
      return true;
    }
    
    const status = getScenarioStatus(normalizedCode);
    return status === 'unlocked' || status === 'current' || status === 'completed';
  };

  // 檢查階段是否可以開始
  const canStartPhase = (phaseCode) => {
    // 如果所有關卡已完成，所有階段都可以開始
    if (currentScenarioCode === 'completed') return true;

    // 標準化當前 scenario code
    const normalizedCurrent = normalizeScenarioCode(currentScenarioCode);
    
    // Phase 1 總是可以開始
    if (phaseCode === 'onboarding' || phaseCode === 'phase1') {
      return true;
    }
    
    // Phase 2: 如果當前場景是 phase2 開頭，則可以開始
    if (phaseCode === 'phase2') {
      // 如果當前已經在 phase2，當然可以開始
      if (normalizedCurrent.startsWith('phase2')) {
        return true;
      }
      
      // 否則檢查 phase1-6 是否完成
      const phase1_6_status = getScenarioStatus('phase1-6');
      console.log('🔐 canStartPhase(phase2) check:', { currentScenarioCode, normalizedCurrent, phase1_6_status });
      return phase1_6_status === 'completed';
    }
    
    return false;
  };

  // 根據 scenario_code 獲取 phase_code (用於 URL 路由)
  const getPhaseByScenarioCode = (scenarioCode) => {
    // 嘗試反向映射（如果輸入是新格式，轉換為舊格式查詢資料庫）
    const dbCode = denormalizeScenarioCode(scenarioCode);
    
    // 首先嘗試從已載入的 scenarios 中查找（嘗試多種格式）
    const scenario = scenarios.find(s => s.scenario_code === scenarioCode) ||
                     scenarios.find(s => s.scenario_code === dbCode);
    if (scenario) {
      const phase = phases.find(p => p.phase_id === scenario.phase_id);
      if (phase) {
        // 為了 URL 一致性，phase1 使用 'onboarding' 作為路由參數
        if (phase.phase_code === 'phase1') {
          return 'onboarding';
        }
        return phase.phase_code;
      }
    }
    
    // Fallback: 從 scenarioCode 推斷 phase
    // 格式: 'phase1-2' -> 'onboarding', 'phase2-danger-auth' -> 'phase2'
    if (scenarioCode.startsWith('phase1')) {
      return 'onboarding';
    }
    if (scenarioCode.startsWith('phase2')) {
      return 'phase2';
    }
    
    // 特殊情況: 非 phase 開頭的 scenario code 映射
    const specialMappings = {
      'malicious-auth': 'phase2',
      'judge-auth': 'phase2',
      'danger-auth': 'phase2'
    };
    
    return specialMappings[scenarioCode] || null;
  };

  // 獲取指定 Phase 的當前應該進入的關卡路徑
  const getPhaseCurrentPath = (phaseCode) => {
    const normalizedCurrent = normalizeScenarioCode(currentScenarioCode);
    
    // Phase 1 (onboarding) 的關卡順序
    const phase1Scenarios = ['phase1-1', 'phase1-2', 'phase1-3', 'phase1-4', 'phase1-5', 'phase1-6'];
    // Phase 2 的關卡順序
    const phase2Scenarios = ['phase2-1', 'phase2-2', 'phase2-3'];
    
    if (phaseCode === 'onboarding' || phaseCode === 'phase1') {
      // 如果當前進度在 phase1 範圍內，返回當前進度
      if (normalizedCurrent.startsWith('phase1-')) {
        return `/challenge/onboarding/${normalizedCurrent}`;
      }
      // 如果當前進度已經超過 phase1（在 phase2 或更後），返回最後一個 phase1 關卡
      if (normalizedCurrent.startsWith('phase2') || normalizedCurrent === 'completed') {
        return `/challenge/onboarding/phase1-6`;
      }
      // 默認從 phase1-1 開始
      return `/challenge/onboarding/phase1-1`;
    }
    
    if (phaseCode === 'phase2') {
      // 如果當前進度在 phase2 範圍內，返回當前進度
      if (normalizedCurrent.startsWith('phase2-')) {
        return `/challenge/phase2/${normalizedCurrent}`;
      }
      // 如果已完成所有關卡
      if (normalizedCurrent === 'completed') {
        return `/challenge/phase2/phase2-3`;
      }
      // 默認從 phase2-1 開始
      return `/challenge/phase2/phase2-1`;
    }
    
    return null;
  };

  const value = {
    phases,
    scenarios,
    currentScenarioCode,
    loading,
    error,
    userId,
    language,
    setUser,
    setLanguage,
    logout,
    updateProgress,
    getScenariosByPhase,
    getScenarioStatus,
    getCurrentScenario,
    getCurrentScenarioPath,
    canStartScenario,
    canStartPhase,
    getPhaseByScenarioCode,
    getPhaseCurrentPath,
    completeScenarioAndUnlockNext,
    startScenarioAttempt,
    recordStageError,
    currentAttemptId,
    getScenarioIdByCode
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
