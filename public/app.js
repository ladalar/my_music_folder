const { useEffect, useState } = React;

function App() {
  const [pieces, setPieces] = useState([]);
  const [bookEntries, setBookEntries] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPieces();
    loadBook();
  }, []);

  async function loadPieces() {
    const response = await fetch('/api/pieces');
    const data = await response.json();
    setPieces(data);
  }

  async function loadBook() {
    const response = await fetch('/api/my-book');
    const data = await response.json();
    setBookEntries(data);
  }

  async function addToBook(pieceId) {
    const response = await fetch('/api/my-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pieceId })
    });

    if (response.ok) {
      await loadBook();
      setMessage('Piece added to your book.');
      clearToastSoon();
    }
  }

  async function removeFromBook(entryId) {
    const response = await fetch(`/api/my-book/${entryId}`, { method: 'DELETE' });

    if (response.ok) {
      await loadBook();
      setMessage('Piece removed from your book.');
      clearToastSoon();
    }
  }

  function exportPdfPlaceholder() {
    setMessage('PDF export is coming soon. For now, this is a placeholder action.');
    clearToastSoon();
  }

  function clearToastSoon() {
    window.clearTimeout(clearToastSoon.timer);
    clearToastSoon.timer = window.setTimeout(() => setMessage(''), 2200);
  }

  const levelOnePieces = pieces.filter((piece) => piece.level === 'Level 1');

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'header',
      null,
      React.createElement(
        'div',
        { className: 'container nav' },
        React.createElement('div', { className: 'brand' }, 'My Music Folder'),
        React.createElement(
          'nav',
          null,
          React.createElement('a', { href: '#how-it-works' }, 'How it works'),
          React.createElement('a', { href: '#library' }, 'Browse'),
          React.createElement('a', { href: '#my-book' }, 'My Book')
        )
      )
    ),
    React.createElement(
      'main',
      null,
      React.createElement(
        'section',
        { className: 'container hero' },
        React.createElement(
          'div',
          { className: 'hero-copy' },
          React.createElement('h1', null, 'Build your own piano book, one level at a time.'),
          React.createElement(
            'p',
            null,
            'My Music Folder replaces one-size-fits-all method books with a calm, curated library of leveled piano pieces. Browse, pick what fits your student, and assemble a personal lesson book in minutes.'
          ),
          React.createElement(
            'div',
            { className: 'hero-badges' },
            React.createElement('span', { className: 'badge' }, 'Leveled repertoire'),
            React.createElement('span', { className: 'badge' }, 'Teacher-friendly on iPad'),
            React.createElement('span', { className: 'badge' }, 'Build-your-own flow')
          )
        ),
        React.createElement(
          'div',
          { className: 'hero-image' },
          React.createElement('img', {
            src: 'https://github.com/user-attachments/assets/0fd57265-2362-490f-88b7-94b7addc3b54',
            alt: 'Warm illustrated piano scene in a sunlit room'
          })
        )
      ),
      React.createElement(
        'section',
        { id: 'how-it-works', className: 'section container' },
        React.createElement('h2', null, 'How it works'),
        React.createElement(
          'p',
          { className: 'section-intro' },
          'A simple three-step flow for first lessons and beyond.'
        ),
        React.createElement(
          'div',
          { className: 'steps' },
          React.createElement(
            'article',
            { className: 'step-card' },
            React.createElement('div', { className: 'step-icon browse' }, '1'),
            React.createElement('h3', null, 'Browse'),
            React.createElement(
              'p',
              null,
              'Start in Level 1 and explore beginner pieces designed around tiny, reachable musical ideas.'
            )
          ),
          React.createElement(
            'article',
            { className: 'step-card' },
            React.createElement('div', { className: 'step-icon pick' }, '2'),
            React.createElement('h3', null, 'Pick pieces'),
            React.createElement(
              'p',
              null,
              'Choose the pieces that match your learner today and add them into a custom sequence.'
            )
          ),
          React.createElement(
            'article',
            { className: 'step-card' },
            React.createElement('div', { className: 'step-icon build' }, '3'),
            React.createElement('h3', null, 'Build your book'),
            React.createElement(
              'p',
              null,
              'Review your running list on-screen and export as a printable PDF when ready.'
            )
          )
        )
      ),
      React.createElement(
        'section',
        { id: 'library', className: 'section container' },
        React.createElement('h2', null, 'Library: Level 1'),
        React.createElement(
          'p',
          { className: 'section-intro' },
          'These starter pieces use two adjacent notes, simple rhythms, and four bars for a very first lesson.'
        ),
        React.createElement(
          'div',
          { className: 'library-layout' },
          React.createElement(
            'div',
            { className: 'pieces-grid' },
            levelOnePieces.map((piece) =>
              React.createElement(
                'article',
                { className: 'piece-card', key: piece.id },
                React.createElement('span', { className: 'level-chip' }, piece.level),
                React.createElement('h3', null, piece.title),
                React.createElement('p', null, piece.description),
                React.createElement(
                  'button',
                  { className: 'secondary', onClick: () => addToBook(piece.id) },
                  'Add to My Book'
                )
              )
            )
          ),
          React.createElement(
            'aside',
            { id: 'my-book', className: 'book-card' },
            React.createElement('h3', null, 'My Book'),
            bookEntries.length === 0
              ? React.createElement(
                  'p',
                  { className: 'book-empty' },
                  'No pieces yet. Add from the Level 1 library to build your personalized book.'
                )
              : React.createElement(
                  'ol',
                  { className: 'book-list' },
                  bookEntries.map((entry) =>
                    React.createElement(
                      'li',
                      { key: entry.id },
                      React.createElement(
                        'div',
                        null,
                        React.createElement('span', null, entry.title),
                        React.createElement(
                          'button',
                          {
                            className: 'secondary',
                            onClick: () => removeFromBook(entry.id),
                            'aria-label': `Remove ${entry.title}`
                          },
                          'Remove'
                        )
                      )
                    )
                  )
                ),
            React.createElement(
              'button',
              {
                className: 'primary',
                onClick: exportPdfPlaceholder,
                disabled: bookEntries.length === 0
              },
              'Export as PDF'
            ),
            message && React.createElement('div', { className: 'toast' }, message)
          )
        )
      )
    ),
    React.createElement(
      'footer',
      null,
      React.createElement(
        'div',
        { className: 'container' },
        'My Music Folder · A leveled, build-your-own piano sheet music concept.'
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
