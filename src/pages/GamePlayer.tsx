import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function GamePlayer() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id || '0', 10);
  
  const game = useLiveQuery(() => db.games.get(gameId), [gameId]);
  const levels = useLiveQuery(() => db.levels.where('gameId').equals(gameId).toArray(), [gameId]);
  
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-select first level when levels load
  useEffect(() => {
    if (levels && levels.length > 0 && !selectedLevelId) {
      setTimeout(() => setSelectedLevelId(levels[0].id || null), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels]);

  const currentLevel = levels?.find(l => l.id === selectedLevelId) || null;

  // Setup PostMessage API
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Basic security check (though we are using srcDoc which has same origin as parent)
      const data = event.data;
      
      if (!data || data.source !== 'GameAPI') return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const respond = (payload: any, error?: string) => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            source: 'GameAPI_Response',
            reqId: data.reqId,
            payload,
            error
          }, '*');
        }
      };

      try {
        switch (data.type) {
          case 'getProgress': {
            const progress = await db.progress.where('gameId').equals(gameId).first();
            respond(progress ? progress.progressData : null);
            break;
          }
          case 'setProgress': {
            const progressStr = data.payload;
            const existing = await db.progress.where('gameId').equals(gameId).first();
            if (existing && existing.id) {
              await db.progress.update(existing.id, { progressData: progressStr, lastPlayed: Date.now() });
            } else {
              await db.progress.add({ gameId, progressData: progressStr, lastPlayed: Date.now() });
            }
            respond(true);
            break;
          }
          case 'getCurrentLevel': {
            respond(currentLevel);
            break;
          }
          case 'getSettings': {
            const settingsArr = await db.settings.toArray();
            const settingsObj = settingsArr.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
            respond(settingsObj);
            break;
          }
          default:
            console.warn('Unknown GameAPI command:', data.type);
            respond(null, 'Unknown command');
        }
      } catch (err: unknown) {
        console.error('GameAPI Error:', err);
        respond(null, err instanceof Error ? err.message : 'Internal error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameId, currentLevel]);

  if (!game) return <div className="p-4">Loading game...</div>;

  // Build the complete HTML to inject
  const injectedHtml = `
    <script>
      // The injected GameAPI connects the game inside the iframe to the React app
      window.GameAPI = {
        _reqId: 0,
        _callbacks: {},
        
        _sendMsg: function(type, payload) {
          return new Promise((resolve, reject) => {
            const reqId = ++this._reqId;
            this._callbacks[reqId] = { resolve, reject };
            window.parent.postMessage({ source: 'GameAPI', type, payload, reqId }, '*');
          });
        },

        getProgress: function() { return this._sendMsg('getProgress'); },
        setProgress: function(data) { return this._sendMsg('setProgress', data); },
        getCurrentLevel: function() { return this._sendMsg('getCurrentLevel'); },
        getSettings: function() { return this._sendMsg('getSettings'); }
      };

      // Listen for responses from the parent
      window.addEventListener('message', function(event) {
        const data = event.data;
        if (data && data.source === 'GameAPI_Response') {
          const cb = window.GameAPI._callbacks[data.reqId];
          if (cb) {
            if (data.error) cb.reject(data.error);
            else cb.resolve(data.payload);
            delete window.GameAPI._callbacks[data.reqId];
          }
        }
      });

      // Announce API is ready
      window.dispatchEvent(new Event('GameAPIReady'));
    </script>
    ${game.htmlCode}
  `;

  // Force iframe reload when level changes to reset game state cleanly
  const iframeKey = `game-${gameId}-level-${selectedLevelId}`;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h1 className="text-xl font-bold">{game.title}</h1>
        
        {levels && levels.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Level:</label>
            <select
              className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={selectedLevelId || ''}
              onChange={(e) => setSelectedLevelId(parseInt(e.target.value, 10))}
            >
              {levels.map(level => (
                <option key={level.id} value={level.id}>
                  Level {level.levelNumber}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-black rounded-lg shadow overflow-hidden relative" style={{ minHeight: '60vh' }}>
         <iframe
            key={iframeKey}
            ref={iframeRef}
            srcDoc={injectedHtml}
            className="w-full h-full border-0 absolute inset-0"
            sandbox="allow-scripts allow-same-origin"
            title={`Game: ${game.title}`}
         />
      </div>
    </div>
  );
}
