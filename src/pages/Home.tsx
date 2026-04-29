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
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">My Games</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div key={game.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-5 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/20 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-2">{game.title}</h2>
            <p className="text-indigo-200 text-sm flex-1 mb-6 leading-relaxed">
              {game.description || 'No description provided.'}
            </p>
            <div className="flex space-x-3 mt-auto">
              <Link
                to={`/game/${game.id}`}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-2.5 rounded-lg font-semibold shadow-md transition-colors"
              >
                <Play size={18} />
                <span>Play</span>
              </Link>
              <Link
                to={`/game/${game.id}/edit`}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white py-2.5 rounded-lg font-semibold shadow-md transition-colors"
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
