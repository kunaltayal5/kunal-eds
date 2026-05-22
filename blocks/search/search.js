const INDEX_PATH = '/query-index.json';

const SEARCH_FIELDS = [
  'title',
  'description',
  'keywords',
  'author',
  'publishedDate',
  'category',
  'tags',
  'headings',
  'content',
  'path',
];

let indexPromise;

function getSearchValue(item, field) {
  const value = item[field];

  if (Array.isArray(value)) {
    return value.join(' ');
  }

  return value || '';
}

function escapeHTML(value = '') {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function matchesQuery(item, query) {
  const searchText = query.toLowerCase();

  return SEARCH_FIELDS.some((field) => (
    getSearchValue(item, field).toString().toLowerCase().includes(searchText)
  ));
}

async function fetchIndex() {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_PATH)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load search index: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => json.data || []);
  }

  return indexPromise;
}

export default function decorate(block) {
  block.innerHTML = `
    <div class="search-input-wrapper">
      <input type="search" placeholder="Search..." aria-label="Search">
      <button type="button">Search</button>
    </div>
    <div class="search-summary" aria-live="polite"></div>
    <div class="search-results"></div>
  `;

  const input = block.querySelector('input');
  const button = block.querySelector('button');
  const summary = block.querySelector('.search-summary');
  const results = block.querySelector('.search-results');

  function clearResults() {
    summary.textContent = '';
    results.innerHTML = '';
  }

  function renderResults(matches) {
    if (matches.length === 0) {
      summary.textContent = 'No results found.';
      results.innerHTML = '';
      return;
    }

    summary.textContent = `${matches.length} result(s) found`;
    results.innerHTML = matches.map((item) => {
      const path = escapeHTML(item.path || '#');
      const title = escapeHTML(item.title || item.path || 'Untitled');
      const description = escapeHTML(item.description || '');

      return `
        <article class="search-result-item">
          <h3><a href="${path}">${title}</a></h3>
          ${description ? `<p>${description}</p>` : ''}
          <span class="search-result-path">${path}</span>
        </article>
      `;
    }).join('');
  }

  async function doSearch() {
    const query = input.value.trim();

    if (!query) {
      clearResults();
      return;
    }

    summary.textContent = 'Searching...';
    results.innerHTML = '';

    try {
      const pages = await fetchIndex();
      renderResults(pages.filter((page) => matchesQuery(page, query)));
    } catch {
      summary.textContent = 'Search is not available right now.';
    }
  }

  button.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}
