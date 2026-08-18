import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devPreview, setDevPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevPreview(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setSuccess(res.data.message);
      if (res.data.devEmailPreviewUrl) setDevPreview(res.data.devEmailPreviewUrl);
      setName(''); setEmail(''); setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Créer un compte</h1>
        <p className="auth-card__subtitle">Rejoins Pizza Delivery pour composer ta pizza.</p>

        {success && <div className="alert alert--success">{success}</div>}
        {devPreview && (
          <div className="alert alert--success">
            Mode dev : <a href={devPreview} target="_blank" rel="noreferrer">voir l'email de confirmation</a>
          </div>
        )}
        {error && <div className="alert alert--error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-form__label" htmlFor="name">Nom</label>
          <input className="auth-form__input" id="name" value={name} onChange={e => setName(e.target.value)} required />

          <label className="auth-form__label" htmlFor="email">Email</label>
          <input className="auth-form__input" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label className="auth-form__label" htmlFor="password">Mot de passe</label>
          <input className="auth-form__input" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <p className="auth-form__hint">8 caractères minimum, avec au moins un chiffre.</p>

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>
        <p className="auth-card__footer">Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}
