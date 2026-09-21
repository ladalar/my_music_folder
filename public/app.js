(function () {
  const h = React.createElement;

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
            'section',
            { className: 'card' },
            h('h2', null, 'Build your own piano method book, one level at a time 🎹'),
            h(
              'p',
              null,
              'My Music Folder helps students and teachers choose pieces that fit each lesson. Pick songs from the library and create your own custom book for practice, screen viewing, or future printing.'
            ),
            h(
              'p',
              null,
              'For this demo, every Level 1 piece uses two friendly neighboring notes (C and D), very simple rhythms, and short 4-bar length ideal for a first piano lesson.'
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
      h('main', null, section, message ? h('section', { className: 'card' }, h('p', null, message)) : null)
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
