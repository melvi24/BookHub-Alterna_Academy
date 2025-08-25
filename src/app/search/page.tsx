'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { searchBooks } from '@/lib/api/books';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function SearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery(
    ['search', debouncedSearchTerm],
    () => searchBooks(debouncedSearchTerm, 0, 10),
    {
      enabled: debouncedSearchTerm.length > 0,
      select: (data) => (data?.items || []).slice(0, 10), // Limitar a 10 resultados
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex rounded-md shadow-sm">
                <div className="relative flex-grow focus-within:z-10">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-4 sm:text-sm border-gray-300"
                    placeholder="Buscar libros por título, autor o ISBN"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!searchTerm.trim()}
                  className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Buscar</span>
                </button>
              </div>
            </form>

            {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {isError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      Ocurrió un error al buscar libros. Por favor, inténtalo de nuevo más tarde.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {searchResults && searchResults.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron resultados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron libros que coincidan con tu búsqueda. Intenta con otros términos.
                </p>
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Resultados para: <span className="font-semibold">{debouncedSearchTerm}</span>
                </h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {searchResults.map((book) => (
                      <li key={book.id}>
                        <Link href={`/books/${book.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {book.volumeInfo.imageLinks?.thumbnail && (
                                  <div className="flex-shrink-0 h-20 w-14 mr-4">
                                    <img
                                      className="h-full w-full object-cover rounded"
                                      src={book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                                      alt={`Portada de ${book.volumeInfo.title}`}
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-indigo-600 truncate">
                                    {book.volumeInfo.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}
                                  </p>
                                  {book.volumeInfo.publishedDate && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      Publicado en: {new Date(book.volumeInfo.publishedDate).getFullYear()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <svg
                                  className="h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
