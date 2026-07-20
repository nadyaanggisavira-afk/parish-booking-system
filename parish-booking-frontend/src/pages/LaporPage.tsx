import { useEffect, useState } from 'react';
import { api, ApiError, getStoredUser, type Room } from '../lib/api';
import { PageHeading } from '../components/ui';

export function LaporPage() {
  const user = getStoredUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.listRooms().then((r) => {
      setRooms(r);
      setRoomId((prev) => prev || (r[0]?.id ?? ''));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (message.trim().length < 5) {
      setError('Mohon jelaskan pelanggaran secara lebih lengkap.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitFeedback({
        type: 'violation_report',
        roomId: roomId || undefined,
        message,
        email: user?.email,
        reporterName: user?.nama,
      });
      setSuccess(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim laporan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <p className="font-display text-2xl mb-2">Laporan diterima</p>
        <p className="text-[var(--color-muted)]">
          Sekretariat akan menindaklanjuti laporan Anda dan mengirim tanggapan melalui email
          {user?.email ? ` (${user.email})` : ''}.
        </p>
        <button onClick={() => setSuccess(false)} className="btn mt-6">
          Kirim laporan lain
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeading
        title="Lapor Pelanggaran"
        subtitle="Laporkan penggunaan ruangan yang tidak sesuai — misalnya dipakai tanpa booking."
      />

      <div className="card p-5 md:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="field">
            <span className="field-label">Ruangan Terkait</span>
            <select className="input" value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Deskripsi Pelanggaran</span>
            <textarea
              className="input"
              rows={5}
              placeholder="Jelaskan kejadiannya — ruangan, waktu, dan apa yang terjadi…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>

          {error && <p className="text-sm text-[var(--color-accent-2)]">{error}</p>}

          <button type="submit" className="btn btn-accent w-full md:w-auto" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim Laporan'}
          </button>
        </form>
      </div>
    </>
  );
}
