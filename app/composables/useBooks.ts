import type { BooksApiResponse, Book, BooksQueryParams } from "~~/types/books";
import { API_URL } from "~/constants";

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
    const url = `/api/books${queryString ? `?${queryString}` : ""}`;

    return await $fetch<BooksApiResponse>(url);
  };

  /**
   * Получить информацию о конкретной книге
   */
  const getBookById = async (id: string) => {
    return await $fetch<Book>(`/api/books/${id}`);
  };

  /**
   * Поиск книг с реактивностью (для использования в компонентах)
   */
  const searchBooks = (params: Ref<BooksQueryParams> | BooksQueryParams) => {
    return useFetch<BooksApiResponse>(API_URL + "/books", {
      query: params,
      key: "books",
    });
  };

  /**
   * Получить книгу с реактивностью
   */
  const fetchBook = (id: string | Ref<string>) => {
    return useFetch<Book>(`/api/books/${unref(id)}`, {
      key: `book-${unref(id)}`,
    });
  };

  return {
    getBooks,
    getBookById,
    searchBooks,
    fetchBook,
  };
};
