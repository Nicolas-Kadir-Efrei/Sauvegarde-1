'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  totalTournaments: number;
  totalTeams: number;
  upcomingMatches: Array<{
    id: string;
    tournament_name: string;
    opponent: string;
    date: string;
  }>;
  recentTournaments: Array<{
    id: string;
    name: string;
    start_date: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await fetch('/api/user/dashboard-stats');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-black">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">
          Bienvenue, {user?.name || 'Utilisateur'}
        </h1>
        <p className="text-black mt-2">
          Voici un aperçu de vos activités et tournois à venir.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-black">Mes Tournois</h3>
          <p className="text-3xl font-bold text-black">{stats?.totalTournaments || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-black">Mes Équipes</h3>
          <p className="text-3xl font-bold text-black">{stats?.totalTeams || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-black">Matchs à venir</h3>
          <p className="text-3xl font-bold text-black">
            {stats?.upcomingMatches.length || 0}
          </p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/tournaments/create"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">Créer un tournoi</h3>
          <p>Organisez votre propre tournoi e-sport</p>
        </Link>
        <Link
          href="/teams/create"
          className="bg-green-600 text-white p-6 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">Créer une équipe</h3>
          <p>Formez votre équipe et participez à des tournois</p>
        </Link>
      </div>

      {/* Matchs à venir */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Matchs à venir</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Tournoi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Adversaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.upcomingMatches.map((match) => (
                <tr key={match.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {match.tournament_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {match.opponent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {new Date(match.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.upcomingMatches || stats.upcomingMatches.length === 0) && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-black"
                  >
                    Aucun match à venir
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tournois récents */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-black">Mes tournois récents</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Date de début
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentTournaments.map((tournament) => (
                <tr key={tournament.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {tournament.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      tournament.status === 'upcoming'
                        ? 'bg-yellow-100 text-yellow-800'
                        : tournament.status === 'ongoing'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tournament.status === 'upcoming'
                        ? 'À venir'
                        : tournament.status === 'ongoing'
                        ? 'En cours'
                        : 'Terminé'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.recentTournaments || stats.recentTournaments.length === 0) && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-black"
                  >
                    Aucun tournoi récent
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
