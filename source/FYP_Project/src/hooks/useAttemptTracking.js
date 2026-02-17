import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

// 全局變量追蹤正在進行的 attempt，防止 React Strict Mode 雙重調用
const activeAttempts = new Map();

/**
 * 答題記錄 Hook
 * 提供手動開始和自動完成記錄的功能
 * 
 * @param {string} scenarioCode - 場景代碼
 * @returns {object} - { startTracking, currentAttemptId, completeScenarioAndUnlockNext }
 */
export const useAttemptTracking = (scenarioCode) => {
  const { startScenarioAttempt, completeScenarioAndUnlockNext, recordStageError, currentAttemptId } = useGame();
  const hasStarted = useRef(false);
  const isStarting = useRef(false); // 防止並發調用

  // 手動開始記錄（在用戶實際開始挑戰時調用）
  // 返回 attemptId，確保調用者可以等待 attempt 創建完成
  const startTracking = useCallback(async () => {
    // 多重檢查防止重複調用
    if (!scenarioCode) {
      console.log('⚠️ No scenarioCode provided');
      return null;
    }
    
    // 如果已經有 currentAttemptId，直接返回它
    if (currentAttemptId) {
      console.log('⚠️ Already have current attempt ID:', currentAttemptId);
      hasStarted.current = true;
      return currentAttemptId;
    }
    
    if (hasStarted.current) {
      console.log('⚠️ Already started tracking for:', scenarioCode);
      // 等待 attempt 創建完成（如果正在進行中）
      let waitCount = 0;
      while (isStarting.current && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      return currentAttemptId;
    }
    
    if (isStarting.current) {
      console.log('⚠️ Already starting tracking for:', scenarioCode);
      // 等待進行中的創建完成
      let waitCount = 0;
      while (isStarting.current && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      return currentAttemptId;
    }
    
    // 檢查全局狀態 - 防止 React Strict Mode 雙重調用
    if (activeAttempts.has(scenarioCode)) {
      console.log('⚠️ Global: Already has active attempt for:', scenarioCode);
      return currentAttemptId;
    }
    
    console.log('🎬 Starting attempt tracking for:', scenarioCode);
    isStarting.current = true;
    hasStarted.current = true;
    activeAttempts.set(scenarioCode, Date.now());
    
    try {
      const attemptId = await startScenarioAttempt(scenarioCode);
      console.log('✅ Attempt tracking started, ID:', attemptId);
      return attemptId;
    } catch (error) {
      console.error('❌ Failed to start tracking:', error);
      return null;
    } finally {
      isStarting.current = false;
    }
  }, [scenarioCode, startScenarioAttempt, currentAttemptId]);

  // 重置狀態（當場景代碼改變時）
  useEffect(() => {
    // 清理舊的場景
    return () => {
      if (hasStarted.current && scenarioCode) {
        // 延遲清理，給完成操作時間
        setTimeout(() => {
          activeAttempts.delete(scenarioCode);
        }, 1000);
      }
    };
  }, [scenarioCode]);

  // 組件卸載時的清理
  useEffect(() => {
    return () => {
      if (hasStarted.current) {
        console.log('⚠️ Component unmounted with active attempt for:', scenarioCode);
        // 注意：這裡不能使用 await，因為 cleanup 函數應該是同步的
      }
    };
  }, [scenarioCode]);

  return {
    startTracking,
    currentAttemptId,
    completeScenarioAndUnlockNext,
    recordStageError
  };
};

/**
 * 答題記錄輔助函數
 * 用於在關卡中記錄答題結果
 */
export const recordAttemptResult = {
  /**
   * 記錄成功答題
   */
  success: async (completeScenarioAndUnlockNext, scenarioCode, nextScenarioCode) => {
    await completeScenarioAndUnlockNext(scenarioCode, nextScenarioCode, true, null);
  },

  /**
   * 記錄失敗答題
   */
  failure: async (completeScenarioAndUnlockNext, scenarioCode, errorType, errorDetails = {}) => {
    const errorData = {
      error_type: errorType,
      ...errorDetails,
      timestamp: new Date().toISOString()
    };
    
    await completeScenarioAndUnlockNext(scenarioCode, null, false, errorData);
  }
};
