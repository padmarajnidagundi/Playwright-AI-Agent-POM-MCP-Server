import { test, expect } from '@playwright/test';
import { URLS } from '../data/urls';

/**
 * API Response Compare Tests
 * Focus: Testing actual API responses against expected structure and content
 */

test.describe('API Response Compare Tests', () => {
  test('should fetch and validate WordPress posts API response', async ({
    request,
  }) => {
    const response = await request.get(URLS.wesendcv.api.posts);
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);

    // Validate structure of at least one post if array is not empty
    if (posts.length > 0) {
      const post = posts[0];
      expect(post).toHaveProperty('id');
      expect(typeof post.id).toBe('number');

      expect(post).toHaveProperty('title');
      expect(post.title).toHaveProperty('rendered');
      expect(typeof post.title.rendered).toBe('string');

      expect(post).toHaveProperty('content');
      expect(post.content).toHaveProperty('rendered');
      expect(typeof post.content.rendered).toBe('string');

      expect(post).toHaveProperty('excerpt');
      expect(post.excerpt).toHaveProperty('rendered');
      expect(typeof post.excerpt.rendered).toBe('string');

      expect(post).toHaveProperty('date');
      expect(typeof post.date).toBe('string');

      expect(post).toHaveProperty('modified');
      expect(typeof post.modified).toBe('string');

      expect(post).toHaveProperty('slug');
      expect(typeof post.slug).toBe('string');

      expect(post).toHaveProperty('status');
      expect(typeof post.status).toBe('string');

      expect(post).toHaveProperty('type');
      expect(post.type).toBe('post');

      expect(post).toHaveProperty('link');
      expect(typeof post.link).toBe('string');
    }
  });

  test('negative: should handle invalid API endpoint', async ({ request }) => {
    const invalidUrl = `${URLS.wesendcv.base}/wp-json/wp/v2/invalid-endpoint`;
    const response = await request.get(invalidUrl);
    expect(response.status()).toBe(404);
  });
});
