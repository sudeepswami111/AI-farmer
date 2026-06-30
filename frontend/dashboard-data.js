/* ============================================================
   KisanMitra - Dashboard Live Data Engine
   Loads live weather (user location) + dynamic mandi prices
   ============================================================ */
(function () {
  'use strict';

  // ── Time-based greeting ──
  function setGreeting() {
    const h = new Date().getHours();
    let greet = 'Good Morning';
    if (h >= 12 && h < 17) greet = 'Good Afternoon';
    else if (h >= 17 && h < 21) greet = 'Good Evening';
    else if (h >= 21) greet = 'Good Night';
    const user = JSON.parse(localStorage.getItem('kisanmitra_user') || 'null');
    const name = user ? user.name : 'Farmer';
    const el = document.getElementById('dash-greeting');
    if (el) el.textContent = greet + ', ' + name + '! \ud83c\udf3e';
  }

  // ── WMO code helper ──
  function weatherDesc(code) {
    const m = {0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',
      45:'Foggy',48:'Rime Fog',51:'Light Drizzle',53:'Drizzle',55:'Dense Drizzle',
      61:'Slight Rain',63:'Moderate Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',
      75:'Heavy Snow',80:'Rain Showers',81:'Moderate Showers',82:'Violent Showers',
      95:'Thunderstorm',96:'Thunderstorm + Hail',99:'Severe Thunderstorm'};
    return m[code] || 'Unknown';
  }
  function weatherIcon(code) {
    if ([0,1].includes(code)) return 'sun';
    if (code === 2) return 'cloud-sun';
    if (code === 3) return 'cloud';
    if ([45,48].includes(code)) return 'cloud-fog';
    if ([51,53,55].includes(code)) return 'cloud-drizzle';
    if ([61,63,65,80,81,82].includes(code)) return 'cloud-rain';
    if ([71,73,75].includes(code)) return 'snowflake';
    if ([95,96,99].includes(code)) return 'cloud-lightning';
    return 'cloud';
  }

  // ── Dashboard Weather Widget ──
  async function loadDashWeather() {
    let lat = 28.6139, lon = 77.2090, city = 'New Delhi, India';

    // Check localStorage cache first — avoid repeated permission prompts
    const cached = localStorage.getItem('kisanmitra_location');
    if (cached) {
      try {
        const loc = JSON.parse(cached);
        lat = loc.lat; lon = loc.lon; city = loc.city;
      } catch (_) {}
    } else {
      // First time: ask for GPS permission
      try {
        const pos = await new Promise((res, rej) => {
          if (!navigator.geolocation) return rej('no-geo');
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`);
          if (r.ok) {
            const d = await r.json();
            const a = d.address || {};
            city = (a.city || a.town || a.village || a.state_district || 'Your Area');
            if (a.state) city += ', ' + a.state;
          }
        } catch (_) { city = `${lat.toFixed(2)}\u00b0N, ${lon.toFixed(2)}\u00b0E`; }
        // Save to cache
        localStorage.setItem('kisanmitra_location', JSON.stringify({ lat, lon, city }));
      } catch (_) { /* default Delhi */ }
    }

    const locEl = document.getElementById('dash-weather-loc');
    if (locEl) locEl.textContent = city;

    try {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=precipitation_probability_max,temperature_2m_max&timezone=auto&forecast_days=3`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const c = data.current;
      const d = data.daily;

      const el = id => document.getElementById(id);
      if (el('dash-weather-temp')) el('dash-weather-temp').textContent = Math.round(c.temperature_2m) + '\u00b0C';
      if (el('dash-weather-humidity')) el('dash-weather-humidity').textContent = c.relative_humidity_2m + '%';
      if (el('dash-weather-wind')) el('dash-weather-wind').textContent = Math.round(c.wind_speed_10m) + ' km/h';
      if (el('dash-weather-loc')) el('dash-weather-loc').textContent = weatherDesc(c.weather_code) + ' \u00b7 ' + city;

      const iconEl = el('dash-weather-icon');
      if (iconEl) {
        iconEl.setAttribute('data-lucide', weatherIcon(c.weather_code));
        iconEl.classList.remove('spinner');
      }

      // Smart alert
      const alertEl = el('dash-weather-alert');
      if (alertEl) {
        let alertIcon = 'check-circle', alertColor = 'hsl(var(--success))',
            alertMsg = 'Weather looks good for farming today.';

        if (d.precipitation_probability_max) {
          for (let i = 0; i < Math.min(2, d.precipitation_probability_max.length); i++) {
            if (d.precipitation_probability_max[i] >= 60) {
              const day = i === 0 ? 'today' : 'tomorrow';
              alertIcon = 'alert-triangle'; alertColor = 'hsl(var(--warning))';
              alertMsg = `${d.precipitation_probability_max[i]}% rain chance ${day} \u2013 Consider harvesting and securing crops.`;
              break;
            }
          }
        }
        if (d.temperature_2m_max && d.temperature_2m_max[0] >= 40) {
          alertIcon = 'thermometer'; alertColor = 'hsl(var(--destructive))';
          alertMsg = `Heatwave: ${Math.round(d.temperature_2m_max[0])}\u00b0C expected. Ensure adequate irrigation.`;
        }
        if (c.wind_speed_10m >= 30) {
          alertIcon = 'wind'; alertColor = 'hsl(var(--primary))';
          alertMsg = `Strong winds (${Math.round(c.wind_speed_10m)} km/h). Protect tall crops and delay spraying.`;
        }

        alertEl.innerHTML = `
          <i data-lucide="${alertIcon}" class="icon-md" style="color:${alertColor};flex-shrink:0;margin-top:2px;"></i>
          <p>${alertMsg}</p>`;
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error('Dashboard weather failed:', err);
      const locEl2 = document.getElementById('dash-weather-loc');
      if (locEl2) locEl2.textContent = 'Unable to load weather';
    }
  }

  // ── Dashboard Mandi Prices (reuse mandi-data logic) ──
  function loadDashPrices() {
    // Lightweight crop data for dashboard (top 6 commodities)
    const crops = [
      { crop: 'Wheat', emoji: '🌾', base: 2650, spread: 5 },
      { crop: 'Rice', emoji: '🍚', base: 4200, spread: 6 },
      { crop: 'Cotton', emoji: '☁️', base: 7100, spread: 4 },
      { crop: 'Soybean', emoji: '🫛', base: 4600, spread: 5 },
      { crop: 'Chana', emoji: '🫘', base: 5800, spread: 4 },
      { crop: 'Mustard', emoji: '🌼', base: 5400, spread: 4 },
    ];

    function seededRand(seed) { let x = Math.sin(seed) * 10000; return x - Math.floor(x); }
    function hash(s) { let h=0; for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;} return Math.abs(h); }

    const now = new Date();
    const seed = now.getFullYear()*10000 + (now.getMonth()+1)*100 + now.getDate();
    const sessionSeed = seed * 10000 + now.getHours()*100 + Math.floor(now.getMinutes()/5);

    const container = document.getElementById('dash-price-list');
    const timeEl = document.getElementById('dash-prices-time');
    if (!container) return;

    if (timeEl) timeEl.textContent = 'Updated ' + now.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit',hour12:true});

    let html = '';
    crops.forEach(item => {
      const s = sessionSeed + hash(item.crop);
      const r = seededRand(s);
      const dir = seededRand(s+1) > 0.5 ? 1 : -1;
      const price = Math.round(item.base + dir * r * (item.spread/100) * item.base);

      const ys = (seed - 10000) + hash(item.crop);
      const yr = seededRand(ys);
      const yd = seededRand(ys+1) > 0.5 ? 1 : -1;
      const yPrice = Math.round(item.base + yd * yr * (item.spread/100) * item.base);
      const change = ((price - yPrice) / yPrice * 100);

      const isUp = change > 0;
      const changeStr = (isUp ? '+' : '') + change.toFixed(1) + '%';
      const icon = isUp ? 'trending-up' : 'trending-down';
      const cls = isUp ? 'up' : 'down';

      html += `
        <div class="price-item">
          <span style="font-weight:500;">${item.emoji} ${item.crop}</span>
          <div class="text-right">
            <div style="font-weight:700;">\u20b9${price.toLocaleString('en-IN')}</div>
            <div class="price-change ${cls}">
              <i data-lucide="${icon}" style="width:12px;height:12px;"></i> ${changeStr}
            </div>
          </div>
        </div>`;
    });
    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Init ──
  function init() {
    setGreeting();
    loadDashWeather();
    loadDashPrices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
