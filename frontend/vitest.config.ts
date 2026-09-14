import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jsdom: the api module touches document.cookie (CSRF fallback)
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
