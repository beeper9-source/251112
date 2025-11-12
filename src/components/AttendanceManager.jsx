import { useEffect, useMemo, useState } from 'react';
import { useAttendances, emptyAttendance } from '../hooks/useAttendances.js';

export const AttendanceManager = ({ seminars }) => {
  const {
    attendances,
    loading,
    error,
    editingAttendance,
    editingValues,
    setEditingAttendance,
    resetEditing,
    upsertAttendance,
    removeAttendance,
  } = useAttendances();

  const [formValues, setFormValues] = useState(editingValues);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormValues(editingValues);
  }, [editingValues]);

  const seminarOptions = useMemo(
    () =>
      seminars.map((seminar) => ({
        id: seminar.id,
        label: `${seminar.title} · ${seminar.start_at ? new Date(seminar.start_at).toLocaleString('ko-KR') : ''}`,
      })),
    [seminars],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await upsertAttendance(formValues);
    setSubmitting(false);
    if (result) {
      setFormValues(emptyAttendance);
    }
  };

  const handleEdit = (record) => {
    setEditingAttendance(record);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 참석 신청을 삭제할까요?')) return;
    await removeAttendance(id);
  };

  const resetForm = () => {
    resetEditing();
    setFormValues(emptyAttendance);
  };

  return (
    <section>
      <div className="section-header">
        <h2>참석 신청 관리</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          세미나 선택
          <select name="seminar_id" value={formValues.seminar_id} onChange={handleChange} required>
            <option value="">세미나를 선택하세요</option>
            {seminarOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          신청자 이름
          <input
            name="applicant_name"
            value={formValues.applicant_name}
            onChange={handleChange}
            placeholder="예) 홍길동"
            required
          />
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="submit" className="primary" disabled={submitting || loading}>
            {editingAttendance ? '참석 신청 수정' : '참석 신청 등록'}
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
              <th>신청자</th>
              <th>세미나</th>
              <th>신청일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state">
                  등록된 참석 신청이 없습니다.
                </td>
              </tr>
            )}
            {attendances.map((attendance) => (
              <tr key={attendance.id}>
                <td>{attendance.applicant_name}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{attendance.seminar?.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {attendance.seminar?.start_at
                      ? new Date(attendance.seminar.start_at).toLocaleString('ko-KR')
                      : '-'}
                  </div>
                </td>
                <td>{new Date(attendance.created_at).toLocaleString('ko-KR')}</td>
                <td>
                  <div className="inline-actions">
                    <button type="button" className="ghost" onClick={() => handleEdit(attendance)}>
                      수정
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(attendance.id)}>
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
