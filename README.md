# Organizer Engine — Modernized

This repository contains a backend (FastAPI) and a frontend (Vite + React) for organizing files.

Key upgrades made:
- Added a production-ready upload endpoint (`POST /upload`).
- Modern frontend with TailwindCSS, Framer Motion, drag-and-drop uploads, and toast notifications.
- Organized uploads into `backend/uploads/<Category>` with unique filenames and hashing.
- Environment-configured CORS and improved dependency list.

Local run (backend):

1. Create a virtualenv and install:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

2. Start the backend:

```powershell
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Local run (frontend):

```bash
cd frontend
npm install
npm run dev
```

Deploy notes:
- Backend: containerize with the provided Dockerfile, ensure `ALLOWED_ORIGINS` is set.
- Frontend: build with `npm run build` and deploy to Vercel/Netlify/Railway. Set `VITE_API_URL` to the backend base URL.
