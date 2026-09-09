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

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.copy-ip-trigger');
        if (trigger) {
            const ip = trigger.dataset.ip || 'globalmc.hypixels.pl';
            copyToClipboard(ip);
        }
    });

    function copyToClipboard(text) {
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
    // 3. Live Server Status через mcsrvstatus.us API
    // =========================================================================
    const SERVER_IP = 'globalmc.hypixels.pl';
    const API_URL = `https://api.mcsrvstat.us/2/${SERVER_IP}`;

    const statusEl = document.getElementById('server-status');
    const playersEl = document.getElementById('server-players');
    const versionEl = document.getElementById('server-version');
    const navOnlineDot = document.getElementById('nav-online-dot');

    async function fetchServerStatus() {
        try {
            if (statusEl && statusEl.textContent.includes('Loading')) {
                statusEl.innerHTML = '<span class="status-indicator loading">⏳ Checking...</span>';
            }

            const response = await fetch(API_URL, { cache: 'no-store' });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (data.online) {
                const players = data.players || { online: 0, max: 100 };
                const online = players.online ?? 0;
                const max = players.max ?? 100;
                const version = data.version || '1.21.11';

                if (statusEl) {
                    statusEl.innerHTML = '<span class="status-indicator online">🟢 Online</span>';
                }
                if (playersEl) {
                    playersEl.textContent = `${online} / ${max}`;
                    if (online >= max * 0.9) {
                        playersEl.style.color = 'var(--accent-gold)';
                    } else {
                        playersEl.style.color = '';
                    }
                }
                if (versionEl) {
                    versionEl.textContent = version;
                }
                if (navOnlineDot) {
                    navOnlineDot.classList.remove('offline');
                    navOnlineDot.classList.add('online');
                }
            } else {
                setServerOffline('Server is offline');
            }
        } catch (error) {
            console.warn('Failed to fetch server status:', error);
            setServerOffline('Status unavailable');
        }
    }

    function setServerOffline(message) {
        if (statusEl) {
            statusEl.innerHTML = `<span class="status-indicator offline">🔴 ${message}</span>`;
        }
        if (playersEl) {
            playersEl.textContent = '0 / 0';
            playersEl.style.color = 'var(--text-muted)';
        }
        if (navOnlineDot) {
            navOnlineDot.classList.remove('online');
            navOnlineDot.classList.add('offline');
        }
    }

    fetchServerStatus();
    setInterval(fetchServerStatus, 60 * 1000);

    // =========================================================================
    // 4. Rules Live Search & Category Filter
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

        let noResults = document.getElementById('rules-no-results');
        if (!noResults) {
            const rulesGrid = document.querySelector('.rules-grid');
            if (rulesGrid) {
                noResults = document.createElement('div');
                noResults.id = 'rules-no-results';
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
    // 5. DynMap Reload Button
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
    // 6. Store Category Filter Switcher
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
    // 7. Buy Button Handler
    // =========================================================================
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
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
    // 8. Intersection Observer — плавное появление карточек
    // =========================================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 60);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
        '.rule-card, .step-card, .store-card, .feature-pill, .stat-item'
    );
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // =========================================================================
    // 9. Keyboard shortcuts
    // =========================================================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toast) {
            toast.classList.remove('show');
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            const rulesSection = document.getElementById('rules');
            if (rulesSection && rulesSection.classList.contains('active') && searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
    });

    // =========================================================================
    // 10. Smooth scroll for anchor links
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length <= 1) return;

            const targetId = href.replace('#', '');
            const targetSection = document.getElementById(targetId);

            if (targetSection && targetSection.classList.contains('page-section')) {
                e.preventDefault();
                switchTab(targetId);
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log('%c🌍 GlobalMC', 'font-size: 24px; font-weight: bold; color: #10b981;');
    console.log('%cGeopolitical Minecraft Server', 'font-size: 12px; color: #94a3b8;');
});
