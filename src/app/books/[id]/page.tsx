'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBookById, mapGoogleBookToBook, type GoogleBook } from '@/lib/api/books';
import { useSession } from 'next-auth/react';
import { addToLibrary } from '@/lib/api/library';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function BookDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession() as { data: { user: SessionUser } | null };

  const { data: book, isLoading, error } = useQuery<GoogleBook | null>({
    queryKey: ['book', id],
    queryFn: () => getBookById(id as string),
    enabled: !!id,
  });

  const handleAddToLibrary = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (!book) return;

    try {
      const bookData = mapGoogleBookToBook(book);
      await addToLibrary(bookData, session.user.id);
      toast.success('Libro añadido a tu biblioteca');
    } catch (error) {
      console.error('Error al añadir a la biblioteca:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al añadir a la biblioteca';
      toast.error(errorMessage);
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar el libro</div>;
  if (!book || !book.volumeInfo) return <div>Libro no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="md:flex md:items-start md:space-x-8">
                <div className="flex-shrink-0 mb-6 md:mb-0">
                  {book.volumeInfo.imageLinks?.thumbnail ? (
                    <img
                      className="h-64 w-48 object-cover rounded-lg shadow-md"
                      src={book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                      alt={`Portada de ${book.volumeInfo.title}`}
                    />
                  ) : (
                    <div className="h-64 w-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      <span>Sin imagen</span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      onClick={handleAddToLibrary}
                      className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Añadir a mi biblioteca
                    </button>
                    
                    {book.volumeInfo.previewLink && (
                      <a
                        href={book.volumeInfo.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Vista previa
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{book.volumeInfo.title}</h1>
                  
                  {book.volumeInfo.subtitle && (
                    <h2 className="text-lg text-gray-600 mt-1">{book.volumeInfo.subtitle}</h2>
                  )}
                  
                  <p className="mt-2 text-sm text-gray-600">
                    {book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}
                  </p>
                  
                  <div className="mt-4">
                    {book.volumeInfo.publishedDate && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Publicado:</span>{' '}
                        {new Date(book.volumeInfo.publishedDate).toLocaleDateString()}
                      </p>
                    )}
                    
                    {book.volumeInfo.pageCount && (
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Páginas:</span> {book.volumeInfo.pageCount}
                      </p>
                    )}
                    
                    {book.volumeInfo.language && (
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Idioma:</span>{' '}
                        {book.volumeInfo.language.toUpperCase()}
                      </p>
                    )}
                    
                    {book.volumeInfo.categories && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {book.volumeInfo.categories.map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {book.volumeInfo.description && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900">Descripción</h3>
                      <div 
                        className="mt-2 prose max-w-none text-gray-500"
                        dangerouslySetInnerHTML={{ 
                          __html: book.volumeInfo.description.replace(/\n/g, '<br />') 
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 border-t border-gray-200 pt-5">
                <div className="flex justify-end">
                  <Link
                    href="/search"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Volver a la búsqueda
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
