# 使用 Node.js LTS 版本作為基礎映像檔
FROM node:20

# 設定容器中的工作目錄
WORKDIR /app

# 將 package.json 和 package-lock.json 複製到工作目錄中
COPY package.json ./
COPY package-lock.json ./

# 在容器中安裝所有依賴套件，並使用 --legacy-peer-deps 解決版本衝突
RUN npm install --legacy-peer-deps

# 刪除 esbuild，然後重新安裝以確保版本正確
RUN npm uninstall esbuild && npm install esbuild

# 將你的專案所有文件複製到容器中
COPY . .

# 暴露應用程式使用的 port
EXPOSE 5173

# 定義容器啟動時執行的命令
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
