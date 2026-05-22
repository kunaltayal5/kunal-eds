export default function decorate(block) {
  block.innerHTML = `
    <div class="search-container">
      <input type="text" class="search-input" placeholder="Search on this page..." />
      <button class="search-btn">Search</button>
      <div class="search-summary"></div>
    </div>
  `;

  const input = block.querySelector('.search-input');
  const btn = block.querySelector('.search-btn');
  const summary = block.querySelector('.search-summary');

  // Remove previous highlights
  function clearHighlights() {
    document.querySelectorAll('mark.search-highlight').forEach((mark) => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  // Highlight all matches on the page
  function highlightText(keyword) {
    clearHighlights();
    if (!keyword.trim()) {
      summary.textContent = '';
      return;
    }

    const searchBlock = block.closest('.search');
    let count = 0;

    // Walk through all text nodes on the page
    function walkNode(node) {
      // Skip the search block itself
      if (node === searchBlock) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const index = text.toLowerCase().indexOf(keyword.toLowerCase());
        if (index !== -1) {
          const before = document.createTextNode(text.slice(0, index));
          const mark = document.createElement('mark');
          mark.className = 'search-highlight';
          mark.textContent = text.slice(index, index + keyword.length);
          const after = document.createTextNode(text.slice(index + keyword.length));

          const parent = node.parentNode;
          parent.insertBefore(before, node);
          parent.insertBefore(mark, node);
          parent.insertBefore(after, node);
          parent.removeChild(node);
          count += 1;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script and style tags
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
        Array.from(node.childNodes).forEach(walkNode);
      }
    }

    walkNode(document.body);

    // Show result count
    if (count > 0) {
      summary.textContent = `${count} match(es) found`;
      summary.style.color = 'green';
      // Scroll to first match
      const first = document.querySelector('mark.search-highlight');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      summary.textContent = 'No matches found';
      summary.style.color = 'red';
    }
  }

  btn.addEventListener('click', () => {
    highlightText(input.value);
  });

  // Also search on Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') highlightText(input.value);
  });

  // Clear highlights when input is cleared
  input.addEventListener('input', () => {
    if (!input.value) {
      clearHighlights();
      summary.textContent = '';
    }
  });
}
