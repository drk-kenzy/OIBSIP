import { useEffect, useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import { adminRequest } from '../../api/client';

const TYPE_LABELS = { base: 'Pâtes', sauce: 'Sauces', cheese: 'Fromages', veggie: 'Légumes' };

export default function AdminStockPage() {
  const [ingredients, setIngredients] = useState([]);
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');

  function load() {
    adminRequest({ url: '/ingredients', method: 'GET' }).then(res => setIngredients(res.data.ingredients));
  }

  useEffect(load, []);

  function handleEdit(id, value) {
    setEdits(e => ({ ...e, [id]: value }));
  }

  async function saveStock(item) {
    const raw = edits[item._id];
    const stock = raw === undefined ? item.stock : Number(raw);
    if (Number.isNaN(stock) || stock < 0) return;

    setSavingId(item._id);
    setMessage('');
    try {
      await adminRequest({ url: `/ingredients/${item._id}`, method: 'PATCH', data: { stock } });
      setMessage(`Stock de "${item.name}" mis à jour.`);
      setEdits(e => { const next = { ...e }; delete next[item._id]; return next; });
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erreur lors de la mise à jour.');
    } finally {
      setSavingId(null);
    }
  }

  const grouped = Object.keys(TYPE_LABELS).map(type => ({
    type,
    label: TYPE_LABELS[type],
    items: ingredients.filter(i => i.type === type),
  }));

  return (
    <div>
      <AdminNavbar />
      <div className="container">
        <div className="page-header">
          <h1>Gestion des stocks</h1>
          <p>Modifie manuellement le stock de chaque ingrédient. Les lignes en rouge sont sous le seuil d'alerte.</p>
        </div>

        {message && <div className="alert alert--success">{message}</div>}

        {grouped.map(group => (
          <div key={group.type} style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 12 }}>{group.label}</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Stock</th>
                  <th>Seuil d'alerte</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {group.items.map(item => (
                  <tr key={item._id} className={item.stock <= item.threshold ? 'is-low-stock' : ''}>
                    <td>{item.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="stock-input"
                        value={edits[item._id] ?? item.stock}
                        onChange={e => handleEdit(item._id, e.target.value)}
                      />
                    </td>
                    <td>{item.threshold}</td>
                    <td>
                      <button type="button" className="btn btn--primary btn--sm" onClick={() => saveStock(item)} disabled={savingId === item._id}>
                        {savingId === item._id ? '...' : 'Enregistrer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
