import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
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
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Ant Design UI
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design/icons')) {
            return 'vendor-antd-ui';
          }
          // Ant Design Charts (heavy - separate chunk)
          if (id.includes('node_modules/@ant-design/charts') || id.includes('node_modules/@ant-design/plots')) {
            return 'vendor-charts-antd';
          }
          // Recharts (heavy - separate chunk)
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts-recharts';
          }
          // Editor (heavy)
          if (id.includes('node_modules/suneditor')) {
            return 'vendor-editor';
          }
          // Framer Motion (heavy)
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-animation';
          }
          // DnD libraries
          if (id.includes('node_modules/@dnd-kit') || id.includes('node_modules/@hello-pangea/dnd')) {
            return 'vendor-dnd';
          }
          // Utilities
          if (id.includes('node_modules/axios') || id.includes('node_modules/dayjs') || id.includes('node_modules/lodash')) {
            return 'vendor-utils';
          }
          // Radix UI
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Other vendors
          if (id.includes('node_modules/')) {
            return 'vendor-other';
          }
        },
        // Optimize chunk size
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Optimize source maps
    sourcemap: false,
    // Report compressed size
    reportCompressedSize: false,
  },
  // Optimize dev server
  server: {
    host: 'localhost',  // Fix IPv6 issue
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false,
      host: 'localhost'  // Force HMR to use localhost instead of IPv6
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'axios',
      'dayjs'
    ],
    exclude: [
      '@ant-design/charts',
      '@ant-design/plots',
      'recharts',
      'suneditor-react',
      'framer-motion'
    ]
  }
});
