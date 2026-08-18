import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

const STATUS_LABELS = {
  recue: 'Reçue',
  en_cuisine: 'En cuisine',
  en_livraison: 'En livraison',
  livree: 'Livrée',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/mine').then(res => setOrders(res.data.orders));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Mes commandes</h1>
          <p>Suis l'état de tes pizzas en temps réel.</p>
        </div>

        {orders === null && <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>}

        {orders?.length === 0 && (
          <div className="empty-state">
            <p>Aucune commande pour l'instant.</p>
            <Link to="/build" className="btn btn--primary" style={{ marginTop: 16 }}>Créer ma première pizza</Link>
          </div>
        )}

        <div className="order-list">
          {orders?.map(order => (
            <Link to={`/orders/${order._id}`} key={order._id} className="order-row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div>
                <div className="order-row__pizza">
                  {order.pizza.base.name} · {order.pizza.sauce.name} · {order.pizza.cheese.name}
                  {order.pizza.veggies.length > 0 && ` · ${order.pizza.veggies.map(v => v.name).join(', ')}`}
                </div>
                <div className="order-row__meta">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} · {order.total} €
                </div>
              </div>
              <span className={`badge badge--${order.status}`}>{STATUS_LABELS[order.status]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
