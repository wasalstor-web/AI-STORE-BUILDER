#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  AI Store Builder — SSL Setup Script
#  Run on VPS: sudo bash scripts/setup-ssl.sh YOUR_DOMAIN
# ═══════════════════════════════════════════════════════════

set -euo pipefail

DOMAIN="${1:-}"
APP_NAME="ai-store-builder"
NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

# ── Validation ──
if [ -z "$DOMAIN" ]; then
    err "Usage: sudo bash setup-ssl.sh YOUR_DOMAIN"
fi

if [ "$EUID" -ne 0 ]; then
    err "Please run as root: sudo bash setup-ssl.sh $DOMAIN"
fi

echo ""
echo "═══════════════════════════════════════"
echo "  SSL Setup for: $DOMAIN"
echo "═══════════════════════════════════════"
echo ""

# ── Step 1: Install Certbot ──
info "Installing Certbot..."
apt-get update -qq
apt-get install -y -qq certbot python3-certbot-nginx
log "Certbot installed"

# ── Step 2: Create ACME challenge directory ──
info "Creating ACME challenge directory..."
mkdir -p /var/www/certbot
log "ACME directory ready"

# ── Step 3: Copy and configure Nginx ──
info "Configuring Nginx..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SSL_CONF="${PROJECT_DIR}/infra/nginx-ssl.conf"

if [ ! -f "$SSL_CONF" ]; then
    err "SSL config not found at: $SSL_CONF"
fi

# Replace placeholder domain with actual domain
sed "s/YOUR_DOMAIN/$DOMAIN/g" "$SSL_CONF" > "$NGINX_CONF"
log "Nginx config created at $NGINX_CONF"

# Enable site
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# ── Step 4: Test Nginx config (before SSL) ──
# First, comment out SSL lines since we don't have certs yet
info "Testing Nginx config (pre-SSL)..."

# Create a temporary HTTP-only config for initial Certbot run
cat > /tmp/nginx-temp.conf << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        root /var/www/${APP_NAME};
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

cp "$NGINX_CONF" "${NGINX_CONF}.ssl-backup"
cp /tmp/nginx-temp.conf "$NGINX_CONF"
nginx -t || err "Nginx config test failed"
systemctl reload nginx
log "Nginx running with HTTP (pre-SSL)"

# ── Step 5: Obtain SSL Certificate ──
info "Obtaining SSL certificate from Let's Encrypt..."
echo ""
warn "You will be asked for an email address for certificate renewal notices."
echo ""

certbot certonly \
    --nginx \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "${CERT_EMAIL:-admin@$DOMAIN}" \
    --redirect \
    || err "Certbot failed. Make sure DNS points to this server."

log "SSL certificate obtained!"

# ── Step 6: Restore full SSL config ──
info "Activating full SSL configuration..."
cp "${NGINX_CONF}.ssl-backup" "$NGINX_CONF"
rm -f "${NGINX_CONF}.ssl-backup"

nginx -t || err "SSL Nginx config test failed"
systemctl reload nginx
log "Full SSL config activated"

# ── Step 7: Setup auto-renewal ──
info "Setting up auto-renewal..."
# Certbot auto-renewal is typically configured via systemd timer
systemctl enable certbot.timer 2>/dev/null || true
systemctl start certbot.timer 2>/dev/null || true

# Also add a cron job as backup
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab - 2>/dev/null || true
log "Auto-renewal configured"

# ── Step 8: Verify ──
info "Verifying SSL..."
sleep 2
if curl -sf "https://$DOMAIN/health" > /dev/null 2>&1; then
    log "SSL is working! https://$DOMAIN is live ✅"
else
    warn "SSL certificate installed but health check failed."
    warn "Make sure the backend is running: systemctl status ${APP_NAME}-api"
fi

echo ""
echo "═══════════════════════════════════════"
echo -e "  ${GREEN}SSL Setup Complete!${NC}"
echo "═══════════════════════════════════════"
echo ""
echo "  🔒 HTTPS: https://$DOMAIN"
echo "  📋 Cert:  /etc/letsencrypt/live/$DOMAIN/"
echo "  🔄 Auto-renewal: Enabled (certbot.timer)"
echo ""
echo "  Next steps:"
echo "  1. Update .env: FRONTEND_URL=https://$DOMAIN"
echo "  2. Update CORS_ORIGINS to include https://$DOMAIN"
echo "  3. Test: curl -I https://$DOMAIN"
echo "  4. SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
