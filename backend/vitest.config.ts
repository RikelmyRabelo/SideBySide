import { defineConfig } from 'vitest/config';

export default defineConfig({
test: {
globals: true,
environment: 'node',
include: ['src/**/*.test.ts', 'src/**/*.test.js'],
exclude: [
'**/node_modules/**',
'**/dist/**',
'**/.{idea,git,cache,output,temp}/**',
'./e2e/**',
'**/e2e/**',
'**/*.e2e.test.ts',
'**/*.spec.ts'
],
coverage: {
provider: 'v8',
reporter: ['text', 'json', 'html'],
exclude: [
'node_modules/**',
'dist/**',
'.agents/**',
'.claude/**',
'.windsurf/**'
]
},
},
});