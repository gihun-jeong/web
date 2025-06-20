// sidebar.js: 사이드바 토글 및 AJAX 페이지 로딩(사이드바는 그대로 유지)

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-btn');
  let isAnimating = false;
  const loader = document.getElementById('loader'); // 로딩 스피너

  // 페이지 로드시 사이드바 접힘/펼침 상태 복원(localStorage 사용)
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

  // 토글 버튼 클릭 시 사이드바 접힘/펼침
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isAnimating = true;
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });

  // 애니메이션 끝나면 다음 토글 허용
  sidebar.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'width') {
      isAnimating = false;
    }
  });

  // AJAX로 페이지 내용만 교체(사이드바는 그대로)
  function loadPage(url) {
    // 로딩 스피너 표시
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

          // 차트 등 필요한 script만 실행(사이드바 관련 js는 제외)
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

  // 메뉴 링크 클릭 시 AJAX로 페이지 로딩
  document.querySelectorAll('.menu-list a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      loadPage(link.href);
    });
  });

  // 브라우저 뒤로가기/앞으로가기 시에도 AJAX로 페이지 로딩
  window.addEventListener('popstate', () => {
    loadPage(window.location.pathname);
  });
});