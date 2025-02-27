import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      mode === 'analyze' &&
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-draggable', 'react-color',],
            material: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            flow: ['@xyflow/react',],
          },
        }
      }
    }
  }
})
/*
export default defineConfig({
  plugins: [react()],
})
*/
