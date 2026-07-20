import { FeedbackInbox } from '../../components/FeedbackInbox';

export function AdminLaporanPage() {
  return (
    <FeedbackInbox
      type="violation_report"
      title="Laporan Pelanggaran"
      subtitle="Laporan penggunaan ruangan yang tidak sesuai. Klik untuk membaca dan menindaklanjuti."
    />
  );
}
