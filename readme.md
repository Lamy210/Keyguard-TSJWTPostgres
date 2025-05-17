# Keyguard-TSJWTPostgres

## 概要

Bun + Hono を使った認証バックエンドのサンプル構成です。  
PostgreSQL, Redis, Adminer, Portainer を含むマルチコンテナ環境を Docker Compose で扱います。

## 使い方

### 1. 環境変数の設定

.env ファイル等で DB 接続や JWT_SECRET などの値を設定してください。  
// ...必要に応じて環境変数を追記...

### 2. Docker 起動

以下のコマンドでバックエンド環境が起動します。

```bash
docker compose up -d
```

コンテナ起動後、Docker コンテナ内で Bun + Hono が実行されます。

### 3. ソースコード編集

src ディレクトリ直下に Hono 関連のコードがあり、自由に修正できます。
// ...existing code...

### 4. アクセス
<http://localhost:3000> にアクセスすることで、Hono アプリの動作確認ができます。
