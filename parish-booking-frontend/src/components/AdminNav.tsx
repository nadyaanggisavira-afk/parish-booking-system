import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Brand } from './ui';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/antrean', label: 'Antrean Persetujuan' },
  { to: '/admin/kalender', label: 'Kalender' },
  { to: '/admin/ruangan', label: 'Kelola Ruangan' },
  { to: '/admin/saran', label: 'Saran' },
  { to: '/admin/laporan', label: 'Laporan Pelanggaran' },
];

export function AdminNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="nav flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-6 py-3 gap-3">
      <Brand subtitle="Panel Admin — Sekretariat" />
      <nav className="flex items-center gap-x-5 gap-y-1 flex-wrap">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="nav-link text-[var(--color-accent-2)]">
          Keluar
        </button>
      </nav>
    </header>
  );
}
