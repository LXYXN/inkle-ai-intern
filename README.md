# Inkle — Multi-Agent Tourism (AI Intern Assignment)

This project implements the Inkle assignment: a small multi-agent tourism system with a Parent Agent (orchestrator) and two Child Agents:
- **Weather Agent** — uses Open-Meteo to fetch current weather and precipitation probability.
- **Places Agent** — uses Overpass (OpenStreetMap) to suggest up to 5 nearby tourist attractions.
- **Geocoding** — uses Nominatim (OpenStreetMap) to convert place names to coordinates.

## Features
- Accepts free-text queries (e.g. "I'm going to Bangalore, what is the temperature there? And what are the places I can visit?")
- Detects whether user asked about weather, places, or both.
- Returns weather summary and up to 5 suggested places.
- Error handling for unknown/non-existent places.

## How to run locally
1. Ensure Node.js (>=16) is installed.
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```
4. Open http://localhost:3000 in your browser.

## Notes & Limitations
- Uses public free APIs (Nominatim, Overpass, Open-Meteo). Respect rate limits.
- Overpass queries search a ~30km radius — adjust `server.js` if you want a different radius.
- Intent detection is heuristic, not ML-based. For production, replace with a proper NLU.
