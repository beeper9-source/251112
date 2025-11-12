import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const defaultSeminar = {
  title: '',
  description: '',
  organizer: '',
  location: '',
  is_online: false,
  online_url: '',
  start_at: '',
  end_at: '',
  registration_link: '',
  capacity: '',
  contact_email: '',
  lunch_provided: false,
  dinner_provided: false,
};

export const useSeminars = () => {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSeminar, setEditingSeminar] = useState(null);

  const fetchSeminars = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('it_seminars')
      .select('*')
      .order('start_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setSeminars(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSeminars();
  }, [fetchSeminars]);

  const upsertSeminar = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    const record = {
      ...payload,
      capacity: payload.capacity ? Number(payload.capacity) : null,
      start_at: payload.start_at ? new Date(payload.start_at).toISOString() : null,
      end_at: payload.end_at ? new Date(payload.end_at).toISOString() : null,
    };

    const request = payload.id
      ? supabase.from('it_seminars').update(record).eq('id', payload.id).select()
      : supabase.from('it_seminars').insert(record).select();

    const { data, error: upsertError } = await request;

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setEditingSeminar(null);
      await fetchSeminars();
      return data?.[0] ?? null;
    }

    setLoading(false);
    return null;
  }, [fetchSeminars]);

  const removeSeminar = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { error: deleteError } = await supabase.from('it_seminars').delete().eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
    }

    await fetchSeminars();
    setLoading(false);
  }, [fetchSeminars]);

  const resetEditing = useCallback(() => {
    setEditingSeminar(null);
  }, []);

  const editingValues = useMemo(() => {
    if (!editingSeminar) return { ...defaultSeminar };
    return {
      ...defaultSeminar,
      ...editingSeminar,
      capacity: editingSeminar.capacity ?? '',
      start_at: editingSeminar.start_at ? editingSeminar.start_at.slice(0, 16) : '',
      end_at: editingSeminar.end_at ? editingSeminar.end_at.slice(0, 16) : '',
    };
  }, [editingSeminar]);

  return {
    seminars,
    loading,
    error,
    editingSeminar,
    editingValues,
    setEditingSeminar,
    resetEditing,
    upsertSeminar,
    removeSeminar,
    refetch: fetchSeminars,
  };
};

export const emptySeminar = { ...defaultSeminar };
