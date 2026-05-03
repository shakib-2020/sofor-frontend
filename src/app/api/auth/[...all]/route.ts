import { proxyApiRequest } from '@/lib/server-api-proxy';

export const runtime = 'nodejs';

const handleRequest = (request: Request) => proxyApiRequest(request);

export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS };