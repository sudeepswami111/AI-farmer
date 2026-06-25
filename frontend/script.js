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
  updateAuthUI();
  initSettings();
  initCurrentPage();
});

/* =================== API Helper =================== */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('kisanmitra_token');
  const headers = { ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const baseUrl = window.location.origin.includes('file://') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' 
    : window.location.origin;

  const url = baseUrl + endpoint;

  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (response.status === 401 || response.status === 403) {
    // Token invalid or expired
    localStorage.removeItem('kisanmitra_token');
    localStorage.removeItem('kisanmitra_user');
    window.location.href = 'login.html';
    throw new Error('Authentication failed');
  }
  
  return response;
}

/* =================== Auth UI (Login/Logout across all pages) =================== */
async function updateAuthUI() {
  const localUser = JSON.parse(localStorage.getItem('kisanmitra_user') || 'null');
  let user = localUser;

  // Try to fetch fresh profile from server if we have a token
  if (localStorage.getItem('kisanmitra_token')) {
    try {
      const res = await apiRequest('/api/auth/profile');
      if (res.ok) {
        user = await res.json();
        // Update local storage with fresh data
        localStorage.setItem('kisanmitra_user', JSON.stringify({ ...user, loggedInAt: new Date().toISOString() }));
      }
    } catch (e) {
      console.warn('Failed to verify session:', e);
      user = null;
    }
  }

  // Find all login links/buttons in navbar
  document.querySelectorAll('a[href="login.html"]').forEach(el => {
    if (!user) return; // Keep as "Login" link
    const name = user.name || 'Farmer';
    const initial = name.charAt(0).toUpperCase();

    // Replace with user profile button
    const wrapper = document.createElement('div');
    wrapper.className = 'user-profile-nav';
    wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;';
    wrapper.innerHTML = `
      <button class="btn btn-secondary btn-sm user-profile-btn" style="display:flex;align-items:center;gap:6px;">
        <span style="width:24px;height:24px;border-radius:50%;background:hsl(var(--primary));color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;">${initial}</span>
        <span class="user-name-text">${name}</span>
        <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
      </button>
      <div class="user-dropdown" style="display:none;position:absolute;top:100%;right:0;margin-top:8px;background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:180px;z-index:999;overflow:hidden;">
        <div style="padding:12px 16px;border-bottom:1px solid hsl(var(--border));">
          <div style="font-weight:600;font-size:0.9rem;">${name}</div>
          <div style="font-size:0.75rem;color:hsl(var(--muted-foreground));margin-top:2px;">${user.email}</div>
        </div>
        <a href="dashboard.html" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:hsl(var(--foreground));text-decoration:none;font-size:0.85rem;">
          <i data-lucide="layout-dashboard" style="width:14px;height:14px;"></i> Dashboard
        </a>
        <button class="logout-btn" style="display:flex;align-items:center;gap:8px;padding:10px 16px;width:100%;border:none;background:none;color:hsl(var(--destructive));cursor:pointer;font-size:0.85rem;text-align:left;">
          <i data-lucide="log-out" style="width:14px;height:14px;"></i> Logout
        </button>
      </div>`;
    el.replaceWith(wrapper);

    // Toggle dropdown
    const btn = wrapper.querySelector('.user-profile-btn');
    const dropdown = wrapper.querySelector('.user-dropdown');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => { dropdown.style.display = 'none'; });

    // Logout
    wrapper.querySelector('.logout-btn').addEventListener('click', async () => {
      if (typeof supabaseClient !== 'undefined') {
        await supabaseClient.auth.signOut();
      }
      localStorage.removeItem('kisanmitra_user');
      localStorage.removeItem('kisanmitra_token');
      window.location.href = 'login.html';
    });
  });

  // Update dashboard greeting with user name
  if (user) {
    const greetEl = document.getElementById('dash-greeting');
    if (greetEl) {
      const h = new Date().getHours();
      let greet = 'Good Morning';
      if (h >= 12 && h < 17) greet = 'Good Afternoon';
      else if (h >= 17 && h < 21) greet = 'Good Evening';
      else if (h >= 21) greet = 'Good Night';
      greetEl.textContent = greet + ', ' + user.name + '! \ud83c\udf3e';
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* =================== Settings UI & Translation =================== */
// Initialize Google Translate
window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,hi,as,bn,gu,kn,ks,gom,ml,mni,mr,or,pa,sa,sd,ta,te,ur',
    autoDisplay: false
  }, 'google_translate_element');
};

