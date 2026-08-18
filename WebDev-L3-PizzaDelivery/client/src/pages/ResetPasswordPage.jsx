import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password) {
      setError('Le mot de passe est obligatoire.');
      return;
    }
    if (!token) {
      setError('Jeton de réinitialisation manquant.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Réinitialiser le mot de passe</h1>
        <p className="auth-card__subtitle">Choisis un nouveau mot de passe.</p>

        {success && <div className="alert alert--success">{success}</div>}
        {error && <div className="alert alert--error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-form__label" htmlFor="password">Nouveau mot de passe</label>
          <input className="auth-form__input" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <p className="auth-form__hint">8 caractères minimum, avec au moins un chiffre.</p>

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Réinitialiser'}
          </button>
        </form>
        <p className="auth-card__footer"><Link to="/login">Retour à la connexion</Link></p>
      </div>
    </div>
  );
}
