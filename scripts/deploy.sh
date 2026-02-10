#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  AI Store Builder — VPS Deployment Script
#  Target: Hostinger VPS (147.93.120.99) / Ubuntu 22.04+
#  Usage: bash deploy.sh [setup|deploy|restart|status|logs]
# ═══════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration ──
APP_NAME="ai-store-builder"
APP_DIR="/opt/${APP_NAME}"
FRONTEND_DIR="/var/www/${APP_NAME}"
VENV_DIR="${APP_DIR}/.venv"
USER="www-data"
PYTHON="python3.12"
NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
SYSTEMD_API="/etc/systemd/system/${APP_NAME}-api.service"
SYSTEMD_WORKER="/etc/systemd/system/${APP_NAME}-worker.service"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

# ═══════════════════════════════════════════════════════════
#  SETUP — First-time server configuration
# ═══════════════════════════════════════════════════════════
cmd_setup() {
    info "Setting up AI Store Builder on VPS..."

    # 1. System packages
    info "Installing system dependencies..."
    apt-get update -qq
    apt-get install -y -qq \
        ${PYTHON} ${PYTHON}-venv ${PYTHON}-dev \
        nginx redis-server postgresql postgresql-contrib \
        curl git build-essential libpq-dev \
        certbot python3-certbot-nginx

    # 2. Create app directory
    info "Creating application directories..."
    mkdir -p ${APP_DIR} ${FRONTEND_DIR}

    # 3. Copy project files
    info "Copying project files..."
    rsync -av --exclude='.venv' --exclude='node_modules' --exclude='__pycache__' \
          --exclude='.git' --exclude='frontend/dist' \
          ./ ${APP_DIR}/

    # 4. Python virtual environment
    info "Creating Python virtual environment..."
    cd ${APP_DIR}
    ${PYTHON} -m venv ${VENV_DIR}
    source ${VENV_DIR}/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    pip install gunicorn

    # 5. Setup .env
    if [ ! -f "${APP_DIR}/.env" ]; then
        cp .env.example .env 2>/dev/null || cp .env ${APP_DIR}/.env
        warn "Review and update ${APP_DIR}/.env with production values!"
    fi

    # 6. Build frontend
    info "Building frontend..."
    cd ${APP_DIR}/frontend
    if command -v node &>/dev/null; then
        npm install
        npm run build
        cp -r dist/* ${FRONTEND_DIR}/
    else
        warn "Node.js not installed. Install via: curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs"
    fi

    # 7. Setup Nginx
    info "Configuring Nginx..."
    cp ${APP_DIR}/nginx-aisb-api.conf ${NGINX_CONF}
    ln -sf ${NGINX_CONF} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx

    # 8. Setup systemd services
    _create_systemd_services

    # 9. Enable and start services
    systemctl daemon-reload
    systemctl enable ${APP_NAME}-api ${APP_NAME}-worker redis nginx
    systemctl start redis
    systemctl start ${APP_NAME}-api
    systemctl start ${APP_NAME}-worker

    log "Setup complete! API running at http://147.93.120.99/api/v1"
    log "Frontend at http://147.93.120.99/"
    info "Run: bash deploy.sh status"
}

# ═══════════════════════════════════════════════════════════
#  DEPLOY — Update existing deployment
# ═══════════════════════════════════════════════════════════
cmd_deploy() {
    info "Deploying latest changes..."

    # 1. Copy backend files
    info "Updating backend..."
    rsync -av --exclude='.venv' --exclude='node_modules' --exclude='__pycache__' \
          --exclude='.git' --exclude='frontend/dist' --exclude='.env' \
          ./ ${APP_DIR}/

    # 2. Update Python dependencies
    cd ${APP_DIR}
    source ${VENV_DIR}/bin/activate
    pip install -r requirements.txt -q

    # 3. Run migrations
    info "Running database migrations..."
    cd ${APP_DIR}
    alembic upgrade head 2>/dev/null || warn "Alembic migration skipped (tables auto-created)"

    # 4. Build and deploy frontend
    info "Building frontend..."
    cd ${APP_DIR}/frontend
    npm install --production=false
    npm run build
    rm -rf ${FRONTEND_DIR}/*
    cp -r dist/* ${FRONTEND_DIR}/

    # 5. Update nginx config
    cp ${APP_DIR}/nginx-aisb-api.conf ${NGINX_CONF}
    nginx -t && systemctl reload nginx

    # 6. Restart services
    systemctl restart ${APP_NAME}-api ${APP_NAME}-worker

    log "Deployment complete!"
    cmd_status
}

# ═══════════════════════════════════════════════════════════
#  RESTART — Restart all services
# ═══════════════════════════════════════════════════════════
cmd_restart() {
    info "Restarting services..."
    systemctl restart ${APP_NAME}-api
    systemctl restart ${APP_NAME}-worker
    systemctl reload nginx
    log "All services restarted."
    cmd_status
}

# ═══════════════════════════════════════════════════════════
#  STATUS — Show service status
# ═══════════════════════════════════════════════════════════
cmd_status() {
    echo ""
    echo "═══════════════════════════════════════"
    echo "  AI Store Builder — Service Status"
    echo "═══════════════════════════════════════"
    echo ""

    for svc in "${APP_NAME}-api" "${APP_NAME}-worker" "nginx" "redis"; do
        if systemctl is-active --quiet ${svc} 2>/dev/null; then
            echo -e "  ${GREEN}●${NC} ${svc}: running"
        else
            echo -e "  ${RED}●${NC} ${svc}: stopped"
        fi
    done

    echo ""
    echo "  API:      http://147.93.120.99/api/v1"
    echo "  Frontend: http://147.93.120.99/"
    echo "  Docs:     http://147.93.120.99/docs"
    echo ""
}

# ═══════════════════════════════════════════════════════════
#  LOGS — View service logs
# ═══════════════════════════════════════════════════════════
cmd_logs() {
    local service="${1:-api}"
    journalctl -u ${APP_NAME}-${service} -f --no-pager -n 50
}

# ═══════════════════════════════════════════════════════════
#  SYSTEMD SERVICE FILES
# ═══════════════════════════════════════════════════════════
_create_systemd_services() {
    # API Service
    cat > ${SYSTEMD_API} << 'APIEOF'
[Unit]
Description=AI Store Builder API
After=network.target redis.service
Wants=redis.service

[Service]
Type=exec
User=root
Group=root
WorkingDirectory=/opt/ai-store-builder
Environment=PATH=/opt/ai-store-builder/.venv/bin:/usr/bin:/bin
EnvironmentFile=/opt/ai-store-builder/.env
ExecStart=/opt/ai-store-builder/.venv/bin/gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 2 \
    --bind 0.0.0.0:8000 \
    --timeout 180 \
    --graceful-timeout 30 \
    --access-logfile - \
    --error-logfile -
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
APIEOF

    # Worker Service
    cat > ${SYSTEMD_WORKER} << 'WORKEREOF'
[Unit]
Description=AI Store Builder ARQ Worker
After=network.target redis.service
Wants=redis.service

[Service]
Type=exec
User=root
Group=root
WorkingDirectory=/opt/ai-store-builder
Environment=PATH=/opt/ai-store-builder/.venv/bin:/usr/bin:/bin
EnvironmentFile=/opt/ai-store-builder/.env
ExecStart=/opt/ai-store-builder/.venv/bin/python -m app.workers.store_worker
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
WORKEREOF

    log "Systemd service files created."
}

# ═══════════════════════════════════════════════════════════
#  MAIN — Command dispatcher
# ═══════════════════════════════════════════════════════════
case "${1:-help}" in
    setup)   cmd_setup ;;
    deploy)  cmd_deploy ;;
    restart) cmd_restart ;;
    status)  cmd_status ;;
    logs)    cmd_logs "${2:-api}" ;;
    *)
        echo "AI Store Builder — Deployment Script"
        echo ""
        echo "Usage: bash deploy.sh <command>"
        echo ""
        echo "Commands:"
        echo "  setup    — First-time VPS setup (install all dependencies)"
        echo "  deploy   — Deploy latest code changes"
        echo "  restart  — Restart all services"
        echo "  status   — Show service status"
        echo "  logs     — View service logs (api|worker)"
        echo ""
        echo "Examples:"
        echo "  bash deploy.sh setup"
        echo "  bash deploy.sh deploy"
        echo "  bash deploy.sh logs worker"
        ;;
esac
