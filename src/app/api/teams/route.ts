import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour créer une équipe' },
        { status: 401 }
      );
    }

    const { name, tag, description, logo_url } = await request.json();

    // Vérifier si le nom d'équipe existe déjà
    const existingTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { tag: { equals: tag, mode: 'insensitive' } },
        ],
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Une équipe avec ce nom ou ce tag existe déjà' },
        { status: 400 }
      );
    }

    // Créer l'équipe
    const team = await prisma.team.create({
      data: {
        name,
        tag,
        description,
        logo_url: logo_url || null,
        captain_id: session.user.id,
        members: {
          create: {
            user_id: session.user.id,
            role: 'CAPTAIN',
          },
        },
      },
    });

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'équipe' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour voir les équipes' },
        { status: 401 }
      );
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            user_id: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(teams);
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des équipes' },
      { status: 500 }
    );
  }
}
