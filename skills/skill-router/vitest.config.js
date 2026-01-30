import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/plugin.js',  // Plugin depends on unavailable package
        'src/cli.js',     // CLI tested via subprocess, not counted
        'src/index.js'    // Re-exports only
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    }
  }
});
