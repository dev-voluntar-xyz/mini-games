import { db } from './src/db.js';

async function clear() {
  await db.games.clear();
  await db.levels.clear();
  await db.progress.clear();
  console.log('Database cleared.');
}

clear();
