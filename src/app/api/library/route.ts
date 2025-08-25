import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Book } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { googleId, title, authors, description, image } = await request.json();

    if (!googleId || !title) {
      return new NextResponse(
        JSON.stringify({ error: 'Datos del libro incompletos' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si el libro ya existe en la base de datos
    let book = await prisma.book.findUnique({
      where: { googleId },
    });

    // Si el libro no existe, crearlo
    if (!book) {
      book = await prisma.book.create({
        data: {
          googleId,
          title,
          authors,
          description: description || '',
          image: image || '',
        },
      });
    }

    // Verificar si el libro ya está en la biblioteca del usuario
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        bookId: book.id,
      },
    });

    if (existingFavorite) {
      return new NextResponse(
        JSON.stringify({ message: 'El libro ya está en tu biblioteca' }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Añadir el libro a la biblioteca del usuario
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        bookId: book.id,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: 'Libro añadido a tu biblioteca' }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al añadir a la biblioteca:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al procesar la solicitud' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Se requiere el ID de usuario' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new NextResponse(
      JSON.stringify(favorites), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al obtener la biblioteca:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener la biblioteca' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
