import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour voir les équipes' },
        { status: 401 }
      );
    }

    // Récupérer toutes les équipes avec leurs membres
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Transformer les données pour inclure isOwner
    const transformedTeams = teams.map(team => ({
      ...team,
      members: team.members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      })),
      isOwner: team.members.some(
        member => member.user.id === session.user.id && member.role === 'CAPTAIN'
      ),
    }));

    return NextResponse.json(transformedTeams);
  } catch (error: any) {
    console.error('Error fetching all teams:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des équipes' },
      { status: 500 }
    );
  }
}
