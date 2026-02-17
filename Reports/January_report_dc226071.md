# Database development

After Discussing with proefessor and TA, we agreed that the users' decisions and solving time will be collected for us to analysis. We will use **PostgreSQL** for data storing.

---
## The ER diagram of the database
![ERD](./img/ERD.png)
## The DDL code of the database
```
-- 1. Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'zh',
    created_at TIMESTAMP DEFAULT NOW(),
    consent_given BOOLEAN DEFAULT FALSE
);

-- 2.  Phases Table
CREATE TABLE phases (
    phase_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_code VARCHAR(20) UNIQUE NOT NULL,
    title_zh VARCHAR(100),
    title_en VARCHAR(100),
    description_zh TEXT,
    description_en TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Scenario_Types Table
CREATE TABLE scenario_types (
    type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(50) UNIQUE NOT NULL,
    name_zh VARCHAR(100),
    name_en VARCHAR(100),
    component_name VARCHAR(100)
);

-- 4. Scenarios Table
CREATE TABLE scenarios (
    scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_code VARCHAR(20) UNIQUE NOT NULL,
    phase_id UUID REFERENCES phases(phase_id),
    type_id UUID REFERENCES scenario_types(type_id),
    title_zh VARCHAR(100),
    title_en VARCHAR(100),
    story_zh TEXT,
    story_en TEXT,
    mission_zh TEXT,
    mission_en TEXT,
    warning_zh TEXT,
    warning_en TEXT,
    icon_type VARCHAR(30),
    display_order INTEGER,
    config_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. User_Progress Table
CREATE TABLE user_progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(scenario_id),
    status VARCHAR(20) DEFAULT 'locked',
    attempt_count INTEGER DEFAULT 0,
    first_completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. User_Attempts Table
CREATE TABLE user_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(scenario_id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_ms INTEGER,
    is_success BOOLEAN,
    error_details JSONB,
    session_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. User_Final_Reports Table
CREATE TABLE user_final_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    total_scenarios_completed INTEGER DEFAULT 0,
    total_time_ms INTEGER DEFAULT 0,
    total_days_to_complete INTEGER,
    first_attempt_at TIMESTAMP,
    last_completed_at TIMESTAMP,
    overall_success_rate DECIMAL(5,2),
    performance_summary JSONB,
    error_distribution JSONB,
    skill_grading JSONB,
    is_top_performer BOOLEAN DEFAULT FALSE,
    frustration_index DECIMAL(5,2),
    generated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```
## Tables details
| Table | Description |
| -------- | -------- |
| Users     | Contains the usernames, language preference and consent record    |
| Phases     | Stores the phases' data, determine the order of the scenarios     |
| Scenario_Types     | Stores the front-end componets of all the scenarios, the type of the scenarios    |
| Scenarios     | Stores the config data in each scenarios     |
| User_Progress     | Stores the users current progress     |
| User_Attempts     | Stores users; solving time and incorrect answers' dtails     |
| User_Final_Reports    | Stores the user final reports after the user finished all scenarios     |
