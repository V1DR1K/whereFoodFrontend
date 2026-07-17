import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { session } from '../lib/api';
import { logout } from '../features/auth/auth';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = session.get();
  const canManage = user?.role === 'ADMIN' || user?.username === 'avril';
  const inFood = location.pathname.startsWith('/food');
  const inFilms = location.pathname.startsWith('/films');
  const inCook = location.pathname.startsWith('/how-cook');
  const settingsLink = inFood ? '/food/categories' : '/films/platforms';

  return <main className={`app-shell ${inFilms ? 'film-shell' : ''} ${inCook ? 'cook-shell' : ''}`}>
    <header className="app-header">
      <Link className="brand" to="/" aria-label="WhatPlan, ir al selector">What<span>Plan</span><i>✦</i></Link>
      <div className="header-actions">
        {(inFood || inFilms || inCook) && <Link className="round" to="/" aria-label="Cambiar de aplicación" title="Cambiar de aplicación">⌂</Link>}
        {canManage && (inFood || inFilms) && <Link className="round" to={settingsLink} aria-label="Configuración" title="Configuración">⚙</Link>}
        <button className="avatar" aria-label={`Cerrar sesión de ${user?.username ?? 'usuario'}`} title="Cerrar sesión" onClick={() => { logout(); navigate('/login'); }}>{user?.username[0].toUpperCase()}</button>
      </div>
    </header>
    <Outlet />
  </main>;
}
