import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Plus } from 'lucide-react';

export default function EditGame() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id || '0', 10);
  const navigate = useNavigate();

  const game = useLiveQuery(() => db.games.get(gameId), [gameId]);
  const levels = useLiveQuery(() => db.levels.where('gameId').equals(gameId).toArray(), [gameId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  
  const [newLevelNum, setNewLevelNum] = useState('');
  const [newLevelHtml, setNewLevelHtml] = useState('');

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setDescription(game.description || '');
      setHtmlCode(game.htmlCode);
    }
  }, [game]);

  if (!game) return <div>Loading...</div>;

  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.games.update(gameId, { title, description, htmlCode });
    alert('Game updated!');
  };

  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newLevelNum, 10);
    if (!num || !newLevelHtml) return;

    await db.levels.add({
      gameId,
      levelNumber: num,
      levelHtml: newLevelHtml
    });
    setNewLevelNum('');
    setNewLevelHtml('');
  };

  const handleDeleteLevel = async (levelId: number) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      await db.levels.delete(levelId);
    }
  };

  const handleDeleteGame = async () => {
    if (window.confirm('Are you sure you want to delete this game and all its data?')) {
      await db.games.delete(gameId);
      await db.levels.where('gameId').equals(gameId).delete();
      await db.progress.where('gameId').equals(gameId).delete();
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Edit Game: {game.title}</h1>
        <form onSubmit={handleUpdateGame} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">HTML Code</label>
            <textarea
              className="w-full p-2 font-mono text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
              rows={8}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-between">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Update Game
            </button>
            <button type="button" onClick={handleDeleteGame} className="text-red-600 hover:text-red-800 font-medium">
              Delete Game
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Manage Levels</h2>
        
        {/* Existing Levels */}
        <div className="space-y-4 mb-6">
          {levels?.map(level => (
            <div key={level.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start">
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold mb-2">Level {level.levelNumber}</div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                  {level.levelHtml}
                </pre>
              </div>
              <button 
                onClick={() => level.id && handleDeleteLevel(level.id)}
                className="ml-4 text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {levels?.length === 0 && <p className="text-gray-500">No levels added yet.</p>}
        </div>

        {/* Add Level Form */}
        <form onSubmit={handleAddLevel} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-lg">Add New Level</h3>
          <div className="flex space-x-4">
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">Level #</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                value={newLevelNum}
                onChange={(e) => setNewLevelNum(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Level Data (JSON/HTML)</label>
              <textarea
                className="w-full p-2 font-mono text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                value={newLevelHtml}
                onChange={(e) => setNewLevelHtml(e.target.value)}
                required
                placeholder='{"title": "Level 1", "data": "..."}'
              />
            </div>
          </div>
          <button type="submit" className="flex items-center justify-center w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <Plus size={18} className="mr-2" /> Add Level
          </button>
        </form>
      </div>
    </div>
  );
}
