# KAGAMI IR System - モック・サンプルサイト

AI技術を活用した投資家向け情報管理システムのモック実装です。

## 🚀 プロジェクト概要

KAGAMIは、投資家対応業務を効率化するAI-IRシステムです。
- **CMS（管理画面）**: IR担当者が投資家対応を管理
- **フロントエンド**: 投資家が情報を閲覧

## 📂 ディレクトリ構造

```
ir_system/
├── cms/                    # CMS管理画面
│   ├── app.py             # FastAPIアプリケーション
│   ├── templates/         # HTMLテンプレート
│   │   ├── base.html      # 共通レイアウト
│   │   ├── dashboard.html # ダッシュボード
│   │   └── ...
│   └── static/            # 静的ファイル
│       └── css/
│           └── cms.css    # CMS専用スタイル
│
├── frontend/              # 投資家向けサイト
│   ├── app.py            # FastAPIアプリケーション
│   ├── templates/        # HTMLテンプレート
│   │   ├── base.html     # 共通レイアウト
│   │   ├── home.html     # ホームページ
│   │   └── investor_qa.html # 投資家Q&A
│   └── static/           # 静的ファイル
│
├── shared/               # 共通リソース
│   └── css/
│       ├── components.css # 共通コンポーネント
│       └── variables.css  # CSS変数定義
│
└── docs/                 # ドキュメント
```

## 🛠 技術スタック

- **バックエンド**: Python 3.8+, FastAPI
- **フロントエンド**: HTML5, Tailwind CSS, Chart.js
- **スタイリング**: レスポンシブデザイン対応

## 📊 主な機能

### CMS管理画面
1. **ミーティング処理ダッシュボード**
   - 52週分の処理件数推移（棒グラフ）
   - 今日の投資家予定と過去のヒアリング内容
   - 質問カテゴリの内訳（円グラフ）

2. **AI-FAQ管理**
   - 自動生成されたFAQの編集・承認
   - バージョン管理と有効期限管理

3. **投資家管理**
   - 投資家情報の一元管理
   - 対話履歴の追跡

### フロントエンド（投資家向け）
1. **投資家Q&A**
   - AIが回答する質問応答システム
   - カテゴリ別の検索機能

2. **財務情報**
   - 最新の決算情報
   - 財務ハイライト

3. **IRライブラリ**
   - 決算資料のダウンロード
   - IR関連文書の閲覧

## 🚀 セットアップ

### 1. 必要な環境
- Python 3.8以上
- pip（Pythonパッケージマネージャー）

### 2. 依存関係のインストール

```bash
# CMSのセットアップ
cd cms
pip install fastapi uvicorn jinja2 python-multipart

# フロントエンドのセットアップ
cd ../frontend
pip install fastapi uvicorn jinja2
```

### 3. アプリケーションの起動

#### 一括起動スクリプトを使用する場合
```bash
# 実行権限を付与
chmod +x start_all.sh

# 起動
./start_all.sh
```

#### CMS管理画面（ポート8000）
```bash
cd cms
python app.py
# または
uvicorn app:app --reload --port 8000
```
アクセス: http://localhost:8000

#### フロントエンド（ポート8001）
```bash
cd frontend
python app.py
# または
uvicorn app:app --reload --port 8001
```
アクセス: http://localhost:8001

## 📱 レスポンシブデザイン

すべてのページはモバイル・タブレット・デスクトップに対応しています。
- モバイル: 320px〜
- タブレット: 768px〜
- デスクトップ: 1024px〜

## 🎨 デザインシステム

### カラーパレット
- **Primary**: Kagami Blue (#1a365d)
- **Secondary**: Accent Teal (#14b8a6)
- **Grays**: 50-900のグラデーション

### コンポーネント
共通コンポーネントは `/shared/css/components.css` で定義：
- ボタン（.btn）
- カード（.card）
- フォーム要素（.form-control）
- バッジ（.badge）
- アラート（.alert）

## 🔄 データフロー

```
投資家ミーティング
    ↓
録画・音声ファイルアップロード
    ↓
AI文字起こし・要約
    ↓
FAQ自動生成
    ↓
IR担当者レビュー
    ↓
投資家向け公開
```

## 🌟 特徴的な機能

### 1. AIによる自動処理
- 音声・動画の自動文字起こし
- 重要ポイントの自動抽出
- FAQの自動生成

### 2. リアルタイムダッシュボード
- 処理状況の可視化
- KPIのモニタリング
- アラート機能

### 3. 投資家エンゲージメント
- 24時間対応のAIチャットボット
- パーソナライズされた情報提供
- 多言語対応（日本語/英語）

## 📈 今後の拡張予定

1. **バックエンド実装**
   - データベース連携（PostgreSQL）
   - 認証・認可システム
   - WebSocket通信

2. **AI機能強化**
   - GPT-4連携
   - 感情分析
   - 予測分析

3. **分析機能**
   - 投資家行動分析
   - センチメント分析
   - レポート自動生成

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはモックアップであり、商用利用を想定していません。

## 👥 チーム

- **プロジェクトリード**: KAGAMI開発チーム
- **デザイン**: UIUXデザインチーム
- **開発**: フルスタック開発チーム

---

© 2024 KAGAMI Corporation. All rights reserved.
