# 🌾 KisanMitra — AI Farming Assistant for Indian Farmers

KisanMitra is an intelligent farming assistant that helps Indian farmers get expert agricultural advice, detect crop diseases from photos, check mandi prices, and monitor weather — all through a simple web interface with voice support in Hindi and English.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Ask Expert** | Ask any farming question and get accurate answers in both English and Hindi, powered by Groq (LLaMA 3.3 70B) |
| 📸 **Crop Disease Detection** | Upload or capture a photo of your crop — AI analyzes it for diseases and gives treatment & prevention advice (powered by Google Gemini Vision) |
| 📊 **Mandi Prices** | Check latest market prices for crops |
| 🌤️ **Weather Info** | Get weather updates for your region |
| 🎤 **Voice Input/Output** | Speak your questions and hear answers read aloud in Hindi or English |
| 🗣️ **Hands-Free Mode** | Continuous voice conversation — speak, get answer, speak again |
| 🌐 **18 Indian Languages** | Full UI translation via Google Translate |
| 🌙 **Dark Mode** | Toggle between light and dark themes |
| 🔐 **User Auth** | Register/login to save your question history and scan results |

## 🆕 Recent Updates
- **Upgraded AI Chat Model**: Shifted from deprecated `llama3-8b-8192` to the powerful `llama-3.3-70b-versatile` via Groq.
- **Real Image Recognition**: Replaced the simulated image scan with real Vision AI powered by Google's `gemini-2.5-flash` model.
- **Bilingual TTS**: Strengthened AI prompt to always provide Hindi/English answers, and updated Text-To-Speech to automatically speak in Hindi when Devanagari text is detected.
- **Improved Navigation**: Added global "Scan Disease" links to the navigation bars across the site.

---

## 🏗️ Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Lucide Icons
- Web Speech API (voice input/output)
- Google Translate API (multilingual UI)

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** SQLite (via `better-sqlite3`)
- **AI Chat:** Groq API (`llama-3.3-70b-versatile`)
- **Image Recognition:** Google Gemini API (`gemini-1.5-flash`)
- **Auth:** JWT-based authentication with `bcryptjs`
- **File Upload:** Multer (for crop image uploads)

---

## 📁 Project Structure

```
AI-farmer-main/
├── frontend/                # Static frontend files
│   ├── index.html           # Landing page
│   ├── ask.html             # Ask AI Expert page
│   ├── upload.html          # Crop disease detection page
│   ├── mandi.html           # Mandi prices page
│   ├── weather.html         # Weather page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # User dashboard
│   ├── script.js            # Main frontend JavaScript
│   └── styles.css           # Stylesheet
├── server/                  # Backend server
│   ├── server.js            # Express app entry point
│   ├── db.js                # SQLite database setup
│   ├── middleware/
│   │   └── auth.js          # JWT auth middleware
│   ├── routes/
│   │   ├── ask.js           # AI question answering (Groq API)
│   │   ├── upload.js        # Crop image analysis (Gemini Vision API)
│   │   ├── auth.js          # User registration & login
│   │   └── mandi.js         # Mandi price data
│   └── data/
│       ├── kisanmitra.db    # SQLite database (auto-created)
│       └── uploads/         # Uploaded crop images
├── .env                     # Environment variables (API keys)
├── package.json             # Dependencies & scripts
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### 1. Clone the Repository
```bash
git clone <YOUR_GIT_URL>
cd AI-farmer-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
JWT_SECRET=your-secret-key

# Required — Get free key from https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional — For crop disease image recognition
# Get free key from https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the Server
```bash
npm start
```

### 5. Open in Browser
```
http://localhost:3000
```

---

## 🔌 Backend API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/profile` | Get logged-in user profile |

### AI Ask Expert
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ask` | Send a farming question, get AI answer in English + Hindi |
| GET | `/api/ask/history` | Get user's question history (requires auth) |

### Crop Disease Detection
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/analyze` | Upload a crop image for AI disease analysis |
| GET | `/api/upload/images/:filename` | Serve an uploaded image |
| GET | `/api/upload/history` | Get user's scan history (requires auth) |

### Mandi Prices
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/mandi` | Get current mandi/market prices |

---

## 🔑 API Keys

| Service | Purpose | Free Tier | Get Key |
|---|---|---|---|
| **Groq** | AI chat answers (LLaMA 3.3 70B) | ✅ Free | [console.groq.com](https://console.groq.com/keys) |
| **Google Gemini** | Crop image disease detection | ✅ Free | [aistudio.google.com](https://aistudio.google.com/apikey) |

> **Note:** If API keys are not provided, the app will fall back to a built-in knowledge base for answers and simulated disease detection.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
