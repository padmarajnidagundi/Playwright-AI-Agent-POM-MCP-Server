const baseURL = process.env.E2E_BASE_URL || 'https://indiarealtime.com';

export const URLS = {
  indiaRealtime: {
    base: baseURL,
    home: baseURL,
    invalidPage: '/invalid-page-that-does-not-exist',
    api: {
      posts: `${baseURL}/wp-json/wp/v2/posts`,
    },
  },
};
