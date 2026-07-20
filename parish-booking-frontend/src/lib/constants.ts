import type { BookingStatus, FeedbackStatus, SuggestionCategory } from './api';

// Seeded lingkungan/wilayah options for the register dropdown (free string in DB).
export const LINGKUNGAN_OPTIONS = [
  'Wilayah I - Lingkungan St. Petrus',
  'Wilayah I - Lingkungan St. Paulus',
  'Wilayah II - Lingkungan St. Maria',
  'Wilayah II - Lingkungan St. Yusuf',
  'Wilayah III - Lingkungan St. Yohanes',
  'Wilayah III - Lingkungan St. Antonius',
];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export const BOOKING_STATUS_TAG: Record<BookingStatus, string> = {
  pending: 'tag-wait',
  approved: 'tag-ok',
  rejected: 'tag-reject',
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: 'Baru',
  read: 'Dibaca',
  in_progress: 'Diproses',
  done: 'Selesai',
};

// Forward-only progression; used to compute the next "Tandai …" action.
export const FEEDBACK_STATUS_ORDER: FeedbackStatus[] = ['new', 'read', 'in_progress', 'done'];

export const SUGGESTION_CATEGORY_LABEL: Record<SuggestionCategory, string> = {
  fasilitas_ruangan: 'Fasilitas Ruangan',
  prosedur_booking: 'Prosedur Booking',
  kegiatan_paroki: 'Kegiatan Paroki',
  lainnya: 'Lainnya',
};

export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  'fasilitas_ruangan',
  'prosedur_booking',
  'kegiatan_paroki',
  'lainnya',
];
