export default defineEventHandler((event) => {
  // Устанавливаем CORS заголовки для всех запросов
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  setHeader(event, "Access-Control-Allow-Credentials", "true");
  setHeader(event, "Access-Control-Max-Age", "86400");

  // Обработка предварительных запросов OPTIONS
  if (event.node.req.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
    return;
  }
});