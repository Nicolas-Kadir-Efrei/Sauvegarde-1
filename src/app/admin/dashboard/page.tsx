'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-black">Administration</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Statistiques Générales */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-black">Statistiques</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Utilisateurs:</span>
                  <span className="font-semibold text-black">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Tournois Actifs:</span>
                  <span className="font-semibold text-black">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Équipes Enregistrées:</span>
                  <span className="font-semibold text-black">0</span>
                </div>
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-black">Actions Rapides</h2>
              <div className="space-y-3">
                <Link 
                  href="/admin/users/create"
                  className="block w-full bg-green-600 text-white text-center px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Créer Utilisateur
                </Link>
                <Link 
                  href="/admin/tournaments/create"
                  className="block w-full bg-green-600 text-white text-center px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Créer Tournoi
                </Link>
              </div>
            </div>

            {/* Activité Récente */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-black">Activité Récente</h2>
              <div className="space-y-2">
                <p className="text-gray-600">Aucune activité récente</p>
              </div>
            </div>
          </div>

          {/* Gestion des Utilisateurs */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Derniers Utilisateurs</h2>
              <Link 
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800"
              >
                Voir tout →
              </Link>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">
                        Date d'inscription
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-gray-500" colSpan={3}>
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Gestion des Tournois */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Tournois Actifs</h2>
              <Link 
                href="/admin/tournaments"
                className="text-blue-600 hover:text-blue-800"
              >
                Voir tout →
              </Link>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-gray-500" colSpan={3}>
                        Aucun tournoi actif
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
