import { useEffect, useState } from 'react';
import { disablePush, enablePush, getExistingSubscription, permissionState } from '../lib/push';

const DISMISS_KEY = 'push_prompt_dismissed';

// Offers to turn on booking notifications. Stays out of the way once the umat
// has decided — either subscribed, or explicitly dismissed.
export function NotificationPrompt() {
  const [state, setState] = useState<NotificationPermission | 'unsupported'>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true',
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState(permissionState());
    getExistingSubscription().then((s) => setSubscribed(Boolean(s)));
  }, []);

  async function turnOn() {
    setBusy(true);
    setError(null);
    const res = await enablePush();
    setState(permissionState());
    setSubscribed(res.ok);
    if (!res.ok) setError(res.reason ?? 'Gagal mengaktifkan notifikasi.');
    setBusy(false);
  }

  async function turnOff() {
    setBusy(true);
    await disablePush();
    setSubscribed(false);
    setBusy(false);
  }

  if (state === 'unsupported') return null;

  // Already on — offer a quiet way to turn it back off.
  if (subscribed) {
    return (
      <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-muted)] mb-4">
        <span>🔔 Notifikasi booking aktif di perangkat ini.</span>
        <button className="btn-ghost underline underline-offset-4" onClick={turnOff} disabled={busy}>
          Matikan
        </button>
      </div>
    );
  }

  if (dismissed || state === 'denied') return null;

  return (
    <div className="card p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div>
        <p className="font-semibold">Aktifkan notifikasi booking</p>
        <p className="text-sm text-[var(--color-muted)]">
          Dapatkan pemberitahuan langsung saat sekretariat menyetujui atau menolak pengajuan Anda.
        </p>
        {error && <p className="text-sm text-[var(--color-accent-2)] mt-1">{error}</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          className="btn"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, 'true');
            setDismissed(true);
          }}
        >
          Nanti
        </button>
        <button className="btn btn-accent" onClick={turnOn} disabled={busy}>
          {busy ? 'Memproses…' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
}
