# 使用 Node.js LTS Alpine 版本（更小的攻擊面）
FROM node:20-alpine AS build

# 設定容器中的工作目錄
WORKDIR /app

# 將 package.json 和 package-lock.json 複製到工作目錄中
COPY package.json ./
COPY package-lock.json ./

# 在容器中安裝所有依賴套件，並使用 --legacy-peer-deps 解決版本衝突
RUN npm ci --legacy-peer-deps

# 刪除 esbuild，然後重新安裝以確保版本正確
RUN npm uninstall esbuild && npm install esbuild

# 將你的專案所有文件複製到容器中
COPY . .

# Build for production
RUN npm run build

# === Production Stage: Nginx ===
FROM nginx:alpine

# Copy built assets to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config with security headers and SPA fallback
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co https://api.deepseek.com; frame-ancestors 'none';" always;

    # SPA fallback
    location / {
        try_files $uri /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
