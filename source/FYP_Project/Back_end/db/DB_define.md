# Web3 防釣魚訓練平台資料庫架構文檔 (Database Schema Documentation)

本文檔詳細解析了 Web3 防釣魚訓練平台的資料庫設計。該設計旨在支援「無難度分級」的關卡機制，並專注於**答題時間分析**與**錯誤類型統計**。

---

## 1. 核心內容配置 (Content Configuration)
此部分用於定義關卡內容與前端顯示形式。

### 1.1 Phases (階段/章節表)
**作用**：將零散的關卡打包成結構化的「章節」（如：新手村、DeFi 進階）。
* `phase_id` (UUID, PK): 唯一識別碼。
* `phase_code` (VARCHAR): 內部代號（如 `P1_BASICS`），方便程式碼引用。
* `title_zh` / `title_en` (VARCHAR): 章節標題（中/英）。
* `description_zh` / `description_en` (TEXT): 章節描述。
* `display_order` (INTEGER): 排序權重，決定章節顯示順序。
* `is_active` (BOOLEAN): 章節上下架開關。

### 1.2 Scenario_Types (關卡形式表)
**作用**：定義關卡的「前端 UI 模板」。
* `type_id` (UUID, PK): 唯一識別碼。
* `type_code` (VARCHAR): 代號（如 `phishing`, `createWallet`, `addressPoisoning`）。
* `name_zh` / `name_en` (VARCHAR): 形式名稱（如「釣魚郵件模擬」、「錢包創建」）。
* `component_name` (VARCHAR): **前端開發關鍵**。對應前端代碼中的組件名稱（例如 `PhishingEmailChallenge.jsx`），系統根據此欄位決定渲染哪種畫面。

### 1.3 Scenarios (關卡/場景表)
**作用**：每一行代表一個具體的訓練題目。
* `scenario_id` (UUID, PK): 唯一識別碼。
* `scenario_code` (VARCHAR): 題目代號（如 `phase1-1`, `malicious-auth`）。
* `phase_id` (UUID, FK): 所屬章節。
* `type_id` (UUID, FK): 使用的 UI 模板類型。
* `title_zh` / `title_en` (VARCHAR): 關卡標題。
* `story_zh` / `story_en` (TEXT): 劇情背景（如：「你需要創建一個 Web3 錢包...」）。
* `mission_zh` / `mission_en` (TEXT): 任務目標。
* `warning_zh` / `warning_en` (TEXT): 通關或失敗後的教育警示語。
* `icon_type` (VARCHAR): 關卡圖示類型。
* `display_order` (INTEGER): 關卡排序。
* `config_data` (JSONB): **核心欄位**。存放關卡的動態參數（如：地址、網絡選項等），實現同一模板多種題目。
* `is_active` (BOOLEAN): 關卡開關。
* `created_at` (TIMESTAMP): 創建時間。

---

## 2. 用戶數據 (User Data)
此部分記錄玩家身分。

### 2.1 Users (用戶表)
* `user_id` (UUID, PK): 唯一識別碼。
* `username` (VARCHAR): 玩家暱稱。
* `preferred_language` (VARCHAR): 語言偏好（`zh` / `en`）。
* `created_at` (TIMESTAMP): 帳號創建時間。
* `last_login_at` (TIMESTAMP): 最後登入時間。
* `consent_given` (BOOLEAN): 隱私條款同意紀錄。

---

## 3. 行為分析與進度 (Analytics & Progression)
此部分為平台的核心分析區，記錄玩家行為與存檔。

### 3.1 User_Attempts (挑戰紀錄表 - Fact Table)
**作用**：流水帳，記錄每一次遊玩的詳細數據，用於生成分析報表。
* `attempt_id` (UUID, PK): 唯一識別碼。
* `user_id` (UUID, FK): 玩家 ID。
* `scenario_id` (UUID, FK): 關卡 ID。
* `start_time` (TIMESTAMP): 開始時間。
* `end_time` (TIMESTAMP): 結束時間。
* `duration_ms` (INTEGER): **分析關鍵**。答題耗時（毫秒），用於分析「思考時間」與「被騙率」的關係。
* `is_success` (BOOLEAN): 是否通關。
* `error_details` (JSONB): **錯誤分析關鍵**。記錄失敗原因，結構如：
  ```json
  {
    "error_type": "wrong_address",
    "user_selected": "0x1a2b...abcf",
    "correct_answer": "0x1a2b...abcb",
    "description": "用戶選擇了投毒地址"
  }
  ```
