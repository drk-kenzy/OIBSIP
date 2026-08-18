import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/dashboard" className="navbar__brand">🍕 Pizza Delivery</Link>
        <nav className="navbar__links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/build">Créer une pizza</Link>
          <Link to="/orders">Mes commandes</Link>
          {user && <span className="navbar__user">{user.name}</span>}
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>Déconnexion</button>
        </nav>
      </div>
    </header>
  );
}
