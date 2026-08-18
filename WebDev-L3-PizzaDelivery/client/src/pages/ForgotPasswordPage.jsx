import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devPreview, setDevPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setDevPreview(null);
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.devEmailPreviewUrl) setDevPreview(res.data.devEmailPreviewUrl);
    } catch {
      setMessage("Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Mot de passe oublié</h1>
        <p className="auth-card__subtitle">Indique ton email, on t'envoie un lien de réinitialisation.</p>

        {message && <div className="alert alert--success">{message}</div>}
        {devPreview && (
          <div className="alert alert--success">
            Mode dev : <a href={devPreview} target="_blank" rel="noreferrer">voir l'email de réinitialisation</a>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-form__label" htmlFor="email">Email</label>
          <input className="auth-form__input" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
        <p className="auth-card__footer"><Link to="/login">Retour à la connexion</Link></p>
      </div>
    </div>
  );
}
