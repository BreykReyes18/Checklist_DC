import { createClient } from '@supabase/supabase-js'
 
const supabaseUrl = 'https://rcmlhujkytcacrwxgwko.supabase.co'
const supabaseKey = 'sb_publishable_Uc8R4-VtYBziv7srElvwTA_2lkczoHZ'
 
export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)