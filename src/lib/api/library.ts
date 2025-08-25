import { Book } from '@prisma/client';

export interface AddToLibraryParams {
  googleId: string;
  title: string;
  authors: string;
  description?: string;
  image?: string;
}

export async function addToLibrary(book: AddToLibraryParams, userId: string) {
  const response = await fetch('/api/library', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...book,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al añadir a la biblioteca');
  }

  return response.json();
}

export async function getUserLibrary(userId: string) {
  const response = await fetch(`/api/library?userId=${userId}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener la biblioteca');
  }
  
  return response.json();
}

export async function removeFromLibrary(bookId: string) {
  const response = await fetch(`/api/library/${bookId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar de la biblioteca');
  }

  return response.json();
}

export async function updateBookNotes(bookId: string, notes: string) {
  const response = await fetch(`/api/library/${bookId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar las notas');
  }

  return response.json();
}
