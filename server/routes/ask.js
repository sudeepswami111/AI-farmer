import express from 'express';
import db from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const FALLBACK_ANSWERS = {
  'wheat': 'For wheat, the ideal planting time is late October to mid-November. Ensure your soil is well-drained and apply basal fertilizer (NPK) before sowing. Water the crop at the crown root initiation stage (20-25 days after sowing) for best yields.',
  'cotton': 'Cotton requires warm climate and moderate rainfall. It is susceptible to pink bollworm; use pheromone traps and spray appropriate insecticides like Emamectin Benzoate if infestation crosses the economic threshold level.',
  'fertilizer': 'Soil testing is crucial before applying fertilizers. Generally, a balanced NPK application is recommended. Split nitrogen doses: 50% as basal, 25% at vegetative stage, and 25% at reproductive stage.',
  'tomato': 'Tomatoes thrive in slightly acidic soil (pH 6.0-6.8). Stake the plants to prevent soil-borne diseases. Watch out for early blight and apply copper-based fungicides as a preventive measure.',
  'default': 'Based on general agricultural practices, ensure you maintain good soil health with organic matter. For specific crop issues, please consult your local Krishi Vigyan Kendra (KVK) or provide more details about your crop, soil type, and climate.'
};

function getFallbackAnswer(question) {
  const q = question.toLowerCase();
  for (const [key, answer] of Object.entries(FALLBACK_ANSWERS)) {
    if (key !== 'default' && q.includes(key)) {
      return answer;
    }
  }
  return FALLBACK_ANSWERS['default'];
}

router.post('/', optionalAuth, async (req, res) => {
  const { question } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  let answerText = '';

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      // Use Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are KisanMitra, an expert AI farming assistant for Indian farmers. If the user asks a question in Hindi, you MUST respond entirely in Hindi. If the user asks a question in Gujarati, you MUST respond entirely in Gujarati. If the user asks a question in English, you MUST respond entirely in English. Give accurate, practical farming advice in 3-4 sentences.'
            },
            {
              role: 'user',
              content: question
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0].message.content) {
          answerText = data.choices[0].message.content;
        }
      } else {
        console.error('Groq API Error:', await response.text());
        answerText = getFallbackAnswer(question); // Fallback on API error
      }
    } else {
      // Use Fallback KB
      answerText = getFallbackAnswer(question);
    }

    // Save to DB if user is logged in
    if (userId) {
      const insert = db.prepare('INSERT INTO questions (user_id, question, answer) VALUES (?, ?, ?)');
      insert.run(userId, question, answerText);
    }

    res.json({ answer: answerText });
  } catch (error) {
    console.error('Ask Error:', error);
    res.status(500).json({ error: 'Failed to process question', fallback: getFallbackAnswer(question) });
  }
});

router.get('/history', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json([]); // Return empty for anonymous users
  }
  
  try {
    const history = db.prepare('SELECT id, question, answer, created_at FROM questions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
