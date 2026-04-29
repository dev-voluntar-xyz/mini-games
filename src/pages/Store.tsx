import { useState, useEffect } from 'react';
import { db } from '../db';

export default function Store() {
  const [availableGames, setAvailableGames] = useState<{id: string, title: string, description: string}[]>([]);
  const [installedGameIds, setInstalledGameIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch('/games/registry.json');
        if (response.ok) {
          const registry = await response.json();
          setAvailableGames(registry);
        }
      } catch (err) {
        console.error('Failed to load store registry', err);
      }

      const dbGames = await db.games.toArray();
      // Use title to check installation for now since ID isn't matching perfectly
      const installedTitles = new Set(dbGames.map(g => g.title));
      setInstalledGameIds(installedTitles);
      setLoading(false);
    };

    fetchStore();
  }, []);

  const handleInstall = async (gameInfo: {id: string, title: string, description: string}) => {
    try {
      const detailsResponse = await fetch(`/games/${gameInfo.id}/details.json`);
      if (!detailsResponse.ok) throw new Error('Failed to fetch game details');

      const htmlResponse = await fetch(`/games/${gameInfo.id}/index.html`);
      if (!htmlResponse.ok) throw new Error('Failed to fetch game HTML code');

      const gameData = await detailsResponse.json();
      const htmlCode = await htmlResponse.text();

      const gameId = await db.games.add({
        title: gameData.title,
        description: gameData.description,
        htmlCode: htmlCode,
        createdAt: Date.now() // eslint-disable-line react-hooks/purity
      });

      if (gameId !== undefined && gameData.levels && gameData.levels.length > 0) {
        const levelsToAdd = gameData.levels.map((l: {levelNumber: number, levelHtml: string}) => ({
          gameId,
          levelNumber: l.levelNumber,
          levelHtml: l.levelHtml
        }));
        await db.levels.bulkAdd(levelsToAdd);
      }

      setInstalledGameIds(prev => new Set(prev).add(gameData.title));
      alert(`Installed ${gameData.title}!`);
    } catch (err) {
      console.error('Error installing game:', err);
      alert('Failed to install game');
    }
  };

  if (loading) {
    return <div className="p-4">Loading store...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">App Store</h1>
      <p className="text-indigo-200 text-lg">Browse and install sample games.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {availableGames.map((game) => {
          const isInstalled = installedGameIds.has(game.title);
          return (
            <div key={game.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-5 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <h2 className="text-2xl font-bold text-white mb-2">{game.title}</h2>
              <p className="text-indigo-200 text-sm flex-1 mb-6 leading-relaxed">
                {game.description}
              </p>
              <div className="mt-auto">
                {isInstalled ? (
                  <button disabled className="w-full bg-white/5 border border-white/10 text-indigo-300/50 cursor-not-allowed py-2.5 rounded-lg font-semibold">
                    Installed
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(game)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white py-2.5 rounded-lg font-semibold shadow-md transition-colors"
                  >
                    Install
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
