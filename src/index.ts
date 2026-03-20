<<<<<<< HEAD
export interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/ai/')) {
      const anthropicPath = url.pathname.replace('/api/ai', '');
      const anthropicUrl = `https://api.anthropic.com${anthropicPath}${url.search}`;

      // Forward original headers, then inject auth
      const forwardedHeaders = new Headers(request.headers);
      forwardedHeaders.set('x-api-key', env.ANTHROPIC_API_KEY);
      forwardedHeaders.set('anthropic-version', '2023-06-01');
      // Remove host header so it doesn't conflict with the upstream host
      forwardedHeaders.delete('host');
      forwardedHeaders.delete('origin');
      forwardedHeaders.delete('referer');

      const upstreamRequest = new Request(anthropicUrl, {
        method: request.method,
        headers: forwardedHeaders,
        body: request.body,
      });

      const response = await fetch(upstreamRequest);

      // Filter hop-by-hop headers that shouldn't be forwarded
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete('content-encoding');
      responseHeaders.delete('transfer-encoding');
      responseHeaders.set('access-control-allow-origin', '*');

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
=======
export default {
    fetch() {
      return new Response(`Running in ${navigator.userAgent}!`);
    },
  };
>>>>>>> 736d217 (cf setup)
