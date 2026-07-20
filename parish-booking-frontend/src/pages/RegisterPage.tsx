import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../lib/api';
import { LINGKUNGAN_OPTIONS } from '../lib/constants';
import { Brand } from '../components/ui';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    noWhatsapp: '',
    lingkungan: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mendaftar. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Brand />
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="font-display text-2xl mb-1">Daftar Akun Umat</h1>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            Akun terhubung dengan lingkungan/wilayah agar sekretariat dapat memverifikasi pemohon.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="field">
              <span className="field-label">Nama Lengkap</span>
              <input
                className="input"
                value={form.nama}
                onChange={(e) => set('nama', e.target.value)}
                required
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="field">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">No. WhatsApp</span>
                <input
                  className="input"
                  placeholder="0812-3456-7890"
                  value={form.noWhatsapp}
                  onChange={(e) => set('noWhatsapp', e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="field">
              <span className="field-label">Lingkungan / Wilayah</span>
              <select
                className="input"
                value={form.lingkungan}
                onChange={(e) => set('lingkungan', e.target.value)}
                required
              >
                <option value="">Pilih lingkungan</option>
                {LINGKUNGAN_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Kata Sandi</span>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            {error && <p className="text-sm text-[var(--color-accent-2)]">{error}</p>}

            <button type="submit" className="btn btn-accent w-full" disabled={submitting}>
              {submitting ? 'Memproses…' : 'Daftar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-muted)] mt-5">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[var(--color-accent)] underline underline-offset-4">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
