import { createClient } from '@supabase/supabase-js'
 
const supabaseUrl = 'https://rcmlhujkytcacrwxgwko.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbWxodWpreXRjYWNyd3hnd2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTEyMzQsImV4cCI6MjA5MjAyNzIzNH0.eX_vS4Q9o70MiGBj2-m5yVg-_x02uBt9jj1iX_lOXFo'
 
export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)