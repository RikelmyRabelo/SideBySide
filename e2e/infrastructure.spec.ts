import { test, expect } from '@playwright/test';

test.describe('Infraestrutura local', () => {
  test('backend e frontend respondem', async ({ page, request }) => {
    const health = await request.get('http://localhost:3000/health');
    expect(health.ok()).toBeTruthy();
    expect((await health.json()).status).toBe('healthy');

    const readiness = await request.get('http://localhost:3000/health/ready');
    expect(readiness.ok()).toBeTruthy();
    expect((await readiness.json()).status).toBe('ready');

    await page.goto('http://localhost:5173');
    await expect(page).toHaveTitle(/SideBySide/i);
  });
});
