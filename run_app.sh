#!/bin/bash

# Define directories
API_DIR="api"
FRONTEND_DIR="frontend"

# Cleanup function to kill background processes
cleanup() {
    echo ""
    echo ">>> Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Move to the frontend directory
echo ">>> Starting frontend (npm dev server) in '$FRONTEND_DIR'..."
cd "$FRONTEND_DIR"

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Move into the API directory
echo ">>> Setting up backend environment in '$API_DIR'..."
cd "../$API_DIR"

# Sync dependencies from pyproject.toml
if [ -f "pyproject.toml" ]; then
    echo ">>> Syncing dependencies with uv..."
    uv sync
else
    echo "!!! pyproject.toml not found in $API_DIR"
fi

# Activate the virtual environment
echo ">>> Activating virtual environment..."
source .venv/bin/activate

# Start the backend using uvicorn in background
echo ">>> Starting backend server (Uvicorn)..."
uvicorn main:app --reload &
BACKEND_PID=$!

# Wait for both processes
echo ">>> Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo ">>> Both servers are running. Press Ctrl+C to stop."
echo ""

# Wait for background jobs to finish
wait
