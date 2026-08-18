import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AdminNavbar from '../../components/AdminNavbar';
import { adminRequest, API_URL } from '../../api/client';

const STATUS_OPTIONS = [
  { value: 'recue', label: 'Reçue' },
  { value: 'en_cuisine', label: 'En cuisine' },
  { value: 'en_livraison', label: 'En livraison' },
  { value: 'livree', label: 'Livrée' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  function load() {
    adminRequest({ url: '/orders', method: 'GET' }).then(res => setOrders(res.data.orders));
  }

  useEffect(load, []);

  useEffect(() => {
    const socket = io(API_URL);
    const token = localStorage.getItem('pizza_admin_token');
    socket.emit('auth:admin', token);
    socket.on('order:new', load);
    return () => socket.disconnect();
  }, []);

  async function updateStatus(order, status) {
    setUpdatingId(order._id);
    try {
      await adminRequest({ url: `/orders/${order._id}/status`, method: 'PATCH', data: { status } });
      setOrders(current => current.map(o => (o._id === order._id ? { ...o, status } : o)));
    } finally {
      setUpdatingId(null);
    }
  }

  const activeOrders = orders.filter(o => o.status !== 'livree');
  const deliveredOrders = orders.filter(o => o.status === 'livree');

  function renderTable(list) {
    return (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Pizza</th>
            <th>Total</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {list.map(order => (
            <tr key={order._id}>
              <td>{order.user?.name}<br /><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{order.user?.email}</span></td>
              <td>
                {order.pizza.base.name} · {order.pizza.sauce.name} · {order.pizza.cheese.name}
                {order.pizza.veggies.length > 0 && ` · ${order.pizza.veggies.map(v => v.name).join(', ')}`}
              </td>
              <td>{order.total} €</td>
              <td>
                <select
                  className="status-select"
                  value={order.status}
                  onChange={e => updateStatus(order, e.target.value)}
                  disabled={updatingId === order._id}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container">
        <div className="page-header">
          <h1>Commandes</h1>
          <p>Mets à jour le statut, le client le voit en temps réel. Un email de confirmation part automatiquement au client quand une commande passe à "Livrée".</p>
        </div>

        {orders.length === 0 && <div className="empty-state">Aucune commande pour l'instant.</div>}

        {activeOrders.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ marginBottom: 12 }}>En cours ({activeOrders.length})</h3>
            {renderTable(activeOrders)}
          </div>
        )}

        {deliveredOrders.length > 0 && (
          <div>
            <h3 style={{ marginBottom: 12 }}>Commandes livrées ({deliveredOrders.length})</h3>
            {renderTable(deliveredOrders)}
          </div>
        )}
      </div>
    </div>
  );
}
