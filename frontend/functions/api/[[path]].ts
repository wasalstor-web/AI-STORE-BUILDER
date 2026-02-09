/**
 * Cloudflare Pages Function — API Proxy
 * يمرر كل طلبات /api/* للباك إند عبر Cloudflare Tunnel
 */

interface Env {
  API_BACKEND_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const backendUrl = context.env.API_BACKEND_URL || 'https://constitutes-background-antibodies-subsequently.trycloudflare.com';

  // Build the target URL
  const url = new URL(context.request.url);
  const targetUrl = `${backendUrl}${url.pathname}${url.search}`;

  // Clone request with new URL
  const modifiedRequest = new Request(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
    redirect: 'follow',
  });

  // Remove host header to avoid issues
  modifiedRequest.headers.delete('host');

  try {
    const response = await fetch(modifiedRequest);

    // Clone response and add CORS headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return modifiedResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Backend unreachable', detail: String(error) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
