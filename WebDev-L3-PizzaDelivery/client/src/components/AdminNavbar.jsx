import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminNavbar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/admin/orders" className="navbar__brand">🍕 Admin</Link>
        <nav className="navbar__links">
          <Link to="/admin/stock">Stock</Link>
          <Link to="/admin/orders">Commandes</Link>
          {admin && <span className="navbar__user">{admin.username}</span>}
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>Déconnexion</button>
        </nav>
      </div>
    </header>
  );
}
