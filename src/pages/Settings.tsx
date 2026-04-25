import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2 } from 'lucide-react';

export default function Settings() {
  const settingsArr = useLiveQuery(() => db.settings.toArray());
  
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    
    await db.settings.put({ key: newKey.trim(), value: newValue });
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteSetting = async (key: string) => {
    await db.settings.delete(key);
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete ALL games, levels, and progress? This cannot be undone.')) {
      await db.games.clear();
      await db.levels.clear();
      await db.progress.clear();
      alert('All data cleared.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">App Settings</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Global Game Variables</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          These key/value pairs are exposed to all games via <code>GameAPI.getSettings()</code>.
        </p>

        {/* Existing Settings */}
        <div className="space-y-2 mt-4">
          {settingsArr?.map((setting) => (
            <div key={setting.key} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
              <div>
                <span className="font-mono font-bold text-sm">{setting.key}</span>
                <span className="mx-2 text-gray-400">=</span>
                <span className="font-mono text-sm text-gray-600 dark:text-gray-300">{setting.value}</span>
              </div>
              <button onClick={() => handleDeleteSetting(setting.key)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {settingsArr?.length === 0 && <p className="text-gray-500 text-sm">No global settings defined.</p>}
        </div>

        {/* Add Setting */}
        <form onSubmit={handleSaveSetting} className="flex space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
          <input
            type="text"
            placeholder="Key (e.g. soundEnabled)"
            className="flex-1 p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Value"
            className="flex-1 p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
            Save
          </button>
        </form>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg shadow space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
        <p className="text-sm text-red-600 dark:text-red-300">
          Delete all local game data, levels, and progress from this device.
        </p>
        <button 
          onClick={handleClearData}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
