import prisma from './prisma';

export type NotificationType = 
  | 'TEAM_INVITE'           // Invitation à rejoindre une équipe
  | 'TOURNAMENT_REQUEST'    // Demande de participation à un tournoi
  | 'REQUEST_ACCEPTED'      // Demande acceptée
  | 'REQUEST_REJECTED'      // Demande rejetée
  | 'TEAM_JOINED'          // Un joueur a rejoint l'équipe
  | 'TEAM_LEFT'            // Un joueur a quitté l'équipe
  | 'TOURNAMENT_STARTED'   // Le tournoi commence
  | 'MATCH_SCHEDULED'      // Un match a été programmé
  | 'MATCH_RESULT';        // Résultat d'un match

interface NotificationData {
  tournamentId?: number;
  teamId?: number;
  matchId?: number;
  [key: string]: any;
}

export async function sendNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  data?: NotificationData
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
      },
    });
    return notification;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    throw error;
  }
}

// Fonction utilitaire pour envoyer une notification d'invitation à une équipe
export async function sendTeamInvite(userId: number, teamName: string, teamId: number) {
  return sendNotification(
    userId,
    'TEAM_INVITE',
    'Invitation à rejoindre une équipe',
    `Vous avez été invité à rejoindre l'équipe ${teamName}`,
    { teamId }
  );
}

// Fonction utilitaire pour envoyer une notification de demande de participation à un tournoi
export async function sendTournamentRequest(userId: number, tournamentName: string, tournamentId: number) {
  return sendNotification(
    userId,
    'TOURNAMENT_REQUEST',
    'Nouvelle demande de participation',
    `Une demande de participation au tournoi ${tournamentName} a été envoyée`,
    { tournamentId }
  );
}

// Fonction utilitaire pour notifier l'acceptation d'une demande
export async function sendRequestAccepted(userId: number, tournamentName: string, tournamentId: number) {
  return sendNotification(
    userId,
    'REQUEST_ACCEPTED',
    'Demande acceptée',
    `Votre demande de participation au tournoi ${tournamentName} a été acceptée`,
    { tournamentId }
  );
}

// Fonction utilitaire pour notifier le rejet d'une demande
export async function sendRequestRejected(userId: number, tournamentName: string, tournamentId: number) {
  return sendNotification(
    userId,
    'REQUEST_REJECTED',
    'Demande rejetée',
    `Votre demande de participation au tournoi ${tournamentName} a été rejetée`,
    { tournamentId }
  );
}

// Fonction utilitaire pour notifier le début d'un tournoi
export async function sendTournamentStarted(userId: number, tournamentName: string, tournamentId: number) {
  return sendNotification(
    userId,
    'TOURNAMENT_STARTED',
    'Début du tournoi',
    `Le tournoi ${tournamentName} commence !`,
    { tournamentId }
  );
}

// Fonction utilitaire pour notifier la programmation d'un match
export async function sendMatchScheduled(
  userId: number,
  tournamentName: string,
  matchId: number,
  opponent: string,
  matchDate: Date
) {
  return sendNotification(
    userId,
    'MATCH_SCHEDULED',
    'Nouveau match programmé',
    `Votre prochain match contre ${opponent} dans le tournoi ${tournamentName} aura lieu le ${matchDate.toLocaleDateString('fr-FR')}`,
    { matchId }
  );
}
