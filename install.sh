#!/usr/bin/env bash
# =============================================================================
# Tab Sorter AI — Install Script
# Checks prerequisites, sets up the environment, installs dependencies,
# runs the test suite, and prints available npm scripts.
# =============================================================================

set -euo pipefail

# ── ANSI colour helpers ───────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[Tab-Sorter]${RESET} $*"; }
success() { echo -e "${GREEN}[  OK  ]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[ WARN ]${RESET} $*"; }
die()     { echo -e "${RED}[ ERR  ]${RESET} $*" >&2; exit 1; }

# ── Resolve script directory ──────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Step 1: Check Node.js version ─────────────────────────────────────────────
check_node() {
    echo ""
    echo -e "${BOLD}${CYAN}── Step 1/4 · Checking Node.js ──────────────────────────────${RESET}"

    if ! command -v node &>/dev/null; then
        die "Node.js is not installed or not in PATH. Download it from https://nodejs.org/ (v20+ required)."
    fi

    NODE_VERSION="$(node --version | tr -d 'v')"
    NODE_MAJOR="$(echo "${NODE_VERSION}" | cut -d. -f1)"

    if [[ "${NODE_MAJOR}" -lt 20 ]]; then
        die "Node.js v20 or later is required. Found: v${NODE_VERSION}. Download the latest LTS from https://nodejs.org/"
    fi

    success "Node.js v${NODE_VERSION} — requirement met (20+)"

    if ! command -v npm &>/dev/null; then
        die "npm is not found. It should be bundled with Node.js — please reinstall Node.js."
    fi

    NPM_VERSION="$(npm --version)"
    success "npm v${NPM_VERSION}"
}

# ── Step 2: Set up .env file ──────────────────────────────────────────────────
setup_env() {
    echo ""
    echo -e "${BOLD}${CYAN}── Step 2/4 · Environment setup ─────────────────────────────${RESET}"

    cd "${SCRIPT_DIR}"

    if [[ -f ".env" ]]; then
        success ".env file already exists — skipping copy"
    elif [[ -f ".env.example" ]]; then
        cp .env.example .env
        warn ".env created from .env.example"
        warn "Open .env and set GEMINI_API_KEY before using AI features."
        warn "Get a free key at: https://aistudio.google.com/app/apikey"
    else
        warn "No .env.example found. Create .env manually with GEMINI_API_KEY=your_key_here"
    fi
}

# ── Step 3: Install dependencies ──────────────────────────────────────────────
install_deps() {
    echo ""
    echo -e "${BOLD}${CYAN}── Step 3/4 · Installing dependencies ───────────────────────${RESET}"

    cd "${SCRIPT_DIR}"

    if [[ -f "package-lock.json" ]]; then
        info "Running: npm ci  (reproducible install from lock file)"
        npm ci
    else
        info "No package-lock.json found — running: npm install"
        npm install
    fi

    success "Dependencies installed"
}

# ── Step 4: Run tests (non-fatal) ─────────────────────────────────────────────
verify() {
    echo ""
    echo -e "${BOLD}${CYAN}── Step 4/4 · Running test suite ────────────────────────────${RESET}"

    cd "${SCRIPT_DIR}"

    info "Running: npm test -- --run"
    if npm test -- --run; then
        success "All tests passed"
    else
        warn "Some tests failed — the app may still work, but review the output above."
        warn "Run 'npm test' manually to investigate."
    fi
}

# ── Print available scripts ───────────────────────────────────────────────────
print_usage() {
    echo ""
    echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${GREEN}║           Tab Sorter AI — installation complete!             ║${RESET}"
    echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "${BOLD}Available scripts:${RESET}"
    echo ""
    printf "  %-30s %s\n" "npm run dev"            "Start development server at http://localhost:3000"
    printf "  %-30s %s\n" "npm run build"          "Build for production (outputs to dist/)"
    printf "  %-30s %s\n" "npm run preview"        "Preview the production build at http://localhost:4173"
    printf "  %-30s %s\n" "npm run typecheck"      "Run TypeScript type checking"
    printf "  %-30s %s\n" "npm run lint"           "Run ESLint + TypeScript checks"
    printf "  %-30s %s\n" "npm run lint:fix"       "Auto-fix ESLint issues"
    printf "  %-30s %s\n" "npm run format"         "Format all files with Prettier"
    printf "  %-30s %s\n" "npm run format:check"   "Check formatting without writing changes"
    printf "  %-30s %s\n" "npm test"               "Run all tests once"
    printf "  %-30s %s\n" "npm run test:watch"     "Run tests in watch mode"
    printf "  %-30s %s\n" "npm run test:coverage"  "Run tests with coverage report"
    printf "  %-30s %s\n" "npm run clean"          "Remove dist/ directory"
    echo ""
    echo -e "${CYAN}Next step:${RESET} edit .env and set GEMINI_API_KEY, then run ${BOLD}npm run dev${RESET}"
    echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${BOLD}${CYAN}Tab Sorter AI — Install Script${RESET}"
    echo -e "${CYAN}Working directory: ${SCRIPT_DIR}${RESET}"

    check_node
    setup_env
    install_deps
    verify
    print_usage
}

main "$@"
