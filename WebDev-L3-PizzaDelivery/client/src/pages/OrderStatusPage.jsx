import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import { api, API_URL } from '../api/client';

const STATUS_FLOW = [
  { key: 'recue', label: 'Reçue' },
  { key: 'en_cuisine', label: 'En cuisine' },
  { key: 'en_livraison', label: 'En livraison' },
  { key: 'livree', label: 'Livrée' },
];

export default function OrderStatusPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => setError('Commande introuvable.'));
  }, [id]);

  useEffect(() => {
    const socket = io(API_URL);
    const token = localStorage.getItem('pizza_user_token');
    socket.emit('auth:user', token);
    socket.emit('order:watch', id);
    socket.on('order:status', payload => {
      if (payload.orderId === id) {
        setOrder(current => (current ? { ...current, status: payload.status } : current));
      }
    });
    return () => socket.disconnect();
  }, [id]);

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container"><div className="alert alert--error" style={{ marginTop: 24 }}>{error}</div></div>
      </div>
    );
  }

  if (!order) return null;

  const currentIndex = STATUS_FLOW.findIndex(s => s.key === order.status);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Commande #{order._id.slice(-6).toUpperCase()}</h1>
          <p>Mise à jour en temps réel, laisse cette page ouverte pour suivre l'avancement.</p>
        </div>

        <div className="status-timeline">
          {STATUS_FLOW.map((s, i) => (
            <div key={s.key} className={`status-step ${i <= currentIndex ? 'is-reached' : ''}`}>
              {s.label}
            </div>
          ))}
        </div>

        <div className="summary-card">
          <div className="summary-row">
            <span className="summary-row__label">Pâte</span>
            <span>{order.pizza.base.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Sauce</span>
            <span>{order.pizza.sauce.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Fromage</span>
            <span>{order.pizza.cheese.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Légumes</span>
            <span>{order.pizza.veggies.length ? order.pizza.veggies.map(v => v.name).join(', ') : 'Aucun'}</span>
          </div>
          <div className="summary-total">
            <span>Total payé</span>
            <span>{order.total} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
