// =============================================================
// УПРАВЛЕНИЕ ВКЛАДКАМИ
// =============================================================

export class TabsManager {
    constructor() {
        this.tabs = {};
        this.currentTab = 'converter';
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.initEventListeners();
    }

    initEventListeners() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Подписываемся на события смены вкладки
        document.addEventListener('tabChanged', (event) => {
            this.onTabChanged(event.detail.tab);
        });
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Обновляем кнопки
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Обновляем панели
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });

        const previousTab = this.currentTab;
        this.currentTab = tabName;

        // Генерируем событие смены вкладки
        const event = new CustomEvent('tabChanged', { 
            detail: { 
                tab: tabName,
                previousTab: previousTab
            } 
        });
        document.dispatchEvent(event);

        console.log(`📑 Переключено с "${previousTab}" на "${tabName}"`);
    }

    onTabChanged(tabName) {
        // Вызывается при смене вкладки
        // Можно добавить дополнительную логику здесь
        if (tabName === 'editor') {
            // Активация редактора
            this.activateEditor();
        } else if (tabName === 'converter') {
            // Активация конвертера
            this.activateConverter();
        }
    }

    activateEditor() {
        // Логика активации редактора
        const editorPanel = document.getElementById('tab-editor');
        if (editorPanel) {
            editorPanel.style.display = 'block';
        }
        
        // Скрываем кнопки действий конвертера
        const converterActions = document.querySelector('#tab-converter .sidebar-actions');
        if (converterActions) {
            converterActions.style.display = 'none';
        }
    }

    activateConverter() {
        // Логика активации конвертера
        const editorPanel = document.getElementById('tab-editor');
        if (editorPanel) {
            editorPanel.style.display = 'none';
        }
        
        // Показываем кнопки действий конвертера
        const converterActions = document.querySelector('#tab-converter .sidebar-actions');
        if (converterActions) {
            converterActions.style.display = 'flex';
        }
    }

    getCurrentTab() {
        return this.currentTab;
    }

    isTabActive(tabName) {
        return this.currentTab === tabName;
    }

    addTab(tabConfig) {
        // Метод для динамического добавления вкладок
        // tabConfig = { id, label, icon, content, order }
        const { id, label, icon, content, order = 999 } = tabConfig;
        
        // Создаем кнопку вкладки
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.dataset.tab = id;
        btn.innerHTML = `<span class="tab-icon">${icon}</span><span>${label}</span>`;
        
        // Вставляем в нужное место
        const nav = document.querySelector('.tab-navigation');
        const buttons = nav.querySelectorAll('.tab-btn');
        let inserted = false;
        for (let i = 0; i < buttons.length; i++) {
            const existingOrder = parseInt(buttons[i].dataset.order || 999);
            if (order < existingOrder) {
                nav.insertBefore(btn, buttons[i]);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            nav.appendChild(btn);
        }

        // Создаем панель вкладки
        const panel = document.createElement('div');
        panel.className = 'tab-panel';
        panel.id = `tab-${id}`;
        panel.innerHTML = content;
        
        const contentContainer = document.getElementById('tabContent');
        contentContainer.appendChild(panel);

        // Добавляем событие
        btn.addEventListener('click', () => {
            this.switchTab(id);
        });

        // Обновляем коллекции
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');

        console.log(`➕ Добавлена вкладка: ${label} (${id})`);
    }

    removeTab(tabName) {
        // Удаление вкладки
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const panel = document.getElementById(`tab-${tabName}`);
        
        if (btn) btn.remove();
        if (panel) panel.remove();

        // Если удалили текущую вкладку, переключаемся на первую
        if (this.currentTab === tabName) {
            const firstBtn = document.querySelector('.tab-btn');
            if (firstBtn) {
                this.switchTab(firstBtn.dataset.tab);
            }
        }

        // Обновляем коллекции
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');

        console.log(`🗑️ Удалена вкладка: ${tabName}`);
    }

    setTabBadge(tabName, badgeText) {
        // Установка бейджа на вкладку
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (btn) {
            let badge = btn.querySelector('.tab-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tab-badge';
                btn.appendChild(badge);
            }
            if (badgeText) {
                badge.textContent = badgeText;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    showTab(tabName) {
        // Показать вкладку (если скрыта)
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const panel = document.getElementById(`tab-${tabName}`);
        if (btn) btn.style.display = 'flex';
        if (panel) panel.style.display = 'block';
    }

    hideTab(tabName) {
        // Скрыть вкладку
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const panel = document.getElementById(`tab-${tabName}`);
        if (btn) btn.style.display = 'none';
        if (panel) panel.style.display = 'none';
        
        // Если скрыли текущую вкладку, переключаемся на первую видимую
        if (this.currentTab === tabName) {
            const firstVisible = document.querySelector('.tab-btn:not([style*="display: none"])');
            if (firstVisible) {
                this.switchTab(firstVisible.dataset.tab);
            }
        }
    }

    enableTab(tabName) {
        // Включить вкладку
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }

    disableTab(tabName) {
        // Отключить вкладку
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    }

    getTabState(tabName) {
        // Получить состояние вкладки
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const panel = document.getElementById(`tab-${tabName}`);
        return {
            exists: !!btn && !!panel,
            active: this.currentTab === tabName,
            visible: btn ? btn.style.display !== 'none' : false,
            enabled: btn ? !btn.disabled : false,
            hasBadge: !!btn?.querySelector('.tab-badge')
        };
    }

    getAllTabs() {
        // Получить список всех вкладок
        const tabs = [];
        this.tabButtons.forEach(btn => {
            tabs.push({
                id: btn.dataset.tab,
                label: btn.textContent.trim(),
                active: btn.classList.contains('active'),
                visible: btn.style.display !== 'none',
                enabled: !btn.disabled
            });
        });
        return tabs;
    }

    // Метод для плавного переключения с анимацией
    switchTabWithAnimation(tabName, animation = 'fade') {
        const panel = document.getElementById(`tab-${tabName}`);
        if (!panel) return;

        // Скрываем все панели
        this.tabPanels.forEach(p => {
            p.classList.remove('active', 'fade-in', 'slide-in');
        });

        // Показываем новую панель с анимацией
        panel.classList.add('active');
        
        switch(animation) {
            case 'fade':
                panel.classList.add('fade-in');
                break;
            case 'slide':
                panel.classList.add('slide-in');
                break;
            default:
                break;
        }

        // Переключаем кнопки
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        this.currentTab = tabName;

        // Генерируем событие
        const event = new CustomEvent('tabChanged', { 
            detail: { 
                tab: tabName,
                previousTab: this.currentTab,
                animation: animation
            } 
        });
        document.dispatchEvent(event);

        console.log(`📑 Переключено на "${tabName}" с анимацией "${animation}"`);
    }

    // Метод для сохранения состояния вкладок
    saveTabState() {
        const state = {
            currentTab: this.currentTab,
            tabs: this.getAllTabs()
        };
        try {
            localStorage.setItem('convertpro_tabs_state', JSON.stringify(state));
        } catch (e) {
            console.warn('Не удалось сохранить состояние вкладок:', e);
        }
    }

    // Метод для восстановления состояния вкладок
    restoreTabState() {
        try {
            const saved = localStorage.getItem('convertpro_tabs_state');
            if (saved) {
                const state = JSON.parse(saved);
                if (state.currentTab) {
                    this.switchTab(state.currentTab);
                }
                return state;
            }
        } catch (e) {
            console.warn('Не удалось восстановить состояние вкладок:', e);
        }
        return null;
    }
}

// Добавляем CSS для анимаций
const style = document.createElement('style');
style.textContent = `
    .tab-panel.fade-in {
        animation: tabFadeIn 0.3s ease forwards;
    }
    
    .tab-panel.slide-in {
        animation: tabSlideIn 0.3s ease forwards;
    }
    
    @keyframes tabFadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes tabSlideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .tab-badge {
        background: #ff6b6b;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: 4px;
        font-weight: 700;
    }
    
    .tab-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);