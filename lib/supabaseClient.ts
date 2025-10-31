import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para usar en el servidor (rutas API, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
