/**
 * KAGAMI CMS 2.0 - サイドバー管理
 * サイドバーの表示制御、メニュー管理、ナビゲーション
 */

class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mobileMenuButton = document.getElementById('mobileMenuButton');
        this.isCollapsed = false;
        this.isMobileMenuOpen = false;
        this.activeMenuItem = null;
        this.init();
    }

    init() {
        if (!this.sidebar) return;

        // ローカルストレージから状態を復元
        this.restoreState();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // 現在のページをアクティブに設定
        this.setActiveMenuItem();
        
        // モバイル対応
        this.handleResponsive();
        
        // サブメニューの初期化
        this.initSubmenus();
    }

    restoreState() {
        const savedState = localStorage.getItem('sidebar_collapsed');
        if (savedState === 'true' && window.innerWidth > 768) {
            this.collapse();
        }
    }

    setupEventListeners() {
        // サイドバートグル
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggle());
        }

        // モバイルメニューボタン
        if (this.mobileMenuButton) {
            this.mobileMenuButton.addEventListener('click', () => this.toggleMobileMenu());
        }

        // メニューアイテムのクリック
        this.sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuClick(e));
        });

        // サブメニューのトグル
        this.sidebar.querySelectorAll('.nav-submenu-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.toggleSubmenu(e));
        });

        // ウィンドウリサイズ
        window.addEventListener('resize', debounce(() => this.handleResponsive(), 250));

        // モバイルでの外側クリック
        if (window.innerWidth <= 768) {
            DOMUtils.onClickOutside(this.sidebar, () => {
                if (this.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        if (this.isCollapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    collapse() {
        this.isCollapsed = true;
        this.sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
        localStorage.setItem('sidebar_collapsed', 'true');
        
        // ツールチップを表示
        this.enableTooltips();
        
        // アニメーション後にイベントを発火
        setTimeout(() => {
            window.dispatchEvent(new Event('sidebarCollapsed'));
        }, 300);
    }

    expand() {
        this.isCollapsed = false;
        this.sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
        localStorage.setItem('sidebar_collapsed', 'false');
        
        // ツールチップを非表示
        this.disableTooltips();
        
        // アニメーション後にイベントを発火
        setTimeout(() => {
            window.dispatchEvent(new Event('sidebarExpanded'));
        }, 300);
    }

    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMobileMenuOpen = true;
        this.sidebar.classList.add('mobile-open');
        document.body.classList.add('mobile-menu-open');
        
        // オーバーレイを追加
        this.createOverlay();
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.sidebar.classList.remove('mobile-open');
        document.body.classList.remove('mobile-menu-open');
        
        // オーバーレイを削除
        this.removeOverlay();
    }

    createOverlay() {
        if (!document.getElementById('sidebarOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => this.closeMobileMenu());
            document.body.appendChild(overlay);
            
            // アニメーション
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        }
    }

    removeOverlay() {
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    handleMenuClick(e) {
        const navItem = e.currentTarget;
        const link = navItem.querySelector('a');
        
        // サブメニューがある場合は展開/折りたたみ
        if (navItem.querySelector('.nav-submenu')) {
            e.preventDefault();
            this.toggleSubmenu(e);
            return;
        }
        
        // モバイルの場合はメニューを閉じる
        if (window.innerWidth <= 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // アクティブ状態を更新
        this.setActiveMenuItem(navItem);
    }

    toggleSubmenu(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const navItem = e.currentTarget.closest('.nav-item');
        const submenu = navItem.querySelector('.nav-submenu');
        
        if (!submenu) return;
        
        const isOpen = navItem.classList.contains('open');
        
        // 他のサブメニューを閉じる（アコーディオン動作）
        if (!this.isCollapsed) {
            this.sidebar.querySelectorAll('.nav-item.open').forEach(item => {
                if (item !== navItem) {
                    this.closeSubmenu(item);
                }
            });
        }
        
        // 現在のサブメニューをトグル
        if (isOpen) {
            this.closeSubmenu(navItem);
        } else {
            this.openSubmenu(navItem);
        }
    }

    openSubmenu(navItem) {
        const submenu = navItem.querySelector('.nav-submenu');
        if (!submenu) return;
        
        navItem.classList.add('open');
        
        // 高さを計算してアニメーション
        const height = submenu.scrollHeight;
        submenu.style.height = '0';
        requestAnimationFrame(() => {
            submenu.style.height = `${height}px`;
        });
        
        // アニメーション完了後に高さをautoに
        setTimeout(() => {
            submenu.style.height = 'auto';
        }, 300);
    }

    closeSubmenu(navItem) {
        const submenu = navItem.querySelector('.nav-submenu');
        if (!submenu) return;
        
        // 現在の高さを取得
        const height = submenu.scrollHeight;
        submenu.style.height = `${height}px`;
        
        // 高さを0にアニメーション
        requestAnimationFrame(() => {
            submenu.style.height = '0';
        });
        
        navItem.classList.remove('open');
    }

    initSubmenus() {
        // 現在のページに基づいてサブメニューを開く
        const currentPath = window.location.pathname;
        
        this.sidebar.querySelectorAll('.nav-submenu-item a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                const navItem = link.closest('.nav-item');
                if (navItem && !this.isCollapsed) {
                    this.openSubmenu(navItem);
                }
                link.parentElement.classList.add('active');
            }
        });
    }

    setActiveMenuItem(navItem = null) {
        // 既存のアクティブ状態をクリア
        this.sidebar.querySelectorAll('.nav-item.active, .nav-submenu-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        if (navItem) {
            navItem.classList.add('active');
            this.activeMenuItem = navItem;
        } else {
            // 現在のURLに基づいて設定
            const currentPath = window.location.pathname;
            
            // 通常のメニューアイテム
            this.sidebar.querySelectorAll('.nav-item > a').forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.parentElement.classList.add('active');
                    this.activeMenuItem = link.parentElement;
                }
            });
            
            // サブメニューアイテム
            this.sidebar.querySelectorAll('.nav-submenu-item a').forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.parentElement.classList.add('active');
                    const parentNavItem = link.closest('.nav-item');
                    if (parentNavItem) {
                        parentNavItem.classList.add('active');
                    }
                }
            });
        }
    }

    handleResponsive() {
        if (window.innerWidth <= 768) {
            // モバイル表示
            this.sidebar.classList.add('mobile');
            this.sidebar.classList.remove('collapsed');
            this.isCollapsed = false;
            
            // モバイルではツールチップを無効化
            this.disableTooltips();
        } else {
            // デスクトップ表示
            this.sidebar.classList.remove('mobile');
            this.closeMobileMenu();
            
            // 保存された状態を復元
            this.restoreState();
        }
    }

    enableTooltips() {
        // サイドバーが折りたたまれている時のツールチップ
        this.sidebar.querySelectorAll('.nav-item > a').forEach(link => {
            const text = link.querySelector('.nav-text')?.textContent;
            if (text) {
                link.setAttribute('title', text);
                link.setAttribute('data-tooltip', text);
            }
        });
    }

    disableTooltips() {
        this.sidebar.querySelectorAll('.nav-item > a').forEach(link => {
            link.removeAttribute('title');
            link.removeAttribute('data-tooltip');
        });
    }

    // 検索機能
    filterMenu(query) {
        const searchQuery = query.toLowerCase();
        let hasResults = false;
        
        this.sidebar.querySelectorAll('.nav-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchQuery);
            
            if (matches) {
                item.style.display = '';
                hasResults = true;
                
                // 親要素も表示
                const parent = item.closest('.nav-submenu');
                if (parent) {
                    parent.closest('.nav-item').style.display = '';
                }
            } else {
                // サブメニューを持つアイテムは、子要素がマッチするかチェック
                const submenu = item.querySelector('.nav-submenu');
                if (submenu) {
                    const hasMatchingChild = Array.from(submenu.querySelectorAll('.nav-submenu-item'))
                        .some(child => child.textContent.toLowerCase().includes(searchQuery));
                    
                    if (hasMatchingChild) {
                        item.style.display = '';
                        hasResults = true;
                    } else {
                        item.style.display = 'none';
                    }
                } else {
                    item.style.display = 'none';
                }
            }
        });
        
        // 結果がない場合のメッセージ
        const noResultsMsg = this.sidebar.querySelector('.no-results-message');
        if (!hasResults) {
            if (!noResultsMsg) {
                const message = document.createElement('div');
                message.className = 'no-results-message';
                message.textContent = '検索結果がありません';
                this.sidebar.querySelector('.nav-menu').appendChild(message);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // メニュー項目を追加
    addMenuItem(config) {
        const navMenu = this.sidebar.querySelector('.nav-menu');
        const navItem = this.createMenuItem(config);
        
        if (config.position === 'top') {
            navMenu.prepend(navItem);
        } else {
            navMenu.appendChild(navItem);
        }
        
        // イベントリスナーを設定
        navItem.addEventListener('click', (e) => this.handleMenuClick(e));
        
        return navItem;
    }

    createMenuItem(config) {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        
        const link = document.createElement('a');
        link.href = config.href || '#';
        
        if (config.icon) {
            const icon = document.createElement('span');
            icon.className = 'nav-icon';
            icon.innerHTML = config.icon;
            link.appendChild(icon);
        }
        
        const text = document.createElement('span');
        text.className = 'nav-text';
        text.textContent = config.text;
        link.appendChild(text);
        
        if (config.badge) {
            const badge = document.createElement('span');
            badge.className = `nav-badge ${config.badge.class || ''}`;
            badge.textContent = config.badge.text;
            link.appendChild(badge);
        }
        
        navItem.appendChild(link);
        
        if (config.submenu) {
            // サブメニューを追加
            const submenu = document.createElement('ul');
            submenu.className = 'nav-submenu';
            
            config.submenu.forEach(subItem => {
                const li = document.createElement('li');
                li.className = 'nav-submenu-item';
                
                const subLink = document.createElement('a');
                subLink.href = subItem.href;
                subLink.textContent = subItem.text;
                
                li.appendChild(subLink);
                submenu.appendChild(li);
            });
            
            navItem.appendChild(submenu);
            
            // トグルボタンを追加
            const toggle = document.createElement('button');
            toggle.className = 'nav-submenu-toggle';
            toggle.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>';
            link.appendChild(toggle);
            
            toggle.addEventListener('click', (e) => this.toggleSubmenu(e));
        }
        
        return navItem;
    }
}

// サイドバーのトグル関数（グローバル）
function toggleSidebar() {
    if (window.sidebarManager) {
        window.sidebarManager.toggle();
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});