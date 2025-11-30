/**
 * OPTIONS handler for CORS preflight requests
 */
export default defineEventHandler(async (event) => {
  // Set CORS headers for preflight
  setHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  });

  // Return empty response for OPTIONS
  setResponseStatus(event, 204);
  return '';
});