# 答題數據記錄使用指南

## 概述

系統現在會自動記錄每次答題的詳細數據到 `user_attempts` 表，用於數據分析和統計。

## 自動記錄機制

### 1. 自動開始記錄

當用戶進入關卡頁面時（`ChallengePage`），系統會自動：
- 調用 `startScenarioAttempt(scenarioCode)` 
- 記錄開始時間到 `user_attempts.start_time`
- 生成 `attempt_id` 供後續使用

### 2. 完成記錄

在關卡組件中調用 `completeScenarioAndUnlockNext` 時，系統會自動：
- 調用 `completeAttempt(attempt_id, isSuccess, errorDetails)`
- 記錄結束時間和答題耗時
- 記錄成功/失敗狀態
- 記錄錯誤詳情（如果失敗）
- 只有成功時才更新進度到下一關

## 在關卡組件中的使用

### 成功案例

```jsx
import { useGame } from '../context/GameContext';

const YourChallenge = ({ config }) => {
  const { completeScenarioAndUnlockNext } = useGame();
  
  const handleSuccess = async () => {
    // 用戶答對了
    await completeScenarioAndUnlockNext(
      config.id,           // 當前關卡代碼 (如 'phase1-1')
      config.nextLevel,    // 下一關代碼 (如 'phase1-2'，如果是最後一關則為 null)
      true,                // isSuccess = true
      null                 // errorDetails = null (成功時不需要)
    );
  };
  
  return (
    <button onClick={handleSuccess}>提交答案</button>
  );
};
```

### 失敗案例

```jsx
const handleFailure = async (userAnswer, correctAnswer) => {
  // 用戶答錯了
  await completeScenarioAndUnlockNext(
    config.id,           // 當前關卡代碼
    null,                // 失敗時不進入下一關
    false,               // isSuccess = false
    {
      error_type: 'wrong_address',           // 錯誤類型
      user_selected: userAnswer,             // 用戶的選擇
      correct_answer: correctAnswer,         // 正確答案
      description: '用戶選擇了錯誤的地址'   // 描述
    }
  );
  
  // 顯示錯誤提示，讓用戶重試
  setShowError(true);
};
```

## 錯誤類型建議

為了統計分析，建議使用以下統一的錯誤類型：

### Phase 1 錯誤類型

- `wrong_wallet_choice` - 選擇了錯誤的錢包
- `wrong_network` - 選擇了錯誤的網絡
- `wrong_address` - 選擇了錯誤的地址
- `wrong_amount` - 輸入了錯誤的金額
- `security_phrase_error` - 助記詞相關錯誤
- `phishing_link_clicked` - 點擊了釣魚連結

### Phase 2 錯誤類型

- `wrong_contract` - 選擇了錯誤的合約
- `wrong_authorization` - 授權判斷錯誤
- `malicious_site_trusted` - 信任了惡意網站
- `signature_verification_failed` - 簽名驗證失敗
- `permission_scope_error` - 權限範圍判斷錯誤

## 完整示例：CreateWalletChallenge

```jsx
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const CreateWalletChallenge = ({ config }) => {
  const { completeScenarioAndUnlockNext } = useGame();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  const correctWallet = config.wallets.find(w => w.isCorrect);
  
  const handleSubmit = async () => {
    const isCorrect = selectedWallet === correctWallet.id;
    
    if (isCorrect) {
      // 答對了
      setShowResult(true);
      setTimeout(async () => {
        await completeScenarioAndUnlockNext(
          config.id,
          config.nextLevel,
          true,
          null
        );
      }, 2000);
    } else {
      // 答錯了
      await completeScenarioAndUnlockNext(
        config.id,
        null,
        false,
        {
          error_type: 'wrong_wallet_choice',
          user_selected: selectedWallet,
          correct_answer: correctWallet.id,
          description: `用戶選擇了 ${selectedWallet}，正確答案是 ${correctWallet.id}`
        }
      );
      
      // 顯示錯誤提示
      setShowResult(true);
      
      // 2秒後允許重試
      setTimeout(() => {
        setShowResult(false);
        setSelectedWallet(null);
      }, 2000);
    }
  };
  
  return (
    <div>
      {/* 錢包選擇 UI */}
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
};
```

## 數據結構

### user_attempts 表記錄的數據

```json
{
  "attempt_id": "uuid",
  "user_id": "uuid",
  "scenario_id": "uuid",
  "start_time": "2026-02-02T10:30:00.000Z",
  "end_time": "2026-02-02T10:32:15.500Z",
  "duration_ms": 135500,
  "is_success": false,
  "error_details": {
    "error_type": "wrong_address",
    "user_selected": "0x1234...abcd",
    "correct_answer": "0x5678...efgh",
    "description": "用戶選擇了投毒地址",
    "timestamp": "2026-02-02T10:32:15.500Z"
  },
  "session_id": "session_1738498200000_abc123",
  "created_at": "2026-02-02T10:30:00.000Z"
}
```

## 注意事項

1. **自動開始記錄**：不需要手動調用 `startScenarioAttempt`，系統會自動處理

2. **失敗可重試**：失敗時傳入 `isSuccess = false`，不會更新進度，用戶可以重試

3. **成功才進階**：只有 `isSuccess = true` 時才會更新到下一關

4. **詳細錯誤記錄**：失敗時提供詳細的 `errorDetails`，有助於後續分析

5. **每次答題都記錄**：無論成功還是失敗，每次提交都會生成一條記錄

## 遷移現有關卡

對於現有的關卡組件，需要修改：

### 修改前
```jsx
const handleSubmit = async () => {
  if (isCorrect) {
    await completeScenarioAndUnlockNext(config.id, config.nextLevel);
  }
};
```

### 修改後
```jsx
const handleSubmit = async () => {
  if (isCorrect) {
    await completeScenarioAndUnlockNext(
      config.id, 
      config.nextLevel, 
      true,  // isSuccess
      null   // errorDetails
    );
  } else {
    await completeScenarioAndUnlockNext(
      config.id, 
      null,  // 失敗時不進下一關
      false, // isSuccess
      {
        error_type: 'specific_error_type',
        user_selected: userAnswer,
        correct_answer: correctAnswer,
        description: '錯誤描述'
      }
    );
  }
};
```

## 測試

完成修改後：
1. 進入一個關卡
2. 提交答案（成功或失敗）
3. 檢查資料庫 `user_attempts` 表
4. 在主頁點擊「統計」按鈕查看數據
5. 確認答題次數、成功率、錯誤類型等數據正確

## 後續優化

可以考慮添加：
- 答題中途退出記錄（用戶未完成就離開頁面）
- 答題步驟追蹤（記錄用戶的每一步操作）
- 實時統計更新（使用 WebSocket）
- 答題重放功能（回放用戶的操作過程）
