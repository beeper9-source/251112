import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://nqwjvrznwzmfytjlpfsk.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd2p2cnpud3ptZnl0amxwZnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzc1MjAsImV4cCI6MjA3MTk1MzUyMH0.uPBYH5YZn2uZFXZr31MeDsVaU19hf-BIhnV1QzmbsZo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seminarForm = document.getElementById('seminar-form');
const seminarResetButton = document.getElementById('seminar-reset');
const seminarStatus = document.getElementById('seminar-status');
const seminarTableBody = document.getElementById('seminar-table-body');

const attendanceForm = document.getElementById('attendance-form');
const attendanceResetButton = document.getElementById('attendance-reset');
const attendanceStatus = document.getElementById('attendance-status');
const attendanceTableBody = document.getElementById('attendance-table-body');
const attendanceSeminarSelect = document.getElementById('attendance-seminar');

let seminarsCache = [];

const lunchLabel = {
  true: '중식 제공',
  false: '중식 미제공',
};

const dinnerLabel = {
  true: '석식 제공',
  false: '석식 미제공',
};

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('ko-KR');
}

function isoLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function showStatus(element, message, type = 'info') {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('error', 'success');
  if (type === 'error') {
    element.classList.add('error');
  } else if (type === 'success') {
    element.classList.add('success');
  }
  element.hidden = false;
}

function clearStatus(element) {
  if (!element) return;
  element.hidden = true;
  element.textContent = '';
  element.classList.remove('error', 'success');
}

function resetSeminarForm() {
  seminarForm.reset();
  seminarForm.querySelector('#seminar-id').value = '';
  document.getElementById('seminar-submit').textContent = '세미나 등록';
  clearStatus(seminarStatus);
  toggleLocationFields();
}

function resetAttendanceForm() {
  attendanceForm.reset();
  attendanceForm.querySelector('#attendance-id').value = '';
  document.getElementById('attendance-submit').textContent = '참석 신청 등록';
  clearStatus(attendanceStatus);
}

function toggleLocationFields() {
  const isOnline = document.getElementById('seminar-is-online').checked;
  document.getElementById('seminar-location').disabled = isOnline;
  document.getElementById('seminar-online-url').disabled = !isOnline;
}

document.getElementById('seminar-is-online').addEventListener('change', toggleLocationFields);

async function loadSeminars() {
  clearStatus(seminarStatus);
  const { data, error } = await supabase.from('it_seminars').select('*').order('start_at', { ascending: true });

  if (error) {
    showStatus(seminarStatus, `세미나 조회 중 오류: ${error.message}`, 'error');
    return;
  }

  seminarsCache = data ?? [];
  renderSeminars();
  populateSeminarOptions();
}

