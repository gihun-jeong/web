// sidebar.js: handles sidebar toggle and AJAX page loading without refreshing the sidebar

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-btn');
  let isAnimating = false;
  const loader = document.getElementById('loader'); // optional loader element

  // Restore collapsed state on load
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

  // Toggle button click: expand/collapse sidebar
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isAnimating = true;
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });

  // After transition ends, allow next toggle
  sidebar.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'width') {
      isAnimating = false;
    }
  });

  // AJAX-based content loading (sidebar remains intact)
  function loadPage(url) {
    // show loader if exists
    if (loader) loader.classList.remove('hidden');

    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then((res) => res.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('#content');

        if (newContent) {
          const contentDiv = document.querySelector('#content');
          contentDiv.innerHTML = newContent.innerHTML;
          document.title = doc.title;
          window.history.pushState(null, '', url);

          // Execute only chart scripts (skip sidebar.js)
          newContent.querySelectorAll('script').forEach((oldScript) => {
            if (oldScript.src && oldScript.src.includes('sidebar.js')) return;
            const script = document.createElement('script');
            if (oldScript.src) script.src = oldScript.src;
            else script.textContent = oldScript.textContent;
            document.body.appendChild(script);
            document.body.removeChild(script);
          });
        }
      })
      .catch((err) => console.error('Page load error:', err))
      .finally(() => {
        if (loader) loader.classList.add('hidden');
      });
  }

  // Attach click handlers to menu links
  document.querySelectorAll('.menu-list a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      loadPage(link.href);
    });
  });

  // Handle back/forward navigation
  window.addEventListener('popstate', () => {
    loadPage(window.location.pathname);
  });
});