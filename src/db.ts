import Dexie, { type EntityTable } from 'dexie';

export interface Game {
  id?: number;
  title: string;
  description: string;
  htmlCode: string;
  createdAt: number;
}

export interface Level {
  id?: number;
  gameId: number;
  levelNumber: number;
  levelHtml: string;
}

export interface Progress {
  id?: number;
  gameId: number;
  progressData: string; // JSON string to support dynamic structures
  lastPlayed: number;
}

export interface Settings {
  key: string;
  value: string; // JSON string or plain string
}

const db = new Dexie('MiniHtmlGamesDB') as Dexie & {
  games: EntityTable<Game, 'id'>;
  levels: EntityTable<Level, 'id'>;
  progress: EntityTable<Progress, 'id'>;
  settings: EntityTable<Settings, 'key'>;
};

// Schema declaration
db.version(1).stores({
  games: '++id, title, createdAt',
  levels: '++id, gameId, levelNumber',
  progress: '++id, gameId, lastPlayed',
  settings: 'key'
});

export const seedDatabase = async () => {
  const gamesCount = await db.games.count();
  
  if (gamesCount === 0) {
    console.log('Seeding initial game data...');
    
    // Simple clicker game HTML template using the GameAPI
    const clickerGameHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 2rem; }
        button { padding: 1rem 2rem; font-size: 1.2rem; cursor: pointer; }
        #score { font-size: 2rem; margin: 1rem 0; }
    </style>
</head>
<body>
    <h1>Clicker Game</h1>
    <h2 id="level-title">Level 1</h2>
    <div id="score">Score: 0</div>
    <button id="click-btn">Click Me!</button>

    <script>
        let score = 0;
        let currentLevelInfo = null;

        const updateScoreDisplay = () => {
            document.getElementById('score').innerText = 'Score: ' + score;
        };

        const initGame = async () => {
            if (window.GameAPI) {
                try {
                    // Load progress
                    const progressDataStr = await window.GameAPI.getProgress();
                    if (progressDataStr) {
                        const progress = JSON.parse(progressDataStr);
                        if (progress.score) {
                            score = progress.score;
                        }
                    }
                    
                    // Load level
                    currentLevelInfo = await window.GameAPI.getCurrentLevel();
                    if (currentLevelInfo && currentLevelInfo.levelHtml) {
                        try {
                           const levelData = JSON.parse(currentLevelInfo.levelHtml);
                           document.getElementById('level-title').innerText = levelData.title || ('Level ' + currentLevelInfo.levelNumber);
                        } catch(e) {
                           document.getElementById('level-title').innerText = 'Level ' + currentLevelInfo.levelNumber;
                        }
                    }
                } catch(e) {
                    console.error('Error initing Game API', e);
                }
            }
            updateScoreDisplay();
        };

        const saveProgress = async () => {
            if (window.GameAPI) {
                await window.GameAPI.setProgress(JSON.stringify({ score }));
            }
        };

        document.getElementById('click-btn').addEventListener('click', () => {
            let multiplier = 1;
            if (currentLevelInfo && currentLevelInfo.levelHtml) {
               try {
                  const levelData = JSON.parse(currentLevelInfo.levelHtml);
                  multiplier = levelData.multiplier || 1;
               } catch(e) {}
            }
            score += multiplier;
            updateScoreDisplay();
            saveProgress();
        });

        // Initialize when API is ready
        if (window.GameAPI) {
            initGame();
        } else {
            window.addEventListener('GameAPIReady', initGame);
        }
    </script>
</body>
</html>
    `;

    const gameId = await db.games.add({
      title: 'Simple Clicker',
      description: 'A basic clicker game to test the platform API.',
      htmlCode: clickerGameHtml,
      createdAt: Date.now()
    });

    if (gameId !== undefined) {
      await db.levels.bulkAdd([
        {
          gameId,
          levelNumber: 1,
          levelHtml: JSON.stringify({ title: 'Level 1: Basic Clicking', multiplier: 1 })
        },
        {
          gameId,
          levelNumber: 2,
          levelHtml: JSON.stringify({ title: 'Level 2: Double Points', multiplier: 2 })
        }
      ]);
    }
  }
};

// Automatically try to seed when imported
seedDatabase().catch(console.error);

export { db };
