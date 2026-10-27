import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ImagePlus } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import BookCover from '../components/BookCover';
import { categories } from '../data/categories';
import type { Gradient } from '../data/types';
import { useStore } from '../store/store';
import { supabase } from '../lib/supabase';

const conditions = ['New', 'Like New', 'Good', 'Fair'] as const;
const coverGradients: Gradient[] = [
  ['#7C6FFF', '#3B82F6'],
  ['#F5A623', '#FF6B9D'],
  ['#2DD4BF', '#3B82F6'],
  ['#8B5CF6', '#EC4899'],
  ['#EF4444', '#F97316'],
  ['#3B82F6', '#22D3EE'],
];

export default function DonateBook() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { addBook, session, profile } = useStore();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(categories[0].id);
  const [condition, setCondition] = useState<(typeof conditions)[number]>('Good');
  const [description, setDescription] = useState('');
  const [gradient, setGradient] = useState<Gradient>(coverGradients[0]);
  const [submitError, setSubmitError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 1 && author.trim().length > 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!session) {
      navigate('/login');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');
    let coverUrl: string | undefined;
    let uploadedPath: string | undefined;
    if (imageFile && supabase) {
      const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${session.user.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('book-covers').upload(filePath, imageFile, {
        cacheControl: '3600', contentType: imageFile.type, upsert: false,
      });
      if (uploadError) {
        setSubmitError(`Photo upload failed: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      uploadedPath = filePath;
      coverUrl = supabase.storage.from('book-covers').getPublicUrl(filePath).data.publicUrl;
    }
    const saved = await addBook({
      title: title.trim(),
      author: author.trim(),
      gradient,
      category,
      condition,
      description: description.trim() || 'No description provided yet.',
      location: profile?.location || '',
      language: 'English',
      pages: 0,
      coverUrl,
      communityId: params.get('communityId') ?? undefined,
    });
    if (!saved) {
      if (uploadedPath && supabase) await supabase.storage.from('book-covers').remove([uploadedPath]);
      setSubmitError('Your book could not be saved. Make sure you ran the Supabase schema, then try again.');
      setIsSubmitting(false);
      return;
    }
    navigate('/donate/success', { state: { title } });
  };

  return (
    <PageTransition>
      <ScreenHeader title="Donate a Book" />
      <div className="px-5 pb-32 pt-4">
        <div className="flex gap-4">
          <BookCover title={title || 'Your Book'} gradient={gradient} imageUrl={imagePreview || undefined} className="h-[132px] w-[94px] shrink-0" />
          <div className="flex-1">
            <p className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Book photo</p>
            <label className="tap mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-3 py-2.5 text-[12.5px] font-semibold text-[var(--color-primary-2)]">
              <ImagePlus size={16} /> {imageFile ? 'Change photo' : 'Add a real book photo'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { setSubmitError('Choose an image smaller than 5 MB.'); return; }
                setImageFile(file); setImagePreview(URL.createObjectURL(file)); setSubmitError('');
              }} />
            </label>
            <p className="mt-2 text-[11px] text-[var(--color-text-faint)]">JPG, PNG, or WebP · maximum 5 MB</p>
            <p className="mt-4 text-[12.5px] font-medium text-[var(--color-text-dim)]">Fallback cover color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {coverGradients.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGradient(g)}
                  className="tap h-8 w-8 rounded-full border-2"
                  style={{
                    background: `linear-gradient(140deg, ${g[0]}, ${g[1]})`,
                    borderColor: gradient[0] === g[0] ? '#fff' : 'transparent',
                  }}
                />
              ))}
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--color-text-faint)]">
              If you skip the photo, BookBridge will use this simple color cover.
            </p>
          </div>
          {submitError && <p className="text-[12.5px] text-rose-400">{submitError}</p>}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Book title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Silent Orbit"
              className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Author</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Lena Achterberg"
              className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Category</label>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`tap shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium ${
                    category === c.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary-2)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Condition</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {conditions.map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`tap rounded-xl border py-2.5 text-[12px] font-semibold ${
                    condition === c
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary-2)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What's it about? Any notes for the next reader?"
              className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-[12px] text-[var(--color-text-faint)]">Pickup location</p>
            <p className="mt-0.5 text-[13.5px] font-medium text-[var(--color-text)]">{profile?.location || 'Add your location in Profile first'}</p>
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto glass border-t border-[var(--color-border)] px-5 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3.5"
        style={{ maxWidth: 480 }}
      >
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="tap flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14.5px] font-semibold text-white shadow-lg disabled:opacity-40"
          style={{ background: 'linear-gradient(120deg, #F5A623, #FF6B9D)' }}
        >
          <Check size={17} />
          {isSubmitting ? 'Listing your book…' : 'List this book'}
        </button>
      </div>
    </PageTransition>
  );
}
