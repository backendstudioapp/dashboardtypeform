
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kskpccemsslenrfjfmqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtza3BjY2Vtc3NsZW5yZmpmbXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzgyNDcsImV4cCI6MjA4Mzk1NDI0N30.3CV504TS6dik0m5ibt2kFWHnTu1oDiioVc3ykDYaCtY';

export const supabase = createClient(supabaseUrl, supabaseKey);
