# ✅ 認証バックエンド構築：完全実装指示書（MVCSR + Bun + Drizzle）

---

## 🗂️ プロジェクト構成（完成時ディレクトリ）

```plaintext
project-root/
├── src/
│   ├── app.ts
│   ├── handlers/
│   │   └── authHandler.ts
│   ├── controllers/
│   │   └── authController.ts
│   ├── services/
│   │   └── authService.ts
│   ├── repositories/
│   │   └── userRepository.ts
│   ├── models/
│   │   ├── db.ts
│   │   └── user.model.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   ├── utils/
│   │   ├── hash.ts
│   │   └── jwt.ts
├── .env
├── drizzle.config.ts
├── drizzle/
└── bunfig.toml
```

---

## 📋 実装ステップ一覧（各フェーズ詳細）

---

## 🟦 フェーズ 1: プロジェクト初期化

### 📌 目的

環境構築・必要ライブラリの導入

### 📝 手順

1. プロジェクトディレクトリ作成 & 初期化

   ```bash
   mkdir auth-backend && cd auth-backend
   bun init
   ```

2. 必要なパッケージインストール

   ```bash
   bun add hono drizzle-orm drizzle-kit pg bcrypt jsonwebtoken zod dotenv
   bun add -d @types/bcrypt @types/jsonwebtoken @types/node tsx
   ```

---

## 🟦 フェーズ 2: DB設計（user モデル）

### 📌 目的

Drizzle ORM で users テーブルを定義

### 📝 手順

1. `src/models/user.model.ts` を作成
2. 以下の設計を反映：

| カラム名          | 型             | 制約                    |
|-------------------|----------------|-------------------------|
| id                | serial         | 主キー、自動採番        |
| email             | varchar(255)   | not null, unique        |
| hashed_password   | varchar(255)   | not null                |
| created_at        | timestamp      | default 現在時刻        |

---

## 🟦 フェーズ 3: DB接続

### 📌 目的

PostgreSQL + Drizzle ORM に接続

### 📝 手順

1. `.env` に以下を追加（適切に変更）

   ```
   DATABASE_URL=postgres://username:password@localhost:5432/your_db
   JWT_SECRET=yourSecretKey
   ```

2. `src/models/db.ts` を作成

   * `pg.Pool` で接続
   * drizzle に `schema` 指定して DB インスタンスを作成

---

## 🟦 フェーズ 4: drizzle マイグレーション実行

### 📌 目的

設計した users テーブルをDBに反映

### 📝 手順

1. `drizzle.config.ts` を作成し、スキーマと接続先を指定
2. マイグレーション実行

   ```bash
   bunx drizzle-kit push
   ```

---

## 🟦 フェーズ 5: Repository 実装

### 📌 目的

DBアクセスを一元化・Service層へ提供

### 📝 手順

1. `src/repositories/userRepository.ts` を作成
2. 以下のメソッドを実装：

| メソッド          | 機能         |
| ------------- | ---------- |
| `findByEmail` | emailで1件取得 |
| `createUser`  | ユーザー登録     |

---

## 🟦 フェーズ 6: Service 実装

### 📌 目的

ビジネスロジックの記述（入力検証、ハッシュ化、JWT発行）

### 📝 手順

1. `src/services/authService.ts` を作成
2. 処理の流れ：

   * `signup`：email重複確認 → passwordハッシュ → 登録
   * `login`：email確認 → password比較 → JWT発行

---

## 🟦 フェーズ 7: Controller 実装

### 📌 目的

handler層からの入力をservice層に橋渡し

### 📝 手順

1. `src/controllers/authController.ts` を作成
2. 処理の流れ：

   * Serviceの`signup`/`login` を呼び出し、結果を返却

---

## 🟦 フェーズ 8: Handler実装（ルーティング含む）

### 📌 目的

リクエストバリデーション + Controller 呼び出し

### 📝 手順

1. `src/handlers/authHandler.ts` を作成
2. `Hono()` インスタンス作成
3. エンドポイントを追加：

| メソッド | エンドポイント   | 処理              |
| ---- | --------- | --------------- |
| POST | `/signup` | 登録処理            |
| POST | `/login`  | ログイン            |
| GET  | `/me`     | ユーザー取得（JWT認証必要） |

4. `Zod`でリクエスト body をスキーマ定義＆バリデーション

---

## 🟦 フェーズ 9: JWTミドルウェア

### 📌 目的

`Authorization: Bearer <token>` ヘッダーで保護ルートを守る

### 📝 手順

1. `src/middleware/authMiddleware.ts` を作成
2. JWTトークンを検証し、`ctx.set("user")` に `userId` を保存

---

## 🟦 フェーズ 10: アプリ起動

### 📌 目的

`app.ts` に全てのhandlerを統合してHonoアプリとして起動

### 📝 手順

1. `src/app.ts` にて Hono インスタンスを作成
2. `authHandler` をルートに追加
3. `main.ts` や `index.ts` で `serve(app.fetch)` を呼び出し

---

## ✅ 学習ステップの補助

* **Step-by-Step**で自作実装を推奨
* 実装しながら以下のように質問してくれてOK：

  * 「`findByEmail` のDBクエリ書いたけどこれ正しい？」
  * 「Handlerのルーティングってこう書けばいい？」
  * 「Zodのスキーマってどう定義すればいい？」

---

## 🎉 最終完成時に提供されるAPI

| メソッド | パス           | 説明              |
| ---- | ------------ | --------------- |
| POST | /auth/signup | 新規ユーザー登録        |
| POST | /auth/login  | ログイン（JWT返却）     |
| GET  | /auth/me     | JWTで保護された自己情報取得 |

---

## 🔚 最後に

この設計書に沿って進めることで、以下が自然に身につきます：

* 型安全なDB設計
* アーキテクチャに基づいた責務分離
* JWT認証とセキュアなAPI実装
* 実務的なテスト可能コードの書き方