* `session_id` (VARCHAR): 瀏覽器會話追蹤 ID。
* `created_at` (TIMESTAMP): 記錄創建時間。

### 3.2 User_Progress (用戶存檔表 - State Table)
**作用**：記錄用戶在每一關的當前狀態（存檔）。
* `progress_id` (UUID, PK): 唯一識別碼。
* `user_id` (UUID, FK): 玩家 ID。
* `scenario_id` (UUID, FK): 關卡 ID。
* `status` (VARCHAR): 狀態 (`LOCKED`, `UNLOCKED`, `COMPLETED`)。
* `attempt_count` (INTEGER): 嘗試次數（用於分析關卡難度與引導清晰度）。
* `first_completed_at` (TIMESTAMP): 首次通關時間。
* `updated_at` (TIMESTAMP): 最後更新時間。

### 3.3 User_Final_Reports (終極報告表)
**作用**：用戶完成所有關卡後生成的總結報告，用於個人成就展示與營運數據分析。
* `report_id` (UUID, PK): 唯一識別碼。
* `user_id` (UUID, FK): 玩家 ID（唯一約束，每人一份報告）。
* `total_scenarios_completed` (INTEGER): 總完成關卡數。
* `total_time_ms` (BIGINT): 總耗時（毫秒）。
* `total_days_to_complete` (INTEGER): 從開始到完賽的總天數。
* `first_attempt_at` (TIMESTAMP): 首次嘗試時間。
* `last_completed_at` (TIMESTAMP): 最後完成時間。
* `overall_success_rate` (DECIMAL): 整體正確率。
* `performance_summary` (JSONB): **每關表現摘要**，結構如：
  ```json
  {
    "scenario_id": "phase1-4",
    "scenario_title": "錢包轉帳",
    "total_attempts": 2,
    "successful_attempt_number": 2,
    "total_time_ms": 265000,
    "avg_time_ms": 132500,
    "is_over_time": false,
    "final_success": true
  }
  ```
* `error_distribution` (JSONB): **錯誤類型分佈**，結構如：
  ```json
  {
    "wrong_address": { "count": 1, "percentage": 33.33 },
    "wrong_judgment": { "count": 1, "percentage": 33.33 },
    "approved_malicious": { "count": 1, "percentage": 33.33 }
  }
  ```
* `skill_grading` (JSONB): **能力維度評分**，結構如：
  ```json
  {
    "reaction_speed": { "score": 76, "level": "good" },
    "accuracy": { "score": 75, "level": "good" },
    "consistency": { "score": 70, "level": "good" }
  }
  ```
* `frustration_index` (DECIMAL): 挫折感指數（根據重複失敗次數計算）。
* `generated_at` (TIMESTAMP): 報告生成時間。
* `updated_at` (TIMESTAMP): 報告更新時間。

---

## 4. 數據流向總結

1.  **內容建立**：管理員設定 `Phases` 與 `Scenarios`。
2.  **玩家進入**：系統讀取 `User_Progress` 決定玩家可遊玩的關卡。
3.  **遊戲開始**：建立 `User_Attempts` 記錄 `start_time`。
4.  **結算分析**：
    * **失敗**：更新 `User_Attempts`，寫入 `error_details`（記錄錯誤原因）。
    * **成功**：更新 `User_Attempts`，並更新 `User_Progress` 狀態為 `COMPLETED`，解鎖下一關。
5.  **完成全部關卡**：系統聚合 `User_Attempts` 數據，生成 `User_Final_Reports`。

---

## 5. 關卡類型對照表

| type_code | component_name | 中文名稱 |
|-----------|----------------|----------|
| `phishing` | `PhishingEmailChallenge` | 下載錢包 |
| `createWallet` | `CreateWalletChallenge` | 創建錢包 |
| `firstDeposit` | `FirstDepositChallenge` | 首次入金 |
| `addressPoisoning` | `WalletTransferChallenge` | 錢包轉帳 |
| `centralizedPlatform` | `CentralizedPlatform` | 中心化平台判別 |
| `decentralizedPlatform` | `Decentralizedplatform` | 去中心化平台判別 |
| `maliciousAuth` | `IdentifyMalicious` | 判別惡意授權 |
| `judgeAuth` | `JudgeAuth` | 判斷授權內容 |
| `dangerAuthWeb3` | `Web3DangerAuth` | 混合詐騙實戰 |