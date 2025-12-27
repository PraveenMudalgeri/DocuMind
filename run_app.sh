#!/bin/bash

# ==========================================
# Configuration
# ==========================================
API_DIR="api"
FRONTEND_DIR="frontend"

# Colors for log output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==========================================
# Helper Functions
# ==========================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    echo ""
    log_info "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    log_success "Shutdown complete."
    exit 0
}

# Trap Ctrl+C (INT) and Termination (TERM) signals
trap cleanup INT TERM

# ==========================================
# Frontend Setup
# ==========================================

if [ -d "$FRONTEND_DIR" ]; then
    log_info "Setting up FRONTEND in '$FRONTEND_DIR'..."
    cd "$FRONTEND_DIR" || exit 1

    # Check for package.json
    if [ -f "package.json" ]; then
        # Check for bun
        if ! command -v bun &> /dev/null; then
             log_error "'bun' is not installed. Please install it: curl -fsSL https://bun.sh/install | bash"
             exit 1
        fi

        log_info "Installing frontend dependencies with bun..."
        bun install
        
        log_info "Starting frontend dev server with bun..."
        bun run dev &
        FRONTEND_PID=$!
        log_success "Frontend started (PID: $FRONTEND_PID)"
    else
        log_error "package.json not found in $FRONTEND_DIR"
        exit 1
    fi
    
    # Return to root
    cd ..
else
    log_error "Frontend directory '$FRONTEND_DIR' not found!"
    exit 1
fi

# ==========================================
# Backend Setup
# ==========================================

if [ -d "$API_DIR" ]; then
    log_info "Setting up BACKEND in '$API_DIR'..."
    cd "$API_DIR" || exit 1

    # Check for uv
    if ! command -v uv &> /dev/null; then
        log_error "'uv' is not installed. Please install it: curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi

    # Ensure pyproject.toml exists for uv sync
    if [ ! -f "pyproject.toml" ]; then
         # If no pyproject.toml but requirements.txt exists, we can init or just warn
         if [ -f "requirements.txt" ]; then
             log_warn "pyproject.toml not found, but requirements.txt exists."
             log_info "Initializing uv project from requirements.txt..."
             uv init --no-workspace
             uv add -r requirements.txt
         else
             log_error "No pyproject.toml or requirements.txt found in $API_DIR"
             exit 1
         fi
    fi

    log_info "Syncing dependencies with uv..."
    uv sync

    log_info "Starting backend server (Uvicorn via uv)..."
    uv run uvicorn main:app --reload &
    BACKEND_PID=$!
    log_success "Backend started (PID: $BACKEND_PID)"

    # Return to root
    cd ..
else
    log_error "API directory '$API_DIR' not found!"
    exit 1
fi

# ==========================================
# Monitoring
# ==========================================

echo ""
log_success "All services are running!"
log_info "Frontend PID: $FRONTEND_PID"
log_info "Backend PID:  $BACKEND_PID"
echo -e "${YELLOW}Press Ctrl+C to stop all servers.${NC}"
echo ""

# Wait for background processes
wait
