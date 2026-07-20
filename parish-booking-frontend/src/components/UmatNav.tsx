import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Brand } from './ui';

const LINKS = [
  { to: '/', label: 'Ketersediaan', end: true },
  { to: '/booking-baru', label: 'Booking Baru' },
  { to: '/booking-saya', label: 'Booking Saya' },
  { to: '/saran', label: 'Saran' },
  { to: '/lapor', label: 'Lapor Pelanggaran' },
];

export function UmatNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="nav flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 py-3 gap-3">
      <Brand />
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
