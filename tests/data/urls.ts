const baseURL = process.env.E2E_BASE_URL || 'https://wesendcv.com';

export const URLS = {
  wesendcv: {
    base: baseURL,
    home: baseURL,
    invalidPage: '/invalid-page-that-does-not-exist',
    api: {
      posts: `${baseURL}/wp-json/wp/v2/posts`,
    },
  },
};
