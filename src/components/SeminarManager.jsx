import { useEffect, useMemo, useState } from 'react';
import { useSeminars, emptySeminar } from '../hooks/useSeminars.js';

const lunchLabel = {
  true: '중식 제공',
  false: '중식 미제공',
};

const dinnerLabel = {
  true: '석식 제공',
  false: '석식 미제공',
};

export const SeminarManager = ({ onSeminarsChange }) => {
  const {
    seminars,
    loading,
    error,
    editingSeminar,
    editingValues,
    setEditingSeminar,
    resetEditing,
    upsertSeminar,
    removeSeminar,
  } = useSeminars();
  const [formValues, setFormValues] = useState(editingValues);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormValues(editingValues);
  }, [editingValues]);

  useEffect(() => {
    onSeminarsChange?.(seminars);
  }, [seminars, onSeminarsChange]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await upsertSeminar(formValues);
    setSubmitting(false);
    if (result) {
      setFormValues(emptySeminar);
    }
  };

  const handleEdit = (record) => {
    setEditingSeminar(record);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 세미나를 삭제할까요? 관련 참석 신청도 함께 삭제됩니다.')) return;
    await removeSeminar(id);
  };

  const resetForm = () => {
    resetEditing();
    setFormValues(emptySeminar);
  };

  const formattedSeminars = useMemo(
    () =>
      seminars.map((seminar) => ({
        ...seminar,
        startDisplay: seminar.start_at ? new Date(seminar.start_at).toLocaleString('ko-KR') : '-',
        endDisplay: seminar.end_at ? new Date(seminar.end_at).toLocaleString('ko-KR') : '-',
      })),
    [seminars],
  );

  return (
    <section>
      <div className="section-header">
        <h2>세미나 관리</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          세미나명
          <input
            name="title"
            value={formValues.title}
            onChange={handleChange}
            placeholder="예) AI 트렌드 2026"
            required
          />
        </label>
        <label>
          주최
          <input
            name="organizer"
            value={formValues.organizer}
            onChange={handleChange}
            placeholder="주최 기관"
          />
        </label>
        <label>
          장소 (오프라인)
          <input
            name="location"
            value={formValues.location}
            onChange={handleChange}
            placeholder="예) 서울 강남구 ..."
            disabled={formValues.is_online}
          />
        </label>
        <label>
          온라인 세미나 URL
          <input
            name="online_url"
            value={formValues.online_url}
            onChange={handleChange}
            placeholder="https://..."
            disabled={!formValues.is_online}
          />
        </label>
        <label>
          시작 일시
          <input
            type="datetime-local"
            name="start_at"
            value={formValues.start_at}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          종료 일시
          <input
            type="datetime-local"
            name="end_at"
            value={formValues.end_at}
            onChange={handleChange}
          />
        </label>
        <label>
          참가 정원
          <input
            type="number"
            name="capacity"
            value={formValues.capacity}
            onChange={handleChange}
            placeholder="숫자 입력"
            min="1"
          />
        </label>
        <label>
          연락 이메일
          <input
            type="email"
            name="contact_email"
            value={formValues.contact_email}
            onChange={handleChange}
            placeholder="contact@example.com"
          />
        </label>
        <label>
          신청 링크
          <input
            name="registration_link"
            value={formValues.registration_link}
            onChange={handleChange}
            placeholder="https://..."
          />
        </label>
        <label style={{ gridColumn: 'span 2' }}>
          설명
          <textarea
            name="description"
            value={formValues.description}
            onChange={handleChange}
            rows={3}
            placeholder="세미나 소개를 입력하세요"
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="is_online"
            checked={formValues.is_online}
            onChange={handleChange}
          />
          온라인 세미나
        </label>
        <label>
          <input
            type="checkbox"
            name="lunch_provided"
            checked={formValues.lunch_provided}
            onChange={handleChange}
          />
          중식 제공
        </label>
        <label>
          <input
            type="checkbox"
            name="dinner_provided"
            checked={formValues.dinner_provided}
            onChange={handleChange}
          />
          석식 제공
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="submit" className="primary" disabled={submitting || loading}>
            {editingSeminar ? '세미나 수정' : '세미나 등록'}
          </button>
          <button type="button" className="ghost" onClick={resetForm} disabled={submitting || loading}>
            초기화
          </button>
        </div>
      </form>
      {error && <div className="badge warning">오류: {error}</div>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>세미나명</th>
              <th>일정</th>
              <th>장소/온라인</th>
              <th>정원</th>
              <th>중식</th>
              <th>석식</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {formattedSeminars.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">
                  등록된 세미나가 없습니다.
                </td>
              </tr>
            )}
            {formattedSeminars.map((seminar) => (
              <tr key={seminar.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{seminar.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{seminar.organizer}</div>
                </td>
                <td>
                  <div>{seminar.startDisplay}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{seminar.endDisplay}</div>
                </td>
                <td>
                  {seminar.is_online ? (
                    <div className="badge success">온라인</div>
                  ) : (
                    <div>{seminar.location || '-'}</div>
                  )}
                </td>
                <td>{seminar.capacity ?? '-'}</td>
                <td>
                  <div className={`badge ${seminar.lunch_provided ? 'success' : 'warning'}`}>
                    {lunchLabel[seminar.lunch_provided]}
                  </div>
                </td>
                <td>
                  <div className={`badge ${seminar.dinner_provided ? 'success' : 'warning'}`}>
                    {dinnerLabel[seminar.dinner_provided]}
                  </div>
                </td>
                <td>
                  <div className="inline-actions">
                    <button type="button" className="ghost" onClick={() => handleEdit(seminar)}>
                      수정
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(seminar.id)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
