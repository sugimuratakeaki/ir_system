/**
 * KAGAMI CMS 2.0 - Sidebar Component
 * サイドバーの動作を管理
 */

// サイドバー名前空間
KAGAMI.sidebar = {
    element: null,
    isCollapsedState: false,
    isMobileOpen: false,
    
    // 初期化
    init: function() {
        this.element = document.getElementById('sidebar');
        if (!this.element) return;
        
        // 保存された状態の復元
        const savedState = localStorage.getItem(KAGAMI.config.sidebar.storageKey);
        if (savedState === 'collapsed') {
            this.collapse(false);
        }
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // モバイル対応
        this.handleMobile();
    },
    
    // イベントリスナーの設定
    setupEventListeners: function() {
        // トグルボタン
        const toggleButton = document.getElementById('sidebarToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggle());
        }
        
        // ナビゲーションアイテムのホバー効果
        const navItems = this.element.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => this.handleNavItemHover(e));
        });
        
        // モバイルでのスワイプ対応
        if ('ontouchstart' in window) {
            this.setupSwipeGestures();
        }
    },
    
    // トグル
    toggle: function() {
        if (this.isCollapsedState) {
            this.expand();
        } else {
            this.collapse();
        }
    },
    
    // 折りたたむ
    collapse: function(save = true) {
        this.element.classList.add('collapsed');
        this.isCollapsedState = true;
        
        if (save) {
            localStorage.setItem(KAGAMI.config.sidebar.storageKey, 'collapsed');
        }
        
        // イベント発火
        window.dispatchEvent(new CustomEvent('sidebarCollapsed'));
    },
    
    // 展開する
    expand: function(save = true) {
        this.element.classList.remove('collapsed');
        this.isCollapsedState = false;
        
        if (save) {
            localStorage.setItem(KAGAMI.config.sidebar.storageKey, 'expanded');
        }
        
        // イベント発火
        window.dispatchEvent(new CustomEvent('sidebarExpanded'));
    },
    
    // 折りたたまれているかチェック
    isCollapsed: function() {
        return this.isCollapsedState;
    },
    
    // モバイルでの開閉
    open: function() {
        if (window.innerWidth < 768) {
            this.element.classList.add('open');
            this.isMobileOpen = true;
            
            // オーバーレイの作成
            this.createOverlay();
        }
    },
    
    close: function() {
        if (window.innerWidth < 768) {
            this.element.classList.remove('open');
            this.isMobileOpen = false;
            
            // オーバーレイの削除
            this.removeOverlay();
        }
    },
    
    // ナビゲーションアイテムのホバー処理
    handleNavItemHover: function(e) {
        if (!this.isCollapsed()) return;
        
        const item = e.currentTarget;
        const tooltip = item.getAttribute('data-tooltip');
        if (!tooltip) return;
        
        // ツールチップの位置調整
        const rect = item.getBoundingClientRect();
        const tooltipElement = item.querySelector('::after');
        if (tooltipElement) {
            const style = window.getComputedStyle(tooltipElement);
            // 必要に応じて位置調整
        }
    },
    
    // モバイル対応
    handleMobile: function() {
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768;
            
            if (isMobile && !this.isMobileOpen) {
                this.element.classList.remove('open');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', KAGAMI.utils.debounce(checkMobile, 250));
    },
    
    // スワイプジェスチャーの設定
    setupSwipeGestures: function() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, false);
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchEndX - touchStartX;
            
            // 左端からの右スワイプでサイドバーを開く
            if (touchStartX < 50 && diff > swipeThreshold) {
                this.open();
            }
            // 左スワイプでサイドバーを閉じる
            else if (this.isMobileOpen && diff < -swipeThreshold) {
                this.close();
            }
        };
        
        this.handleSwipe = handleSwipe;
    },
    
    // オーバーレイの作成
    createOverlay: function() {
        if (document.getElementById('sidebarOverlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'sidebarOverlay';
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: ${parseInt(window.getComputedStyle(this.element).zIndex) - 1};
            opacity: 0;
            transition: opacity 300ms ease;
        `;
        
        overlay.addEventListener('click', () => this.close());
        document.body.appendChild(overlay);
        
        // アニメーション
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
    },
    
    // オーバーレイの削除
    removeOverlay: function() {
        const overlay = document.getElementById('sidebarOverlay');
        if (!overlay) return;
        
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    },
    
    // アクティブなナビゲーションアイテムへのスクロール
    scrollToActive: function() {
        const activeItem = this.element.querySelector('.nav-item.active');
        if (!activeItem) return;
        
        const nav = this.element.querySelector('.sidebar-nav');
        const itemRect = activeItem.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        
        if (itemRect.top < navRect.top || itemRect.bottom > navRect.bottom) {
            activeItem.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    },
    
    // ナビゲーションアイテムのアクティブ状態を更新
    updateActiveState: function(path) {
        const navItems = this.element.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === path) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        this.scrollToActive();
    },
    
    // 検索機能
    setupSearch: function() {
        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.placeholder = 'メニューを検索...';
        searchInput.className = 'sidebar-search';
        searchInput.style.cssText = `
            width: calc(100% - ${window.getComputedStyle(this.element).getPropertyValue('--space-lg')} * 2);
            margin: var(--space-md) var(--space-lg);
            padding: var(--space-sm) var(--space-md);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--border-radius-md);
            color: white;
            font-size: var(--text-sm);
        `;
        
        const nav = this.element.querySelector('.sidebar-nav');
        nav.insertBefore(searchInput, nav.firstChild);
        
        // 検索処理
        searchInput.addEventListener('input', KAGAMI.utils.debounce((e) => {
            const query = e.target.value.toLowerCase();
            const navItems = this.element.querySelectorAll('.nav-item');
            const sections = this.element.querySelectorAll('.nav-section');
            
            if (!query) {
                navItems.forEach(item => item.style.display = '');
                sections.forEach(section => section.style.display = '');
                return;
            }
            
            navItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? '' : 'none';
            });
            
            // セクションの表示/非表示
            sections.forEach(section => {
                const visibleItems = section.querySelectorAll('.nav-item[style=""]');
                section.style.display = visibleItems.length > 0 ? '' : 'none';
            });
        }, 300));
    },
    
    // サブメニューのトグル
    toggleSubmenu(event, element) {
        event.preventDefault();
        
        const submenu = element.nextElementSibling;
        const isExpanded = element.classList.contains('expanded');
        
        // 他のサブメニューを閉じる
        document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
            if (item !== element) {
                item.classList.remove('expanded');
                const otherSubmenu = item.nextElementSibling;
                if (otherSubmenu) {
                    otherSubmenu.classList.remove('show');
                }
            }
        });
        
        // 現在のサブメニューをトグル
        if (isExpanded) {
            element.classList.remove('expanded');
            submenu.classList.remove('show');
        } else {
            element.classList.add('expanded');
            submenu.classList.add('show');
        }
    }
};

// ドキュメント準備完了時に初期化を予約
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => KAGAMI.sidebar.init());
} else {
    KAGAMI.sidebar.init();
}

// グローバル関数として公開
window.toggleSubmenu = function(event, element) {
    KAGAMI.sidebar.toggleSubmenu(event, element);
};
