import { useEffect, useState } from 'react';
import { api, type DashboardSummary } from '../../lib/api';
import { PageHeading } from '../../components/ui';

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <p className="text-[var(--color-muted)]">Memuat…</p>;
  if (!data) return <p className="text-[var(--color-muted)]">Gagal memuat dashboard.</p>;

  return (
    <>
      <PageHeading title="Dashboard" subtitle={today} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Minggu Ini" value={data.bookingsThisWeek} caption="Booking terjadwal" />
        <Stat label="Menunggu" value={data.pendingCount} caption="Perlu persetujuan" accent />
        <Stat label="Ruangan" value={data.activeRooms} caption="Ruangan aktif" />
        <Stat label="Laporan" value={data.newReports} caption="Laporan pelanggaran baru" accent2 />
      </div>

      <h2 className="font-display text-2xl mb-3">Perlu Persetujuan</h2>
      {data.pending.length === 0 ? (
        <div className="card p-6">
          <p className="text-[var(--color-muted)]">Tidak ada pengajuan yang menunggu.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table min-w-[48rem]">
            <thead>
              <tr>
                <th>Ruangan</th>
                <th>Pemohon</th>
                <th>Lingkungan</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Keperluan</th>
              </tr>
            </thead>
            <tbody>
              {data.pending.map((b) => (
                <tr key={b.id}>
                  <td>{b.room?.name ?? '—'}</td>
                  <td>{b.pemohon?.nama ?? b.requesterName}</td>
                  <td className="text-[var(--color-muted)]">{b.pemohon?.lingkungan ?? '—'}</td>
                  <td className="whitespace-nowrap">{fmtDate(b.startTime)}</td>
                  <td className="whitespace-nowrap">
                    {fmtTime(b.startTime)}–{fmtTime(b.endTime)}
                  </td>
                  <td className="text-[var(--color-muted)]">{b.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  caption,
  accent,
  accent2,
}: {
  label: string;
  value: number;
  caption: string;
  accent?: boolean;
  accent2?: boolean;
}) {
  const color = accent2
    ? 'text-[var(--color-accent-2)]'
    : accent
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-text)]';
  return (
    <div className="card p-4">
      <p className="eyebrow">{label}</p>
      <p className={`font-display text-4xl my-1 ${color}`}>{value}</p>
      <p className="text-xs text-[var(--color-muted)]">{caption}</p>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
