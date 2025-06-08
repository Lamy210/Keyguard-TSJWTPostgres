# ER Diagram

erDiagram
    USERS {
        UUID    uuid            PK
        BIGSERIAL id            UNIQUE
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP last_login_at
    }

    USER_PROFILES {
        UUID    user_uuid       PK
        VARCHAR username        UNIQUE
        VARCHAR display_name
        TEXT    avatar_object_key
        TEXT    bio
    }

    USER_EMAILS {
        BIGSERIAL id            PK
        UUID    user_uuid
        VARCHAR email           UNIQUE
        BOOLEAN is_verified
        BOOLEAN is_primary
        TIMESTAMP created_at
    }

    ROLES {
        SERIAL  role_id         PK
        VARCHAR role_name       UNIQUE
        TEXT    description
    }

    USER_ROLES {
        UUID    user_uuid
        INT     role_id
        TIMESTAMP assigned_at
    }

    USER_CREDENTIALS {
        UUID    user_uuid       PK
        TEXT    password_hash
        TIMESTAMP password_changed_at
    }

    USER_AUTH_PROVIDERS {
        BIGSERIAL id            PK
        UUID    user_uuid
        VARCHAR provider_name
        VARCHAR external_user_id
        BYTEA   access_token
        BYTEA   refresh_token
        TIMESTAMP token_expires_at
        TIMESTAMP created_at
    }

    USER_STATUS {
        UUID    user_uuid       PK
        ENUM    status
        TIMESTAMP deactivated_at
        TEXT    reason
    }

    USER_MFA_FACTORS {
        BIGSERIAL id            PK
        UUID    user_uuid
        VARCHAR factor_type
        BYTEA   factor_data
        BOOLEAN is_enabled
        TIMESTAMP created_at
    }

    USER_DEVICES {
        BIGSERIAL id            PK
        UUID    user_uuid
        VARCHAR device_fingerprint
        VARCHAR device_name
        TIMESTAMP last_seen_at
        TIMESTAMP created_at
    }

    LOGIN_AUDIT_LOGS {
        BIGSERIAL id            PK
        UUID    user_uuid
        VARCHAR event_type
        INET    ip_address
        TEXT    user_agent
        TIMESTAMP event_at
    }

    USERS ||--o{ USER_PROFILES        : has
    USERS ||--o{ USER_EMAILS          : has
    USERS ||--o{ USER_ROLES           : has
    ROLES ||--o{ USER_ROLES           : has
    USERS ||--o{ USER_CREDENTIALS     : has
    USERS ||--o{ USER_AUTH_PROVIDERS  : has
    USERS ||--|| USER_STATUS         : has
    USERS ||--o{ USER_MFA_FACTORS     : has
    USERS ||--o{ USER_DEVICES         : has
    USERS ||--o{ LOGIN_AUDIT_LOGS     : has
