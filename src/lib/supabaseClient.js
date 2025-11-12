import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqwjvrznwzmfytjlpfsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd2p2cnpud3ptZnl0amxwZnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzc1MjAsImV4cCI6MjA3MTk1MzUyMH0.uPBYH5YZn2uZFXZr31MeDsVaU19hf-BIhnV1QzmbsZo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
