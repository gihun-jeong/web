(function() {
  // 사용자 관리 테이블 및 버튼 등 DOM 요소 가져오기
  const table = document.getElementById('users-table');
  const selectAll = document.getElementById('select-all');
  const addBtn = document.getElementById('add-btn');
  const editBtn = document.getElementById('edit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const editModal = document.getElementById('edit-modal');
  const addModal = document.getElementById('add-modal');
  const nameInput = document.getElementById('edit-name');
  const phoneInput = document.getElementById('edit-phone');
  const emailInput = document.getElementById('edit-email');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const addName = document.getElementById('add-name');
  const addPhone = document.getElementById('add-phone');
  const addEmail = document.getElementById('add-email');
  const createBtn = document.getElementById('create-btn');
  const cancelAdd = document.getElementById('cancel-add-btn');
  let selectedId = null; // 선택된 사용자 id

  // 버튼 활성화/비활성화 토글 함수
  function toggleButtons() {
    const checks = table.querySelectorAll('tbody .row-check');
    const checked = table.querySelectorAll('tbody .row-check:checked');
    selectAll.checked = (checked.length === checks.length && checks.length > 0);
    editBtn.disabled = (checked.length !== 1); // 1개만 선택 시 수정 가능
    deleteBtn.disabled = (checked.length < 1); // 1개 이상 선택 시 삭제 가능
    selectedId = checked.length === 1 ? checked[0].closest('tr').dataset.id : null;
  }

  // 전체 선택 체크박스 이벤트
  selectAll.addEventListener('change', () => {
    const checks = table.querySelectorAll('tbody .row-check');
    checks.forEach(cb => cb.checked = selectAll.checked);
    toggleButtons();
  });

  // 개별 체크박스 이벤트 (이벤트 위임)
  table.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-check')) {
      toggleButtons();
    }
  });

  // 추가 버튼 클릭 시 추가 모달 표시
  addBtn.addEventListener('click', () => {
    addName.value = '';
    addPhone.value = '';
    addEmail.value = '';
    addModal.classList.remove('hidden');
  });

  // 생성 버튼 클릭 시 서버에 사용자 추가 요청 (AJAX)
  createBtn.addEventListener('click', () => {
    fetch('/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: addName.value,
        phone: addPhone.value,
        email: addEmail.value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        location.reload(); // 성공 시 새로고침(실제 서비스에서는 DOM만 갱신 권장)
      }
    });
  });

  // 추가 모달 취소 버튼
  cancelAdd.addEventListener('click', () => {
    addModal.classList.add('hidden');
  });

  // 수정 버튼 클릭 시 수정 모달 표시
  editBtn.addEventListener('click', () => {
    if (!selectedId) return;
    const row = document.querySelector(`tr[data-id="${selectedId}"]`);
    nameInput.value = row.querySelector('.cell-name').textContent;
    phoneInput.value = row.querySelector('.cell-phone').textContent;
    emailInput.value = row.querySelector('.cell-email').textContent;
    editModal.classList.remove('hidden');
  });

  // 저장 버튼 클릭 시 서버에 사용자 정보 업데이트 요청 (AJAX)
  saveBtn.addEventListener('click', () => {
    if (!selectedId) return;
    fetch('/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedId,
        name: nameInput.value,
        phone: phoneInput.value,
        email: emailInput.value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        location.reload(); // 성공 시 새로고침(실제 서비스에서는 DOM만 갱신 권장)
      }
    });
  });

  // 수정 모달 취소 버튼
  cancelBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
  });

  // 삭제 버튼 클릭 시 선택된 사용자 모두 삭제 요청 (AJAX)
  deleteBtn.addEventListener('click', function(e) {
    e.preventDefault(); // 폼 제출/새로고침 방지
    const toDelete = Array.from(table.querySelectorAll('tbody .row-check:checked'))
      .map(cb => cb.closest('tr').dataset.id);
    if (toDelete.length === 0) return;
    // 여러 삭제 요청을 순차적으로 처리
    Promise.all(toDelete.map(id =>
      fetch('/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      }).then(res => res.json())
    )).then(results => {
      location.reload(); // 성공 시 새로고침(실제 서비스에서는 DOM만 갱신 권장)
    });
  });

  // 페이지 로드시 버튼 상태 초기화
  toggleButtons();
})();