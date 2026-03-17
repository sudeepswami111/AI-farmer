/* ============================================
   KisanMitra - Static Site JavaScript
   Handles: Navigation, Ask, Upload, Mandi, Weather
   ============================================ */

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  initNavigation();
  initCurrentPage();
});

/* =================== Navigation =================== */
function initNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      // Swap icon
      const icon = menuBtn.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
        lucide.createIcons();
      }
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const icon = menuBtn.querySelector('[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide', 'menu');
          lucide.createIcons();
        }
      });
    });
  }

  // Mark active nav link
  highlightActiveNav();
}

function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === currentPage);
  });
}

/* =================== Page Router =================== */
function initCurrentPage() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  switch (page) {
    case 'ask.html':
      initAskPage();
      break;
    case 'upload.html':
      initUploadPage();
      break;
    case 'mandi.html':
      initMandiPage();
      break;
    case 'weather.html':
      initWeatherPage();
      break;
  }
}

/* =================== Ask Question Page =================== */
function initAskPage() {
  const textarea = document.getElementById('question-input');
  const sendBtn = document.getElementById('send-btn');
  const micBtn = document.getElementById('mic-btn');
  const suggestedContainer = document.getElementById('suggested-questions');
  const answerContainer = document.getElementById('answer-container');
  const sendBtnText = document.getElementById('send-btn-text');
  const sendBtnIcon = document.getElementById('send-btn-icon');

  if (!textarea || !sendBtn) return;

  let isListening = false;

  // Update send button state
  function updateSendBtn() {
    sendBtn.disabled = !textarea.value.trim();
  }

  textarea.addEventListener('input', updateSendBtn);

  // Suggested question chips
  if (suggestedContainer) {
    suggestedContainer.querySelectorAll('.question-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        textarea.value = chip.textContent;
        updateSendBtn();
      });
    });
  }

  // Mic button with Web Speech API
  if (micBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        const indicator = document.getElementById('listening-indicator');
        if (indicator) indicator.style.display = 'flex';
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        // Set the value of textarea to the transcript
        textarea.value = transcript;
        updateSendBtn();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };
    } else {
      console.warn('Speech recognition is not supported in this browser.');
    }

    function stopListening() {
      isListening = false;
      micBtn.classList.remove('listening');
      const indicator = document.getElementById('listening-indicator');
      if (indicator) indicator.style.display = 'none';
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    }

    micBtn.addEventListener('click', () => {
      if (isListening) {
        stopListening();
      } else {
        if (recognition) {
          try {
            // Clear text when starting a new session to ensure fresh start
            textarea.value = ''; 
            updateSendBtn();
            recognition.start();
          } catch (e) {
            console.error('Failed to start speech recognition', e);
          }
        } else {
          alert('Microphone/Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Safari.');
        }
      }
    });
  }

  // Send / Get Answer
  sendBtn.addEventListener('click', async () => {
    if (!textarea.value.trim()) return;

    sendBtn.disabled = true;
    if (sendBtnIcon) {
      sendBtnIcon.setAttribute('data-lucide', 'loader-2');
      sendBtnIcon.classList.add('spinner');
      lucide.createIcons();
    }
    if (sendBtnText) sendBtnText.textContent = 'Thinking...';

    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));

    // Show answer
    if (answerContainer) {
      answerContainer.style.display = 'block';
      answerContainer.classList.add('animate-fade-in');
    }
    if (suggestedContainer) suggestedContainer.style.display = 'none';

    // Reset button
    if (sendBtnIcon) {
      sendBtnIcon.setAttribute('data-lucide', 'send');
      sendBtnIcon.classList.remove('spinner');
      lucide.createIcons();
    }
    if (sendBtnText) sendBtnText.textContent = 'Get Answer';
    sendBtn.disabled = false;
  });
}

