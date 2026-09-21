(function () {
  const h = React.createElement;
  const photoUrls = [
    'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
  ];

  function App() {
    const [view, setView] = React.useState('home');
    const [pieces, setPieces] = React.useState([]);
    const [myBook, setMyBook] = React.useState([]);
    const [message, setMessage] = React.useState('');

    const refreshData = React.useCallback(async () => {
      const [piecesResponse, bookResponse] = await Promise.all([
        fetch('/api/pieces'),
        fetch('/api/my-book')
      ]);
      setPieces(await piecesResponse.json());
      setMyBook(await bookResponse.json());
    }, []);

    React.useEffect(() => {
      refreshData();
    }, [refreshData]);

    const addToMyBook = async (pieceId) => {
      await fetch('/api/my-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieceId })
      });
      setMessage('Added to My Book!');
      refreshData();
    };

    const exportPdf = async () => {
      const response = await fetch('/api/my-book/export', { method: 'POST' });
      const data = await response.json();
      setMessage(data.message);
    };

    const section =
      view === 'home'
        ? h(
            React.Fragment,
            null,
            h(
              'section',
              { className: 'hero card' },
              h(
                'div',
                null,
                h('p', { className: 'eyebrow' }, 'Welcome, little musicians'),
                h('h2', null, 'Build your own piano book, page by page 🎹'),
                h(
                  'p',
                  null,
                  'My Music Folder helps students and teachers choose songs that fit each lesson. Mix and match pieces to create a custom beginner book for practice, screen viewing, and future printing.'
                ),
                h(
                  'p',
                  null,
                  'For this demo, each Level 1 song uses neighboring notes C and D, simple rhythms, and short 4-bar phrases.'
                )
              ),
              h(
                'div',
                { className: 'hero-image-grid' },
                photoUrls.map((url, index) =>
                  h('img', {
                    key: url,
                    src: url,
                    alt: `Young musician scene ${index + 1}`,
                    loading: 'lazy'
                  })
                )
              )
            )
          )
        : view === 'library'
          ? h(
              'section',
              { className: 'card' },
              h('h2', null, 'Browse Library'),
              h('p', null, 'Level 1 starter pieces for very first lessons.'),
              h(
                'div',
                { className: 'piece-grid' },
                pieces.map((piece) =>
                  h(
                    'article',
                    { className: 'card', key: piece.id },
                    h('div', { className: 'tag' }, piece.level),
                    h('h3', null, piece.title),
                    h('p', null, piece.description),
                    h('img', {
                      className: 'piece-image',
                      src: photoUrls[Number(piece.id.split('-')[1]) % photoUrls.length],
                      alt: `${piece.title} preview`,
                      loading: 'lazy'
                    }),
                    h('div', { className: 'preview' }, piece.preview),
                    h(
                      'button',
                      {
                        onClick: function () {
                          addToMyBook(piece.id);
                        },
                        disabled: myBook.some((selected) => selected.id === piece.id)
                      },
                      myBook.some((selected) => selected.id === piece.id) ? 'Added' : 'Add to My Book'
                    )
                  )
                )
              )
            )
          : h(
              'section',
              { className: 'card' },
              h('h2', null, 'My Book'),
              myBook.length
                ? h(
                    React.Fragment,
                    null,
                    h(
                      'ol',
                      null,
                      myBook.map((piece) =>
                        h(
                          'li',
                          { key: piece.id },
                          h('strong', null, piece.title),
                          h('div', null, piece.description)
                        )
                      )
                    ),
                    h(
                      'button',
                      {
                        onClick: exportPdf
                      },
                      'Export as PDF'
                    )
                  )
                : h('p', null, 'Your book is empty. Visit the library and add your first pieces!')
            );

    return h(
      'div',
      { className: 'app' },
      h(
        'header',
        null,
        h('h1', null, 'My Music Folder'),
        h('p', null, 'A warm, level-based piano library for students and families.'),
        h(
          'nav',
          null,
          h(
            'button',
            {
              className: view === 'home' ? '' : 'secondary',
              onClick: function () {
                setView('home');
              }
            },
            'Home'
          ),
          h(
            'button',
            {
              className: view === 'library' ? '' : 'secondary',
              onClick: function () {
                setView('library');
              }
            },
            'Library'
          ),
          h(
            'button',
            {
              className: view === 'my-book' ? '' : 'secondary',
              onClick: function () {
                setView('my-book');
              }
            },
            `My Book (${myBook.length})`
          )
        )
      ),
      h(
        'main',
        null,
        section,
        message ? h('section', { className: 'card notice-card' }, h('p', null, message)) : null
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
