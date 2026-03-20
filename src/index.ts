export interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/ai/')) {
      const anthropicPath = url.pathname.replace('/api/ai', '');
      const anthropicUrl = `https://api.anthropic.com${anthropicPath}`;

      const upstreamRequest = new Request(anthropicUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: request.body,
      });

      const response = await fetch(upstreamRequest);
      // Pass through response (including streaming SSE)
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
