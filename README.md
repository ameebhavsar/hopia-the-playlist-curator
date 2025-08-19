# hopia-the-playlist-curator
A playlist curator application made by music enthusiasts, Amee Bhavsar and Mahreen Naila.

## Local setup

Steps to run the backend locally:

### 1) Prereq
- Python 3.8+ 
- A Spotify Developer app (see below)

### 2) Clone and create virtual env
```bash
cd /Users/<your-username>/
# clone the repo (adjust URL if needed)
# git clone <repo-url>
cd hopia-the-playlist-curator
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 3) Environment variables
Create `.env.example` (if not present) and then copy it to `.env`:
```bash
cat > .env.example << 'EOF'
# Copy this file to .env and fill in values locally. Do NOT commit your .env.

# Spotify Developer App credentials
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
# For local dev with a backend on port 8000
SPOTIFY_REDIRECT_URI=http://localhost:8000/callback

# Optional: Weather integration
OPENWEATHER_API_KEY=

EOF

cp .env.example .env
```


### 4) Spotify Developer app
 TBD
### 5) First run
```bash
# from hopia-the-playlist-curator
mkdir -p .tokens
uvicorn backend.main:app --reload
```
Visit: `http://127.0.0.1:8000/` → should return `{ "status": "ok" }`.

If port 8000 is busy or to kill server:
```bash
kill -9 $(lsof -t -i:8000) 2>/dev/null || true
```

### 6) Notes

- Always run `uvicorn` from `hopia-the-playlist-curator` so `backend` package resolves.

## Project structure 
- `.env` – local secrets (not committed)
- `.env.example` – template env file (committed)
