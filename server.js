const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Parent Agent endpoint
app.post('/api/plan', async (req, res) => {
  try {
    const { text, place } = req.body;
    // determine place (prefer explicit place param)
    const placeQuery = (place || text || '').trim();
    if (!placeQuery) return res.status(400).json({ error: 'No place provided' });

    // simple intent detection
    const t = (text || '').toLowerCase();
    const wantsWeather = /weather|temperature|temp|rain|climate/.test(t);
    const wantsPlaces = /visit|places|things to do|attraction|tourist|go to|sight(seen)?/.test(t);

    // if user didn't specify clear intent, and place param given, assume both
    const intent = wantsWeather || wantsPlaces ? {weather: wantsWeather, places: wantsPlaces} : {weather:true, places:true};

    // Child Agent: Geocoding (Nominatim)
    const coords = await getCoordinates(placeQuery);
    if (!coords) return res.json({ error: `I don't know a place called "${placeQuery}".` });

    const result = { place: coords.display_name, lat: coords.lat, lon: coords.lon };

    // Child Agent: Weather
    if (intent.weather) {
      const weather = await getWeather(coords.lat, coords.lon);
      result.weather = weather;
    }

    // Child Agent: Places
    if (intent.places) {
      const places = await getNearbyPlaces(coords.lat, coords.lon);
      result.places = places;
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------- Child Agent implementations -------
async function getCoordinates(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'Inkle-AI-Intern/1.0 (+https://example.com)' } });
  const data = await resp.json();
  if (!data || data.length === 0) return null;
  const p = data[0];
  return { lat: p.lat, lon: p.lon, display_name: p.display_name };
}

async function getWeather(lat, lon) {
  // Use Open-Meteo: get current weather and precipitation probability hourly
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability&timezone=auto`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!data) return null;
  const current = data.current_weather || null;
  let rainChance = null;
  try {
    // find nearest hourly index
    if (data.hourly && data.hourly.time && data.hourly.precipitation_probability) {
      const times = data.hourly.time;
      const probs = data.hourly.precipitation_probability;
      const now = new Date().toISOString().slice(0,13); // YYYY-MM-DDTHH
      // find index where time starts with now hour
      let idx = times.findIndex(t => t.startsWith(now));
      if (idx === -1) idx = 0;
      rainChance = probs[idx];
    }
  } catch (e) {
    rainChance = null;
  }
  return {
    temperature: current ? `${current.temperature}°C` : null,
    windspeed: current ? `${current.windspeed} m/s` : null,
    weathercode: current ? current.weathercode : null,
    precipitation_probability_percent: rainChance
  };
}

async function getNearbyPlaces(lat, lon) {
  // Overpass QL: search tourist/leisure/amenity nodes & ways within radius
  const radius = 30000; // 30 km radius
  const query = `
[out:json][timeout:25];
(
  node["tourism"](around:${radius},${lat},${lon});
  way["tourism"](around:${radius},${lat},${lon});
  node["leisure"="park"](around:${radius},${lat},${lon});
  way["leisure"="park"](around:${radius},${lat},${lon});
  node["amenity"="planetarium"](around:${radius},${lat},${lon});
  way["amenity"="planetarium"](around:${radius},${lat},${lon});
);
out center;
`;
  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query
  });
  const data = await resp.json();
  if (!data || !data.elements) return [];
  const names = [];
  for (const el of data.elements) {
    if (el.tags && el.tags.name) names.push(el.tags.name);
  }
  // dedupe and limit to 5
  const unique = [...new Set(names)].slice(0,5);
  return unique;
}

// Serve a basic health check
app.get('/health', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
