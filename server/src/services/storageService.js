import { supabase, BUCKET_NAME } from '../config/supabase.js';

export const uploadFileToStorage = async (fileBuffer, originalName, mimeType, folder = 'general') => {
  if (!supabase) {
    console.warn('[Storage Warning] Supabase credentials not configured. Returning fallback placeholder URL.');
    return `https://storage.placeholder.com/${folder}/${Date.now()}_${originalName}`;
  }

  const cleanFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const deleteFileFromStorage = async (fileUrl) => {
  if (!supabase || !fileUrl) return;

  try {
    const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    }
  } catch (err) {
    console.error(`[Storage Warning] Failed to delete file: ${err.message}`);
  }
};
