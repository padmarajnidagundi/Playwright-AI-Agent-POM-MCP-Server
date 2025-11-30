import { test, expect } from '@playwright/test';

/**
 * Unit Tests: Basic API Operations
 * Focus: Testing individual functions and utilities in isolation
 */

test.describe('Unit Tests - API Operations', () => {
  test('should parse URL correctly', () => {
    const url = 'https://wesendcv.com/profile';
    const parsed = new URL(url);
    expect(parsed.hostname).toBe('wesendcv.com');
    expect(parsed.pathname).toBe('/profile');
  });

  test('should validate email format', () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(validateEmail('test@example.com')).toBeTruthy();
    expect(validateEmail('invalid-email')).toBeFalsy();
  });

  test('should calculate request timeout correctly', () => {
    const calculateTimeout = (retries: number, baseTimeout: number) => baseTimeout * (retries + 1);
    expect(calculateTimeout(3, 5000)).toBe(20000);
    expect(calculateTimeout(0, 5000)).toBe(5000);
  });
});