function renderSeminars() {
  seminarTableBody.innerHTML = '';

  if (!seminarsCache.length) {
    seminarTableBody.innerHTML =
      '<tr><td colspan="7" class="empty-state">등록된 세미나가 없습니다.</td></tr>';
    return;
  }

  seminarsCache.forEach((seminar) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="font-weight: 600">${seminar.title}</div>
        <div style="font-size: 12px; color: #64748b">${seminar.organizer ?? ''}</div>
      </td>
      <td>
        <div>${formatDateTime(seminar.start_at)}</div>
        <div style="font-size: 12px; color: #64748b">${formatDateTime(seminar.end_at)}</div>
      </td>
      <td>
        ${
          seminar.is_online
            ? '<div class="badge success">온라인</div>'
            : `<div>${seminar.location ?? '-'}</div>`
        }
      </td>
      <td>${seminar.capacity ?? '-'}</td>
      <td>
        <div class="badge ${seminar.lunch_provided ? 'success' : 'warning'}">
          ${lunchLabel[seminar.lunch_provided]}
        </div>
      </td>
      <td>
        <div class="badge ${seminar.dinner_provided ? 'success' : 'warning'}">
          ${dinnerLabel[seminar.dinner_provided]}
        </div>
      </td>
      <td>
        <div class="inline-actions">
          <button type="button" class="ghost" data-action="edit" data-id="${seminar.id}">수정</button>
          <button type="button" class="danger" data-action="delete" data-id="${seminar.id}">삭제</button>
        </div>
      </td>
    `;
    seminarTableBody.appendChild(tr);
  });
}

function populateSeminarOptions() {
  const currentValue = attendanceSeminarSelect.value;
  attendanceSeminarSelect.innerHTML = '<option value="">세미나를 선택하세요</option>';

  seminarsCache.forEach((seminar) => {
    const option = document.createElement('option');
    option.value = seminar.id;
    option.textContent = `${seminar.title} · ${formatDateTime(seminar.start_at)}`;
    attendanceSeminarSelect.appendChild(option);
  });

  if (seminarsCache.some((seminar) => seminar.id === currentValue)) {
    attendanceSeminarSelect.value = currentValue;
  }
}

seminarTableBody.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  if (!id) return;

  if (target.dataset.action === 'edit') {
    const seminar = seminarsCache.find((item) => item.id === id);
    if (!seminar) return;

    seminarForm.querySelector('#seminar-id').value = seminar.id;
    document.getElementById('seminar-title').value = seminar.title ?? '';
    document.getElementById('seminar-organizer').value = seminar.organizer ?? '';
    document.getElementById('seminar-location').value = seminar.location ?? '';
    document.getElementById('seminar-online-url').value = seminar.online_url ?? '';
    document.getElementById('seminar-start').value = isoLocal(seminar.start_at);
    document.getElementById('seminar-end').value = isoLocal(seminar.end_at);
    document.getElementById('seminar-capacity').value = seminar.capacity ?? '';
    document.getElementById('seminar-email').value = seminar.contact_email ?? '';
    document.getElementById('seminar-registration').value = seminar.registration_link ?? '';
    document.getElementById('seminar-description').value = seminar.description ?? '';
    document.getElementById('seminar-is-online').checked = Boolean(seminar.is_online);
    document.getElementById('seminar-lunch').checked = Boolean(seminar.lunch_provided);
    document.getElementById('seminar-dinner').checked = Boolean(seminar.dinner_provided);
    document.getElementById('seminar-submit').textContent = '세미나 수정';
    toggleLocationFields();
  }

  if (target.dataset.action === 'delete') {
    const confirmed = window.confirm('이 세미나를 삭제할까요? 관련 참석 신청도 함께 삭제됩니다.');
    if (!confirmed) return;
    const { error } = await supabase.from('it_seminars').delete().eq('id', id);
    if (error) {
      showStatus(seminarStatus, `삭제 중 오류: ${error.message}`, 'error');
      return;
    }
    showStatus(seminarStatus, '세미나를 삭제했습니다.', 'success');
    await loadSeminars();
    await loadAttendances();
  }
});

seminarForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus(seminarStatus);

  const formData = new FormData(seminarForm);
  const id = formData.get('id');
  const payload = {
    title: formData.get('title')?.trim(),
    organizer: formData.get('organizer')?.trim() || null,
    location: formData.get('location')?.trim() || null,
    online_url: formData.get('online_url')?.trim() || null,
    start_at: formData.get('start_at') ? new Date(formData.get('start_at')).toISOString() : null,
    end_at: formData.get('end_at') ? new Date(formData.get('end_at')).toISOString() : null,
    registration_link: formData.get('registration_link')?.trim() || null,
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    contact_email: formData.get('contact_email')?.trim() || null,
    description: formData.get('description')?.trim() || null,
    is_online: seminarForm.querySelector('#seminar-is-online').checked,
    lunch_provided: seminarForm.querySelector('#seminar-lunch').checked,
    dinner_provided: seminarForm.querySelector('#seminar-dinner').checked,
  };

  if (!payload.title || !payload.start_at) {
    showStatus(seminarStatus, '세미나명과 시작 일시는 필수입니다.', 'error');
    return;
  }

  const request = id
    ? supabase.from('it_seminars').update(payload).eq('id', id).select('id')
    : supabase.from('it_seminars').insert(payload).select('id');

  const { error } = await request;

  if (error) {
    showStatus(seminarStatus, `저장 중 오류: ${error.message}`, 'error');
    return;
  }

  showStatus(seminarStatus, '세미나 정보를 저장했습니다.', 'success');
  resetSeminarForm();
  await loadSeminars();
  await loadAttendances();
});

seminarResetButton.addEventListener('click', () => {
  resetSeminarForm();
});

attendanceTableBody.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  if (!id) return;

  if (target.dataset.action === 'edit') {
    const attendance = (await getAttendancesCache()).find((item) => item.id === id);
    if (!attendance) return;
    attendanceForm.querySelector('#attendance-id').value = attendance.id;
    attendanceForm.querySelector('#attendance-name').value = attendance.applicant_name ?? '';
    attendanceForm.querySelector('#attendance-seminar').value = attendance.seminar_id ?? '';
    document.getElementById('attendance-submit').textContent = '참석 신청 수정';
  }

  if (target.dataset.action === 'delete') {
    const confirmed = window.confirm('이 참석 신청을 삭제할까요?');
    if (!confirmed) return;
    const { error } = await supabase.from('it__attendances').delete().eq('id', id);
    if (error) {
      showStatus(attendanceStatus, `삭제 중 오류: ${error.message}`, 'error');
      return;
    }
    showStatus(attendanceStatus, '참석 신청을 삭제했습니다.', 'success');
    await loadAttendances();
  }
});

attendanceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus(attendanceStatus);

  const formData = new FormData(attendanceForm);
  const id = formData.get('id');
  const payload = {
    seminar_id: formData.get('seminar_id'),
    applicant_name: formData.get('applicant_name')?.trim(),
  };

  if (!payload.seminar_id || !payload.applicant_name) {
    showStatus(attendanceStatus, '세미나와 신청자 이름을 모두 입력하세요.', 'error');
    return;
  }

  const request = id
    ? supabase
        .from('it__attendances')
        .update({ seminar_id: payload.seminar_id, applicant_name: payload.applicant_name })
        .eq('id', id)
        .select('id')
    : supabase
        .from('it__attendances')
        .insert({ seminar_id: payload.seminar_id, applicant_name: payload.applicant_name })
        .select('id');

  const { error } = await request;

  if (error) {
    showStatus(attendanceStatus, `저장 중 오류: ${error.message}`, 'error');
    return;
  }

  showStatus(attendanceStatus, '참석 신청을 저장했습니다.', 'success');
  resetAttendanceForm();
  await loadAttendances();
});

attendanceResetButton.addEventListener('click', () => {
  resetAttendanceForm();
});

let attendancesCache = [];

async function getAttendancesCache() {
  if (attendancesCache.length) return attendancesCache;
  await loadAttendances();
  return attendancesCache;
}

async function loadAttendances() {
  clearStatus(attendanceStatus);
  const { data, error } = await supabase
    .from('it__attendances')
    .select('id, applicant_name, seminar_id, created_at, it_seminars(title, start_at)')
    .order('created_at', { ascending: false });

  if (error) {
    showStatus(attendanceStatus, `참석 신청 조회 중 오류: ${error.message}`, 'error');
    return;
  }

  attendancesCache = (data ?? []).map((item) => ({
    id: item.id,
    applicant_name: item.applicant_name,
    seminar_id: item.seminar_id,
    created_at: item.created_at,
    seminar: item.it_seminars,
  }));
  renderAttendances();
}

function renderAttendances() {
  attendanceTableBody.innerHTML = '';

  if (!attendancesCache.length) {
    attendanceTableBody.innerHTML =
      '<tr><td colspan="4" class="empty-state">등록된 참석 신청이 없습니다.</td></tr>';
    return;
  }

  attendancesCache.forEach((attendance) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${attendance.applicant_name}</td>
      <td>
        <div style="font-weight: 600">${attendance.seminar?.title ?? '-'}</div>
        <div style="font-size: 12px; color: #64748b">
          ${attendance.seminar?.start_at ? formatDateTime(attendance.seminar.start_at) : '-'}
        </div>
      </td>
      <td>${formatDateTime(attendance.created_at)}</td>
      <td>
        <div class="inline-actions">
          <button type="button" class="ghost" data-action="edit" data-id="${attendance.id}">수정</button>
          <button type="button" class="danger" data-action="delete" data-id="${attendance.id}">삭제</button>
        </div>
      </td>
    `;
    attendanceTableBody.appendChild(tr);
  });
}

resetSeminarForm();
resetAttendanceForm();
await loadSeminars();
await loadAttendances();
