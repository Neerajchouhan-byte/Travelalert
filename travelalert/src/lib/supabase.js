import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.https://ircmfinkrzkhtqcuchpy.supabase.co;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY21maW5rcnpraHRxY3VjaHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNDI2MjIsImV4cCI6MjEwMzcxODYyMn0.TDCVLa-2awEFN2f8PGZ9Qr0RRuF_G82W2wKdTD2qiks;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;