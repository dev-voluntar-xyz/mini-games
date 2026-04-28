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

    const snakeGameHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 1rem; margin: 0; background-color: #222; color: #fff; }
        canvas { background-color: #000; border: 2px solid #555; display: block; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        #score-board { display: flex; justify-content: space-around; font-size: 1.5rem; margin-bottom: 1rem; }
        .controls { margin-top: 1rem; color: #aaa; font-size: 0.9rem; }
    </style>
</head>
<body>
    <h1 id="level-title">Snake Game - Level 1</h1>
    <div id="score-board">
        <div>Score: <span id="score">0</span></div>
        <div>High Score: <span id="high-score">0</span></div>
    </div>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div class="controls">Use Arrow Keys to move.</div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gridSize = 20;
        let snake = [{ x: 200, y: 200 }];
        let food = { x: 100, y: 100 };
        let dx = 0;
        let dy = 0;
        let score = 0;
        let highScore = 0;
        let gameLoopTimeout;
        let currentLevelInfo = null;
        let baseSpeed = 150;
        let gameOver = false;

        const updateScoreDisplay = () => {
            document.getElementById('score').innerText = score;
            document.getElementById('high-score').innerText = highScore;
        };

        const drawRect = (x, y, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, gridSize - 2, gridSize - 2);
        };

        const randomFoodPosition = () => {
            return {
                x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
            };
        };

        const resetGame = () => {
            snake = [{ x: 200, y: 200 }];
            food = randomFoodPosition();
            dx = 0;
            dy = 0;
            score = 0;
            gameOver = false;
            updateScoreDisplay();
            gameLoop();
        };

        const update = () => {
            if (dx === 0 && dy === 0) return; // Not started moving yet

            const head = { x: snake[0].x + dx, y: snake[0].y + dy };

            // Wall collision
            if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
                gameOver = true;
                return;
            }

            // Self collision
            for (let i = 0; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver = true;
                    return;
                }
            }

            snake.unshift(head);

            // Food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                if (score > highScore) {
                    highScore = score;
                    saveProgress();
                }
                updateScoreDisplay();
                food = randomFoodPosition();
            } else {
                snake.pop();
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw food
            drawRect(food.x, food.y, 'red');

            // Draw snake
            snake.forEach((part, index) => {
                drawRect(part.x, part.y, index === 0 ? '#4CAF50' : '#81C784');
            });

            if (gameOver) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
                ctx.font = '20px Arial';
                ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 40);
            }
        };

        const gameLoop = () => {
            if (gameOver) {
                draw();
                return;
            }
            update();
            draw();
            let currentSpeed = baseSpeed - Math.min(score, 100);
            gameLoopTimeout = setTimeout(gameLoop, currentSpeed);
        };

        document.addEventListener('keydown', (e) => {
            if (gameOver && e.code === 'Space') {
                resetGame();
                return;
            }
            if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -gridSize; }
            if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = gridSize; }
            if (e.key === 'ArrowLeft' && dx === 0) { dx = -gridSize; dy = 0; }
            if (e.key === 'ArrowRight' && dx === 0) { dx = gridSize; dy = 0; }
        });

        const saveProgress = async () => {
            if (window.GameAPI) {
                await window.GameAPI.setProgress(JSON.stringify({ highScore }));
            }
        };

        const initGame = async () => {
            if (window.GameAPI) {
                try {
                    // Load progress
                    const progressDataStr = await window.GameAPI.getProgress();
                    if (progressDataStr) {
                        const progress = JSON.parse(progressDataStr);
                        if (progress.highScore) {
                            highScore = progress.highScore;
                        }
                    }

                    // Load level
                    currentLevelInfo = await window.GameAPI.getCurrentLevel();
                    if (currentLevelInfo && currentLevelInfo.levelHtml) {
                        try {
                           const levelData = JSON.parse(currentLevelInfo.levelHtml);
                           document.getElementById('level-title').innerText = levelData.title || ('Snake Game - Level ' + currentLevelInfo.levelNumber);
                           if (levelData.speed) {
                               baseSpeed = levelData.speed;
                           }
                        } catch(e) {
                           document.getElementById('level-title').innerText = 'Snake Game - Level ' + currentLevelInfo.levelNumber;
                        }
                    }
                } catch(e) {
                    console.error('Error initing Game API', e);
                }
            }
            updateScoreDisplay();
            draw(); // Draw initial state
        };

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

    const snakeGameId = await db.games.add({
      title: 'Classic Snake',
      description: 'A more complex arcade snake game with collision detection and speed levels.',
      htmlCode: snakeGameHtml,
      createdAt: Date.now() + 1000 // Ensure slightly different creation time
    });

    if (snakeGameId !== undefined) {
      await db.levels.bulkAdd([
        {
          gameId: snakeGameId,
          levelNumber: 1,
          levelHtml: JSON.stringify({ title: 'Level 1: Easy Peasy', speed: 150 })
        },
        {
          gameId: snakeGameId,
          levelNumber: 2,
          levelHtml: JSON.stringify({ title: 'Level 2: Getting Faster', speed: 100 })
        },
        {
          gameId: snakeGameId,
          levelNumber: 3,
          levelHtml: JSON.stringify({ title: 'Level 3: Light Speed', speed: 60 })
        }
      ]);
    }
  }
};

// Automatically try to seed when imported
seedDatabase().catch(console.error);

export { db };
