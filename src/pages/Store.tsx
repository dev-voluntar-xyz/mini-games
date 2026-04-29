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
      const response = await fetch(`/games/${gameInfo.id}/game.json`);
      if (!response.ok) throw new Error('Failed to fetch game details');

      const gameData = await response.json();

      const gameId = await db.games.add({
        title: gameData.title,
        description: gameData.description,
        htmlCode: gameData.htmlCode,
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
      <h1 className="text-3xl font-bold">App Store</h1>
      <p className="text-gray-600 dark:text-gray-400">Browse and install sample games.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableGames.map((game) => {
          const isInstalled = installedGameIds.has(game.title);
          return (
            <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
              <h2 className="text-xl font-semibold mb-2">{game.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 mb-4">
                {game.description}
              </p>
              <div className="mt-auto">
                {isInstalled ? (
                  <button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed py-2 rounded-md font-medium">
                    Installed
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(game)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
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
