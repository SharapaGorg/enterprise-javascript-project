export default defineEventHandler(async (event) => {
  // Set CORS headers for all requests
  setHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
  });

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204);
    return '';
  }
});