/* =================== Upload Crop Page =================== */
function initUploadPage() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const previewContainer = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeBtn = document.getElementById('remove-image');
  const analyzeSection = document.getElementById('analyze-section');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultsSection = document.getElementById('results-section');
  const analyzeBtnText = document.getElementById('analyze-btn-text');
  const analyzeBtnIcon = document.getElementById('analyze-btn-icon');

  if (!uploadZone || !fileInput) return;

  uploadZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (previewImg) previewImg.src = reader.result;
      if (previewContainer) previewContainer.style.display = 'block';
      if (uploadZone) uploadZone.style.display = 'none';
      if (analyzeSection) analyzeSection.style.display = 'block';
      if (resultsSection) resultsSection.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      resetUpload();
    });
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      analyzeBtn.disabled = true;
      if (analyzeBtnIcon) {
        analyzeBtnIcon.setAttribute('data-lucide', 'loader-2');
        analyzeBtnIcon.classList.add('spinner');
        lucide.createIcons();
      }
      if (analyzeBtnText) analyzeBtnText.textContent = 'Analyzing Image...';

      await new Promise(r => setTimeout(r, 3000));

      if (analyzeSection) analyzeSection.style.display = 'none';
      if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.classList.add('animate-fade-in');
      }

      // Reset button state
      analyzeBtn.disabled = false;
      if (analyzeBtnIcon) {
        analyzeBtnIcon.setAttribute('data-lucide', 'camera');
        analyzeBtnIcon.classList.remove('spinner');
        lucide.createIcons();
      }
      if (analyzeBtnText) analyzeBtnText.textContent = 'Analyze Crop';
    });
  }

  // Scan Another button
  const scanAnotherBtn = document.getElementById('scan-another');
  if (scanAnotherBtn) {
    scanAnotherBtn.addEventListener('click', resetUpload);
  }

  function resetUpload() {
    if (previewContainer) previewContainer.style.display = 'none';
    if (uploadZone) uploadZone.style.display = 'block';
    if (analyzeSection) analyzeSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';
    fileInput.value = '';
  }
}

