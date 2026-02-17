# 用戶答題統計功能實施指南

## 已完成的工作

### 1. 後端 API（已添加到 `Back_end/db/index.js`）

#### 新增端點：

**獲取用戶所有答題記錄**
```
GET /api/users/:userId/attempts
```

**獲取用戶整體統計**
```
GET /api/users/:userId/statistics
```
返回：
- 整體表現（總嘗試次數、成功次數、失敗次數、成功率、平均時間）
- 各關卡表現（每關的嘗試次數、成功率、錯誤類型統計）

**獲取特定關卡統計**
```
GET /api/users/:userId/statistics/:scenarioCode
```

**生成最終報告**
```
POST /api/users/:userId/report/generate
```

**獲取最終報告**
```
GET /api/users/:userId/report
```

### 2. 前端 API 調用（已更新 `src/api/index.js`）

新增函數：
- `getUserAttempts(userId)` - 獲取答題記錄
- `getUserStatistics(userId)` - 獲取統計數據
- `getScenarioStatistics(userId, scenarioCode)` - 獲取單關卡統計
- `getUserFinalReport(userId)` - 獲取最終報告
- `generateFinalReport(userId)` - 生成最終報告

### 3. 統計展示組件（新建 `src/components/UserStatistics.jsx`）

功能：
- 顯示整體表現（總嘗試、成功率、平均時間等）
- 顯示各關卡詳細統計
- 顯示錯誤類型分析
- 支持中英文切換
- 動畫效果和響應式設計

### 4. GamePage 集成（已更新）

- 在頂部導航欄添加「統計」按鈕
- 點擊顯示 UserStatistics 組件
- 自動傳入用戶 ID 和語言設置

## 使用方法

### 啟動後端
```bash
cd Back_end/db
node index.js
```

### 啟動前端
```bash
cd FYP_Project
npm run dev
```

### 查看統計
1. 登入遊戲
2. 點擊右上角「統計」按鈕
3. 查看整體表現和各關卡詳細數據

## 數據結構

### user_attempts 表
記錄每次遊玩的詳細數據：
- `attempt_id`: 唯一識別碼
- `user_id`: 用戶 ID
- `scenario_id`: 關卡 ID
- `start_time`: 開始時間
- `end_time`: 結束時間
- `duration_ms`: 答題耗時（毫秒）
- `is_success`: 是否成功
- `error_details`: 錯誤詳情（JSON 格式）

### 錯誤詳情格式
```json
{
  "error_type": "wrong_address",
  "user_selected": "0x1a2b...abcf",
  "correct_answer": "0x1a2b...abcb",
  "description": "用戶選擇了投毒地址"
}
```

## 統計指標

### 整體統計
- 總嘗試次數
- 成功次數
- 失敗次數
- 成功率（%）
- 平均答題時間
- 總答題時間

### 各關卡統計
- 關卡嘗試次數
- 成功/失敗次數
- 成功率
- 平均時間
- 最快/最慢時間
- 錯誤類型分布

## 未來可擴展功能

1. **時間趨勢分析**
   - 答題速度隨時間的變化
   - 學習曲線分析

2. **對比分析**
   - 與其他用戶平均值對比
   - 排行榜功能

3. **詳細報告導出**
   - PDF 報告生成
   - CSV 數據導出

4. **實時數據追蹤**
   - WebSocket 實時更新
   - 進度實時同步

5. **錯誤模式分析**
   - 常見錯誤類型
   - 錯誤率熱力圖

6. **建議系統**
   - 根據錯誤類型推薦複習內容
   - 個性化學習路徑

## 測試建議

1. 完成幾個關卡（包括成功和失敗）
2. 打開統計界面查看數據
3. 驗證數據準確性（次數、時間、成功率）
4. 測試中英文切換
5. 檢查錯誤類型統計是否正確

## 注意事項

- 目前記錄功能需要在關卡組件中調用 `startAttempt` 和 `completeAttempt`
- 確保每次遊玩都正確記錄開始和結束時間
- `error_details` 需要在關卡失敗時傳入結構化數據
- 統計計算在後端完成，確保性能
