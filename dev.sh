#!/bin/bash

# ==========================================
# Configuration
# ==========================================
API_DIR="api"
FRONTEND_DIR="frontend"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ==========================================
# Helpers
# ==========================================
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
  echo ""
  log_info "Stopping services..."
  [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null
  log_success "Shutdown complete."
  exit 0
}

trap cleanup INT TERM

# ==========================================
# Pre-flight checks
# ==========================================
command -v bun >/dev/null || {
  log_error "bun not found. Install: curl -fsSL https://bun.sh/install | bash"
  exit 1
}

command -v uv >/dev/null || {
  log_error "uv not found. Install: curl -LsSf https://astral.sh/uv/install.sh | sh"
  exit 1
}

# ==========================================
# Frontend
# ==========================================
log_info "Setting up frontend..."

cd "$FRONTEND_DIR" || exit 1

log_info "Installing frontend dependencies..."
bun install

log_info "Starting frontend dev server..."
bun run dev &
FRONTEND_PID=$!

cd ..

log_success "Frontend running (PID: $FRONTEND_PID)"

# ==========================================
# Backend
# ==========================================
log_info "Setting up backend..."

cd "$API_DIR" || exit 1

if [[ ! -f "pyproject.toml" ]]; then
  if [[ -f "requirements.txt" ]]; then
    log_warn "pyproject.toml missing — initializing from requirements.txt"
    uv init --no-workspace
    uv add -r requirements.txt
  else
    log_error "No pyproject.toml or requirements.txt found"
    exit 1
  fi
fi

log_info "Installing backend dependencies..."
uv sync

log_info "Starting backend server..."
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

cd ..

log_success "Backend running (PID: $BACKEND_PID)"

# ==========================================
# Status
# ==========================================
echo ""
log_success "All services are running"
log_info "Frontend PID: $FRONTEND_PID"
log_info "Backend PID:  $BACKEND_PID"
echo -e "${YELLOW}Press Ctrl+C to stop everything${NC}"
echo ""

wait
