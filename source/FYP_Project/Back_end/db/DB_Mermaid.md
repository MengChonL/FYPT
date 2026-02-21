erDiagram
    Users ||--o{ User_Attempts : "makes"
    Users ||--o{ User_Progress : "tracks"
    Users ||--o| User_Final_Reports : "generates"
    Scenarios ||--o{ User_Attempts : "has"
    Scenarios ||--o{ User_Progress : "unlocks"
    Scenarios }o--|| Scenario_Types : "belongs_to"
    Phases ||--o{ Scenarios : "groups"

    Users {
        UUID user_id PK
        VARCHAR(100) username
        VARCHAR(10) preferred_language
        TIMESTAMP created_at
        TIMESTAMP last_login_at
        BOOLEAN consent_given
    }

    Phases {
        UUID phase_id PK
        VARCHAR(20) phase_code
        VARCHAR(100) title_zh
        VARCHAR(100) title_en
        TEXT description_zh
        TEXT description_en
        INTEGER display_order
        BOOLEAN is_active
    }

    Scenario_Types {
        UUID type_id PK
        VARCHAR(50) type_code
        VARCHAR(100) name_zh
        VARCHAR(100) name_en
        VARCHAR(100) component_name
    }

    Scenarios {
        UUID scenario_id PK
        VARCHAR(20) scenario_code
        UUID phase_id FK
        UUID type_id FK
        VARCHAR(100) title_zh
        VARCHAR(100) title_en
        TEXT story_zh
        TEXT story_en
        TEXT mission_zh
        TEXT mission_en
        TEXT warning_zh
        TEXT warning_en
        VARCHAR(30) icon_type
        INTEGER display_order
        JSONB config_data
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    User_Progress {
        UUID progress_id PK
        UUID user_id FK
        UUID scenario_id FK
        VARCHAR(20) status
        INTEGER attempt_count
        TIMESTAMP first_completed_at
        TIMESTAMP updated_at
    }

    User_Attempts {
        UUID attempt_id PK
        UUID user_id FK
        UUID scenario_id FK
        TIMESTAMP start_time
        TIMESTAMP end_time
        INTEGER duration_ms
        BOOLEAN is_success
        JSONB error_details
        VARCHAR(50) session_id
        TIMESTAMP created_at
    }

    User_Final_Reports {
        UUID report_id PK
        UUID user_id FK
        INTEGER total_scenarios_completed
        INTEGER total_time_ms
        INTEGER total_days_to_complete
        TIMESTAMP first_attempt_at
        TIMESTAMP last_completed_at
        DECIMAL overall_success_rate
        JSONB performance_summary
        JSONB error_distribution
        JSONB skill_grading
        BOOLEAN is_top_performer
        TIMESTAMP generated_at
        TIMESTAMP updated_at
    }