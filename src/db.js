const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const seedPieces = [
  {
    title: 'C-D Echo',
    level: 'Level 1',
    description: 'Uses two adjacent notes (C and D), simple quarter-note rhythm, and 4 bars.'
  },
  {
    title: 'Little Step Song',
    level: 'Level 1',
    description: 'Uses only C and D with gentle repeated patterns in 4 short bars.'
  },
  {
    title: 'Morning Two-Note Tune',
    level: 'Level 1',
    description: 'A calm 4-bar melody with C-D motion and steady beginner rhythm.'
  },
  {
    title: 'First Lesson March',
    level: 'Level 1',
    description: 'A simple 4-bar march using adjacent notes C and D for first-time players.'
  }
];

async function initDb(dbFilePath) {
  const dir = path.dirname(dbFilePath);
  fs.mkdirSync(dir, { recursive: true });

  const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS pieces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS book_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      piece_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(piece_id) REFERENCES pieces(id)
    );
  `);

  const pieceCount = await db.get('SELECT COUNT(*) AS count FROM pieces');

  if (!pieceCount?.count) {
    const insert = await db.prepare(
      'INSERT INTO pieces (title, level, description) VALUES (?, ?, ?)'
    );

    for (const piece of seedPieces) {
      await insert.run(piece.title, piece.level, piece.description);
    }

    await insert.finalize();
  }

  return db;
}

module.exports = { initDb };
