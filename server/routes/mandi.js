import express from 'express';

const router = express.Router();

// Helper to generate seeded random numbers (consistent per day)
function pseudoRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Backend Mandi Database (subset for demonstration, matches frontend)
const CROP_CATEGORIES = {
  cereals: ['Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar'],
  pulses: ['Chana', 'Tur', 'Moong', 'Urad', 'Masoor'],
  oilseeds: ['Soybean', 'Mustard', 'Groundnut', 'Sunflower', 'Castor Seed'],
  cash: ['Cotton', 'Sugarcane', 'Jute', 'Tobacco'],
  spices: ['Turmeric', 'Cumin', 'Coriander', 'Chilli', 'Garlic'],
  vegetables: ['Onion', 'Potato', 'Tomato', 'Cabbage', 'Cauliflower']
};

const BASE_PRICES = {
  'Wheat': 2500, 'Rice': 3800, 'Maize': 2100, 'Bajra': 2200, 'Jowar': 2600,
  'Chana': 5600, 'Tur': 9800, 'Moong': 8200, 'Urad': 8500, 'Masoor': 6100,
  'Soybean': 4700, 'Mustard': 5400, 'Groundnut': 6200, 'Sunflower': 4500, 'Castor Seed': 5800,
  'Cotton': 7200, 'Sugarcane': 350, 'Jute': 4800, 'Tobacco': 8500,
  'Turmeric': 14500, 'Cumin': 28000, 'Coriander': 7500, 'Chilli': 18500, 'Garlic': 12500,
  'Onion': 1800, 'Potato': 1500, 'Tomato': 2400, 'Cabbage': 1200, 'Cauliflower': 1600
};

const LOCATIONS = [
  { state: 'MP', city: 'Indore' },
  { state: 'MP', city: 'Bhopal' },
  { state: 'Gujarat', city: 'Ahmedabad' },
  { state: 'Gujarat', city: 'Rajkot' },
  { state: 'Rajasthan', city: 'Jaipur' },
  { state: 'Rajasthan', city: 'Jodhpur' },
  { state: 'Maharashtra', city: 'Pune' },
  { state: 'Maharashtra', city: 'Nagpur' },
  { state: 'Karnataka', city: 'Bengaluru' },
  { state: 'Karnataka', city: 'Hubli' },
  { state: 'UP', city: 'Lucknow' },
  { state: 'UP', city: 'Agra' },
  { state: 'Haryana', city: 'Karnal' },
  { state: 'Haryana', city: 'Hisar' },
  { state: 'Punjab', city: 'Ludhiana' },
  { state: 'Punjab', city: 'Amritsar' },
  { state: 'Andhra Pradesh', city: 'Vijayawada' },
  { state: 'Andhra Pradesh', city: 'Guntur' },
  { state: 'Tamil Nadu', city: 'Chennai' },
  { state: 'Tamil Nadu', city: 'Coimbatore' },
  { state: 'Telangana', city: 'Hyderabad' },
  { state: 'Telangana', city: 'Warangal' },
  { state: 'West Bengal', city: 'Kolkata' },
  { state: 'West Bengal', city: 'Siliguri' },
];

function generateDynamicPrices(stateFilter = 'All States', typeFilter = 'All Crops') {
  const date = new Date();
  const daySeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const minuteSeed = Math.floor(date.getMinutes() / 5); // Refreshes every 5 mins
  
  let results = [];
  
  // Generate combinations
  Object.keys(CROP_CATEGORIES).forEach(category => {
    if (typeFilter !== 'All Crops' && typeFilter !== category) return;
    
    CROP_CATEGORIES[category].forEach(crop => {
      LOCATIONS.forEach(loc => {
        if (stateFilter !== 'All States' && stateFilter !== loc.state) return;
        
        // Use seeded random to generate stable prices for the current 5-min window
        const strSeed = crop.length + loc.city.length;
        const seed1 = daySeed + strSeed;
        const seed2 = minuteSeed + strSeed;
        
        const base = BASE_PRICES[crop] || 2000;
        const dayVolatility = (pseudoRandom(seed1) * 0.1) - 0.05; // +/- 5% daily
        const minuteVolatility = (pseudoRandom(seed2) * 0.02) - 0.01; // +/- 1% 5-min
        
        const currentPrice = Math.round(base * (1 + dayVolatility + minuteVolatility));
        const previousPrice = Math.round(base * (1 + dayVolatility));
        const changePercent = (((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1);
        
        results.push({
          crop,
          category,
          state: loc.state,
          city: loc.city,
          price: currentPrice,
          change: parseFloat(changePercent),
          isUp: parseFloat(changePercent) >= 0,
          volume: Math.round(100 + pseudoRandom(seed1 + 1) * 900)
        });
      });
    });
  });
  
  // Sort randomly but consistently based on time
  return results.sort((a, b) => pseudoRandom(a.crop.length + minuteSeed) - 0.5);
}

router.get('/prices', (req, res) => {
  const { state = 'All States', type = 'All Crops' } = req.query;
  const prices = generateDynamicPrices(state, type);
  
  // Calculate stats
  const up = prices.filter(p => p.isUp).length;
  const down = prices.filter(p => !p.isUp).length;
  const totalMandis = new Set(prices.map(p => p.city)).size;
  
  res.json({
    stats: { total: prices.length, mandis: totalMandis, up, down },
    data: prices,
    lastUpdated: new Date().toISOString()
  });
});

export default router;
