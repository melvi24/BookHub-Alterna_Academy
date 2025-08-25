import { Book } from '@prisma/client';

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

export interface SearchResult {
  items: GoogleBook[];
  totalItems: number;
}

export async function searchBooks(query: string, startIndex: number = 0, maxResults: number = 10): Promise<SearchResult> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&startIndex=${startIndex}&maxResults=${maxResults}&key=${
        process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || ''
      }`
    );

    if (!response.ok) {
      throw new Error('Error al buscar libros');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error);
    throw error;
  }
}

export function mapGoogleBookToBook(googleBook: GoogleBook): Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'userId'> {
  return {
    googleId: googleBook.id,
    title: googleBook.volumeInfo.title || 'Sin título',
    authors: googleBook.volumeInfo.authors ? googleBook.volumeInfo.authors.join(', ') : 'Autor desconocido',
    description: googleBook.volumeInfo.description || '',
    image: googleBook.volumeInfo.imageLinks?.thumbnail || '',
  };
}

export async function getBookById(bookId: string): Promise<GoogleBook | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${
        process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || ''
      }`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Error al obtener el libro');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener el libro:', error);
    throw error;
  }
}
