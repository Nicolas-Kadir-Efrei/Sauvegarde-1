import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';
import { TeamMember } from '@prisma/client';

interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour voir les détails de l\'équipe' },
        { status: 401 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: parseInt(params.id) },
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
        teamInvites: {
          where: {
            status: 'PENDING',
          },
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est membre de l'équipe
    const isMember = team.members.some(member => member.user.id === session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à cette équipe' },
        { status: 403 }
      );
    }

    // Transformer les données
    const transformedTeam = {
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
      pendingInvites: team.teamInvites,
    };

    return NextResponse.json(transformedTeam);
  } catch (error: any) {
    console.error('Error fetching team details:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des détails de l\'équipe' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour modifier l\'équipe' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est le capitaine
    const team = await prisma.team.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        members: {
          where: {
            userId: session.user.id,
            role: 'CAPTAIN',
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    if (team.members.length === 0) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas les droits pour modifier cette équipe' },
        { status: 403 }
      );
    }

    const { name, tag, description, logoUrl } = await request.json();

    // Vérifier si le nom ou le tag existe déjà
    const existingTeam = await prisma.team.findFirst({
      where: {
        OR: [
          {
            name: { equals: name, mode: 'insensitive' },
            id: { not: parseInt(params.id) },
          },
          {
            tag: { equals: tag, mode: 'insensitive' },
            id: { not: parseInt(params.id) },
          },
        ],
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Une équipe avec ce nom ou ce tag existe déjà' },
        { status: 400 }
      );
    }

    // Mettre à jour l'équipe
    const updatedTeam = await prisma.team.update({
      where: { id: parseInt(params.id) },
      data: {
        teamName: name,
        tag,
        description,
        logoUrl,
      },
    });

    return NextResponse.json(updatedTeam);
  } catch (error: any) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la modification de l\'équipe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour supprimer l\'équipe' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est le capitaine
    const team = await prisma.team.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        members: {
          where: {
            userId: session.user.id,
            role: 'CAPTAIN',
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    if (team.members.length === 0) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas les droits pour supprimer cette équipe' },
        { status: 403 }
      );
    }

    // Supprimer l'équipe
    await prisma.team.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'équipe' },
      { status: 500 }
    );
  }
}
