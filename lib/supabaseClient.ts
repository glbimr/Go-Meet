import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = 'https://treeuqmcrfuscllnidmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZWV1cW1jcmZ1c2NsbG5pZG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjUwNzYsImV4cCI6MjA4NDMwMTA3Nn0.qfa0Mw2em4hFvN_SIQNswjlJqaJALenQG5Pn1otz3tA';

export const supabase = createClient(supabaseUrl, supabaseKey);