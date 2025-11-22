# Inkle — Multi-Agent Tourism (AI Intern Assignment)

I developed this system by integrating multiple external APIs within a Node.js micro-agent architecture. Although my primary background is in Python and AI, the structure was straightforward, and implementing the backend in Node.js allowed me to focus on the agent logic and data flow. I tested each agent individually, implemented error handling for invalid locations, and ensured the response format remained natural/conversational.

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
