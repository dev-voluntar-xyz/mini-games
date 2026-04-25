import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Play, Edit } from 'lucide-react';
import { db } from '../db';

export default function Home() {
  const games = useLiveQuery(() => db.games.toArray());

  if (!games) {
    return <div className="p-4">Loading games...</div>;
  }

  if (games.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Games Found</h2>
        <p className="mb-4">You haven't added any games yet.</p>
        <Link to="/add" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          Add a Game
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Games</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">{game.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 mb-4">
              {game.description || 'No description provided.'}
            </p>
            <div className="flex space-x-2 mt-auto">
              <Link
                to={`/game/${game.id}`}
                className="flex-1 flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
              >
                <Play size={18} />
                <span>Play</span>
              </Link>
              <Link
                to={`/game/${game.id}/edit`}
                className="flex-1 flex items-center justify-center space-x-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-md font-medium"
              >
                <Edit size={18} />
                <span>Edit</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
