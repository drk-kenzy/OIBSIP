import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = {
  base: { label: 'Pâtes', icon: '🍞' },
  sauce: { label: 'Sauces', icon: '🍅' },
  cheese: { label: 'Fromages', icon: '🧀' },
  veggie: { label: 'Garnitures', icon: '🥦' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    api.get('/ingredients').then(res => setIngredients(res.data.ingredients));
  }, []);

  const counts = Object.keys(TYPE_LABELS).map(type => ({
    type,
    ...TYPE_LABELS[type],
    total: ingredients.filter(i => i.type === type).length,
    available: ingredients.filter(i => i.type === type && i.stock > 0).length,
  }));

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Bienvenue, {user?.name} 👋</h1>
          <p>Compose ta pizza idéale en quelques clics.</p>
        </div>

        <div className="cta-banner">
          <div>
            <h2>Prêt(e) pour une pizza sur-mesure ?</h2>
            <p>Pâte, sauce, fromage et garnitures, à toi de choisir.</p>
          </div>
          <Link to="/build" className="btn btn--primary">Créer ma pizza</Link>
        </div>

        <div className="grid-cards">
          {counts.map(c => (
            <div className="info-card" key={c.type}>
              <h3>{c.icon} {c.label}</h3>
              <p>{c.available} / {c.total} disponibles</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
