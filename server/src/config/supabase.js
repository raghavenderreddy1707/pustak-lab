import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const BUCKET = process.env.SUPABASE_BUCKET || 'pustak-notes'

export const uploadToSupabase = async (fileBuffer, fileName, contentType, folder = 'notes') => {
  const filePath = `${folder}/${Date.now()}-${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error(`Supabase upload failed: ${error.message}`)

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  return { filePath, publicUrl }
}

export const deleteFromSupabase = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath])
  if (error) console.error('Supabase delete error:', error.message)
}

export default supabase