/* =================== Mandi Prices Page =================== */
function initMandiPage() {
  const searchInput = document.getElementById('mandi-search');
  const filterContainer = document.getElementById('state-filters');
  const cardsContainer = document.getElementById('price-cards');
  const noResults = document.getElementById('no-results');

  if (!searchInput || !cardsContainer) return;

  let selectedState = 'all';

  // State filter buttons
  if (filterContainer) {
    filterContainer.querySelectorAll('.state-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterContainer.querySelectorAll('.state-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedState = btn.dataset.state;
        filterCards();
      });
    });
  }

  // Search
  searchInput.addEventListener('input', filterCards);

  function filterCards() {
    const query = searchInput.value.toLowerCase();
    const cards = cardsContainer.querySelectorAll('.price-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const crop = card.dataset.crop.toLowerCase();
      const mandi = card.dataset.mandi.toLowerCase();
      const state = card.dataset.state;

      const matchesSearch = crop.includes(query) || mandi.includes(query);
      const matchesState = selectedState === 'all' || state === selectedState;

      const show = matchesSearch && matchesState;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
}

/* =================== Weather Page (Live Open-Meteo API) =================== */
async function initWeatherPage() {
  // Default: New Delhi
  let lat = 28.6139;
  let lon = 77.2090;
  let cityName = 'New Delhi, India';

  // Try to get user's location
  try {
    const pos = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject('no-geo');
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 });
    });
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    // Reverse geocode
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&count=1&language=en&format=json&latitude=${lat}&longitude=${lon}`);
      // Fallback: use nominatim for reverse geocoding
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData.address || {};
        cityName = addr.city || addr.town || addr.village || addr.county || addr.state || 'Your Location';
        if (addr.country) cityName += ', ' + addr.country;
      }
    } catch (e) {
      cityName = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
    }
  } catch (e) {
    // Geolocation failed, use default New Delhi
  }

  const locEl = document.getElementById('weather-location');
  if (locEl) locEl.textContent = cityName;

  // Fetch weather from Open-Meteo (free, no key)
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
    `&timezone=auto&forecast_days=7`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    // --- Current weather ---
    const current = data.current;
    const daily = data.daily;

    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const feelsEl = document.getElementById('weather-feels');
    const humidityEl = document.getElementById('weather-humidity');
    const windEl = document.getElementById('weather-wind');
    const rainEl = document.getElementById('weather-rain');
    const uvEl = document.getElementById('weather-uv');
    const mainIconEl = document.getElementById('weather-main-icon');

    if (tempEl) tempEl.textContent = Math.round(current.temperature_2m) + '°C';
    const weatherInfo = getWeatherInfo(current.weather_code);
    if (descEl) descEl.textContent = weatherInfo.desc;
    if (feelsEl) feelsEl.textContent = 'Feels like ' + Math.round(current.apparent_temperature) + '°C';
    if (humidityEl) humidityEl.textContent = current.relative_humidity_2m + '%';
    if (windEl) windEl.textContent = Math.round(current.wind_speed_10m) + ' km/h';
    // Today's rain probability and UV from daily data
    if (rainEl && daily.precipitation_probability_max) rainEl.textContent = daily.precipitation_probability_max[0] + '%';
    if (uvEl && daily.uv_index_max) {
      const uv = daily.uv_index_max[0];
      uvEl.textContent = uv.toFixed(1) + ' (' + getUVLabel(uv) + ')';
    }
    if (mainIconEl) {
      mainIconEl.setAttribute('data-lucide', weatherInfo.icon);
      lucide.createIcons();
    }

    // --- 7-Day Forecast ---
    const forecastGrid = document.getElementById('forecast-grid');
    if (forecastGrid && daily) {
      forecastGrid.innerHTML = '';
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < daily.time.length && i < 7; i++) {
        const date = new Date(daily.time[i] + 'T00:00:00');
        const dayLabel = i === 0 ? 'Today' : dayNames[date.getDay()];
        const info = getWeatherInfo(daily.weather_code[i]);
        const high = Math.round(daily.temperature_2m_max[i]);
        const low = Math.round(daily.temperature_2m_min[i]);
        const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : '--';

        forecastGrid.innerHTML += `
          <div class="forecast-day">
            <div class="day-name">${dayLabel}</div>
            <i data-lucide="${info.icon}"
              style="width: 28px; height: 28px; color: ${info.color}; margin: 0 auto;"></i>
            <div class="temps">
              <span class="high">${high}°</span> /
              <span class="low">${low}°</span>
            </div>
            <div class="rain-chance">
              <i data-lucide="droplets" style="width: 10px; height: 10px;"></i> ${rainProb}%
            </div>
          </div>`;
      }
      lucide.createIcons();
    }

    // --- Dynamic Alerts based on real data ---
    generateWeatherAlerts(current, daily);

  } catch (err) {
    console.error('Failed to fetch weather data:', err);
    const descEl = document.getElementById('weather-desc');
    if (descEl) descEl.textContent = 'Unable to load weather data';
  }
}

// WMO Weather Code → description + Lucide icon
function getWeatherInfo(code) {
  const map = {
    0:  { desc: 'Clear Sky',           icon: 'sun',        color: 'hsl(var(--accent))' },
    1:  { desc: 'Mainly Clear',        icon: 'sun',        color: 'hsl(var(--accent))' },
    2:  { desc: 'Partly Cloudy',       icon: 'cloud-sun',  color: 'hsl(var(--accent))' },
    3:  { desc: 'Overcast',            icon: 'cloud',      color: 'hsl(var(--muted-foreground))' },
    45: { desc: 'Foggy',               icon: 'cloud-fog',  color: 'hsl(var(--muted-foreground))' },
    48: { desc: 'Depositing Rime Fog', icon: 'cloud-fog',  color: 'hsl(var(--muted-foreground))' },
    51: { desc: 'Light Drizzle',       icon: 'cloud-drizzle', color: 'hsl(var(--primary))' },
    53: { desc: 'Moderate Drizzle',    icon: 'cloud-drizzle', color: 'hsl(var(--primary))' },
    55: { desc: 'Dense Drizzle',       icon: 'cloud-drizzle', color: 'hsl(var(--primary))' },
    61: { desc: 'Slight Rain',         icon: 'cloud-rain', color: 'hsl(var(--primary))' },
    63: { desc: 'Moderate Rain',       icon: 'cloud-rain', color: 'hsl(var(--primary))' },
    65: { desc: 'Heavy Rain',          icon: 'cloud-rain', color: 'hsl(var(--destructive))' },
    71: { desc: 'Slight Snow',         icon: 'snowflake',  color: 'hsl(var(--primary))' },
    73: { desc: 'Moderate Snow',       icon: 'snowflake',  color: 'hsl(var(--primary))' },
    75: { desc: 'Heavy Snow',          icon: 'snowflake',  color: 'hsl(var(--destructive))' },
    80: { desc: 'Rain Showers',        icon: 'cloud-rain', color: 'hsl(var(--primary))' },
    81: { desc: 'Moderate Showers',    icon: 'cloud-rain', color: 'hsl(var(--primary))' },
    82: { desc: 'Violent Showers',     icon: 'cloud-rain', color: 'hsl(var(--destructive))' },
    95: { desc: 'Thunderstorm',        icon: 'cloud-lightning', color: 'hsl(var(--destructive))' },
    96: { desc: 'Thunderstorm + Hail', icon: 'cloud-lightning', color: 'hsl(var(--destructive))' },
    99: { desc: 'Thunderstorm + Heavy Hail', icon: 'cloud-lightning', color: 'hsl(var(--destructive))' },
  };
  return map[code] || { desc: 'Unknown', icon: 'cloud', color: 'hsl(var(--muted-foreground))' };
}

function getUVLabel(uv) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

function generateWeatherAlerts(current, daily) {
  const alertContainer = document.querySelector('.alert-card')?.parentElement;
  if (!alertContainer) return;

  // Clear existing static alerts
  const existingAlerts = alertContainer.querySelectorAll('.alert-card');
  existingAlerts.forEach(a => a.remove());

  const alerts = [];
  const now = new Date();
  const timeStr = 'Updated just now';

  // Check for high rain probability in next days
  if (daily.precipitation_probability_max) {
    for (let i = 0; i < Math.min(3, daily.precipitation_probability_max.length); i++) {
      if (daily.precipitation_probability_max[i] >= 60) {
        const dayLabel = i === 0 ? 'today' : (i === 1 ? 'tomorrow' : new Date(daily.time[i]+'T00:00:00').toLocaleDateString('en-IN', {weekday:'long'}));
        alerts.push({
          type: 'warning',
          icon: 'alert-triangle',
          iconColor: 'hsl(var(--warning))',
          title: 'Rain Alert',
          text: `${daily.precipitation_probability_max[i]}% chance of rain expected ${dayLabel}. Prepare drainage and protect crops.`,
          time: timeStr
        });
        break; // Only show one rain alert
      }
    }
  }

  // Check for high wind
  if (current.wind_speed_10m >= 30) {
    alerts.push({
      type: 'info',
      icon: 'wind',
      iconColor: 'hsl(var(--primary))',
      title: 'Strong Wind Advisory',
      text: `Wind speeds of ${Math.round(current.wind_speed_10m)} km/h detected. Protect tall crops and structures.`,
      time: timeStr
    });
  }

  // Check for extreme UV
  if (daily.uv_index_max && daily.uv_index_max[0] >= 8) {
    alerts.push({
      type: 'info',
      icon: 'sun',
      iconColor: 'hsl(var(--warning))',
      title: 'High UV Alert',
      text: `UV Index is ${daily.uv_index_max[0].toFixed(1)} (${getUVLabel(daily.uv_index_max[0])}). Avoid prolonged outdoor work between 11 AM - 3 PM.`,
      time: timeStr
    });
  }

  // Check for extreme heat
  if (daily.temperature_2m_max && daily.temperature_2m_max[0] >= 40) {
    alerts.push({
      type: 'warning',
      icon: 'thermometer',
      iconColor: 'hsl(var(--destructive))',
      title: 'Heatwave Warning',
      text: `Temperature may reach ${Math.round(daily.temperature_2m_max[0])}°C today. Ensure adequate water for crops and livestock.`,
      time: timeStr
    });
  }

  // If no alerts, show "all clear"
  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      icon: 'check-circle',
      iconColor: 'hsl(var(--success))',
      title: 'All Clear',
      text: 'No severe weather alerts for your area. Good conditions for farming.',
      time: timeStr
    });
  }

  // Render alerts
  alerts.forEach(a => {
    const alertHTML = `
      <div class="alert-card alert-${a.type}">
        <div class="alert-inner">
          <i data-lucide="${a.icon}" class="icon-md" style="color: ${a.iconColor}; flex-shrink: 0; margin-top: 2px;"></i>
          <div>
            <h4>${a.title}</h4>
            <p>${a.text}</p>
            <div class="alert-time">${a.time}</div>
          </div>
        </div>
      </div>`;
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);
  });
  lucide.createIcons();
}
