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

export { db };
