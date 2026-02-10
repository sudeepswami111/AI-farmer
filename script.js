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

  // Mic button
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      isListening = !isListening;
      micBtn.classList.toggle('listening', isListening);
      const indicator = document.getElementById('listening-indicator');
      if (indicator) indicator.style.display = isListening ? 'flex' : 'none';

      if (isListening) {
        setTimeout(() => {
          textarea.value = 'When is the best time to plant wheat?';
          isListening = false;
          micBtn.classList.remove('listening');
          if (indicator) indicator.style.display = 'none';
          updateSendBtn();
        }, 2000);
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
