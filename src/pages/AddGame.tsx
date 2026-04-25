import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';

export default function AddGame() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [htmlCode, setHtmlCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !htmlCode) {
      alert('Title and HTML Code are required');
      return;
    }

    try {
      const id = await db.games.add({
        title,
        description,
        htmlCode,
        createdAt: Date.now()
      });
      navigate(`/game/${id}/edit`);
    } catch (err) {
      console.error('Error adding game:', err);
      alert('Failed to add game');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Game</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">HTML Code</label>
          <textarea
            className="w-full p-2 font-mono text-sm border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            rows={12}
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            placeholder="<!DOCTYPE html>&#10;<html>&#10;<body>...</body>&#10;</html>"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
        >
          Save Game
        </button>
      </form>
    </div>
  );
}
