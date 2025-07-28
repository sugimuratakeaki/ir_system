# KAGAMI IR System - モック・サンプルサイト

AI技術を活用した投資家向け情報管理システムのモック実装です。

## 🚀 プロジェクト概要

KAGAMIは、投資家対応業務を効率化するAI-IRシステムです。
- **CMS（管理画面）**: IR担当者が投資家対応を管理
- **フロントエンド**: 投資家が情報を閲覧
- **共通リソース**: デザインシステムとコンポーネント

## 📂 ディレクトリ構造

```
ir_system/
├── cms/                    # CMS管理画面
│   ├── app.py             # FastAPIアプリケーション
│   ├── requirements.txt   # Python依存関係（CMS専用）
│   ├── templates/         # HTMLテンプレート
│   │   ├── base.html      # 共通レイアウト
│   │   ├── base-three-column.html  # 3カラムレイアウト
│   │   ├── dashboard.html # ダッシュボード
│   │   ├── dialogue-edit-unified.html  # 統合対話編集
│   │   ├── dialogue-center-workspace.html  # 対話センター
│   │   ├── ir-calendar-workspace.html  # IRカレンダー
│   │   ├── director-dashboard.html  # 社外取締役ダッシュボード
│   │   ├── executive-dashboard.html  # 経営陣ダッシュボード
│   │   └── ...            # その他のページ
│   └── static/            # 静的ファイル
│       └── css/
│           ├── cms.css           # CMS基本スタイル（584行）
│           └── dialogue-edit.css  # 対話編集専用（1,397行 - 要分離）
│
├── frontend/              # 投資家向けサイト
│   ├── app.py            # FastAPIアプリケーション
│   ├── requirements.txt  # Python依存関係（フロントエンド専用）
│   ├── templates/        # HTMLテンプレート
│   │   ├── base.html     # 共通レイアウト
│   │   ├── home.html     # ホームページ
│   │   └── investor_qa.html # 投資家Q&A
│   └── static/           # 静的ファイル
│
├── shared/               # 共通リソース
│   ├── css/
│   │   ├── variables.css     # CSS変数定義（141行）
│   │   ├── components.css    # 共通コンポーネント（410行）
│   │   └── data-visualization.css  # データ可視化
│   └── js/
│       └── dialogue-utils.js # 対話関連ユーティリティ
│
├── docs/                 # ドキュメント
│   └── dialogue-improvements.md
│
└── start_all.sh         # 一括起動スクリプト
```

## 🛠 技術スタック

- **バックエンド**: Python 3.8+, FastAPI
- **フロントエンド**: HTML5, Tailwind CSS, Chart.js
- **スタイリング**: レスポンシブデザイン対応
- **デザインシステム**: CSS変数ベースの統一設計

## 📊 主な機能

### CMS管理画面
1. **ミーティング処理ダッシュボード**
   - 52週分の処理件数推移（棒グラフ）
   - 今日の投資家予定と過去のヒアリング内容
   - 質問カテゴリの内訳（円グラフ）

2. **統合対話編集ワークスペース**
   - 段階適応型UI（アップロード→文字起こし→AI分析→FAQ→レビュー→公開）
   - AIによる自動文字起こしと要約
   - 投資家プロファイル表示

3. **IRカレンダー・面談ワークスペース**
   - 投資家面談のスケジュール管理
   - 面談リクエストの承認フロー
   - 投資家情報の一元管理

4. **AI-FAQ管理**
   - 自動生成されたFAQの編集・承認
   - バージョン管理と有効期限管理
   - 信頼度ベースのコンテンツ品質管理

5. **経営陣・社外取締役向けダッシュボード**
   - 投資家懸念事項のサマリー
   - 戦略的課題の可視化
   - ガバナンス指標の監視

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

#### CMSのセットアップ
```bash
cd cms
python -m venv venv

# 仮想環境の有効化
source venv/bin/activate  # Mac/Linux
# または
.\venv\Scripts\activate   # Windows

# 依存関係のインストール
pip install -r requirements.txt
```

#### フロントエンドのセットアップ
```bash
cd frontend
python -m venv venv

# 仮想環境の有効化
source venv/bin/activate  # Mac/Linux
# または
.\venv\Scripts\activate   # Windows

# 依存関係のインストール
pip install -r requirements.txt
```

### 3. アプリケーションの起動

#### 一括起動スクリプトを使用する場合
```bash
# 実行権限を付与
chmod +x start_all.sh

# 起動
./start_all.sh
```

#### 個別起動

##### CMS管理画面（ポート8000）
```bash
cd cms
python app.py
```
アクセス: http://localhost:8000

##### フロントエンド（ポート8001）
```bash
cd frontend
python app.py
```
アクセス: http://localhost:8001

## 📱 レスポンシブデザイン

すべてのページはモバイル・タブレット・デスクトップに対応しています。
- モバイル: 320px〜
- タブレット: 768px〜
- デスクトップ: 1024px〜

## 🎨 デザインシステム

### カラーパレット（`shared/css/variables.css`で定義）
- **Primary**: Kagami Blue (#1a365d)
- **Secondary**: Accent Teal (#14b8a6)
- **Grays**: 50-900のグラデーション
- **Semantic**: Success (#10b981), Warning (#f59e0b), Error (#ef4444)

### コンポーネント
共通コンポーネントは `/shared/css/components.css` で定義：
- ボタン（.btn）
- カード（.card）
- フォーム要素（.form-control）
- バッジ（.badge）
- アラート（.alert）
- モーダル（.modal）

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
- 投資家センチメント分析

### 2. リアルタイムダッシュボード
- 処理状況の可視化
- KPIのモニタリング
- アラート機能

### 3. 投資家エンゲージメント
- 24時間対応のAIチャットボット
- パーソナライズされた情報提供
- 多言語対応（日本語/英語）

### 4. 経営支援機能
- 投資家懸念事項の自動抽出
- 戦略的課題の可視化
- 取締役会資料の自動生成

## ⚠️ 既知の課題と改善予定

### 優先度1: 緊急対応
- [ ] `dialogue-edit.css` (1,397行) のファイル分離
- [ ] ハードコードされたカラー値のCSS変数化
- [ ] 長すぎるファイル名の短縮

### 優先度2: 中期改善
- [ ] 共通コンポーネントの活用拡大
- [ ] レスポンシブデザインの最適化
- [ ] アクセシビリティの向上

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

## 🤝 開発ルール

プロジェクトの開発ルールは `.cursor/rules/` 内で定義されています：
- `baserules.mdc`: 基本開発ルール
- `naming-conventions.mdc`: 命名規則
- `codingrules.mdc`: コーディング規約
- `css-components-rules.mdc`: CSS・コンポーネントルール

## 🚨 注意事項

### CSS開発時
1. **必須**: `shared/css/variables.css` の変数を使用
2. **禁止**: ハードコードされたカラー値
3. **制限**: 単一CSSファイルは最大800行

### ファイル管理
1. 長すぎるファイル名は避ける（HTML: 20文字以下）
2. 機能別にCSSファイルを分離
3. 共通化可能な部分は `shared/` に配置

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 開発ルールに従ってコード作成
4. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
5. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
6. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはモックアップであり、商用利用を想定していません。

## 👥 チーム

- **プロジェクトリード**: KAGAMI開発チーム
- **デザイン**: UIUXデザインチーム
- **開発**: フルスタック開発チーム

---

© 2024 KAGAMI Corporation. All rights reserved.