function initSettings() {
  // Inject Google Translate script and hidden div
  const gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  gtDiv.style.display = 'none';
  document.body.appendChild(gtDiv);

  const gtScript = document.createElement('script');
  gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(gtScript);

  const settingsBtn = document.querySelector('button[aria-label="Settings"]');
  if (!settingsBtn) return;

  // Apply saved theme immediately
  const savedTheme = localStorage.getItem('kisanmitra_theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Get current language from cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };
  
  const gtCookie = getCookie('googtrans');
  const currentLang = gtCookie ? gtCookie.split('/').pop() : 'en';

  // Create Settings Dropdown
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;';
  
  const dropdown = document.createElement('div');
  dropdown.className = 'settings-dropdown';
  dropdown.style.cssText = 'display:none;position:absolute;top:100%;right:0;margin-top:8px;background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:10px;box-shadow:var(--shadow-medium);min-width:220px;z-index:999;overflow:hidden;padding:12px;color:hsl(var(--foreground));';
  
  dropdown.innerHTML = `
    <div style="font-weight:600;font-size:1rem;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
      <i data-lucide="settings" style="width:18px;height:18px;"></i> Settings
    </div>
    
    <!-- Theme Toggle -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid hsl(var(--border));">
      <span style="font-size:0.875rem;font-weight:500;">Dark Mode</span>
      <label style="position:relative;display:inline-block;width:40px;height:24px;">
        <input type="checkbox" id="theme-toggle" style="opacity:0;width:0;height:0;" ${savedTheme === 'dark' ? 'checked' : ''}>
        <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:hsl(var(--border));border-radius:24px;transition:0.4s;">
          <span class="slider-dot" style="position:absolute;content:'';height:18px;width:18px;left:3px;bottom:3px;background-color:white;border-radius:50%;transition:0.4s;${savedTheme === 'dark' ? 'transform:translateX(16px);' : ''}"></span>
        </span>
      </label>
    </div>

    <!-- Language Selector -->
    <div style="padding:12px 0 4px 0;">
      <span style="font-size:0.875rem;font-weight:500;display:block;margin-bottom:8px;">Language</span>
      <select id="language-select" class="form-control" style="width:100%;padding:8px;border-radius:var(--radius-sm);border:1px solid hsl(var(--border));background:hsl(var(--surface));color:hsl(var(--foreground));font-size:0.875rem;">
        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English (English)</option>
        <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>Hindi (हिंदी)</option>
        <option value="as" ${currentLang === 'as' ? 'selected' : ''}>Assamese (অসমীয়া)</option>
        <option value="bn" ${currentLang === 'bn' ? 'selected' : ''}>Bengali (বাংলা)</option>
        <option value="gu" ${currentLang === 'gu' ? 'selected' : ''}>Gujarati (ગુજરાતી)</option>
        <option value="kn" ${currentLang === 'kn' ? 'selected' : ''}>Kannada (ಕನ್ನಡ)</option>
        <option value="ks" ${currentLang === 'ks' ? 'selected' : ''}>Kashmiri (कॉशुर / كأشُر)</option>
        <option value="gom" ${currentLang === 'gom' ? 'selected' : ''}>Konkani (कोंकणी)</option>
        <option value="ml" ${currentLang === 'ml' ? 'selected' : ''}>Malayalam (മലയാളം)</option>
        <option value="mni" ${currentLang === 'mni' ? 'selected' : ''}>Manipuri (মৈতৈলোন্)</option>
        <option value="mr" ${currentLang === 'mr' ? 'selected' : ''}>Marathi (मराठी)</option>
        <option value="or" ${currentLang === 'or' ? 'selected' : ''}>Odia (ଓଡ଼ିଆ)</option>
        <option value="pa" ${currentLang === 'pa' ? 'selected' : ''}>Punjabi (ਪੰਜਾਬੀ)</option>
        <option value="sa" ${currentLang === 'sa' ? 'selected' : ''}>Sanskrit (संस्कृतम्)</option>
        <option value="sd" ${currentLang === 'sd' ? 'selected' : ''}>Sindhi (سنڌي)</option>
        <option value="ta" ${currentLang === 'ta' ? 'selected' : ''}>Tamil (தமிழ்)</option>
        <option value="te" ${currentLang === 'te' ? 'selected' : ''}>Telugu (తెలుగు)</option>
        <option value="ur" ${currentLang === 'ur' ? 'selected' : ''}>Urdu (اردو)</option>
      </select>
    </div>
  `;

  // Replace button in DOM to wrap it
  settingsBtn.parentNode.insertBefore(wrapper, settingsBtn);
  wrapper.appendChild(settingsBtn);
  wrapper.appendChild(dropdown);
  
  if (typeof lucide !== 'undefined') lucide.createIcons({root: dropdown});

  // Toggle Dropdown
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', () => { dropdown.style.display = 'none'; });
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  // Handle Theme Switch
  const themeToggle = document.getElementById('theme-toggle');
  const sliderDot = dropdown.querySelector('.slider-dot');
  
  themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kisanmitra_theme', 'dark');
      sliderDot.style.transform = 'translateX(16px)';
      themeToggle.nextElementSibling.style.backgroundColor = 'hsl(var(--primary))';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kisanmitra_theme', 'light');
      sliderDot.style.transform = 'translateX(0)';
      themeToggle.nextElementSibling.style.backgroundColor = 'hsl(var(--border))';
    }
  });
  
  if (savedTheme === 'dark') {
    themeToggle.nextElementSibling.style.backgroundColor = 'hsl(var(--primary))';
  }

  // Handle Language Switch
  const languageSelect = document.getElementById('language-select');
  languageSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    
    // Set Google Translate cookie
    document.cookie = `googtrans=/en/${lang}; path=/`;
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    
    // Reload to apply translation reliably
    window.location.reload();
  });
}

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
  
  // Voice Assistant UI elements
  const voiceBtn = document.getElementById('voice-synthesis-btn');
  const voiceIcon = document.getElementById('voice-synthesis-icon');
  const handsfreeToggle = document.getElementById('handsfree-mode-toggle');

  if (!textarea || !sendBtn) return;

  let isListening = false;
  let currentUtterance = null;

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

  // Hands-free Toggle custom styling handler
  if (handsfreeToggle) {
    const isHandsfree = localStorage.getItem('kisanmitra_handsfree') === 'true';
    handsfreeToggle.checked = isHandsfree;
    updateHandsfreeToggleUI(handsfreeToggle);

    handsfreeToggle.addEventListener('change', (e) => {
      localStorage.setItem('kisanmitra_handsfree', e.target.checked);
      updateHandsfreeToggleUI(e.target);
      if (!e.target.checked) {
        stopListening();
      }
    });
  }

  function updateHandsfreeToggleUI(toggle) {
    const slider = toggle.nextElementSibling;
    const dot = slider ? slider.querySelector('.toggle-dot') : null;
    if (slider && dot) {
      if (toggle.checked) {
        slider.style.backgroundColor = 'hsl(var(--primary))';
        dot.style.transform = 'translateX(16px)';
      } else {
        slider.style.backgroundColor = 'hsl(var(--border))';
        dot.style.transform = 'translateX(0)';
      }
    }
  }

  // Mic button with Web Speech API
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
      
      // Cancel speech synthesis when user starts speaking
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        cleanupSpeechUI();
      }
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      textarea.value = transcript;
      updateSendBtn();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
      
      // Auto-submit if Hands-free Mode is active and user spoke something
      if (handsfreeToggle && handsfreeToggle.checked && textarea.value.trim()) {
        sendBtn.click();
      }
    };
  } else {
    console.warn('Speech recognition is not supported in this browser.');
  }

  function startListening() {
    if (recognition && !isListening) {
      try {
        textarea.value = ''; 
        updateSendBtn();
        
        // Detect language via GoogTrans cookie to set recognition language
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };
        const gtCookie = getCookie('googtrans');
        const currentLang = gtCookie ? gtCookie.split('/').pop() : 'en';
        const langMap = {
          'hi': 'hi-IN', 'mr': 'mr-IN', 'ta': 'ta-IN', 'te': 'te-IN',
          'bn': 'bn-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'pa': 'pa-IN',
          'ur': 'ur-IN', 'en': 'en-IN'
        };
        recognition.lang = langMap[currentLang] || currentLang;
        
        recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition', e);
      }
    }
  }

  function stopListening() {
    isListening = false;
    if (micBtn) micBtn.classList.remove('listening');
    const indicator = document.getElementById('listening-indicator');
    if (indicator) indicator.style.display = 'none';
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  }

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isListening) {
        stopListening();
      } else {
        if (recognition) {
          startListening();
        } else {
          alert('Microphone/Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Safari.');
        }
      }
    });
  }

  // Text-To-Speech (TTS) voice synthesis implementation
  function speakAnswer(text) {
    window.speechSynthesis.cancel();
    if (!text) return;

    // Filter out emoji characters for cleaner speech synthesis
    const cleanedText = text.replace(/[\u{1F300}-\u{1F6FF}]/gu, '').replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    currentUtterance = utterance;

    // Detect if text contains Hindi or Gujarati characters
    const hasHindi = /[\u0900-\u097F]/.test(cleanedText);
    const hasGujarati = /[\u0A80-\u0AFF]/.test(cleanedText);

    // Detect language via GoogTrans cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    const gtCookie = getCookie('googtrans');
    let currentLang = gtCookie ? gtCookie.split('/').pop() : 'en';

    // If text has Hindi or Gujarati and we aren't explicitly translated to another Indian language, default to that voice
    if (hasGujarati && currentLang === 'en') {
      currentLang = 'gu';
    } else if (hasHindi && currentLang === 'en') {
      currentLang = 'hi';
    }

    const langMap = {
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'pa': 'pa-IN',
      'ur': 'ur-IN',
      'en': 'en-IN'
    };

    const targetLocale = langMap[currentLang] || currentLang;
    const voices = window.speechSynthesis.getVoices();
    
    // Case-insensitive matching for voices
    const targetLocaleLower = targetLocale.toLowerCase().replace('_', '-');
    const currentLangLower = currentLang.toLowerCase();
    
    let voice = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(targetLocaleLower) || vLang.startsWith(currentLangLower);
    });

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = targetLocale;
    }

    utterance.rate = 0.95; // Slightly slower for clear understanding
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (voiceIcon) {
        voiceIcon.setAttribute('data-lucide', 'volume-x');
        lucide.createIcons();
      }
      if (voiceBtn) voiceBtn.classList.add('btn-active-speaking');
    };

    utterance.onend = () => {
      cleanupSpeechUI();
      // Hands-free Mode: restart microphone automatically for seamless voice discussion
      if (handsfreeToggle && handsfreeToggle.checked) {
        setTimeout(() => {
          startListening();
        }, 600);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      cleanupSpeechUI();
    };

    window.speechSynthesis.speak(utterance);
  }

  function cleanupSpeechUI() {
    if (voiceIcon) {
      voiceIcon.setAttribute('data-lucide', 'volume-2');
      lucide.createIcons();
    }
    if (voiceBtn) voiceBtn.classList.remove('btn-active-speaking');
    currentUtterance = null;
  }

  // Bind volume control button in answer card
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        cleanupSpeechUI();
      } else {
        const answerParagraph = answerContainer.querySelector('p');
        if (answerParagraph) {
          speakAnswer(answerParagraph.textContent);
        }
      }
    });
  }

  // Send / Get Answer
  sendBtn.addEventListener('click', async () => {
    const questionText = textarea.value.trim();
    if (!questionText) return;

    // Stop speaking old answers when sending a new question
    window.speechSynthesis.cancel();
    cleanupSpeechUI();

    sendBtn.disabled = true;
    if (sendBtnIcon) {
      sendBtnIcon.setAttribute('data-lucide', 'loader-2');
      sendBtnIcon.classList.add('spinner');
      lucide.createIcons();
    }
    if (sendBtnText) sendBtnText.textContent = 'Thinking...';

    try {
      const response = await apiRequest('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText })
      });
      
      const data = await response.json();

      // Show answer
      if (answerContainer) {
        answerContainer.style.display = 'block';
        answerContainer.classList.add('animate-fade-in');
        
        // Update the actual answer text in the DOM
        const answerParagraph = answerContainer.querySelector('p');
        if (answerParagraph) {
          const text = data.answer || data.fallback || 'Sorry, I could not understand the question.';
          answerParagraph.textContent = text;
          
          // Automatically speak the response
          speakAnswer(text);
        }
      }
      if (suggestedContainer) suggestedContainer.style.display = 'none';

    } catch (error) {
      console.error('Failed to get answer:', error);
      alert('Failed to connect to the server. Please try again.');
    } finally {
      // Reset button
      if (sendBtnIcon) {
        sendBtnIcon.setAttribute('data-lucide', 'send');
        sendBtnIcon.classList.remove('spinner');
        lucide.createIcons();
      }
      if (sendBtnText) sendBtnText.textContent = 'Get Answer';
      sendBtn.disabled = false;
    }
  });
}

