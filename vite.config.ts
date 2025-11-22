import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: process.env.APP_ENV === 'production' ? '/build/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js')
    }
  },
  plugins: [
    laravel({
      input: [
        'resources/js/app.tsx',
        'resources/js/app_user.tsx'
      ],
      refresh: true,
    }),
    react(),
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      host: 'localhost'
    },
    watch: {
      usePolling: true
    }
  },
});
