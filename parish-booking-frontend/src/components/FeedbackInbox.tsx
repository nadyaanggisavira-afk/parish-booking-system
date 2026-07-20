import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type Feedback, type FeedbackStatus, type FeedbackType } from '../lib/api';
import {
  FEEDBACK_STATUS_LABEL,
  FEEDBACK_STATUS_ORDER,
  SUGGESTION_CATEGORY_LABEL,
} from '../lib/constants';
import { PageHeading, FeedbackStatusTag } from './ui';
import { Modal } from './Modal';

const PARISH_FROM = 'sekretariat@purbayan-paroki.org';

export function FeedbackInbox({
  type,
  title,
  subtitle,
}: {
  type: FeedbackType;
  title: string;
  subtitle: string;
}) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Feedback | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .listFeedback({ type })
      .then(setItems)
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => load(), [load]);

  // Keep the open dialog in sync after a status/reply mutation.
  function applyUpdate(updated: Feedback) {
    setItems((prev) => prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)));
    setOpen((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }

  return (
    <>
      <PageHeading title={title} subtitle={subtitle} />

      {loading ? (
        <p className="text-[var(--color-muted)]">Memuat…</p>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-muted)]">Belum ada masukan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <button
              key={f.id}
              onClick={() => setOpen(f)}
              className="card p-4 w-full text-left hover:border-[var(--color-accent)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="eyebrow">
                  {f.type === 'suggestion'
                    ? f.category
                      ? SUGGESTION_CATEGORY_LABEL[f.category]
                      : 'Saran'
                    : (f.room?.name ?? 'Laporan Pelanggaran')}
                  {' · '}
                  {f.sender?.nama ?? f.reporterName ?? 'Anonim'}
                </p>
                <FeedbackStatusTag status={f.status} />
              </div>
              <p className="mt-1 line-clamp-2">{f.message}</p>
              <p className="text-xs text-[var(--color-muted)] mt-2">{fmtDate(f.createdAt)}</p>
            </button>
          ))}
        </div>
      )}

      {open && (
        <FeedbackDialog feedback={open} onClose={() => setOpen(null)} onUpdated={applyUpdate} />
      )}
    </>
  );
}

function FeedbackDialog({
  feedback,
  onClose,
  onUpdated,
}: {
  feedback: Feedback;
  onClose: () => void;
  onUpdated: (f: Feedback) => void;
}) {
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const alreadyReplied = Boolean(feedback.repliedAt);
  const currentIdx = FEEDBACK_STATUS_ORDER.indexOf(feedback.status);
  const nextStatus: FeedbackStatus | undefined = FEEDBACK_STATUS_ORDER[currentIdx + 1];
  const target = feedback.email ?? feedback.sender?.email ?? null;

  async function advance() {
    if (!nextStatus) return;
    setError(null);
    setBusy(true);
    try {
      onUpdated(await api.advanceFeedbackStatus(feedback.id, nextStatus));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memperbarui status.');
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    setError(null);
    if (reply.trim().length < 2) {
      setError('Tulis isi balasan terlebih dahulu.');
      return;
    }
    setBusy(true);
    try {
      onUpdated(await api.replyFeedback(feedback.id, reply));
      setReply('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim balasan.');
    } finally {
      setBusy(false);
    }
  }

  const heading =
    feedback.type === 'suggestion'
      ? feedback.category
        ? SUGGESTION_CATEGORY_LABEL[feedback.category]
        : 'Saran'
      : (feedback.room?.name ?? 'Laporan Pelanggaran');

  return (
    <Modal title={heading} onClose={onClose}>
      <p className="text-sm text-[var(--color-muted)] -mt-2 mb-3">
        <strong className="text-[var(--color-text)]">
          {feedback.sender?.nama ?? feedback.reporterName ?? 'Anonim'}
        </strong>{' '}
        · {fmtDate(feedback.createdAt)}
        {target ? ` · ${target}` : ''}
      </p>

      <div className="mb-4">
        <FeedbackStatusTag status={feedback.status} />
      </div>

      <p className="mb-5 whitespace-pre-wrap">{feedback.message}</p>

      {alreadyReplied && (
        <div className="card p-4 mb-5 bg-[var(--color-bg)]">
          <p className="eyebrow">Email Balasan Terkirim</p>
          <p className="text-sm mt-2 text-[var(--color-muted)]">
            Kepada: {target ?? '—'}
            <br />
            Dari: Sekretariat Paroki St. Antonius Purbayan &lt;{PARISH_FROM}&gt;
            <br />
            Perihal:{' '}
            {feedback.type === 'suggestion'
              ? 'Tanggapan atas Saran Anda'
              : 'Tanggapan atas Laporan Anda'}
          </p>
          <p className="text-sm mt-2 whitespace-pre-wrap">{feedback.adminReply}</p>
        </div>
      )}

      {!alreadyReplied && (
        <label className="field mb-4">
          <span className="field-label">Balasan (dikirim sebagai email resmi paroki)</span>
          <textarea
            className="input"
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Tulis tanggapan untuk umat…"
          />
        </label>
      )}

      {error && <p className="text-sm text-[var(--color-accent-2)] mb-3">{error}</p>}

      <div className="flex flex-wrap gap-2 justify-end">
        <button className="btn" onClick={onClose}>
          Tutup
        </button>
        {nextStatus && (
          <button className="btn" onClick={advance} disabled={busy}>
            Tandai {FEEDBACK_STATUS_LABEL[nextStatus]}
          </button>
        )}
        <button
          className="btn btn-accent"
          onClick={sendReply}
          disabled={busy || alreadyReplied || !target}
          title={!target ? 'Tidak ada alamat email tujuan' : undefined}
        >
          {alreadyReplied ? 'Email Terkirim' : busy ? 'Mengirim…' : 'Kirim Balasan'}
        </button>
      </div>
    </Modal>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
