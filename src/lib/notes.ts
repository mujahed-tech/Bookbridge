import { supabase } from './supabase';
import type { CommunityNote } from '../data/types';

type NoteRow = { id: string; community_id: string; uploaded_by: string; title: string; description: string; subject: string; course: string; class_year: string; file_path: string; file_name: string; file_size: number | null; mime_type: string | null; created_at: string };
const toNote = (row: NoteRow): CommunityNote => ({ id: row.id, communityId: row.community_id, uploadedBy: row.uploaded_by, title: row.title, description: row.description, subject: row.subject, course: row.course, classYear: row.class_year, filePath: row.file_path, fileName: row.file_name, fileSize: row.file_size ?? undefined, mimeType: row.mime_type ?? undefined, createdAt: row.created_at });

export async function loadNotes(communityId: string) { if (!supabase) throw new Error('Supabase is not configured.'); const { data, error } = await supabase.from('notes').select('*').eq('community_id', communityId).order('created_at', { ascending: false }); if (error) throw new Error(error.message); return (data as NoteRow[]).map(toNote); }
export async function uploadNote(input: Omit<CommunityNote, 'id' | 'filePath' | 'createdAt' | 'fileName' | 'fileSize' | 'mimeType'>, file: File) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()!.toLowerCase()}` : '';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120);
  const path = `${input.communityId}/${input.uploadedBy}/${crypto.randomUUID()}-${safeName || `note${extension}`}`;
  const { error: uploadError } = await supabase.storage.from('community-notes').upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { data, error } = await supabase.from('notes').insert({ community_id: input.communityId, uploaded_by: input.uploadedBy, title: input.title, description: input.description, subject: input.subject, course: input.course, class_year: input.classYear, file_path: path, file_name: file.name, file_size: file.size, mime_type: file.type || null }).select('*').single();
  if (error || !data) { await supabase.storage.from('community-notes').remove([path]); throw new Error(error?.message ?? 'Could not save note details.'); }
  return toNote(data as NoteRow);
}
export async function getNoteDownloadUrl(path: string) { if (!supabase) throw new Error('Supabase is not configured.'); const { data, error } = await supabase.storage.from('community-notes').createSignedUrl(path, 60); if (error || !data) throw new Error(error?.message ?? 'Could not create secure download link.'); return data.signedUrl; }
export async function deleteNote(note: CommunityNote) { if (!supabase) throw new Error('Supabase is not configured.'); const { error } = await supabase.from('notes').delete().eq('id', note.id); if (error) throw new Error(error.message); const { error: storageError } = await supabase.storage.from('community-notes').remove([note.filePath]); if (storageError) throw new Error(storageError.message); }
