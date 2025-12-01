/**
 * Обработчик preflight запросов для /api/profile
 * OPTIONS /api/profile
 */
export default defineEventHandler((event) => {
  // Устанавливаем CORS заголовки
  appendResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  });
  
  // Возвращаем успешный ответ для preflight
  setResponseStatus(event, 204);
  return '';
});