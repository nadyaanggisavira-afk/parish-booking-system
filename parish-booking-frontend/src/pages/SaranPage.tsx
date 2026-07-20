import { useState } from 'react';
import { api, ApiError, getStoredUser, type SuggestionCategory } from '../lib/api';
import { SUGGESTION_CATEGORIES, SUGGESTION_CATEGORY_LABEL } from '../lib/constants';
import { PageHeading } from '../components/ui';

export function SaranPage() {
  const user = getStoredUser();
  const [category, setCategory] = useState<SuggestionCategory>('fasilitas_ruangan');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (message.trim().length < 5) {
      setError('Mohon tuliskan saran yang lebih lengkap.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitFeedback({
        type: 'suggestion',
        category,
        message,
        email: user?.email,
        reporterName: user?.nama,
      });
      setSuccess(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim saran. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <p className="font-display text-2xl mb-2">Terima kasih</p>
        <p className="text-[var(--color-muted)]">
          Saran Anda telah diterima sekretariat paroki. Balasan akan dikirim ke email Anda
          {user?.email ? ` (${user.email})` : ''}.
        </p>
        <button onClick={() => setSuccess(false)} className="btn mt-6">
          Kirim saran lain
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeading
        title="Saran untuk Pengurus Paroki"
        subtitle="Masukan Anda membantu kami memperbaiki pelayanan dan pengelolaan ruangan."
      />

      <div className="card p-5 md:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="field">
            <span className="field-label">Kategori Saran</span>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as SuggestionCategory)}
            >
              {SUGGESTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {SUGGESTION_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Saran Anda</span>
            <textarea
              className="input"
              rows={5}
              placeholder="Sampaikan saran Anda untuk pengelolaan ruangan atau kegiatan paroki…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>

          {error && <p className="text-sm text-[var(--color-accent-2)]">{error}</p>}

          <button type="submit" className="btn btn-accent w-full md:w-auto" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim Saran'}
          </button>
        </form>
      </div>
    </>
  );
}
