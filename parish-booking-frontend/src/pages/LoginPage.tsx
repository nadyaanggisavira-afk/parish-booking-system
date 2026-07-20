import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../lib/api';
import { Brand } from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      // Admins land in the panel; umat land on room availability.
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal masuk. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Brand />
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="font-display text-2xl mb-6">Masuk</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="field">
              <span className="field-label">Email</span>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Kata Sandi</span>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p className="text-sm text-[var(--color-accent-2)]">{error}</p>}

            <button type="submit" className="btn btn-accent w-full" disabled={submitting}>
              {submitting ? 'Memproses…' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-muted)] mt-5">
          Belum punya akun?{' '}
          <Link to="/register" className="text-[var(--color-accent)] underline underline-offset-4">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
