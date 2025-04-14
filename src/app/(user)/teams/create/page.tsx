'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface UserSearchResult {
  id: string;
  email: string;
  name: string;
}

export default function CreateTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    logo_url: ''
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Le fichier est trop volumineux. Taille maximum : 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setLogoFile(file);
    }
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, logo_url: url });
    setLogoPreview(url);
    setLogoFile(null);
  };

  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSearchResults(data.filter((user: UserSearchResult) => 
        !selectedUsers.some(selected => selected.id === user.id)
      ));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = (user: UserSearchResult) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter(u => u.id !== user.id));
    setSearchQuery('');
  };

  const handleUserRemove = (user: UserSearchResult) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
  };

  const uploadLogo = async (): Promise<string> => {
    if (!logoFile) return formData.logo_url;

    const formData = new FormData();
    formData.append('file', logoFile);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Erreur lors de l\'upload du logo');
    }

    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload logo if file is selected
      const logoUrl = await uploadLogo();

      // Create team
      const teamRes = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          logo_url: logoUrl,
          invitedUsers: selectedUsers.map(u => u.id),
        }),
      });

      const teamData = await teamRes.json();

      if (!teamRes.ok) {
        throw new Error(teamData.error || 'Une erreur est survenue');
      }

      router.push('/teams');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-black">Créer une équipe</h1>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-black font-medium">
                  Nom de l&apos;équipe
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Nom de votre équipe"
                />
              </div>

              <div>
                <label htmlFor="tag" className="block mb-2 text-black font-medium">
                  Tag de l&apos;équipe
                </label>
                <input
                  type="text"
                  id="tag"
                  required
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Tag (ex: TSM, G2, etc.)"
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 text-black font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Description de votre équipe"
                />
              </div>
            </div>

            {/* Logo et membres */}
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-black font-medium">
                  Logo de l&apos;équipe
                </label>
                <div className="space-y-4">
                  {/* Logo preview */}
                  {logoPreview && (
                    <div className="relative w-32 h-32 mx-auto">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* File upload */}
                  <div>
                    <label className="block mb-2 text-sm text-black">
                      Importer une image
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="block w-full text-sm text-black
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>

                  {/* URL input */}
                  <div>
                    <label className="block mb-2 text-sm text-black">
                      Ou utiliser une URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={handleLogoUrlChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="https://exemple.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              {/* User search and invites */}
              <div>
                <label className="block mb-2 text-black font-medium">
                  Inviter des joueurs
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="Rechercher des joueurs..."
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-2">
                        {/* Add a loading spinner here */}
                        <span className="text-blue-500">Chargement...</span>
                      </div>
                    )}
                  </div>

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className="border border-gray-200 rounded-lg divide-y">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleUserSelect(user)}
                        >
                          <span className="text-black">{user.name || user.email}</span>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Inviter
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected users */}
                  {selectedUsers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-black mb-2">
                        Joueurs invités:
                      </h4>
                      <div className="space-y-2">
                        {selectedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                          >
                            <span className="text-black">{user.name || user.email}</span>
                            <button
                              type="button"
                              onClick={() => handleUserRemove(user)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Retirer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Création...' : 'Créer l\'équipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
