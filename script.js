document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. Navigation & Sub-site Tab Switcher
    // =========================================================================
    const navButtons = document.querySelectorAll('.nav-btn');
    const pageSections = document.querySelectorAll('.page-section');
    const navTriggers = document.querySelectorAll('.nav-trigger');

    function switchTab(targetId) {
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === targetId);
        });
        pageSections.forEach(section => {
            section.classList.toggle('active', section.id === targetId);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Обновляем URL без перезагрузки (для красоты)
        const newUrl = `${window.location.pathname}#${targetId}`;
        history.replaceState(null, '', newUrl);
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.target);
        });
    });

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(trigger.dataset.target);
        });
    });

    // ✨ НОВОЕ: открываем нужную вкладку, если в URL есть хэш
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(initialHash)) {
        switchTab(initialHash);
    }

    // =========================================================================
    // 2. Copy IP to Clipboard & Toast Trigger
    // =========================================================================
    const toast = document.getElementById('toast');

    function showToast(message, duration = 2500) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // ✨ НОВОЕ: делегирование событий — работает даже для динамически добавленных элементов
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.copy-ip-trigger');
        if (trigger) {
            const ip = trigger.dataset.ip || 'globalmc.hypixels.pl';
            copyToClipboard(ip);
        }
    });

    function copyToClipboard(text) {
        // Современный способ + fallback для старых браузеров
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('✅ IP address copied to clipboard!');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('✅ IP address copied to clipboard!');
        } catch (err) {
            showToast('❌ Failed to copy IP');
        }
        document.body.removeChild(textarea);
    }

    // =========================================================================
    // 3. Rules Live Search & Category Filter
    // =========================================================================
    const searchInput = document.getElementById('rules-search');
    const categoryBtns = document.querySelectorAll('.rule-cat-btn');
    const ruleCards = document.querySelectorAll('.rule-card');
    let currentCategory = 'all';

    function filterRules() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let visibleCount = 0;

        ruleCards.forEach(card => {
            const matchesCat = currentCategory === 'all' || card.dataset.category === currentCategory;
            const matchesQuery = card.textContent.toLowerCase().includes(query);

            if (matchesCat && matchesQuery) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // ✨ НОВОЕ: сообщение, если ничего не найдено
        let noResults = document.getElementById('rules-no-results');
        if (!noResults) {
            const rulesGrid = document.querySelector('.rules-grid');
            if (rulesGrid) {
                noResults = document.createElement('div');
                noResults.id = 'rules-no-results';
                noResults.className = 'rules-no-results';
                noResults.style.cssText = `
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-muted);
                    font-size: 1rem;
                `;
                rulesGrid.parentNode.insertBefore(noResults, rulesGrid.nextSibling);
            }
        }
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            noResults.textContent = '🔍 No rules found matching your search.';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterRules);
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            filterRules();
        });
    });

    // =========================================================================
    // 4. DynMap Reload Button
    // =========================================================================
    const reloadMapBtn = document.getElementById('reload-map-btn');
    const mapIframe = document.getElementById('dynmap-iframe');

    if (reloadMapBtn && mapIframe) {
        reloadMapBtn.addEventListener('click', () => {
            reloadMapBtn.textContent = '⏳ Reloading...';
            reloadMapBtn.disabled = true;
            mapIframe.src = mapIframe.src;
            setTimeout(() => {
                reloadMapBtn.textContent = '🔄 Reload Map';
                reloadMapBtn.disabled = false;
            }, 1500);
        });
    }

    // =========================================================================
    // 5. Store Category Filter Switcher
    // =========================================================================
    const storeCatBtns = document.querySelectorAll('.store-cat-btn');
    const storeCards = document.querySelectorAll('.store-card');

    storeCatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            storeCatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const selectedCat = btn.dataset.storeCat;

            storeCards.forEach(card => {
                if (selectedCat === 'all' || card.dataset.storeCat === selectedCat) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // =========================================================================
    // 6. Buy Button Handler — перекидывает на Donationalerts
    // =========================================================================
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // ✨ НОВОЕ: можно передать информацию о товаре в URL
            const card = btn.closest('.store-card');
            const itemName = card ? card.querySelector('h3')?.textContent : 'Item';
            const tierSelect = card ? card.querySelector('.tier-select') : null;
            let selectedTier = '';
            if (tierSelect) {
                const selectedOption = tierSelect.options[tierSelect.selectedIndex];
                selectedTier = selectedOption ? ` — ${selectedOption.textContent}` : '';
            }
            showToast(`🛒 Opening payment for: ${itemName}${selectedTier}`);
            setTimeout(() => {
                window.open('https://www.donationalerts.com/r/nikitabebrechka', '_blank');
            }, 600);
        });
    });

    // =========================================================================
    // 7. ✨ НОВОЕ: Intersection Observer — плавное появление карточек
    // =========================================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Задержка для каскадного эффекта
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 60);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Наблюдаем за карточками
    const animatedElements = document.querySelectorAll(
        '.rule-card, .step-card, .store-card, .feature-pill, .stat-item'
    );
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // =========================================================================
    // 8. ✨ НОВОЕ: Keyboard shortcuts
    // =========================================================================
    document.addEventListener('keydown', (e) => {
        // Escape — закрыть toast
        if (e.key === 'Escape' && toast) {
            toast.classList.remove('show');
        }

        // Ctrl/Cmd + K — быстрый поиск по правилам (если мы на странице rules)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            const rulesSection = document.getElementById('rules');
            if (rulesSection && rulesSection.classList.contains('active') && searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
    });

    // =========================================================================
    // 9. ✨ НОВОЕ: Плавная прокрутка для якорных ссылок
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length <= 1) return;

            const targetId = href.replace('#', '');
            const targetSection = document.getElementById(targetId);

            // Если это вкладка — переключаем
            if (targetSection && targetSection.classList.contains('page-section')) {
                e.preventDefault();
                switchTab(targetId);
                return;
            }

            // Иначе — плавная прокрутка к элементу
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // =========================================================================
    // 10. ✨ НОВОЕ: Анимация счётчика игроков (заглушка)
    // =========================================================================
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + range * progress);
            element.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // Если есть элемент с классом .stat-value и data-target — анимируем
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        animateValue(el, 0, target, 1200);
    });

    // =========================================================================
    // 11. ✨ НОВОЕ: Параллакс для фоновых glow-блобов
    // =========================================================================
    const glowBlobs = document.querySelectorAll('.glow-bg');
    if (glowBlobs.length > 0 && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 30;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 30;
        });

        function animateBlobs() {
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;
            glowBlobs.forEach((blob, i) => {
                const factor = i === 0 ? 1 : -1;
                blob.style.transform = `translate(${currentX * factor}px, ${currentY * factor}px)`;
            });
            requestAnimationFrame(animateBlobs);
        }
        animateBlobs();
    }

    console.log('%c🌍 GlobalMC', 'font-size: 24px; font-weight: bold; color: #10b981;');
    console.log('%cGeopolitical Minecraft Server', 'font-size: 12px; color: #94a3b8;');
});
