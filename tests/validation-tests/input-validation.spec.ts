import { test, expect } from '@playwright/test';

/**
 * Validation Tests: Input Validation & Data Integrity
 * Focus: Testing input sanitization, format validation, and boundary conditions
 */

test.describe('Validation Tests - Input Validation', () => {
  const validateInput = {
    email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    phone: (phone: string) => /^\d{10,}$/.test(phone.replace(/\D/g, '')),
    url: (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    length: (text: string, min: number, max: number) =>
      text.length >= min && text.length <= max,
  };

  test('should validate email addresses correctly', () => {
    expect(validateInput.email('valid@example.com')).toBeTruthy();
    expect(validateInput.email('invalid.email')).toBeFalsy();
    expect(validateInput.email('test@domain.co.uk')).toBeTruthy();
  });

  test('should validate phone numbers correctly', () => {
    expect(validateInput.phone('1234567890')).toBeTruthy();
    expect(validateInput.phone('+1 (234) 567-8900')).toBeTruthy();
    expect(validateInput.phone('123')).toBeFalsy();
  });

  test('should validate URLs correctly', () => {
    expect(validateInput.url('https://wesendcv.com')).toBeTruthy();
    expect(validateInput.url('http://example.com/path')).toBeTruthy();
    expect(validateInput.url('not a url')).toBeFalsy();
  });

  test('should validate text length boundaries', () => {
    expect(validateInput.length('hello', 1, 10)).toBeTruthy();
    expect(validateInput.length('a', 5, 10)).toBeFalsy();
    expect(validateInput.length('toolongtext', 1, 5)).toBeFalsy();
  });

  test('should reject malicious input patterns', () => {
    const isSafe = (input: string) => !/[<>"'`]/g.test(input);
    expect(isSafe('normal text')).toBeTruthy();
    expect(isSafe('<script>alert("xss")</script>')).toBeFalsy();
    expect(isSafe("test's data")).toBeFalsy();
  });
});
