document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const pageSections = document.querySelectorAll('.page-section');
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const burgerBtn = document.getElementById('burger-btn');
    const navLinks = document.getElementById('nav-links');

    function switchTab(targetId) {
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === targetId);
        });
        pageSections.forEach(section => {
            section.classList.toggle('active', section.id === targetId);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close mobile menu after switching
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            burgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.target));
    });

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(trigger.dataset.target);
        });
    });

    // Burger menu
    if (burgerBtn && navLinks) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !burgerBtn.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burgerBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Open correct tab from URL hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(initialHash)) {
        switchTab(initialHash);
    }

    // Copy IP
    const toast = document.getElementById('toast');

    function showToast(message, duration = 2500) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
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
                showToast('IP address copied to clipboard!');
            }).catch(() => fallbackCopy(text));
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
            showToast('IP address copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy IP');
        }
        document.body.removeChild(textarea);
    }

    // Server status
    const SERVER_IP = 'globalmc.hypixels.pl';
    const API_URL = `https://api.mcsrvstat.us/2/${SERVER_IP}`;
    const statusEl = document.getElementById('server-status');
    const playersEl = document.getElementById('server-players');
    const versionEl = document.getElementById('server-version');
    const navOnlineDot = document.getElementById('nav-online-dot');

    async function fetchServerStatus() {
        try {
            if (statusEl && statusEl.textContent.includes('Loading')) {
                statusEl.innerHTML = '<span class="status-indicator loading">Checking...</span>';
            }

            const response = await fetch(API_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (data.online) {
                const players = data.players || { online: 0, max: 100 };
                const online = players.online ?? 0;
                const max = players.max ?? 100;
                const version = data.version || '1.21.11';

                if (statusEl) statusEl.innerHTML = '<span class="status-indicator online">Online</span>';
                if (playersEl) {
                    playersEl.textContent = `${online} / ${max}`;
                    playersEl.style.color = online >= max * 0.9 ? 'var(--accent-gold)' : '';
                }
                if (versionEl) versionEl.textContent = version;
                if (navOnlineDot) {
                    navOnlineDot.classList.remove('offline');
                }
            } else {
                setServerOffline('Offline');
            }
        } catch (error) {
            setServerOffline('Unavailable');
        }
    }

    function setServerOffline(message) {
        if (statusEl) statusEl.innerHTML = `<span class="status-indicator offline">${message}</span>`;
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

    // Rules search
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
                noResults.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);';
                rulesGrid.parentNode.insertBefore(noResults, rulesGrid.nextSibling);
            }
        }
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            noResults.textContent = 'No rules found matching your search.';
        }
    }

    if (searchInput) searchInput.addEventListener('input', filterRules);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            filterRules();
        });
    });

    // DynMap reload
    const reloadMapBtn = document.getElementById('reload-map-btn');
    const mapIframe = document.getElementById('dynmap-iframe');

    if (reloadMapBtn && mapIframe) {
        reloadMapBtn.addEventListener('click', () => {
            reloadMapBtn.textContent = 'Reloading...';
            reloadMapBtn.disabled = true;
            mapIframe.src = mapIframe.src;
            setTimeout(() => {
                reloadMapBtn.textContent = 'Reload Map';
                reloadMapBtn.disabled = false;
            }, 1500);
        });
    }

    // Store filter
    const storeCatBtns = document.querySelectorAll('.store-cat-btn');
    const storeCards = document.querySelectorAll('.store-card');

    storeCatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            storeCatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const selectedCat = btn.dataset.storeCat;

            storeCards.forEach(card => {
                card.style.display = (selectedCat === 'all' || card.dataset.storeCat === selectedCat) ? 'flex' : 'none';
            });
        });
    });

    // Buy buttons
    document.querySelectorAll('.buy-btn').forEach(btn => {
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
            showToast(`Opening payment for: ${itemName}${selectedTier}`);
            setTimeout(() => {
                window.open('https://www.donationalerts.com/r/nikitabebrechka', '_blank');
            }, 600);
        });
    });

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('animate-in'), index * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.rule-card, .step-card, .store-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toast) toast.classList.remove('show');
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            const rulesSection = document.getElementById('rules');
            if (rulesSection && rulesSection.classList.contains('active') && searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
    });

    // Smooth scroll for anchors
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
});
