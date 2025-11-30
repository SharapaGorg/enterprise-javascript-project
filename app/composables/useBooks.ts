import type { BooksApiResponse, Book, BooksQueryParams } from "~~/types/books";
import { API_URL } from "~/constants";
import { createAuthHeaders } from "~/utils/auth";

export const useBooks = () => {
  /**
   * Получить список книг с фильтрацией и пагинацией
   */
  const getBooks = async (params: BooksQueryParams = {}) => {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append("query", params.query);
    if (params.author) queryParams.append("author", params.author);
    if (params.category) queryParams.append("category", params.category);
    if (params.language) queryParams.append("language", params.language);
    if (params.orderBy) queryParams.append("orderBy", params.orderBy);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_URL}/books${queryString ? `?${queryString}` : ""}`;

    const authConfig = await createAuthHeaders();
    const { data, pending, error } = await useFetch<BooksApiResponse>(url, {
      ...authConfig,
    });
    
    // Ждем завершения запроса
    while (pending.value) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (error.value) {
      console.error("Ошибка при загрузке книг:", error.value);
      return { books: [], total: 0, page: 1, limit: 20 };
    }

    console.log("Результат поиска книг:", data.value);
    return data.value || { books: [], total: 0, page: 1, limit: 20 };
  };

  /**
   * Получить информацию о конкретной книге
   */
  const getBookById = async (id: string) => {
    const authConfig = await createAuthHeaders();
    const { data, pending, error } = await useFetch<Book>(`${API_URL}/books/${id}`, {
      ...authConfig,
    });
    
    // Ждем завершения запроса
    while (pending.value) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (error.value) {
      console.error("Ошибка при загрузке книги:", error.value);
      return null;
    }
    
    return data.value;
  };

  /**
   * Поиск книг с реактивностью (для использования в компонентах)
   */
  const searchBooks = async (params: Ref<BooksQueryParams> | BooksQueryParams) => {
    const authConfig = await createAuthHeaders();
    return useFetch<BooksApiResponse>(API_URL + "/books", {
      query: params,
      key: "books",
      ...authConfig,
    });
  };

  /**
   * Получить книгу с реактивностью
   */
  const fetchBook = async (id: string | Ref<string>) => {
    const authConfig = await createAuthHeaders();
    return useFetch<Book>(`${API_URL}/books/${unref(id)}`, {
      key: `book-${unref(id)}`,
      ...authConfig,
    });
  };

  return {
    getBooks,
    getBookById,
    searchBooks,
    fetchBook,
  };
};
