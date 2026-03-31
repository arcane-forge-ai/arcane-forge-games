'use client';

import { useState, useEffect, useRef } from 'react';
import { Game, CreateGameRequest, UpdateGameRequest } from '@/types';
import { generateSlug } from '@/lib/utils';

interface GameWithStats extends Game {
  stats?: {
    plays: number;
    likes: number;
    dislikes: number;
  }[];
}

interface ImageFieldProps {
  label: string;
  fieldKey: 'icon_url' | 'screenshot_url';
  value: string;
  onChange: (val: string) => void;
  adminToken: string;
  gameSlug: string;
  fallbackSrc: string;
  fallbackLabel: string;
  uploading: boolean;
  setUploading: (val: boolean) => void;
  onUploadError: (msg: string) => void;
}

function ImageField({
  label,
  fieldKey,
  value,
  onChange,
  adminToken,
  gameSlug,
  fallbackSrc,
  fallbackLabel,
  uploading,
  setUploading,
  onUploadError,
}: ImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const type = fieldKey === 'icon_url' ? 'icon' : 'screenshot';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!gameSlug.trim()) {
      onUploadError('Please enter a game slug before uploading files');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('game_slug', gameSlug.trim());
      fd.append('type', type);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      onUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const previewSrc = value.trim() || fallbackSrc;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">optional</span>
      </div>

      <div className="space-y-2">
        {/* Upload button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? 'Uploading...' : 'Upload file'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-2 text-gray-400 hover:text-red-500 rounded-lg text-sm transition-colors"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* URL input */}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 text-sm"
          placeholder="Or paste URL here"
        />

        {/* Preview */}
        <div className="flex items-center gap-2">
          <img
            src={previewSrc}
            alt="preview"
            className={`rounded-lg object-cover border border-gray-100 shadow-sm ${
              fieldKey === 'icon_url' ? 'w-10 h-10' : 'w-24 h-14'
            }`}
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
          />
          {!value.trim() && (
            <span className="text-xs text-gray-400">Using {fallbackLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  // null = create mode, Game = edit mode
  const [editingGame, setEditingGame] = useState<GameWithStats | null>(null);

  const blankForm = (): CreateGameRequest => ({
    slug: '',
    title: '',
    description: '',
    icon_url: '',
    screenshot_url: '',
    game_url: '',
  });

  const [formData, setFormData] = useState<CreateGameRequest>(blankForm());

  const isEditMode = editingGame !== null;

  const authenticate = () => {
    if (!adminToken.trim()) {
      setError('Admin token is required');
      return;
    }
    setIsAuthenticated(true);
    setError('');
    fetchGames();
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/admin/games', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setError('Invalid admin token');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch games');

      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isEditMode ? prev.slug : (prev.slug || generateSlug(title)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.game_url.trim()) {
      setError('Title, description, and game URL are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditMode) {
        // Update existing game
        const updatePayload: UpdateGameRequest = {
          title: formData.title,
          description: formData.description,
          icon_url: formData.icon_url,
          screenshot_url: formData.screenshot_url,
          game_url: formData.game_url,
        };

        const response = await fetch(`/api/admin/games/${editingGame.slug}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update game');
        }
      } else {
        // Create new game
        const response = await fetch('/api/admin/games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create game');
        }
      }

      setFormData(blankForm());
      setEditingGame(null);
      await fetchGames();
    } catch (err) {
      console.error('Error saving game:', err);
      setError(err instanceof Error ? err.message : 'Failed to save game');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (game: GameWithStats) => {
    setEditingGame(game);
    setFormData({
      slug: game.slug,
      title: game.title,
      description: game.description,
      icon_url: game.icon_url === '/logo.png' ? '' : game.icon_url,
      screenshot_url: game.screenshot_url === '/placeholder-screenshot.png' ? '' : game.screenshot_url,
      game_url: game.game_url,
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingGame(null);
    setFormData(blankForm());
    setError('');
  };

  const getGameStats = (game: GameWithStats) => {
    const stats = game.stats?.[0];
    return stats || { plays: 0, likes: 0, dislikes: 0 };
  };

  const uploadBusy = uploadingIcon || uploadingScreenshot;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black bg-opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
        </div>

        <div className="relative max-w-md w-full mx-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-600">Enter your admin token to manage games</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="admin-token" className="block text-sm font-semibold text-gray-700 mb-3">
                  Admin Token
                </label>
                <input
                  id="admin-token"
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  placeholder="Enter your admin token"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                  autoComplete="current-password"
                />
              </div>
              <button
                onClick={authenticate}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                Authenticate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Game Management</h1>
                <p className="text-blue-100">Admin Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setAdminToken('');
                setGames([]);
                setEditingGame(null);
                setFormData(blankForm());
              }}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditMode ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {isEditMode ? (
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    ) : (
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? `Editing: ${editingGame.title}` : 'Add New Game'}
                </h2>
              </div>
              {isEditMode && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Game Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                    placeholder="Enter game title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="game-slug"
                    required
                    readOnly={isEditMode}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 h-24 resize-none"
                  placeholder="Enter game description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ImageField
                  label="Icon"
                  fieldKey="icon_url"
                  value={formData.icon_url ?? ''}
                  onChange={(val) => setFormData((prev) => ({ ...prev, icon_url: val }))}
                  adminToken={adminToken}
                  gameSlug={formData.slug ?? ''}
                  fallbackSrc="/logo.png"
                  fallbackLabel="site logo"
                  uploading={uploadingIcon}
                  setUploading={setUploadingIcon}
                  onUploadError={(msg) => setError(msg)}
                />
                <ImageField
                  label="Screenshot"
                  fieldKey="screenshot_url"
                  value={formData.screenshot_url ?? ''}
                  onChange={(val) => setFormData((prev) => ({ ...prev, screenshot_url: val }))}
                  adminToken={adminToken}
                  gameSlug={formData.slug ?? ''}
                  fallbackSrc="/placeholder-screenshot.png"
                  fallbackLabel="placeholder"
                  uploading={uploadingScreenshot}
                  setUploading={setUploadingScreenshot}
                  onUploadError={(msg) => setError(msg)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Game URL</label>
                <input
                  type="url"
                  value={formData.game_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, game_url: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="https://example.com/game.html"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || uploadBusy}
                className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isEditMode
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEditMode ? 'Saving...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      {isEditMode ? (
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      ) : (
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      )}
                    </svg>
                    {isEditMode ? 'Save Changes' : 'Create Game'}
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Games List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Existing Games</h2>
                <p className="text-gray-600">Total: {games.length} games</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <span className="text-gray-600 font-medium">Loading games...</span>
                </div>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No games yet</h3>
                <p className="text-gray-600">Create your first game using the form on the left.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {games.map((game) => {
                  const stats = getGameStats(game);
                  const isCurrentlyEditing = editingGame?.id === game.id;
                  return (
                    <div
                      key={game.id}
                      className={`rounded-2xl p-4 border transition-all ${
                        isCurrentlyEditing
                          ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-300'
                          : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={game.icon_url}
                          alt={`${game.title} icon`}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{game.title}</h3>
                          <p className="text-sm text-gray-600 truncate">{game.description}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>🎮 {stats.plays}</span>
                            <span>👍 {stats.likes}</span>
                            <span>👎 {stats.dislikes}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(game)}
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrentlyEditing
                                ? 'bg-amber-400 text-white'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                            }`}
                            title="Edit game"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <a
                            href={`/games/${game.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                            title="View game"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
