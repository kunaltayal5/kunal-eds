export default async function decorate(block) {
  block.innerHTML = `
    <div class="search-container">
      <input type="text" class="search-input" placeholder="Search across all pages..." />
      <button class="search-btn">Search</button>
      <div class="search-summary"></div>
      <ul class="search-results"></ul>
    </div>
  `;

  const input = block.querySelector('.search-input');
  const btn = block.querySelector('.search-btn');
  const summary = block.querySelector('.search-summary');
  const results = block.querySelector('.search-results');

  // Fetch query-index.json
  async function fetchIndex() {
    const resp = await fetch('/query-index.json');
    const json = await resp.json();
    return json.data;
  }

  // Search through all pages
  function searchPages(pages, keyword) {
    const kw = keyword.toLowerCase().trim();
    return pages.filter((page) => {
      const title = (page.title || '').toLowerCase();
      const description = (page.description || '').toLowerCase();
      const path = (page.path || '').toLowerCase();
      return title.includes(kw) || description.includes(kw) || path.includes(kw);
    });
  }

  // Highlight keyword in text
  function highlight(text, keyword) {
    if (!text) return '';
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Render results
  function renderResults(matches, keyword) {
    results.innerHTML = '';
    summary.textContent = '';

    if (matches.length === 0) {
      summary.textContent = 'No results found';
      summary.style.color = 'red';
      return;
    }

    summary.textContent = `${matches.length} result(s) found`;
    summary.style.color = 'green';

    matches.forEach((page) => {
      const li = document.createElement('li');
      li.className = 'search-result-item';
      li.innerHTML = `
        <a href="${page.path}" class="search-result-link">
          <h3>${highlight(page.title, keyword)}</h3>
          <p>${highlight(page.description, keyword)}</p>
          <span class="search-result-path">${page.path}</span>
        </a>
      `;
      results.appendChild(li);
    });
  }

  async function doSearch() {
    const keyword = input.value.trim();
    if (!keyword) {
      summary.textContent = '';
      results.innerHTML = '';
      return;
    }
    const pages = await fetchIndex();
    const matches = searchPages(pages, keyword);
    renderResults(matches, keyword);
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}