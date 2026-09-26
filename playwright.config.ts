import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: ['tests/**/*.spec.ts'],
  projects: [
    {
      name: 'unit',
      testMatch: /tests\/unit/,
    },
    {
      name: 'ui',
      testMatch: /tests\/ui/,
      use: {
        // 127.0.0.1 explicitly: python http.server binds IPv4 only, and the
        // Actions runners resolve `localhost` to ::1 first (ERR_CONNECTION_REFUSED)
        baseURL: 'http://127.0.0.1:3123',
      },
      webServer: {
        command: 'python3 -m http.server 3123 --bind 127.0.0.1 --directory .',
        port: 3123,
        // Wait for a real 200 on the entry page, not just an open TCP port
        url: 'http://127.0.0.1:3123/speed-catan.html',
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
        // Surface server output in CI logs for debugging
        stdout: 'pipe',
        stderr: 'pipe',
      },
    },
  ],
});