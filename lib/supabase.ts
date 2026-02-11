import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-initialized clients to avoid build-time errors when env vars are missing
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

// Client for browser/public operations
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Admin client for server-side operations (API routes only)
function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase admin environment variables not configured');
    }
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Proxy objects for backward compatibility - only initialize when actually used
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as Record<string, unknown>)[prop as string];
  }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdmin() as Record<string, unknown>)[prop as string];
  }
});

// Storage bucket name
export const STORAGE_BUCKET = 'design-photos';

// Helper to get public URL for uploaded files
export function getPublicUrl(path: string): string {
  const { data } = getSupabase().storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Helper to upload file to storage
export async function uploadToStorage(
  path: string,
  file: Buffer | Blob | string,
  contentType: string
): Promise<{ url: string; error: Error | null }> {
  const { error } = await getSupabaseAdmin().storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    return { url: '', error: new Error(error.message) };
  }

  return { url: getPublicUrl(path), error: null };
}

// Helper to create signed upload URL
export async function createUploadUrl(path: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin().storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    console.error('Create upload URL error:', error);
    return null;
  }

  return data?.signedUrl || null;
}
