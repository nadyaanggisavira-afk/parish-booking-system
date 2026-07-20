import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type Room } from '../../lib/api';
import { PageHeading } from '../../components/ui';
import { Modal } from '../../components/Modal';

type Draft = { id?: string; name: string; capacity: string; facilities: string; isActive: boolean };

const EMPTY: Draft = { name: '', capacity: '', facilities: '', isActive: true };

export function KelolaRuanganPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .listAllRooms()
      .then(setRooms)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setError(null);

    const capacity = Number(draft.capacity);
    if (!draft.name.trim() || !Number.isFinite(capacity) || capacity < 1) {
      setError('Nama ruangan dan kapasitas (minimal 1) wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      if (draft.id) {
        await api.updateRoom(draft.id, {
          name: draft.name,
          capacity,
          facilities: draft.facilities,
          isActive: draft.isActive,
        });
      } else {
        await api.createRoom({ name: draft.name, capacity, facilities: draft.facilities });
      }
      setDraft(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan ruangan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeading title="Kelola Ruangan" subtitle="Ruangan yang dapat dibooking oleh umat." />
        <button className="btn btn-accent" onClick={() => setDraft({ ...EMPTY })}>
          Tambah Ruangan
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--color-muted)]">Memuat…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="eyebrow">Kapasitas {r.capacity} orang</p>
                <span className={`tag ${r.isActive ? 'tag-ok' : 'tag-muted'}`}>
                  {r.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="font-display text-xl mt-1">{r.name}</p>
              <p className="text-sm text-[var(--color-muted)] mt-1">{r.facilities || '—'}</p>
              <button
                className="btn mt-4"
                onClick={() =>
                  setDraft({
                    id: r.id,
                    name: r.name,
                    capacity: String(r.capacity),
                    facilities: r.facilities ?? '',
                    isActive: r.isActive,
                  })
                }
              >
                Edit Ruangan
              </button>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <Modal onClose={() => setDraft(null)} title={draft.id ? 'Edit Ruangan' : 'Tambah Ruangan'}>
          <form onSubmit={save} className="space-y-4">
            <label className="field">
              <span className="field-label">Nama Ruangan</span>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Kapasitas (orang)</span>
              <input
                type="number"
                min={1}
                className="input"
                value={draft.capacity}
                onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Fasilitas</span>
              <input
                className="input"
                placeholder="Proyektor, AC, sound system"
                value={draft.facilities}
                onChange={(e) => setDraft({ ...draft, facilities: e.target.value })}
              />
            </label>
            {draft.id && (
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                />
                Ruangan aktif (muncul di pilihan booking umat)
              </label>
            )}

            {error && <p className="text-sm text-[var(--color-accent-2)]">{error}</p>}

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn" onClick={() => setDraft(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn-accent" disabled={saving}>
                {saving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

