import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const defaultAttendance = {
  id: null,
  seminar_id: '',
  applicant_name: '',
};

export const useAttendances = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('it__attendances')
      .select('id, applicant_name, seminar_id, created_at, it_seminars(title, start_at)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const normalized = (data ?? []).map((item) => ({
        id: item.id,
        applicant_name: item.applicant_name,
        seminar_id: item.seminar_id,
        created_at: item.created_at,
        seminar: item.it_seminars,
      }));
      setAttendances(normalized);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const upsertAttendance = useCallback(async (payload) => {
    if (!payload.seminar_id) {
      setError('세미나를 선택해주세요.');
      return null;
    }
    if (!payload.applicant_name) {
      setError('신청자 이름을 입력해주세요.');
      return null;
    }

    setLoading(true);
    setError(null);

    const request = payload.id
      ? supabase
          .from('it__attendances')
          .update({ applicant_name: payload.applicant_name, seminar_id: payload.seminar_id })
          .eq('id', payload.id)
          .select('id')
      : supabase
          .from('it__attendances')
          .insert({ applicant_name: payload.applicant_name, seminar_id: payload.seminar_id })
          .select('id');

    const { error: upsertError } = await request;

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return null;
    }

    setEditingAttendance(null);
    await fetchAttendances();
    return true;
  }, [fetchAttendances]);

  const removeAttendance = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { error: deleteError } = await supabase.from('it__attendances').delete().eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
    }

    await fetchAttendances();
  }, [fetchAttendances]);

  const resetEditing = useCallback(() => {
    setEditingAttendance(null);
  }, []);

  const editingValues = useMemo(() => {
    if (!editingAttendance) return { ...defaultAttendance };
    return { ...defaultAttendance, ...editingAttendance };
  }, [editingAttendance]);

  return {
    attendances,
    loading,
    error,
    editingAttendance,
    editingValues,
    setEditingAttendance,
    resetEditing,
    upsertAttendance,
    removeAttendance,
    refetch: fetchAttendances,
  };
};

export const emptyAttendance = { ...defaultAttendance };
