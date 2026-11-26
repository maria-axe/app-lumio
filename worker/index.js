import { handleApi } from './api.js';
import { json } from './http.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env);
      } catch (error) {
        console.error(error);
        return json({ error: 'Server error' }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
