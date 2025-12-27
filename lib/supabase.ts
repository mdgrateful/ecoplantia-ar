import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (API routes only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket name
export const STORAGE_BUCKET = 'design-photos';

// Helper to get public URL for uploaded files
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Helper to upload file to storage
export async function uploadToStorage(
  path: string,
  file: Buffer | Blob | string,
  contentType: string
): Promise<{ url: string; error: Error | null }> {
  const { error } = await supabaseAdmin.storage
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
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    console.error('Create upload URL error:', error);
    return null;
  }

  return data?.signedUrl || null;
}