/* =================== Upload Crop Page =================== */
function initUploadPage() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const cameraInput = document.getElementById('camera-input');
  const btnTakePhoto = document.getElementById('btn-take-photo');
  const btnBrowse = document.getElementById('btn-browse');
  const previewContainer = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeBtn = document.getElementById('remove-image');
  const analyzeSection = document.getElementById('analyze-section');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultsSection = document.getElementById('results-section');
  const analyzeBtnText = document.getElementById('analyze-btn-text');
  const analyzeBtnIcon = document.getElementById('analyze-btn-icon');

  if (!uploadZone || !fileInput) return;

  const webcamContainer = document.getElementById('webcam-container');
  const webcamVideo = document.getElementById('webcam-video');
  const webcamCanvas = document.getElementById('webcam-canvas');
  const btnCancelWebcam = document.getElementById('btn-cancel-webcam');
  const btnCapturePhoto = document.getElementById('btn-capture-photo');

  let activeStream = null;
  let capturedFile = null;

  if (!uploadZone || !fileInput) return;

  // Generic click falls back to file picker
  uploadZone.addEventListener('click', (e) => {
    if (e.target.closest('#btn-take-photo') || e.target.closest('#btn-browse')) return;
    fileInput.click();
  });

  // Start Webcam
  if (btnTakePhoto) {
    btnTakePhoto.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        activeStream = stream;
        webcamVideo.srcObject = stream;
        uploadZone.style.display = 'none';
        webcamContainer.style.display = 'flex';
      } catch (err) {
        console.error('Camera access denied or unavailable', err);
        alert('Could not access the camera. Please allow camera permissions or use "Browse Files" instead.');
      }
    });
  }

  // Browse Files
  if (btnBrowse) {
    btnBrowse.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // Cancel Webcam
  if (btnCancelWebcam) {
    btnCancelWebcam.addEventListener('click', () => {
      stopWebcam();
      webcamContainer.style.display = 'none';
      uploadZone.style.display = 'block';
    });
  }

  // Capture Photo
  if (btnCapturePhoto && webcamCanvas && webcamVideo) {
    btnCapturePhoto.addEventListener('click', () => {
      const context = webcamCanvas.getContext('2d');
      webcamCanvas.width = webcamVideo.videoWidth;
      webcamCanvas.height = webcamVideo.videoHeight;
      context.drawImage(webcamVideo, 0, 0, webcamCanvas.width, webcamCanvas.height);
      
      webcamCanvas.toBlob((blob) => {
        if (!blob) return;
        capturedFile = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        
        // Show preview
        if (previewImg) previewImg.src = URL.createObjectURL(capturedFile);
        if (previewContainer) previewContainer.style.display = 'block';
        if (webcamContainer) webcamContainer.style.display = 'none';
        if (analyzeSection) analyzeSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';
        
        stopWebcam();
      }, 'image/jpeg', 0.9);
    });
  }

  function stopWebcam() {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
  }

  // Handle standard file upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    capturedFile = file; // Standardize

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
      const file = capturedFile;
      if (!file) return;

      analyzeBtn.disabled = true;
      if (analyzeBtnIcon) {
        analyzeBtnIcon.setAttribute('data-lucide', 'loader-2');
        analyzeBtnIcon.classList.add('spinner');
        lucide.createIcons();
      }
      if (analyzeBtnText) analyzeBtnText.textContent = 'Analyzing Image...';

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiRequest('/api/upload/analyze', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (analyzeSection) analyzeSection.style.display = 'none';
        
        if (resultsSection) {
          // Update DOM with actual results
          const titleEl = resultsSection.querySelector('h3');
          const confidenceEl = resultsSection.querySelector('p');
          const severityBadge = resultsSection.querySelector('.severity-badge');
          
          if (titleEl) titleEl.textContent = data.disease;
          if (confidenceEl) confidenceEl.textContent = `Confidence: ${data.confidence}%`;
          
          if (severityBadge) {
            severityBadge.textContent = data.severity;
            severityBadge.className = 'severity-badge severity-' + data.severity.toLowerCase();
          }

          // Update treatments list
          const treatmentList = resultsSection.querySelector('.treatment-list');
          if (treatmentList && data.treatment) {
            treatmentList.innerHTML = data.treatment.map((t, i) => 
              `<li><span class="step-number">${i+1}</span>${t}</li>`
            ).join('');
          }

          // Update prevention list
          const preventionList = resultsSection.querySelector('.prevention-list');
          if (preventionList && data.prevention) {
            preventionList.innerHTML = data.prevention.map(p => 
              `<li><span class="bullet"></span>${p}</li>`
            ).join('');
          }

          resultsSection.style.display = 'block';
          resultsSection.classList.add('animate-fade-in');
        }
      } catch (error) {
        console.error('Failed to analyze image:', error);
        alert('Analysis failed. Please ensure you are logged in and try again.');
      } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        if (analyzeBtnIcon) {
          analyzeBtnIcon.setAttribute('data-lucide', 'camera');
          analyzeBtnIcon.classList.remove('spinner');
          lucide.createIcons();
        }
        if (analyzeBtnText) analyzeBtnText.textContent = 'Analyze Crop';
      }
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
    if (fileInput) fileInput.value = '';
    
    // Check if cameraInput is still around from older code just in case
    const oldCameraInput = document.getElementById('camera-input');
    if (oldCameraInput) oldCameraInput.value = '';
    
    capturedFile = null;
    stopWebcam();
    if (webcamContainer) webcamContainer.style.display = 'none';
  }
}

/* =================== Mandi Prices Page =================== */
// Mandi page logic is now handled by mandi-data.js
function initMandiPage() {
  // No-op: see mandi-data.js for the dynamic price engine
}

/* =================== Weather Page =================== */
// Weather page logic is now handled by weather-data.js
function initWeatherPage() {
  // No-op: see weather-data.js for enhanced weather engine
}

