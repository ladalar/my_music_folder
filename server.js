const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const pieces = [
  {
    id: 'l1-1',
    level: 'Level 1',
    title: 'C-D Little Steps',
    description: 'Uses two adjacent notes, C and D, with simple quarter-note rhythm across 4 bars.',
    preview: '🎼 4 bars · C-D-C-D'
  },
  {
    id: 'l1-2',
    level: 'Level 1',
    title: 'Neighbor Note Parade',
    description: 'A short 4-bar piece using C and D only, with easy repeated patterns.',
    preview: '🎼 4 bars · C-C-D-D'
  },
  {
    id: 'l1-3',
    level: 'Level 1',
    title: 'Tiny Rhythm Train',
    description: 'First-lesson piece with C and D adjacent notes and very simple rhythm changes.',
    preview: '🎼 4 bars · C-D-D-C'
  },
  {
    id: 'l1-4',
    level: 'Level 1',
    title: 'First Piano Echo',
    description: 'Gentle 4-bar call-and-response using only C and D for beginners.',
    preview: '🎼 4 bars · D-C-D-C'
  }
];

let myBook = [];

app.use(express.json());
app.use('/react', express.static(path.join(__dirname, 'node_modules/react/umd')));
app.use('/react-dom', express.static(path.join(__dirname, 'node_modules/react-dom/umd')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/pieces', (_req, res) => {
  res.json(pieces);
});

app.get('/api/my-book', (_req, res) => {
  const selectedPieces = myBook
    .map((pieceId) => pieces.find((piece) => piece.id === pieceId))
    .filter(Boolean);
  res.json(selectedPieces);
});

app.post('/api/my-book', (req, res) => {
  const { pieceId } = req.body;
  const piece = pieces.find((candidate) => candidate.id === pieceId);

  if (!piece) {
    return res.status(404).json({ error: 'Piece not found.' });
  }

  if (!myBook.includes(pieceId)) {
    myBook.push(pieceId);
  }

  return res.status(201).json({ success: true });
});

app.post('/api/my-book/export', (_req, res) => {
  res.json({
    success: true,
    message: 'PDF export is coming soon. For now, this is a demo placeholder action.'
  });
});

app.post('/api/my-book/reset', (_req, res) => {
  myBook = [];
  res.json({ success: true });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`My Music Folder demo running on http://localhost:${port}`);
});
