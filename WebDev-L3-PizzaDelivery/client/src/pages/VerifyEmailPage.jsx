import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification manquant.');
      return;
    }
    api.post('/auth/verify-email', { token })
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Lien invalide.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Vérification de l'email</h1>
        {status === 'pending' && <p className="auth-card__subtitle">Vérification en cours...</p>}
        {status === 'success' && <div className="alert alert--success">{message}</div>}
        {status === 'error' && <div className="alert alert--error">{message}</div>}
        <p className="auth-card__footer"><Link to="/login">Aller à la connexion</Link></p>
      </div>
    </div>
  );
}
