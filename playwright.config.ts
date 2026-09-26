import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: ['tests/**/*.spec.ts'],
  // webServer MUST live at the top level: @playwright/test 1.62.x only reads
  // webServer from the top-level config (FullConfigInternal); a webServer block
  // inside a project is silently ignored (no server started, no readiness check),
  // which caused ERR_CONNECTION_REFUSED on every page.goto in CI.
  webServer: {
    command: 'python3 -m http.server 3123 --bind 127.0.0.1 --directory .',
    port: 3123,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    // Surface server output in CI logs for debugging
    stdout: 'pipe',
    stderr: 'pipe',
  },
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
    },
  ],
});
