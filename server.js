const path = require('path');
const express = require('express');
const { initDb } = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

app.get('/api/pieces', async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT id, title, level, description FROM pieces ORDER BY level, id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Could not load pieces.' });
  }
});

app.get('/api/my-book', async (req, res) => {
  try {
    const rows = await db.all(
      `SELECT book_entries.id, book_entries.position, pieces.id AS pieceId, pieces.title, pieces.level, pieces.description
       FROM book_entries
       JOIN pieces ON pieces.id = book_entries.piece_id
       ORDER BY book_entries.position ASC, book_entries.id ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Could not load your book.' });
  }
});

app.post('/api/my-book', async (req, res) => {
  const pieceId = Number.parseInt(req.body?.pieceId, 10);

  if (!Number.isInteger(pieceId)) {
    return res.status(400).json({ error: 'A valid pieceId is required.' });
  }

  try {
    const piece = await db.get('SELECT id FROM pieces WHERE id = ?', pieceId);

    if (!piece) {
      return res.status(404).json({ error: 'Piece not found.' });
    }

    const maxPositionRow = await db.get('SELECT MAX(position) AS maxPosition FROM book_entries');
    const nextPosition = (maxPositionRow?.maxPosition || 0) + 1;

    const result = await db.run(
      'INSERT INTO book_entries (piece_id, position) VALUES (?, ?)',
      pieceId,
      nextPosition
    );

    const newEntry = await db.get(
      `SELECT book_entries.id, book_entries.position, pieces.id AS pieceId, pieces.title, pieces.level, pieces.description
       FROM book_entries
       JOIN pieces ON pieces.id = book_entries.piece_id
       WHERE book_entries.id = ?`,
      result.lastID
    );

    return res.status(201).json(newEntry);
  } catch (error) {
    return res.status(500).json({ error: 'Could not add piece to your book.' });
  }
});

app.delete('/api/my-book/:entryId', async (req, res) => {
  const entryId = Number.parseInt(req.params.entryId, 10);

  if (!Number.isInteger(entryId)) {
    return res.status(400).json({ error: 'A valid entryId is required.' });
  }

  try {
    const existing = await db.get('SELECT id FROM book_entries WHERE id = ?', entryId);

    if (!existing) {
      return res.status(404).json({ error: 'Book entry not found.' });
    }

    await db.run('DELETE FROM book_entries WHERE id = ?', entryId);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Could not remove piece from your book.' });
  }
});

async function start() {
  db = await initDb(path.join(__dirname, 'data', 'my_music_folder.sqlite'));

  app.listen(PORT, () => {
    console.log(`My Music Folder running on http://localhost:${PORT}`);
  });
}

start();
