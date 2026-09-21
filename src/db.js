const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

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

function initDb(dbFilePath) {
  const dir = path.dirname(dbFilePath);
  fs.mkdirSync(dir, { recursive: true });

  const db = new Database(dbFilePath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pieces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS book_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      piece_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(piece_id) REFERENCES pieces(id)
    );
  `);

  const pieceCount = db.prepare('SELECT COUNT(*) AS count FROM pieces').get();

  if (!pieceCount?.count) {
    const insert = db.prepare('INSERT INTO pieces (title, level, description) VALUES (?, ?, ?)');

    for (const piece of seedPieces) {
      insert.run(piece.title, piece.level, piece.description);
    }
  }

  return {
    all(sql, ...params) {
      return Promise.resolve(db.prepare(sql).all(...params));
    },
    get(sql, ...params) {
      return Promise.resolve(db.prepare(sql).get(...params));
    },
    run(sql, ...params) {
      const info = db.prepare(sql).run(...params);
      return Promise.resolve({
        lastID: Number(info.lastInsertRowid),
        changes: info.changes
      });
    }
  };
}

module.exports = { initDb };
