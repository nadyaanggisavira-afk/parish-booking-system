import type { ReactNode } from 'react';
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TAG,
  FEEDBACK_STATUS_LABEL,
} from '../lib/constants';
import type { BookingStatus, FeedbackStatus } from '../lib/api';

// Parish emblem + name — the masthead brand block, serif and understated.
export function Brand({ subtitle = 'Sistem Booking Ruang Pertemuan' }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid place-items-center w-9 h-9 rounded-full border border-[var(--color-neutral)] text-[var(--color-text)] text-lg shrink-0"
      >
        ✝
      </span>
      <div className="leading-tight">
        <p className="font-display font-semibold text-[var(--color-text)]">
          Paroki St. Antonius Purbayan
        </p>
        <p className="eyebrow">{subtitle}</p>
      </div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-2">{children}</p>;
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      {subtitle && <p className="text-[var(--color-muted)] mt-1">{subtitle}</p>}
    </div>
  );
}

export function BookingStatusTag({ status }: { status: BookingStatus }) {
  return <span className={`tag ${BOOKING_STATUS_TAG[status]}`}>{BOOKING_STATUS_LABEL[status]}</span>;
}

const FEEDBACK_STATUS_TAG: Record<FeedbackStatus, string> = {
  new: 'tag-wait',
  read: 'tag-ok',
  in_progress: 'tag-ok',
  done: 'tag-muted',
};

export function FeedbackStatusTag({ status }: { status: FeedbackStatus }) {
  return <span className={`tag ${FEEDBACK_STATUS_TAG[status]}`}>{FEEDBACK_STATUS_LABEL[status]}</span>;
}
