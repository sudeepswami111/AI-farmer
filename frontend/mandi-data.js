/* ============================================================
   KisanMitra - Dynamic Mandi Prices Engine (Backend API Driven)
   ============================================================ */

(function () {
  let pricesCache = [];
  let statsCache = { total: 0, mandis: 0, up: 0, down: 0 };
  let lastUpdated = '';
  let currentStateFilter = 'All States';
  let currentTypeFilter = 'All Crops';
  let sortMode = 'Name A→Z';
  let nextRefreshSeconds = 300;
  let countdownTimer = null;

  async function fetchPrices(state = 'All States', type = 'All Crops') {
    try {
      const baseUrl = window.location.origin.includes('file://') || window.location.port === '5173' 
        ? 'http://localhost:8080' 
        : window.location.origin;
        
      const url = new URL('/api/mandi/prices', baseUrl);
      if (state !== 'All States') url.searchParams.append('state', state);
      if (type !== 'All Crops') url.searchParams.append('type', type);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      pricesCache = data.data;
      statsCache = data.stats;
      lastUpdated = new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return true;
    } catch (err) {
      console.error('Failed to fetch prices:', err);
      return false;
    }
  }

  function renderStateButtons() {
    const container = document.getElementById('state-filters');
    if (!container) return;
    
    // States match the ones available in the backend response
    const states = ['All States', 'Andhra Pradesh', 'Gujarat', 'Haryana', 'Karnataka', 'MP', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'UP', 'West Bengal'];
    
    container.innerHTML = states.map(state => `
      <button class="state-filter-btn ${state === currentStateFilter ? 'active' : ''}" data-state="${state}">
        ${state}
      </button>
    `).join('');

    container.querySelectorAll('.state-filter-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        container.querySelectorAll('.state-filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentStateFilter = e.target.getAttribute('data-state');
        
        await reloadData();
      });
    });
  }

  function bindCropTypeFilters() {
    const container = document.getElementById('crop-type-filters');
    if (!container) return;

    container.querySelectorAll('.crop-type-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        container.querySelectorAll('.crop-type-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTypeFilter = e.currentTarget.getAttribute('data-type') || 'All Crops';
        
        await reloadData();
      });
    });
  }

  function updateSummaryStats() {
    const elTracked = document.getElementById('stat-total-crops');
    const elMandis = document.getElementById('stat-total-mandis');
    const elGainers = document.getElementById('stat-gainers');
    const elLosers = document.getElementById('stat-losers');

    if (elTracked) elTracked.textContent = statsCache.total;
    if (elMandis) elMandis.textContent = statsCache.mandis;
    if (elGainers) elGainers.textContent = statsCache.up;
    if (elLosers) elLosers.textContent = statsCache.down;
  }

  function getSortedPrices(searchQuery = '') {
    let list = [...pricesCache];

    if (searchQuery) {
      list = list.filter(p => 
        p.crop.toLowerCase().includes(searchQuery) || 
        p.city.toLowerCase().includes(searchQuery)
      );
    }

    if (sortMode === 'Name A→Z' || sortMode === 'name-asc') {
      list.sort((a, b) => a.crop.localeCompare(b.crop));
    } else if (sortMode === 'Name Z→A' || sortMode === 'name-desc') {
      list.sort((a, b) => b.crop.localeCompare(a.crop));
    } else if (sortMode === 'Price High→Low' || sortMode === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'Price Low→High' || sortMode === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'Highest Change' || sortMode === 'change-high') {
      list.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    } else if (sortMode === 'change-low') {
      list.sort((a, b) => Math.abs(a.change) - Math.abs(b.change));
    }

    return list;
  }

  function renderCards(animate = false) {
    const container = document.getElementById('price-cards');
    if (!container) return;

    // Make sure container has the correct class for grid layout
    if (!container.classList.contains('mandi-grid')) {
        container.className = 'mandi-grid';
    }

    const searchInput = document.getElementById('mandi-search');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const list = getSortedPrices(query);

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: hsl(var(--card)); border-radius: 12px; border: 1px solid hsl(var(--border));">
          <i data-lucide="search-x" style="width: 48px; height: 48px; color: hsl(var(--muted-foreground)); margin: 0 auto 16px;"></i>
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No crops found</h3>
          <p style="color: hsl(var(--muted-foreground));">Try adjusting your search or filters.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    container.innerHTML = list.map((item, index) => {
      const isUp = item.isUp;
      const trendClass = isUp ? 'trend-up' : 'trend-down';
      const mspClass = isUp ? 'msp-above' : 'msp-below';
      const mspHtml = isUp 
        ? `<div class="msp-badge ${mspClass}">
            <i data-lucide="check" style="width:12px;height:12px;"></i> MSP ₹${Math.round(item.price * 0.9)} · Above MSP
           </div>`
        : `<div class="msp-badge ${mspClass}">
            <i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> MSP ₹${Math.round(item.price * 1.1)} · Below MSP
           </div>`;

      // Assign an emoji based on crop
      let emoji = '🌾';
      if (['Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar'].includes(item.crop)) emoji = '🌽';
      if (['Chana', 'Tur', 'Moong', 'Urad', 'Masoor'].includes(item.crop)) emoji = '🫘';
      if (['Soybean', 'Mustard', 'Groundnut', 'Sunflower', 'Castor Seed'].includes(item.crop)) emoji = '🥜';
      if (['Cotton', 'Sugarcane', 'Jute', 'Tobacco'].includes(item.crop)) emoji = '🪴';
      if (['Turmeric', 'Cumin', 'Coriander', 'Chilli', 'Garlic'].includes(item.crop)) emoji = '🌶️';
      if (['Onion', 'Potato', 'Tomato', 'Cabbage', 'Cauliflower'].includes(item.crop)) emoji = '🧅';

      return `
        <div class="card price-card ${animate ? 'animate-fade-in' : ''}" style="${animate ? `animation-delay: ${index * 0.02}s` : ''}">
          <div class="card-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: hsl(var(--primary)/0.1); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                  ${emoji}
                </div>
                <div>
                  <h3 style="font-weight: 600; font-size: 1.1rem; line-height: 1.2;">${item.crop}</h3>
                  <span style="font-size: 0.8rem; color: hsl(var(--muted-foreground));">${item.category}</span>
                </div>
              </div>
              <div class="trend-badge ${trendClass}">
                <i data-lucide="${isUp ? 'trending-up' : 'trending-down'}" style="width:12px;height:12px;"></i>
                ${isUp ? '+' : ''}${item.change}%
              </div>
            </div>
            
            <div style="margin-bottom: 16px;">
              <div style="font-size: 2rem; font-weight: 700; font-family: var(--font-heading); margin-bottom: 4px;">
                ₹${item.price.toLocaleString('en-IN')}<span style="font-size: 1rem; color: hsl(var(--muted-foreground)); font-weight: 400;">/qtl</span>
              </div>
              <div style="font-size: 0.85rem; color: hsl(var(--muted-foreground));">
                Range: ₹${Math.round(item.price * 0.98).toLocaleString('en-IN')} - ₹${Math.round(item.price * 1.02).toLocaleString('en-IN')}
              </div>
            </div>

            <div style="margin-bottom: 16px;">${mspHtml}</div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); font-size: 0.85rem;">
              <div class="mandi-location">
                <i data-lucide="map-pin" style="width:14px;height:14px;"></i>
                ${item.city}, ${item.state}
              </div>
              <div class="arrival-info">
                <i data-lucide="truck" style="width:14px;height:14px;"></i>
                ${item.volume} tonnes
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function updateTimestamp() {
    const el = document.getElementById('last-updated-time');
    if (el) el.textContent = `Last updated: ${lastUpdated}`;
  }

  function startCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
      nextRefreshSeconds--;
      if (nextRefreshSeconds <= 0) {
        nextRefreshSeconds = 300; // Reset
        reloadData(true); // Auto-refresh data
      }
      const m = Math.floor(nextRefreshSeconds / 60);
      const s = nextRefreshSeconds % 60;
      el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  async function reloadData(isAutoRefresh = false) {
    const success = await fetchPrices(currentStateFilter, currentTypeFilter);
    if (!success) return;
    
    updateSummaryStats();
    updateTimestamp();
    renderCards(!isAutoRefresh); // animate on manual load, flash on auto
    
    if (isAutoRefresh) {
      document.querySelectorAll('.price-card').forEach(card => {
        card.classList.add('price-updating');
        setTimeout(() => card.classList.remove('price-updating'), 700);
      });
    }
  }

  async function refreshPrices() {
    const btn = document.getElementById('refresh-btn');
    if (btn) {
      const icon = btn.querySelector('i');
      if (icon) icon.classList.add('spinner');
      btn.disabled = true;
    }

    nextRefreshSeconds = 300;
    await reloadData(true);

    setTimeout(() => {
      if (btn) {
        const icon = btn.querySelector('i');
        if (icon) icon.classList.remove('spinner');
        btn.disabled = false;
      }
    }, 500);
  }

  // ===================== INIT =====================

  async function initMandiEngine() {
    await reloadData(true);
    renderStateButtons();
    bindCropTypeFilters();
    startCountdown();

    // Search
    const searchInput = document.getElementById('mandi-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => renderCards(false));
    }

    // Sort
    const sortDropdown = document.getElementById('sort-dropdown');
    if (sortDropdown) {
      sortDropdown.addEventListener('change', () => {
        sortMode = sortDropdown.value;
        renderCards(false);
      });
    }

    // Manual refresh
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', refreshPrices);
    }
  }

  // Wait for DOM ready (may already be loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMandiEngine);
  } else {
    initMandiEngine();
  }

})();
