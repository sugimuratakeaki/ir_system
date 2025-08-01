"""
ロール定義ファイル
各ユーザーの役割と権限を定義
"""

from enum import Enum
from typing import List, Dict, Any

class UserRole(Enum):
    """ユーザーロール定義"""
    IR_MANAGER = "ir_manager"  # IR責任者
    IR_STAFF = "ir_staff"      # IR担当者
    EXECUTIVE = "executive"     # 経営陣
    DIRECTOR = "director"       # 社外取締役
    INVESTOR = "investor"       # 投資家
    ADMIN = "admin"            # システム管理者

# ロール別の表示名
ROLE_DISPLAY_NAMES = {
    UserRole.IR_MANAGER: "IR責任者",
    UserRole.IR_STAFF: "IR担当者",
    UserRole.EXECUTIVE: "経営陣",
    UserRole.DIRECTOR: "社外取締役",
    UserRole.INVESTOR: "投資家",
    UserRole.ADMIN: "システム管理者"
}

# ロール別のメニュー構成
ROLE_MENUS = {
    UserRole.IR_MANAGER: [
        {
            "title": "ダッシュボード",
            "icon": "📊",
            "url": "/ir/workspace",
            "children": []
        },
        {
            "title": "議事録管理",
            "icon": "📝",
            "url": "/ir/dialogue-factory",
            "children": []
        },
        {
            "title": "投資家管理",
            "icon": "👥",
            "url": "/ir/investor-hub",
            "children": []
        },
        {
            "title": "スケジュール",
            "icon": "📅",
            "url": "/ir/schedule-center",
            "children": []
        },
        {
            "title": "コンテンツ",
            "icon": "📁",
            "url": "/ir/content-studio",
            "children": []
        },
        {
            "title": "戦略支援",
            "icon": "🎯",
            "url": "/ir/strategy-assistant",
            "children": []
        },
        {
            "title": "分析",
            "icon": "📈",
            "url": "/ir/analytics-lab",
            "children": []
        },
        {
            "title": "開示管理",
            "icon": "📢",
            "url": "/ir/disclosure-hub",
            "children": []
        },
        {
            "title": "管理設定",
            "icon": "⚙️",
            "url": "/ir/admin-panel",
            "children": []
        }
    ],
    UserRole.IR_STAFF: [
        {
            "title": "ダッシュボード",
            "icon": "📊",
            "url": "/ir/workspace",
            "children": []
        },
        {
            "title": "議事録管理",
            "icon": "📝",
            "url": "/ir/dialogue-factory",
            "children": []
        },
        {
            "title": "投資家管理",
            "icon": "👥",
            "url": "/ir/investor-hub",
            "children": []
        },
        {
            "title": "スケジュール",
            "icon": "📅",
            "url": "/ir/schedule-center",
            "children": []
        },
        {
            "title": "コンテンツ",
            "icon": "📁",
            "url": "/ir/content-studio",
            "children": []
        },
        {
            "title": "分析",
            "icon": "📈",
            "url": "/ir/analytics-lab",
            "children": []
        }
    ],
    UserRole.EXECUTIVE: [
        {
            "title": "ダッシュボード",
            "icon": "🏢",
            "url": "/executive/dashboard",
            "children": []
        },
        {
            "title": "経営インサイト",
            "icon": "💡",
            "url": "/executive/insights",
            "children": []
        },
        {
            "title": "承認管理",
            "icon": "✅",
            "url": "/executive/approvals",
            "children": []
        }
    ],
    UserRole.DIRECTOR: [
        {
            "title": "ガバナンス監督",
            "icon": "🏛️",
            "url": "/director/oversight",
            "children": []
        },
        {
            "title": "投資家の声",
            "icon": "🗣️",
            "url": "/director/voices",
            "children": []
        },
        {
            "title": "監査証跡",
            "icon": "📋",
            "url": "/director/audit-trail",
            "children": []
        }
    ],
    UserRole.INVESTOR: [
        {
            "title": "ポータル",
            "icon": "🏠",
            "url": "/front/investor-portal",
            "children": []
        },
        {
            "title": "面談リクエスト",
            "icon": "🤝",
            "url": "/front/meeting-request",
            "children": []
        },
        {
            "title": "IR資料",
            "icon": "📚",
            "url": "/front/resources",
            "children": []
        }
    ],
    UserRole.ADMIN: [
        {
            "title": "システム管理",
            "icon": "🔧",
            "url": "/ir/admin-panel",
            "children": []
        }
    ]
}

# ロール別のアクセス権限
ROLE_PERMISSIONS = {
    UserRole.IR_MANAGER: {
        "dialogue": ["create", "read", "update", "delete", "publish"],
        "investor": ["create", "read", "update", "delete"],
        "content": ["create", "read", "update", "delete", "publish"],
        "schedule": ["create", "read", "update", "delete"],
        "analytics": ["read", "export"],
        "settings": ["read", "update"]
    },
    UserRole.IR_STAFF: {
        "dialogue": ["create", "read", "update"],
        "investor": ["read", "update"],
        "content": ["create", "read", "update"],
        "schedule": ["create", "read", "update"],
        "analytics": ["read"],
        "settings": ["read"]
    },
    UserRole.EXECUTIVE: {
        "dialogue": ["read"],
        "investor": ["read"],
        "content": ["read", "approve"],
        "schedule": ["read"],
        "analytics": ["read", "export"],
        "settings": []
    },
    UserRole.DIRECTOR: {
        "dialogue": ["read"],
        "investor": ["read"],
        "content": ["read"],
        "schedule": ["read"],
        "analytics": ["read"],
        "audit": ["read"]
    },
    UserRole.INVESTOR: {
        "public_content": ["read"],
        "meeting_request": ["create", "read"],
        "resources": ["read", "download"]
    },
    UserRole.ADMIN: {
        "all": ["create", "read", "update", "delete"]
    }
}

def get_user_menu(role: UserRole) -> List[Dict[str, Any]]:
    """ユーザーロールに応じたメニューを取得"""
    return ROLE_MENUS.get(role, [])

def has_permission(role: UserRole, resource: str, action: str) -> bool:
    """指定されたロールが特定のリソースに対してアクションを実行できるか確認"""
    if role == UserRole.ADMIN:
        return True
    
    permissions = ROLE_PERMISSIONS.get(role, {})
    if resource in permissions:
        return action in permissions[resource]
    
    return False

def get_role_display_name(role: UserRole) -> str:
    """ロールの表示名を取得"""
    return ROLE_DISPLAY_NAMES.get(role, "Unknown")