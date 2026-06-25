/* ============================================================
   KisanMitra - Enhanced Weather Engine
   Location-aware weather with city search, hourly forecast,
   dynamic alerts & smart farming tips
   ============================================================ */
(function () {
  'use strict';

  let currentLat = 28.6139, currentLon = 77.2090, currentCity = 'New Delhi, India';
  let searchTimeout = null;

  // ── WMO Weather Code Map ──
  function getWeatherInfo(code) {
    const m = {
      0:{d:'Clear Sky',i:'sun',c:'hsl(var(--accent))'},
      1:{d:'Mainly Clear',i:'sun',c:'hsl(var(--accent))'},
      2:{d:'Partly Cloudy',i:'cloud-sun',c:'hsl(var(--accent))'},
      3:{d:'Overcast',i:'cloud',c:'hsl(var(--muted-foreground))'},
      45:{d:'Foggy',i:'cloud-fog',c:'hsl(var(--muted-foreground))'},
      48:{d:'Rime Fog',i:'cloud-fog',c:'hsl(var(--muted-foreground))'},
      51:{d:'Light Drizzle',i:'cloud-drizzle',c:'hsl(var(--primary))'},
      53:{d:'Moderate Drizzle',i:'cloud-drizzle',c:'hsl(var(--primary))'},
      55:{d:'Dense Drizzle',i:'cloud-drizzle',c:'hsl(var(--primary))'},
      61:{d:'Slight Rain',i:'cloud-rain',c:'hsl(var(--primary))'},
      63:{d:'Moderate Rain',i:'cloud-rain',c:'hsl(var(--primary))'},
      65:{d:'Heavy Rain',i:'cloud-rain',c:'hsl(var(--destructive))'},
      71:{d:'Slight Snow',i:'snowflake',c:'hsl(var(--primary))'},
      73:{d:'Moderate Snow',i:'snowflake',c:'hsl(var(--primary))'},
      75:{d:'Heavy Snow',i:'snowflake',c:'hsl(var(--destructive))'},
      80:{d:'Rain Showers',i:'cloud-rain',c:'hsl(var(--primary))'},
      81:{d:'Moderate Showers',i:'cloud-rain',c:'hsl(var(--primary))'},
      82:{d:'Violent Showers',i:'cloud-rain',c:'hsl(var(--destructive))'},
      95:{d:'Thunderstorm',i:'cloud-lightning',c:'hsl(var(--destructive))'},
      96:{d:'Thunderstorm + Hail',i:'cloud-lightning',c:'hsl(var(--destructive))'},
      99:{d:'Thunderstorm + Heavy Hail',i:'cloud-lightning',c:'hsl(var(--destructive))'}
    };
    const e = m[code] || {d:'Unknown',i:'cloud',c:'hsl(var(--muted-foreground))'};
    return { desc: e.d, icon: e.i, color: e.c };
  }

  function getUVLabel(uv) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  }

  // ── Location Detection (with localStorage cache) ──
  async function detectUserLocation(forceRefresh) {
    const btn = document.getElementById('detect-location-btn');

    // Use cached location if available and not forcing refresh
    if (!forceRefresh) {
      const cached = localStorage.getItem('kisanmitra_location');
      if (cached) {
        try {
          const loc = JSON.parse(cached);
          currentLat = loc.lat; currentLon = loc.lon; currentCity = loc.city;
          updateLocationBadge();
          await loadWeatherData();
          return;
        } catch (_) {}
      }
    }

    // Ask GPS (first time or manual refresh)
    if (btn) btn.classList.add('detecting');
    try {
      const pos = await new Promise((res, rej) => {
        if (!navigator.geolocation) return rej('no-geo');
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 });
      });
      currentLat = pos.coords.latitude;
      currentLon = pos.coords.longitude;
      await reverseGeocode(currentLat, currentLon);
      // Save to cache
      localStorage.setItem('kisanmitra_location', JSON.stringify({ lat: currentLat, lon: currentLon, city: currentCity }));
    } catch (e) {
      console.warn('Geolocation failed, using default Delhi:', e);
      currentCity = 'New Delhi, India';
    }
    if (btn) btn.classList.remove('detecting');
    updateLocationBadge();
    await loadWeatherData();
  }

  async function reverseGeocode(lat, lon) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`);
      if (r.ok) {
        const d = await r.json();
        const a = d.address || {};
        const city = a.city || a.town || a.village || a.county || a.state_district || 'Unknown';
        const state = a.state || '';
        const country = a.country || '';
        currentCity = city + (state ? ', ' + state : '') + (country ? ', ' + country : '');
      }
    } catch (e) {
      currentCity = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
    }
  }

  // ── City Search (Open-Meteo Geocoding) ──
  function initCitySearch() {
    const input = document.getElementById('city-search-input');
    const dropdown = document.getElementById('city-suggestions');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = input.value.trim();
      if (q.length < 2) { dropdown.classList.remove('visible'); return; }
      searchTimeout = setTimeout(() => searchCities(q), 350);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('visible'), 200);
    });
  }

  async function searchCities(query) {
    const dropdown = document.getElementById('city-suggestions');
    if (!dropdown) return;
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
      const d = await r.json();
      if (!d.results || d.results.length === 0) {
        dropdown.innerHTML = '<div style="padding:12px;color:hsl(var(--muted-foreground));font-size:0.85rem;">No results found</div>';
        dropdown.classList.add('visible');
        return;
      }
      dropdown.innerHTML = d.results.map(c => `
        <div class="city-suggestion-item" data-lat="${c.latitude}" data-lon="${c.longitude}" data-name="${c.name}, ${c.admin1 || ''}, ${c.country || ''}">
          <i data-lucide="map-pin" style="width:14px;height:14px;color:hsl(var(--muted-foreground));flex-shrink:0;"></i>
          <div>
            <div class="city-name">${c.name}</div>
            <div class="city-region">${[c.admin1, c.country].filter(Boolean).join(', ')}</div>
          </div>
        </div>`).join('');
      dropdown.classList.add('visible');
      if (typeof lucide !== 'undefined') lucide.createIcons();

      dropdown.querySelectorAll('.city-suggestion-item').forEach(item => {
        item.addEventListener('mousedown', async (e) => {
          e.preventDefault();
          currentLat = parseFloat(item.dataset.lat);
          currentLon = parseFloat(item.dataset.lon);
          currentCity = item.dataset.name.replace(/, $/,'');
          // Save searched city to cache
          localStorage.setItem('kisanmitra_location', JSON.stringify({ lat: currentLat, lon: currentLon, city: currentCity }));
          const input = document.getElementById('city-search-input');
          if (input) input.value = '';
          dropdown.classList.remove('visible');
          updateLocationBadge();
          await loadWeatherData();
        });
      });
    } catch (e) {
      console.error('City search failed:', e);
    }
  }

  function updateLocationBadge() {
    const badge = document.getElementById('location-badge');
    const text = document.getElementById('location-badge-text');
    const coords = document.getElementById('location-coords');
    const locEl = document.getElementById('weather-location');
    if (badge) badge.style.display = 'inline-flex';
    if (text) text.textContent = currentCity;
    if (coords) coords.textContent = `(${currentLat.toFixed(4)}°, ${currentLon.toFixed(4)}°)`;
    if (locEl) locEl.textContent = currentCity;
  }

  // ── Fetch & Render Weather ──
  async function loadWeatherData() {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,precipitation_sum` +
      `&timezone=auto&forecast_days=7`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('API error ' + res.status);
      const data = await res.json();
      renderCurrentWeather(data.current, data.daily);
      renderHourlyForecast(data.hourly);
      render7DayForecast(data.daily);
      renderAlerts(data.current, data.daily);
      renderFarmingTips(data.current, data.daily);
    } catch (err) {
      console.error('Weather fetch failed:', err);
      const desc = document.getElementById('weather-desc');
      if (desc) desc.textContent = 'Unable to load weather data. Please try again.';
    }
  }

  function renderCurrentWeather(current, daily) {
    const el = id => document.getElementById(id);
    const info = getWeatherInfo(current.weather_code);

    if (el('weather-temp')) el('weather-temp').textContent = Math.round(current.temperature_2m) + '°C';
    if (el('weather-desc')) el('weather-desc').textContent = info.desc;
    if (el('weather-feels')) el('weather-feels').textContent = 'Feels like ' + Math.round(current.apparent_temperature) + '°C';
    if (el('weather-humidity')) el('weather-humidity').textContent = current.relative_humidity_2m + '%';
    if (el('weather-wind')) el('weather-wind').textContent = Math.round(current.wind_speed_10m) + ' km/h';
    if (el('weather-rain') && daily.precipitation_probability_max) el('weather-rain').textContent = daily.precipitation_probability_max[0] + '%';
    if (el('weather-uv') && daily.uv_index_max) {
      const uv = daily.uv_index_max[0];
      el('weather-uv').textContent = uv.toFixed(1) + ' (' + getUVLabel(uv) + ')';
    }
    if (el('weather-main-icon')) {
      el('weather-main-icon').setAttribute('data-lucide', info.icon);
    }
    if (el('weather-updated-time')) {
      el('weather-updated-time').textContent = 'Updated: ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function renderHourlyForecast(hourly) {
    const strip = document.getElementById('hourly-strip');
    if (!strip || !hourly) return;
    const nowHour = new Date().getHours();
    let html = '';
    for (let i = nowHour; i < Math.min(nowHour + 12, hourly.time.length); i++) {
      const t = new Date(hourly.time[i]);
      const label = i === nowHour ? 'Now' : t.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });
      const info = getWeatherInfo(hourly.weather_code[i]);
      const temp = Math.round(hourly.temperature_2m[i]);
      const rain = hourly.precipitation_probability ? hourly.precipitation_probability[i] : null;
      html += `<div class="hourly-item">
        <span>${label}</span>
        <i data-lucide="${info.icon}" style="width:20px;height:20px;color:${info.color};"></i>
        <span class="hour-temp">${temp}°</span>
        ${rain !== null ? `<span style="font-size:0.7rem;"><i data-lucide="droplets" style="width:8px;height:8px;"></i> ${rain}%</span>` : ''}
      </div>`;
    }
    strip.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function render7DayForecast(daily) {
    const grid = document.getElementById('forecast-grid');
    if (!grid || !daily) return;
    grid.innerHTML = '';
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let i = 0; i < daily.time.length && i < 7; i++) {
      const date = new Date(daily.time[i] + 'T00:00:00');
      const label = i === 0 ? 'Today' : dayNames[date.getDay()];
      const info = getWeatherInfo(daily.weather_code[i]);
      const hi = Math.round(daily.temperature_2m_max[i]);
      const lo = Math.round(daily.temperature_2m_min[i]);
      const rain = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : '--';
      grid.innerHTML += `<div class="forecast-day">
        <div class="day-name">${label}</div>
        <i data-lucide="${info.icon}" style="width:28px;height:28px;color:${info.color};margin:0 auto;"></i>
        <div class="temps"><span class="high">${hi}°</span> / <span class="low">${lo}°</span></div>
        <div class="rain-chance"><i data-lucide="droplets" style="width:10px;height:10px;"></i> ${rain}%</div>
      </div>`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Dynamic Alerts ──
  function renderAlerts(current, daily) {
    const container = document.getElementById('alerts-container');
    if (!container) return;
    const alerts = [];
    const ts = 'Updated just now';

    if (daily.precipitation_probability_max) {
      for (let i = 0; i < Math.min(3, daily.precipitation_probability_max.length); i++) {
        if (daily.precipitation_probability_max[i] >= 60) {
          const dl = i===0?'today':(i===1?'tomorrow': new Date(daily.time[i]+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long'}));
          alerts.push({type:'warning',icon:'alert-triangle',ic:'hsl(var(--warning))',title:'Rain Alert',
            text:`${daily.precipitation_probability_max[i]}% chance of rain ${dl}. Prepare drainage and protect crops.`,time:ts});
          break;
        }
      }
    }
    if (current.wind_speed_10m >= 30) {
      alerts.push({type:'info',icon:'wind',ic:'hsl(var(--primary))',title:'Strong Wind Advisory',
        text:`Wind speed ${Math.round(current.wind_speed_10m)} km/h. Protect tall crops and structures.`,time:ts});
    }
    if (daily.uv_index_max && daily.uv_index_max[0] >= 8) {
      alerts.push({type:'info',icon:'sun',ic:'hsl(var(--warning))',title:'High UV Alert',
        text:`UV Index ${daily.uv_index_max[0].toFixed(1)} (${getUVLabel(daily.uv_index_max[0])}). Avoid outdoor work 11AM-3PM.`,time:ts});
    }
    if (daily.temperature_2m_max && daily.temperature_2m_max[0] >= 40) {
      alerts.push({type:'warning',icon:'thermometer',ic:'hsl(var(--destructive))',title:'Heatwave Warning',
        text:`Temperature may reach ${Math.round(daily.temperature_2m_max[0])}°C. Ensure water for crops & livestock.`,time:ts});
    }
    if (current.temperature_2m <= 5) {
      alerts.push({type:'warning',icon:'snowflake',ic:'hsl(var(--primary))',title:'Frost Warning',
        text:`Temperature is ${Math.round(current.temperature_2m)}°C. Cover sensitive crops to prevent frost damage.`,time:ts});
    }
    if (alerts.length === 0) {
      alerts.push({type:'info',icon:'check-circle',ic:'hsl(var(--success))',title:'All Clear',
        text:'No severe weather alerts. Good conditions for farming.',time:ts});
    }

    container.innerHTML = alerts.map(a => `
      <div class="alert-card alert-${a.type}">
        <div class="alert-inner">
          <i data-lucide="${a.icon}" class="icon-md" style="color:${a.ic};flex-shrink:0;margin-top:2px;"></i>
          <div><h4>${a.title}</h4><p>${a.text}</p><div class="alert-time">${a.time}</div></div>
        </div>
      </div>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Smart Farming Tips (weather-driven) ──
  function renderFarmingTips(current, daily) {
    const container = document.getElementById('farming-tips-container');
    if (!container) return;
    const tips = [];
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const wind = current.wind_speed_10m;
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
    const uv = daily.uv_index_max ? daily.uv_index_max[0] : 0;

    if (rainProb >= 60) {
      tips.push({icon:'cloud-rain',color:'blue',text:'Heavy rain expected. Harvest ripe crops beforehand and clear drainage channels to prevent waterlogging.'});
      tips.push({icon:'shield',color:'green',text:'Delay fertilizer and pesticide application until after the rain to avoid wash-off.'});
    }
    if (temp >= 38) {
      tips.push({icon:'thermometer',color:'red',text:`Temperature is ${Math.round(temp)}°C. Apply mulching to retain soil moisture and irrigate during early morning or late evening.`});
    }
    if (temp <= 10) {
      tips.push({icon:'snowflake',color:'blue',text:`Cold conditions at ${Math.round(temp)}°C. Cover nursery beds with polythene sheets and use smoke to protect against frost.`});
    }
    if (humidity >= 80) {
      tips.push({icon:'droplets',color:'blue',text:`Humidity is ${humidity}%. Monitor crops for fungal diseases like blight and mildew. Apply preventive fungicide if needed.`});
    }
    if (wind >= 25) {
      tips.push({icon:'wind',color:'orange',text:`Strong winds at ${Math.round(wind)} km/h. Stake tall plants (banana, sugarcane) and delay spraying operations.`});
    }
    if (uv >= 8) {
      tips.push({icon:'sun',color:'orange',text:`UV Index is very high (${uv.toFixed(1)}). Use shade nets for sensitive crops and avoid prolonged field work between 11AM-3PM.`});
    }
    if (rainProb < 20 && temp >= 25 && temp < 38) {
      tips.push({icon:'sprout',color:'green',text:'Clear and warm weather — ideal for sowing, transplanting, and applying organic manure.'});
    }
    if (tips.length === 0) {
      tips.push({icon:'check-circle',color:'green',text:'Weather conditions are favorable for most farming activities. Continue with regular crop management.'});
    }
    // Always add a general tip
    tips.push({icon:'calendar',color:'blue',text:`Today's forecast: High ${Math.round(daily.temperature_2m_max[0])}°C / Low ${Math.round(daily.temperature_2m_min[0])}°C. Plan field work accordingly.`});

    container.innerHTML = tips.map(t => `
      <div class="dynamic-tip-item">
        <div class="tip-icon-box ${t.color}"><i data-lucide="${t.icon}" style="width:16px;height:16px;"></i></div>
        <div class="tip-text">${t.text}</div>
      </div>`).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Init ──
  async function init() {
    initCitySearch();
    const detectBtn = document.getElementById('detect-location-btn');
    if (detectBtn) detectBtn.addEventListener('click', () => detectUserLocation(true));
    // Load from cache or detect on first visit
    await detectUserLocation(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
