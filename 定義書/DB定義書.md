# データベース定義書

## 概要

* **DBMS**: PostgreSQL
* **目的**: 複数サービス（チャット／通話／モバイルアプリ等）で共通利用可能なユーザ基盤を構築する
* **設計方針**: 拡張性・運用安定性を重視

## 目次

1. [users](#1-users-テーブル)
2. [user_profiles](#2-user_profiles-テーブル)
3. [user_emails](#3-user_emails-テーブル)
4. [roles](#4-roles-テーブル)
5. [user_roles](#5-user_roles-テーブル)
6. [user_credentials](#6-user_credentials-テーブル)
7. [user_auth_providers](#7-user_auth_providers-テーブル)
8. [user_status_enum & user_status](#8-user_status_enum-型--user_status-テーブル)
9. [user_mfa_factors](#9-user_mfa_factors-テーブル)
10. [user_devices](#10-user_devices-テーブル)
11. [login_audit_logs](#11-login_audit_logs-テーブル)
12. [トリガー＆関数定義](#12-トリガー関数定義)

---

## 1. users テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| uuid | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | グローバル一意ユーザー識別子（自動生成） |
| id | BIGSERIAL | UNIQUE | 内部連番ID（分析・バッチ用） |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | レコード更新日時（トリガーで更新） |
| last_login_at | TIMESTAMP WITH TIME ZONE | | 最終ログイン日時 |

## 2. user_profiles テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| user_uuid | UUID | PRIMARY KEY, REFERENCES users(uuid) ON DELETE CASCADE | プロフィール所有ユーザーID（1:1） |
| username | VARCHAR(50) | UNIQUE NOT NULL | ログイン/公開用ユーザー名 |
| display_name | VARCHAR(100) | | 表示用ニックネーム・本名 |
| avatar_object_key | TEXT | | MinIO/S3互換オブジェクトキー |
| bio | TEXT | | 自己紹介文 |

## 3. user_emails テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | メールレコードID |
| user_uuid | UUID | NOT NULL, REFERENCES users(uuid) ON DELETE CASCADE | 紐づくユーザーID |
| email | VARCHAR(255) | UNIQUE NOT NULL | メールアドレス |
| is_verified | BOOLEAN | DEFAULT FALSE | 検証済みフラグ |
| is_primary | BOOLEAN | DEFAULT FALSE | 主メールフラグ |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 登録日時 |

**部分ユニークインデックス**

```sql
CREATE UNIQUE INDEX user_emails_primary_unique
  ON user_emails(user_uuid)
  WHERE is_primary = TRUE;
```

## 4. roles テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| role_id | SERIAL | PRIMARY KEY | ロール連番ID |
| role_name | VARCHAR(50) | UNIQUE NOT NULL | ロール名（e.g. admin） |
| description | TEXT | | ロールの説明 |

## 5. user_roles テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| user_uuid | UUID | NOT NULL, REFERENCES users(uuid) ON DELETE CASCADE | 対象ユーザーID |
| role_id | INTEGER | NOT NULL, REFERENCES roles(role_id) ON DELETE RESTRICT | 割当ロールID |
| assigned_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | ロール割当日時 |

* PRIMARY KEY(user_uuid, role_id)

## 6. user_credentials テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| user_uuid | UUID | PRIMARY KEY, REFERENCES users(uuid) ON DELETE CASCADE | 認証対象ユーザーID（1:1） |
| password_hash | TEXT | NOT NULL | bcrypt/Argon2ハッシュ済パスワード |
| password_changed_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 最終パスワード変更日時 |

## 7. user_auth_providers テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | レコードID |
| user_uuid | UUID | NOT NULL, REFERENCES users(uuid) ON DELETE CASCADE | 紐づくユーザーID |
| provider_name | VARCHAR(50) | NOT NULL | 外部プロバイダ名（google, github等） |
| external_user_id | VARCHAR(255) | NOT NULL | プロバイダ発行ユーザーID |
| access_token | BYTEA | | 暗号化保存されたアクセストークン |
| refresh_token | BYTEA | | 暗号化保存されたリフレッシュトークン |
| token_expires_at | TIMESTAMP WITH TIME ZONE | | アクセストークン失効日時 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | レコード作成日時 |

* UNIQUE(provider_name, external_user_id)

## 8. user_status_enum 型 & user_status テーブル

```sql
CREATE TYPE user_status_enum AS ENUM (
  'active',
  'inactive',
  'banned',
  'pending',
  'deleted'
);
```

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| user_uuid | UUID | PRIMARY KEY, REFERENCES users(uuid) ON DELETE CASCADE | 対象ユーザーID |
| status | user_status_enum | DEFAULT 'active' | ユーザー状態（ENUM） |
| deactivated_at | TIMESTAMP WITH TIME ZONE | | 状態変更日時（非アクティブ化/BAN） |
| reason | TEXT | | 状態変更理由 |

## 9. user_mfa_factors テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | レコードID |
| user_uuid | UUID | NOT NULL, REFERENCES users(uuid) ON DELETE CASCADE | 対象ユーザーID |
| factor_type | VARCHAR(50) | NOT NULL | MFA種別（TOTP, SMS等） |
| factor_data | BYTEA | | 暗号化保存されたMFAシークレット/電話番号 |
| is_enabled | BOOLEAN | DEFAULT TRUE | 有効フラグ |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 登録日時 |

* UNIQUE(user_uuid, factor_type)

## 10. user_devices テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | レコードID |
| user_uuid | UUID | NOT NULL, REFERENCES users(uuid) ON DELETE CASCADE | 対象ユーザーID |
| device_fingerprint | VARCHAR(255) | NOT NULL | デバイス識別子 |
| device_name | VARCHAR(100) | | 任意デバイス名 |
| last_seen_at | TIMESTAMP WITH TIME ZONE | | 最終アクセス日時 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | 登録日時 |

* UNIQUE(user_uuid, device_fingerprint)

## 11. login_audit_logs テーブル

| カラム名 | データ型 | 制約 | 説明 |
|:--------|:--------|:-----|:-----|
| id | BIGSERIAL | PRIMARY KEY | レコードID |
| user_uuid | UUID | REFERENCES users(uuid) ON DELETE CASCADE | 対象ユーザーID |
| event_type | VARCHAR(50) | | イベント種別（login_success等） |
| ip_address | INET | | ログイン元IPアドレス |
| user_agent | TEXT | | ブラウザ/OS 情報 |
| event_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | イベント発生日時 |

## 12. トリガー＆関数定義

```sql
-- updated_at 自動更新関数
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_users_updated_at();
```
