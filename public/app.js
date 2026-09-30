const { useEffect, useState } = React;

const FRONT_PAGE_ASSETS = {
  widgetImage: '/images/piano_image.jpg',
  printableImage: '/images/piano_image.jpg',
  coloringImage: '/images/piano_image.jpg'
};

function App() {
  const [pieces, setPieces] = useState([]);
  const [bookEntries, setBookEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(
    window.location.hash === '#front-page'
      ? 'front-page'
      : window.location.hash === '#my-book'
        ? 'my-book'
        : 'library'
  );
  const [showColoringPage, setShowColoringPage] = useState(false);
  const [selectedBookEntryId, setSelectedBookEntryId] = useState(null);

  useEffect(() => {
    loadPieces();
    loadBook();

    function updatePage() {
      setPage(
        window.location.hash === '#front-page'
          ? 'front-page'
          : window.location.hash === '#my-book'
            ? 'my-book'
            : 'library'
      );
    }

    window.addEventListener('hashchange', updatePage);
    return () => window.removeEventListener('hashchange', updatePage);
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
    setSelectedBookEntryId((currentId) =>
      data.some((entry) => entry.id === currentId) ? currentId : data[0]?.id || null
    );
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
    } else {
      const data = await response.json();
      setMessage(data.error || 'Could not add piece to your book.');
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

  function printMyBook() {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      setMessage('Please allow pop-ups to print your book.');
      clearToastSoon();
      return;
    }

    const escapeHtml = (value) =>
      String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    const pages = bookEntries
      .map((entry, index) => {
        const image = entry.title === 'Front page'
          ? `<img src="${FRONT_PAGE_ASSETS.widgetImage}" alt="${escapeHtml(entry.title)} preview" />`
          : '';

        return `
          <article class="page">
            <div class="page-number">Page ${index + 1} of ${bookEntries.length}</div>
            <div class="level">${escapeHtml(entry.level)}</div>
            <h2>${escapeHtml(entry.title)}</h2>
            ${image}
            <p>${escapeHtml(entry.description)}</p>
          </article>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>My Book</title>
          <style>
            @page { margin: 0.65in; }
            * { box-sizing: border-box; }
            body {
              color: #3b2f25;
              font-family: Arial, sans-serif;
              margin: 0;
            }
            .page {
              break-after: page;
              min-height: 9in;
              padding: 0.2in 0;
            }
            .page:last-child { break-after: auto; }
            .page-number {
              border-bottom: 1px solid #d8bf93;
              color: #6d5d4f;
              font-size: 10px;
              letter-spacing: 0.08em;
              margin-bottom: 28px;
              padding-bottom: 10px;
              text-transform: uppercase;
            }
            .level {
              color: #6d5d4f;
              font-size: 11px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            h2 {
              font-family: Georgia, serif;
              font-size: 30px;
              font-weight: normal;
              margin: 8px 0 18px;
            }
            img {
              display: block;
              max-height: 7in;
              max-width: 100%;
              object-fit: contain;
              margin: 0 0 20px;
            }
            p {
              color: #6d5d4f;
              font-size: 14px;
              line-height: 1.6;
              max-width: 6.5in;
            }
          </style>
        </head>
        <body>${pages}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });

    const images = Array.from(printWindow.document.images);
    const print = () => printWindow.print();
    const imageLoads = images.map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
    );

    Promise.all(imageLoads).then(print);
  }

  function clearToastSoon() {
    window.clearTimeout(clearToastSoon.timer);
    clearToastSoon.timer = window.setTimeout(() => setMessage(''), 2200);
  }

  const levelOnePieces = pieces.filter((piece) => piece.level === 'Level 1');
  const frontPagePiece = pieces.find((piece) => piece.title === 'Front page');
  const selectedBookEntry = bookEntries.find((entry) => entry.id === selectedBookEntryId);
  const selectedBookEntryIndex = bookEntries.findIndex(
    (entry) => entry.id === selectedBookEntryId
  );
  const selectedBookEntryImage = selectedBookEntry?.title === 'Front page'
    ? FRONT_PAGE_ASSETS.widgetImage
    : null;
  const bookPieceIds = new Set(bookEntries.map((entry) => entry.pieceId));

  function openFrontPage() {
    window.location.hash = 'front-page';
    setShowColoringPage(false);
  }

  function printFrontPage() {
    const imagePath = showColoringPage
      ? FRONT_PAGE_ASSETS.coloringImage
      : FRONT_PAGE_ASSETS.widgetImage;
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      setMessage('Please allow pop-ups to print the Front page.');
      clearToastSoon();
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Front Page</title>
          <style>
            @page { margin: 0; }
            html, body { margin: 0; min-height: 100%; }
            body { display: grid; place-items: center; }
            img { display: block; max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${imagePath}" alt="Front Page" />
        </body>
      </html>
    `);
    printWindow.document.close();

    const image = printWindow.document.querySelector('img');
    const print = () => {
      printWindow.focus();
      printWindow.print();
    };

    image.addEventListener('load', print, { once: true });
    image.addEventListener('error', () => {
      printWindow.close();
      setMessage('The Front page image could not be loaded for printing.');
      clearToastSoon();
    }, { once: true });

    if (image.complete) {
      print();
    }

    printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });
  }

  const frontPageSection = React.createElement(
    'section',
    { className: `container front-page-view${page === 'front-page' ? '' : ' page-hidden'}` },
    React.createElement(
      'button',
      {
        className: 'secondary front-page-back',
        onClick: () => {
          window.location.hash = 'library';
        }
      },
      'Back to Library'
    ),
    React.createElement(
      'div',
      { className: 'front-page-viewer' },
      React.createElement('img', {
        src: showColoringPage ? FRONT_PAGE_ASSETS.coloringImage : FRONT_PAGE_ASSETS.widgetImage,
        alt: showColoringPage
          ? 'Black-and-white Front page coloring book version'
          : 'Colored Front page',
        className: 'front-page-full-image'
      }),
      React.createElement(
        'div',
        { className: 'front-page-actions' },
        React.createElement(
          'button',
          { className: 'primary', onClick: printFrontPage },
          'Print'
        ),
        React.createElement(
          'button',
          {
            className: 'secondary',
            onClick: () => frontPagePiece && addToBook(frontPagePiece.id),
            disabled: !frontPagePiece || bookPieceIds.has(frontPagePiece.id)
          },
          bookPieceIds.has(frontPagePiece?.id) ? 'Already in My Book' : 'Add to My Book'
        ),
        React.createElement(
          'button',
          {
            className: 'secondary',
            onClick: () => setShowColoringPage((current) => !current)
          },
          showColoringPage ? 'View colored page' : 'Switch to coloring book'
        )
      )
    )
  );

  const myBookSection = React.createElement(
    'section',
    { className: `container my-book-page${page === 'my-book' ? '' : ' page-hidden'}` },
    React.createElement(
      'div',
      { className: 'book-page-header' },
      React.createElement(
        'div',
        null,
        React.createElement('span', { className: 'eyebrow' }, 'Your collection'),
        React.createElement('h1', null, 'My Book'),
        React.createElement(
          'p',
          { className: 'section-intro' },
          'Open a bookmark to view the content you have added to your book.'
        )
      ),
      React.createElement(
        'button',
        { className: 'secondary', onClick: () => { window.location.hash = 'library'; } },
        'Back to Library'
      )
    ),
    React.createElement(
      'div',
      { className: 'book-layout' },
      React.createElement(
        'nav',
        { className: 'bookmarks', 'aria-label': 'My Book bookmarks' },
        bookEntries.length
          ? bookEntries.map((entry, index) =>
              React.createElement(
                'button',
                {
                  className: `bookmark${entry.id === selectedBookEntryId ? ' active' : ''}`,
                  key: entry.id,
                  onClick: () => setSelectedBookEntryId(entry.id),
                  'aria-pressed': entry.id === selectedBookEntryId
                },
                React.createElement('span', { className: 'bookmark-number' }, String(index + 1).padStart(2, '0')),
                React.createElement('span', null, entry.title)
              )
            )
          : React.createElement('p', { className: 'book-empty' }, 'No bookmarks yet.')
      ),
      React.createElement(
        'article',
        { className: 'book-content' },
        selectedBookEntry
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                'div',
                { className: 'book-content-meta' },
                React.createElement('span', null, `Page ${selectedBookEntryIndex + 1} of ${bookEntries.length}`),
                React.createElement('span', { className: 'book-content-rule' })
              ),
              React.createElement('span', { className: 'level-chip' }, selectedBookEntry.level),
              React.createElement('h2', null, selectedBookEntry.title),
              selectedBookEntryImage &&
                React.createElement('img', {
                  className: 'book-content-image',
                  src: selectedBookEntryImage,
                  alt: `${selectedBookEntry.title} preview`
                }),
              React.createElement('p', null, selectedBookEntry.description),
              React.createElement(
                'button',
                {
                  className: 'secondary',
                  onClick: () => removeFromBook(selectedBookEntry.id)
                },
                'Remove from My Book'
              )
            )
          : React.createElement('p', { className: 'book-empty' }, 'Select a bookmark to view its content.')
      )
    ),
    React.createElement(
      'button',
      {
        className: 'primary',
        onClick: printMyBook,
        disabled: bookEntries.length === 0
      },
      'Print My Book'
    ),
    message && React.createElement('div', { className: 'toast' }, message)
  );

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
      frontPageSection,
      myBookSection,
      React.createElement(
        'section',
        { className: `container hero${page !== 'library' ? ' page-hidden' : ''}` },
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
            src: '/images/piano_image.jpg',
            alt: 'Warm illustrated piano scene in a sunlit room'
          })
        )
      ),
      React.createElement(
        'section',
        {
          id: 'how-it-works',
          className: `section container${page !== 'library' ? ' page-hidden' : ''}`
        },
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
        {
          id: 'library',
          className: `section container${page !== 'library' ? ' page-hidden' : ''}`
        },
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
                piece.title === 'Front page'
                  ? React.createElement(
                    React.Fragment,
                    null,
                    React.createElement('h3', null, 'Front Page'),
                    React.createElement('img', {
                      className: 'front-page-widget',
                      src: FRONT_PAGE_ASSETS.widgetImage,
                      alt: 'Front Page preview',
                      role: 'button',
                      tabIndex: 0,
                      onClick: openFrontPage,
                      onKeyDown: (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openFrontPage();
                        }
                      }
                    })
                  )
                  : React.createElement(
                      React.Fragment,
                      null,
                      React.createElement('span', { className: 'level-chip' }, piece.level),
                      React.createElement('h3', null, piece.title),
                      React.createElement('p', null, piece.description),
                      React.createElement(
                        'button',
                        {
                          className: 'secondary',
                          onClick: () => addToBook(piece.id),
                          disabled: bookPieceIds.has(piece.id)
                        },
                        bookPieceIds.has(piece.id) ? 'Already in My Book' : 'Add to My Book'
                      )
                    )
              )
            )
          ),
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
