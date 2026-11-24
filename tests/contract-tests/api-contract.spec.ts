import { test, expect } from '@playwright/test';
import { PactV4 } from '@pact-foundation/pact';
import path from 'path';

test('API contract test for user data endpoint', async ({ page }) => {
  const pact = new PactV4({
    consumer: 'IndiaRealTime Frontend',
    provider: 'IndiaRealTime API',
    port: 1234,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  await pact
    .addInteraction()
    .given('user exists')
    .uponReceiving('a request for user data')
    .withRequest('GET', '/api/user/123')
    .willRespondWith(200, (builder) =>
      builder.headers({ 'Content-Type': 'application/json' }).jsonBody({
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
      })
    )
    .executeTest(async (mockServer) => {
      const response = await page.request.get(`${mockServer.url}/api/user/123`);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
});

test('API contract test for user list endpoint', async ({ page }) => {
  const pact = new PactV4({
    consumer: 'IndiaRealTime Frontend',
    provider: 'IndiaRealTime API',
    port: 1235,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  await pact
    .addInteraction()
    .given('multiple users exist')
    .uponReceiving('a request for user list')
    .withRequest('GET', '/api/users')
    .willRespondWith(200, (builder) =>
      builder.headers({ 'Content-Type': 'application/json' }).jsonBody([
        { id: 123, name: 'John Doe', email: 'john@example.com' },
        { id: 456, name: 'Jane Smith', email: 'jane@example.com' },
      ])
    )
    .executeTest(async (mockServer) => {
      const response = await page.request.get(`${mockServer.url}/api/users`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(2);
    });
});
