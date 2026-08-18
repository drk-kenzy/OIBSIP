import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      login(res.data.token, res.data.admin);
      navigate('/admin/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Espace admin</h1>
        <p className="auth-card__subtitle">Accès réservé à l'équipe Pizza Delivery.</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-form__label" htmlFor="username">Identifiant admin</label>
          <input className="auth-form__input" id="username" value={username} onChange={e => setUsername(e.target.value)} required />

          <label className="auth-form__label" htmlFor="password">Mot de passe</label>
          <input className="auth-form__input" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
