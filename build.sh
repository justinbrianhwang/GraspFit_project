#!/usr/bin/env bash
set -o errexit

# Build frontend
cd frontend
npm install
npm run build

# Copy frontend build to backend
mkdir -p ../backend/static
cp -r dist/* ../backend/static/

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
