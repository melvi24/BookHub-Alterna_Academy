declare module '@/lib/api/books' {
  export interface GoogleBook {
    id: string;
    volumeInfo: {
      title: string;
      subtitle?: string;
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

  export function searchBooks(query: string, startIndex?: number, maxResults?: number): Promise<SearchResult>;
  export function mapGoogleBookToBook(googleBook: GoogleBook): any;
  export function getBookById(bookId: string): Promise<GoogleBook | null>;
}

declare module '@/lib/api/library' {
  export interface AddToLibraryParams {
    googleId: string;
    title: string;
    authors: string;
    description?: string;
    image?: string;
  }

  export function addToLibrary(book: AddToLibraryParams, userId: string): Promise<any>;
  export function getUserLibrary(userId: string): Promise<any>;
  export function removeFromLibrary(bookId: string): Promise<void>;
  export function updateBookNotes(bookId: string, notes: string): Promise<any>;
}

declare module '@/components/Navbar' {
  import { FC } from 'react';
  const Navbar: FC;
  export default Navbar;
}
