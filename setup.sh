#!/bin/bash
# CodeLens quick start — installs deps for both backend and frontend

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   CodeLens — AI Code Review Tool    ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Backend
echo "→ Installing backend dependencies..."
cd backend
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created backend/.env — add your GEMINI_API_KEY and GITHUB_TOKEN"
fi
cd ..

# Frontend
echo "→ Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✓ Done! To start:"
echo ""
echo "  Terminal 1 (backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo ""
