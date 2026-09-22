import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';

const config = {
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: './src/test/setup.ts',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/lib/supabase.ts',
        'src/lib/database.types.ts',
        'src/vite-env.d.ts',
      ],
      reporter: ['text-summary', 'html'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 75 },
    },
  },
};

export default defineConfig(config as UserConfig);
