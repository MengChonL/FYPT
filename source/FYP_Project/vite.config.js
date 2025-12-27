import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 解決 Vite 在某些環境下無法解析依賴的問題
  optimizeDeps: {
    // 明確告訴 Vite 預打包這些套件
    include: ['lucide-react', 'framer-motion']
  }
})