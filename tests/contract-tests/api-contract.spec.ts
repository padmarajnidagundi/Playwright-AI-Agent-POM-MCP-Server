import { test, expect } from '@playwright/test';
import { Pact } from '@pact-foundation/pact';
import path from 'path';

test('API contract test for user data endpoint', async ({ page }) => {
  const pact = new Pact({
    consumer: 'WeSendCV Frontend',
    provider: 'WeSendCV API',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  await pact.setup();

  // Define the expected interaction
  await pact.addInteraction({
    state: 'user exists',
    uponReceiving: 'a request for user data',
    withRequest: {
      method: 'GET',
      path: '/api/user/123',
    },
    willRespondWith: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  });

  // Make the request using Playwright's API testing
  const response = await page.request.get(
    `${pact.mockService.baseUrl}/api/user/123`
  );
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toEqual({
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
  });

  // Verify the pact
  await pact.verify();

  await pact.finalize();

});

test('API contract test for user list endpoint', async ({ page }) => {
  const pact = new Pact({
    consumer: 'WeSendCV Frontend',
    provider: 'WeSendCV API',
    port: 1235,
    log: path.resolve(process.cwd(), 'logs', 'pact-user-list.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

  await pact.setup();

  // Define the expected interaction for user list
  await pact.addInteraction({
    state: 'multiple users exist',
    uponReceiving: 'a request for user list',
    withRequest: {
      method: 'GET',
      path: '/api/users',
    },
    willRespondWith: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: [
        {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
        },
        {
          id: 456,
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      ],
    },
  });

  // Make the request using Playwright's API testing
  const response = await page.request.get(
    `${pact.mockService.baseUrl}/api/users`
  );
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThanOrEqual(2);
  expect(data[0]).toEqual({
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
  });
  expect(data[1]).toEqual({
    id: 456,
    name: 'Jane Smith',
    email: 'jane@example.com',
  });

  // Verify the pact
  await pact.verify();

  await pact.finalize();
});
