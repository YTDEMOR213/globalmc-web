document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navigation & Sub-site Tab Switcher
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

    // 2. Copy IP to Clipboard & Toast Trigger
    const copyTriggers = document.querySelectorAll('.copy-ip-trigger, #nav-copy-ip');
    const toast = document.getElementById('toast');

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    copyTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const ip = trigger.dataset.ip || 'globalmc.hypixels.pl';
            navigator.clipboard.writeText(ip).then(() => {
                showToast('IP address copied to clipboard!');
            });
        });
    });

    // 3. Rules Live Search & Category Filter
    const searchInput = document.getElementById('rules-search');
    const categoryBtns = document.querySelectorAll('.rule-cat-btn');
    const ruleCards = document.querySelectorAll('.rule-card');

    let currentCategory = 'all';

    function filterRules() {
        const query = searchInput.value.toLowerCase().trim();

        ruleCards.forEach(card => {
            const matchesCat = currentCategory === 'all' || card.dataset.category === currentCategory;
            const matchesQuery = card.textContent.toLowerCase().includes(query);

            if (matchesCat && matchesQuery) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
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

    // 4. DynMap Reload Button
    const reloadMapBtn = document.getElementById('reload-map-btn');
    const mapIframe = document.getElementById('dynmap-iframe');

    if (reloadMapBtn && mapIframe) {
        reloadMapBtn.addEventListener('click', () => {
            mapIframe.src = mapIframe.src;
        });
    }

    // 5. Store Category Filter Switcher
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

    // 6. Buy Button Handler — перекидает на Donationalerts
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            window.open('https://www.donationalerts.com/r/nikitabebrechka', '_blank');
        });
    });
});