# KAGAMI IR System - CMS

## 概要
KAGAMI IR Systemは、AI技術を活用したIR（投資家向け広報）業務支援システムです。
投資家との効率的なコミュニケーションと情報開示を実現します。

## システム構成

### フロントエンド（投資家向け）
- `/frontend` - 投資家が利用するウェブサイト

### CMS（管理者向け）
- `/cms` - IR担当者が利用する管理システム

### 共通リソース
- `/shared` - 両システムで共有するCSS、画像などのリソース

## CMS機能一覧

### コンテンツ管理
- **AI-FAQ管理** - AIを活用したFAQの自動生成と管理
- **ドキュメント管理** - IR資料の一元管理
- **ニュース・お知らせ管理** - タイムリーな情報発信

### 業務管理
- **投資家管理** - 投資家情報の管理とセグメンテーション
- **スケジュール管理** - IR活動スケジュールの管理
- **メール配信管理** - ターゲティングメール配信
- **データ取込** - 音声・テキストファイルの自動処理
- **分析・レポート** - IR活動の効果測定

### システム管理
- **ユーザー管理** - CMSユーザーの管理
- **権限管理** - ロールベースのアクセス制御
- **監査ログ** - 操作履歴の記録と監視
- **設定** - システム設定の管理

## 技術スタック

### バックエンド
- Python 3.x
- FastAPI - 高速なWebフレームワーク
- Jinja2 - テンプレートエンジン

### フロントエンド
- HTML5 / CSS3
- JavaScript (Vanilla)
- Tailwind CSS ベースのカスタムデザインシステム

### デザインシステム
- モダンでミニマルなデザイン
- レスポンシブ対応
- アクセシビリティ配慮

## インストール方法

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-repo/kagami-ir-system.git
cd kagami-ir-system
```

### 2. CMS環境のセットアップ
```bash
cd cms

# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化（Windows）
.\venv\Scripts\activate

# 仮想環境の有効化（Mac/Linux）
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt
```

### 3. CMSの起動
```bash
# Windows
start.bat

# Mac/Linux
./start.sh

# または直接実行
python app.py
```

CMSは http://localhost:8000 でアクセスできます。

## プロジェクト構造

```
ir_system/
├── cms/                    # CMS（管理システム）
│   ├── app.py             # FastAPIアプリケーション
│   ├── requirements.txt   # Python依存関係
│   ├── static/           # CMS専用の静的ファイル
│   │   └── css/
│   │       └── cms.css   # CMS専用スタイル
│   └── templates/        # Jinja2テンプレート
│       ├── base.html     # ベーステンプレート
│       ├── dashboard.html # ダッシュボード
│       ├── faq.html      # FAQ管理
│       └── ...           # その他の画面
│
├── frontend/             # フロントエンド（投資家向け）
│   └── ...
│
└── shared/              # 共通リソース
    └── css/
        ├── variables.css   # CSS変数定義
        └── components.css  # 共通コンポーネント
```

## デザイン原則

### カラーパレット
- **プライマリ**: KAGAMI Blue (#1a365d)
- **セカンダリ**: Accent Purple (#6b46c1), Accent Teal (#0891b2)
- **フィードバック**: Success (#10b981), Warning (#f59e0b), Error (#ef4444)

### タイポグラフィ
- システムフォント優先（-apple-system, BlinkMacSystemFont, etc.）
- 明確な階層構造
- 読みやすさを重視

### レイアウト
- 8pxグリッドシステム
- レスポンシブデザイン
- モバイルファースト

## 開発ガイドライン

### コーディング規約
- Python: PEP 8準拠
- HTML/CSS: BEM命名規則を参考
- JavaScript: ES6+構文を使用

### コンポーネント化
- 再利用可能なUIコンポーネントは `/shared/css/components.css` に定義
- CMS固有のスタイルは `/cms/static/css/cms.css` に定義

### アクセシビリティ
- セマンティックHTML
- 適切なARIA属性
- キーボードナビゲーション対応

## ライセンス
このプロジェクトは商用プロジェクトです。無断での複製・配布は禁止されています。

## お問い合わせ
KAGAMI IR System開発チーム
