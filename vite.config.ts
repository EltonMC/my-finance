import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

const config = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
}

export default defineConfig(config as UserConfig)
