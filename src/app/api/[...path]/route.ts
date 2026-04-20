import { proxyApiRequest } from '@/lib/server-api-proxy';

export const runtime = 'nodejs';

const handleRequest = (request: Request) => proxyApiRequest(request);

export {
  handleRequest as DELETE,
  handleRequest as GET,
  handleRequest as HEAD,
  handleRequest as OPTIONS,
  handleRequest as PATCH,
  handleRequest as POST,
  handleRequest as PUT,
};