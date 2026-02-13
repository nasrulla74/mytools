#!/bin/bash

# Exit on error
set -e

echo "--- 🛠️ Starting VPS Setup for mytools.appeul.com ---"

# 1. Update and Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# 2. Create the external network for the proxy
docker network create web-proxy || true

# 3. Setup Nginx Proxy Manager (Best for multiple apps)
echo "Setting up Nginx Proxy Manager..."
mkdir -p ~/nginx-proxy-manager && cd ~/nginx-proxy-manager
cat > docker-compose.yml <<EOF
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - web-proxy

networks:
  web-proxy:
    external: true
EOF
docker compose up -d

# 4. Clone and Deploy MyTools
echo "Deploying MyTools App..."
cd ~
if [ -d "mytools" ]; then
    cd mytools && git pull
else
    git clone https://github.com/nasrulla74/mytools.git
    cd mytools
fi

# 5. Build and Start App
docker compose up -d --build

echo ""
echo "--- ✅ Setup Complete! ---"
echo "1. Change your API keys in ~/mytools/.env (if needed)"
echo "2. Access Nginx Proxy Manager at http://194.163.191.52:81"
echo "   Default Login: admin@example.com / changeme"
echo "3. Add a Proxy Host:"
echo "   - Domain: mytools.appeul.com"
echo "   - Scheme: http"
echo "   - Forward Host: mytools-app"
echo "   - Forward Port: 8000"
echo "   - SSL tab: Request a new SSL Certificate"
