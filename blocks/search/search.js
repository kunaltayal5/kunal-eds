const SEARCH_FIELDS = [
  'title',
  'description',
  'keywords',
  'author',
  'publishedDate',
  'category',
  'headings',
  'image',
  'imageAlt',
  'tags',
  'headings',
  'content',
];

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

export default function decorate(block) {
  block.innerHTML = `
    <div class="search-input-wrapper">
      <input type="text" placeholder="Search..." aria-label="Search">
      <button type="button">Search</button>
    </div>
    <div class="search-results"></div>
  `;

  const input = block.querySelector('input');
  const button = block.querySelector('button');
  const resultsContainer = block.querySelector('.search-results');

  async function performSearch(query) {
    if (!query.trim()) {
      resultsContainer.innerHTML = '';
      return;
    }

    resultsContainer.innerHTML = '<p>Searching...</p>';

    try {
      const response = await fetch('/custom-index.json');
      const data = await response.json();

      const results = data.data.filter((item) => matchesQuery(item, query));

      if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
      }

      resultsContainer.innerHTML = results.map((item) => `
        <div class="search-result-item">
          <h3><a href="${item.path}">${escapeHTML(item.title || item.path)}</a></h3>
          <p>${escapeHTML(item.description || '')}</p>
        </div>
      `).join('');
    } catch {
      resultsContainer.innerHTML = '<p>Search is not available right now.</p>';
    }
  }

  button.addEventListener('click', () => {
    performSearch(input.value);
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(input.value);
    }
  });
}
