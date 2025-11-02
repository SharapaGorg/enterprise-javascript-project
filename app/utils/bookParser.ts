/**
 * Утилиты для парсинга упоминаний книг из текста ИИ-ответов
 */

interface ParsedBook {
  title: string;
  author?: string;
  query: string; // Поисковый запрос для Google Books API
}

/**
 * Парсит текст сообщения ИИ и извлекает упоминания книг
 * 
 * Приоритет 1: Структурированный JSON формат (надежный метод)
 * Приоритет 2: Парсинг естественного языка (fallback)
 */
export function parseBookRecommendations(text: string): ParsedBook[] {
  const books: ParsedBook[] = [];
  
  // Удаляем HTML теги если есть
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  
  // ПРИОРИТЕТ 1: Парсинг структурированного JSON формата
  const structuredPattern = /---BOOKS_START---\s*([\s\S]*?)\s*---BOOKS_END---/;
  const structuredMatch = cleanText.match(structuredPattern);
  
  if (structuredMatch && structuredMatch[1]) {
    try {
      let jsonString = structuredMatch[1].trim();
      
      // Логируем для отладки
      console.log('Найден структурированный формат, JSON строка:', jsonString);
      
      // Пытаемся распарсить JSON
      const parsedBooks = JSON.parse(jsonString);
      
      if (Array.isArray(parsedBooks)) {
        for (const book of parsedBooks) {
          if (book.title && typeof book.title === 'string') {
            const title = book.title.trim();
            const author = book.author?.trim();
            
            if (title.length > 2 && title.length < 100) {
              books.push({
                title,
                author,
                query: author ? `${title} ${author}` : title,
              });
            }
          }
        }
        
        // Если успешно распарсили структурированный формат, возвращаем результат
        if (books.length > 0) {
          return books.slice(0, 5);
        }
      }
    } catch (error) {
      console.warn('Ошибка при парсинге структурированного формата книг:', error);
      // Продолжаем парсинг естественного языка как fallback
    }
  }
  
  // ПРИОРИТЕТ 2: Парсинг естественного языка (fallback)
  
  // Паттерн 1: Книги в кавычках «» или "" с автором
  const quotedWithAuthorPattern = /[«"]([^«"»"]+?)[»"]\s+(?:автор[аы]?|от|by)\s+([А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+)?)/gi;
  let match;
  
  while ((match = quotedWithAuthorPattern.exec(cleanText)) !== null) {
    const bookTitle = match[1]?.trim();
    const author = match[2]?.trim();
    
    if (bookTitle && bookTitle.length > 2 && bookTitle.length < 100 && author) {
      books.push({
        title: bookTitle,
        author,
        query: `${bookTitle} ${author}`,
      });
    }
  }
  
  // Паттерн 2: Нумерованный список с авторами (улучшенный)
  const numberedPattern = /\d+[\.\)]\s*[«"]?([^«"»"—–\n]+?)[»"]?\s*(?:[–—]|автор[аы]?|от|by)\s*([А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+)?)/gi;
  
  while ((match = numberedPattern.exec(cleanText)) !== null) {
    const title = match[1]?.trim().replace(/[«""»]/g, '').trim();
    const author = match[2]?.trim();
    
    if (title && title.length > 2 && title.length < 100 && author) {
      books.push({
        title,
        author,
        query: `${title} ${author}`,
      });
    }
  }
  
  // Паттерн 3: Формат "- "Название" Автор" (маркированный список)
  const bulletPattern = /[-•]\s*[«"]?([^«"»"—–\n]+?)[»"]?\s+([А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+)?)(?:\s*[\()]|$)/gi;
  
  while ((match = bulletPattern.exec(cleanText)) !== null) {
    const title = match[1]?.trim().replace(/[«""»]/g, '').trim();
    const author = match[2]?.trim();
    
    if (title && title.length > 2 && title.length < 100 && author) {
      books.push({
        title,
        author,
        query: `${title} ${author}`,
      });
    }
  }
  
  // Паттерн 4: Просто книги в кавычках (если еще не найдено)
  if (books.length === 0) {
    const quotedPattern = /[«"]([^«"»"]+?)[»"]/g;
    
    while ((match = quotedPattern.exec(cleanText)) !== null) {
      const bookTitle = match[1]?.trim();
      
      if (!bookTitle || bookTitle.length <= 2 || bookTitle.length >= 100) {
        continue;
      }
      
      // Пытаемся найти автора в контексте (до 100 символов после)
      const contextStart = match.index || 0;
      const contextEnd = Math.min(cleanText.length, contextStart + (match[0]?.length || 0) + 100);
      const context = cleanText.substring(contextStart, contextEnd);
      const authorMatch = context.match(/(?:автор[аы]?|от|by)\s+([А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+)?)/i);
      
      books.push({
        title: bookTitle,
        author: authorMatch ? authorMatch[1]?.trim() : undefined,
        query: authorMatch && authorMatch[1] ? `${bookTitle} ${authorMatch[1]}` : bookTitle,
      });
    }
  }
  
  // Удаляем дубликаты
  const uniqueBooks: ParsedBook[] = [];
  const seen = new Set<string>();
  
  for (const book of books) {
    const key = `${book.title.toLowerCase().trim()}_${book.author?.toLowerCase().trim() || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueBooks.push(book);
    }
  }
  
  // Ограничиваем до 5 книг
  return uniqueBooks.slice(0, 5);
}

/**
 * Проверяет, есть ли в тексте рекомендации книг
 */
export function hasBookRecommendations(text: string): boolean {
  const books = parseBookRecommendations(text);
  return books.length > 0;
}

