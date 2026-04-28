import 'server-only';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);

const getBackendOrigin = () => {
  const rawOrigin =
    process.env.BETTER_SERVER_URL ?? process.env.NEXT_PUBLIC_BETTER_SERVER;

  if (!rawOrigin) {
    throw new Error(
      'Missing BETTER_SERVER_URL or NEXT_PUBLIC_BETTER_SERVER for API proxying.'
    );
  }

  return new URL(rawOrigin);
};

const buildUpstreamHeaders = (request: Request) => {
  const headers = new Headers(request.headers);
  const requestUrl = new URL(request.url);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  headers.set(
    'x-forwarded-host',
    request.headers.get('x-forwarded-host') ??
      request.headers.get('host') ??
      requestUrl.host
  );
  headers.set(
    'x-forwarded-proto',
    request.headers.get('x-forwarded-proto') ??
      requestUrl.protocol.replace(':', '')
  );

  const forwardedPort =
    request.headers.get('x-forwarded-port') ?? requestUrl.port;
  if (forwardedPort) {
    headers.set('x-forwarded-port', forwardedPort);
  }

  return headers;
};

const getRequestBody = async (request: Request) => {
  if (METHODS_WITHOUT_BODY.has(request.method.toUpperCase())) {
    return undefined;
  }

  return request.arrayBuffer();
};

const buildResponseHeaders = (upstreamHeaders: Headers) => {
  const responseHeaders = new Headers();

  // Headers that should NOT be forwarded from upstream to client
  const headersToSkip = new Set([
    'set-cookie',
    'content-encoding', // Remove encoding headers - body is already decompressed by fetch
    'transfer-encoding',
    'content-length', // Let Next.js calculate this
  ]);

  upstreamHeaders.forEach((value, key) => {
    if (headersToSkip.has(key.toLowerCase())) {
      return;
    }

    responseHeaders.append(key, value);
  });

  const getSetCookie = (
    upstreamHeaders as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;

  if (typeof getSetCookie === 'function') {
    for (const cookie of getSetCookie.call(upstreamHeaders)) {
      responseHeaders.append('set-cookie', cookie);
    }
    return responseHeaders;
  }

  const setCookie = upstreamHeaders.get('set-cookie');
  if (setCookie) {
    responseHeaders.append('set-cookie', setCookie);
  }

  return responseHeaders;
};

export const proxyApiRequest = async (request: Request) => {
  const backendOrigin = getBackendOrigin();
  const requestUrl = new URL(request.url);
  const targetUrl = new URL(
    `${requestUrl.pathname}${requestUrl.search}`,
    backendOrigin
  );

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: buildUpstreamHeaders(request),
    body: await getRequestBody(request),
    redirect: 'manual',
    signal: request.signal,
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: buildResponseHeaders(upstreamResponse.headers),
  });
};