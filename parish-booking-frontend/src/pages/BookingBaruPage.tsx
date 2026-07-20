import { useEffect, useState } from 'react';
import { api, ApiError, getStoredUser, type Room } from '../lib/api';
import { PageHeading } from '../components/ui';

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export function BookingBaruPage() {
  const user = getStoredUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({
    requesterName: user?.nama ?? '',
    timPelayanan: '',
    requesterContact: user?.noWhatsapp ?? '',
    roomId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    peminjamanBerkala: false,
  });
  const [surat, setSurat] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.listRooms().then((r) => {
      setRooms(r);
      setForm((f) => (f.roomId ? f : { ...f, roomId: r[0]?.id ?? '' }));
    });
  }, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Surat Permohonan harus berformat PDF.');
        e.target.value = '';
        return;
      }
      if (file.size > MAX_PDF_BYTES) {
        setError('Ukuran Surat Permohonan maksimal 5MB.');
        e.target.value = '';
        return;
      }
    }
    setSurat(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (!form.roomId || !form.startTime || !form.endTime) {
      setError('Mohon lengkapi ruangan dan waktu peminjaman.');
      return;
    }
    if (end <= start) {
      setError('Waktu selesai harus setelah waktu mulai.');
      return;
    }

    const fd = new FormData();
    fd.append('roomId', form.roomId);
    fd.append('requesterName', form.requesterName);
    fd.append('requesterContact', form.requesterContact);
    if (form.timPelayanan) fd.append('timPelayanan', form.timPelayanan);
    fd.append('purpose', form.purpose);
    fd.append('peminjamanBerkala', String(form.peminjamanBerkala));
    fd.append('startTime', start.toISOString());
    fd.append('endTime', end.toISOString());
    if (surat) fd.append('suratPermohonan', surat);

    setSubmitting(true);
    try {
      await api.createBooking(fd);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim pengajuan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <p className="font-display text-2xl mb-2">Pengajuan terkirim</p>
        <p className="text-[var(--color-muted)]">
          Pengajuan Anda berstatus <strong>Menunggu</strong> dan akan diproses setelah
          dikonfirmasi admin sekretariat paroki.
        </p>
        <button onClick={() => setSuccess(false)} className="btn mt-6">
          Ajukan booking lain
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeading
        title="Booking Ruangan Baru"
        subtitle="Pengajuan akan diproses setelah dikonfirmasi oleh admin sekretariat paroki."
      />

      <div className="card p-5 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="field">
              <span className="field-label">Nama</span>
              <input
                className="input"
                value={form.requesterName}
                onChange={(e) => set('requesterName', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Tim Pelayanan / Kelompok</span>
              <input
                className="input"
                placeholder="Contoh: Legio Maria"
                value={form.timPelayanan}
                onChange={(e) => set('timPelayanan', e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Nomor WhatsApp</span>
              <input
                className="input"
                value={form.requesterContact}
                onChange={(e) => set('requesterContact', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Ruangan</span>
              <select
                className="input"
                value={form.roomId}
                onChange={(e) => set('roomId', e.target.value)}
                required
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · kapasitas {r.capacity}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Waktu Mulai</span>
              <input
                type="datetime-local"
                className="input"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Waktu Selesai</span>
              <input
                type="datetime-local"
                className="input"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                required
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Tujuan Peminjaman</span>
            <textarea
              className="input"
              rows={3}
              placeholder="Contoh: Rapat persiapan acara Natal"
              value={form.purpose}
              onChange={(e) => set('purpose', e.target.value)}
              required
            />
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.peminjamanBerkala}
              onChange={(e) => set('peminjamanBerkala', e.target.checked)}
            />
            <span className="text-sm">
              Peminjaman Berkala
              <span className="block text-[var(--color-muted)]">
                Tandai bila kegiatan ini berulang — detail jadwal akan dikonfirmasi sekretariat.
              </span>
            </span>
          </label>

          <label className="field">
            <span className="field-label">Surat Permohonan (PDF, maks 5MB — opsional)</span>
            <input type="file" accept="application/pdf" className="input" onChange={handleFile} />
            {surat && (
              <span className="block text-xs text-[var(--color-muted)] mt-1">
                Terlampir: {surat.name}
              </span>
            )}
          </label>

          {error && <p className="text-sm text-[var(--color-accent-2)]">{error}</p>}

          <button type="submit" className="btn btn-accent w-full md:w-auto" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Ajukan Permohonan'}
          </button>
        </form>
      </div>
    </>
  );
}
