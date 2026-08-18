import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Se connecter</h1>
        <p className="auth-card__subtitle">Content de te revoir.</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-form__label" htmlFor="email">Email</label>
          <input className="auth-form__input" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label className="auth-form__label" htmlFor="password">Mot de passe</label>
          <input className="auth-form__input" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="auth-card__footer">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </p>
        <p className="auth-card__footer">Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
      </div>
    </div>
  );
}
