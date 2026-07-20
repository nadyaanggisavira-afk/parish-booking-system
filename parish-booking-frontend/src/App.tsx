import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequireUmat, RequireAdmin } from './components/RequireAuth';
import { UmatNav } from './components/UmatNav';
import { AdminNav } from './components/AdminNav';
import { NotificationPrompt } from './components/NotificationPrompt';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { KetersediaanPage } from './pages/KetersediaanPage';
import { BookingBaruPage } from './pages/BookingBaruPage';
import { BookingSayaPage } from './pages/BookingSayaPage';
import { SaranPage } from './pages/SaranPage';
import { LaporPage } from './pages/LaporPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AntreanPage } from './pages/admin/AntreanPage';
import { KalenderPage } from './pages/admin/KalenderPage';
import { KelolaRuanganPage } from './pages/admin/KelolaRuanganPage';
import { AdminSaranPage } from './pages/admin/AdminSaranPage';
import { AdminLaporanPage } from './pages/admin/AdminLaporanPage';

import { DisplayPage } from './pages/DisplayPage';

function UmatLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireUmat>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <UmatNav />
        <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          <NotificationPrompt />
          {children}
        </main>
      </div>
    </RequireUmat>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <AdminNav />
        <main className="max-w-6xl mx-auto px-4 lg:px-6 py-8">{children}</main>
      </div>
    </RequireAdmin>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Umat */}
        <Route path="/" element={<UmatLayout><KetersediaanPage /></UmatLayout>} />
        <Route path="/booking-baru" element={<UmatLayout><BookingBaruPage /></UmatLayout>} />
        <Route path="/booking-saya" element={<UmatLayout><BookingSayaPage /></UmatLayout>} />
        <Route path="/saran" element={<UmatLayout><SaranPage /></UmatLayout>} />
        <Route path="/lapor" element={<UmatLayout><LaporPage /></UmatLayout>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
        <Route path="/admin/antrean" element={<AdminLayout><AntreanPage /></AdminLayout>} />
        <Route path="/admin/kalender" element={<AdminLayout><KalenderPage /></AdminLayout>} />
        <Route path="/admin/ruangan" element={<AdminLayout><KelolaRuanganPage /></AdminLayout>} />
        <Route path="/admin/saran" element={<AdminLayout><AdminSaranPage /></AdminLayout>} />
        <Route path="/admin/laporan" element={<AdminLayout><AdminLaporanPage /></AdminLayout>} />

        {/* Monitor Display — public, no nav */}
        <Route path="/display" element={<DisplayPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
