"""
投資家向けフロントサイト - Flask Application
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import json

# Flaskアプリケーションの初期化
app = Flask(__name__)
CORS(app)

# 設定
app.config['SECRET_KEY'] = 'ir-system-front-secret-key'
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# ===== ページルート =====

@app.route('/')
def index():
    """トップページ"""
    return render_template('index.html')

@app.route('/ir-library')
def ir_library():
    """IR資料室"""
    return render_template('ir-library.html')

@app.route('/financial-data')
def financial_data():
    """業績・財務データ"""
    return render_template('financial-data.html')

@app.route('/ai-assistant')
def ai_assistant():
    """AIアシスタント"""
    return render_template('ai-assistant.html')

@app.route('/faq')
def faq():
    """よくあるご質問"""
    return render_template('faq.html')

@app.route('/contact')
def contact():
    """お問い合わせ"""
    return render_template('contact.html')

# ===== API エンドポイント =====

@app.route('/api/search')
def api_search():
    """検索API"""
    query = request.args.get('q', '')
    category = request.args.get('category', 'all')
    
    # モックデータ
    results = [
        {
            'id': 1,
            'title': '2025年3月期 第1四半期決算説明資料',
            'category': '決算資料',
            'date': '2025-07-30',
            'highlight': f'{query}に関連する内容が含まれています...',
            'url': '/ir-library/document/1'
        },
        {
            'id': 2,
            'title': 'AI事業の成長戦略について',
            'category': 'FAQ',
            'date': '2025-07-15',
            'highlight': f'{query}についての回答があります...',
            'url': '/faq/ai-business'
        }
    ]
    
    return jsonify({
        'query': query,
        'category': category,
        'total': len(results),
        'results': results
    })

@app.route('/api/documents')
def api_documents():
    """IR資料一覧API"""
    category = request.args.get('category', 'all')
    year = request.args.get('year', '2025')
    
    # モックデータ
    documents = [
        {
            'id': 1,
            'title': '2025年3月期 第1四半期決算説明資料',
            'category': '決算資料',
            'date': '2025-07-30',
            'fileSize': '2.5MB',
            'fileType': 'PDF',
            'tags': ['決算', '2025Q1', 'AI事業']
        },
        {
            'id': 2,
            'title': '2025年3月期 第1四半期決算短信',
            'category': '決算短信',
            'date': '2025-07-30',
            'fileSize': '1.8MB',
            'fileType': 'PDF',
            'tags': ['決算', '2025Q1']
        },
        {
            'id': 3,
            'title': '統合報告書2024',
            'category': '統合報告書',
            'date': '2024-06-30',
            'fileSize': '15.2MB',
            'fileType': 'PDF',
            'tags': ['統合報告書', 'ESG', 'サステナビリティ']
        }
    ]
    
    # カテゴリでフィルタリング
    if category != 'all':
        documents = [d for d in documents if d['category'] == category]
    
    return jsonify({
        'category': category,
        'year': year,
        'total': len(documents),
        'documents': documents
    })

@app.route('/api/financial-summary')
def api_financial_summary():
    """財務サマリーAPI"""
    return jsonify({
        'latestQuarter': '2025年3月期 第1四半期',
        'revenue': {
            'value': 15234,
            'unit': '百万円',
            'change': 35.2,
            'changeType': 'increase'
        },
        'operatingProfit': {
            'value': 3456,
            'unit': '百万円',
            'change': 42.1,
            'changeType': 'increase'
        },
        'netProfit': {
            'value': 2345,
            'unit': '百万円',
            'change': 38.5,
            'changeType': 'increase'
        },
        'eps': {
            'value': 123.45,
            'unit': '円',
            'change': 38.5,
            'changeType': 'increase'
        },
        'stockPrice': {
            'value': 3456,
            'unit': '円',
            'change': 2.3,
            'changeType': 'increase',
            'date': '2025-07-30 15:00'
        }
    })

@app.route('/api/faq/popular')
def api_faq_popular():
    """人気のFAQ API"""
    return jsonify({
        'faqs': [
            {
                'id': 1,
                'category': 'AI事業',
                'question': 'AI事業の成長率35%を達成した要因は何ですか？',
                'answer': 'エンタープライズSaaSの好調、新製品の市場投入、既存顧客のアップセルが主な要因です。',
                'views': 1234,
                'helpful': 89
            },
            {
                'id': 2,
                'category': '財務・業績',
                'question': '今期の業績予想を上方修正した理由は？',
                'answer': 'AI事業の想定以上の成長と、新規顧客獲得の加速により、通期業績予想を上方修正しました。',
                'views': 987,
                'helpful': 76
            },
            {
                'id': 3,
                'category': '経営戦略',
                'question': '中期経営計画の進捗状況は？',
                'answer': '2025年度目標に対して順調に進捗しており、特にAI事業は計画を上回るペースで成長しています。',
                'views': 856,
                'helpful': 65
            }
        ]
    })

@app.route('/api/ai-chat', methods=['POST'])
def api_ai_chat():
    """AIチャットAPI"""
    data = request.get_json()
    message = data.get('message', '')
    
    # シンプルなレスポンス生成（実際はAIモデルを使用）
    responses = {
        '決算': '最新の決算情報については、2025年3月期第1四半期の決算説明資料をご覧ください。売上高は前年同期比35.2%増の152億円となりました。',
        'AI事業': 'AI事業は当社の成長ドライバーとして、前年同期比35%の成長を達成しています。エンタープライズ向けSaaSが特に好調です。',
        '株価': f'本日の株価は3,456円で、前日比+2.3%となっています。詳細な株価情報は証券会社のサイトでご確認ください。'
    }
    
    # キーワードマッチング
    response_text = 'ご質問ありがとうございます。'
    for keyword, response in responses.items():
        if keyword in message:
            response_text = response
            break
    else:
        response_text += 'お問い合わせの内容について、関連する資料をお探しします。IR資料室もご活用ください。'
    
    return jsonify({
        'response': response_text,
        'suggestions': [
            {'text': '最新の決算資料を見る', 'action': 'navigate', 'url': '/ir-library'},
            {'text': 'AI事業について詳しく', 'action': 'search', 'query': 'AI事業'},
            {'text': 'お問い合わせフォーム', 'action': 'navigate', 'url': '/contact'}
        ],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/contact', methods=['POST'])
def api_contact():
    """お問い合わせ送信API"""
    data = request.get_json()
    
    # バリデーション
    required_fields = ['name', 'email', 'category', 'message']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field}は必須項目です'}), 400
    
    # 実際の実装では、ここでメール送信やDB保存を行う
    
    return jsonify({
        'success': True,
        'message': 'お問い合わせを受け付けました。担当者より2営業日以内にご連絡いたします。',
        'referenceNumber': f'INQ-{datetime.now().strftime("%Y%m%d%H%M%S")}'
    })

# ===== エラーハンドラー =====

@app.errorhandler(404)
def not_found(error):
    """404エラーページ"""
    if request.path.startswith('/api/'):
        return jsonify({'error': 'APIエンドポイントが見つかりません'}), 404
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """500エラーページ"""
    if request.path.startswith('/api/'):
        return jsonify({'error': '内部サーバーエラーが発生しました'}), 500
    return render_template('500.html'), 500

# ===== アプリケーション起動 =====

if __name__ == '__main__':
    # 開発サーバーの起動
    app.run(
        host='127.0.0.1',
        port=5001,  # CMSとは別のポート
        debug=True
    )
