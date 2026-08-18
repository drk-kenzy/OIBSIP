import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

const STEPS = [
  { key: 'base', label: '1. Pâte', title: 'Choisis ta pâte' },
  { key: 'sauce', label: '2. Sauce', title: 'Choisis ta sauce' },
  { key: 'cheese', label: '3. Fromage', title: 'Choisis ton fromage' },
  { key: 'veggie', label: '4. Garnitures', title: 'Ajoute des légumes (optionnel)' },
];

export default function BuilderPage() {
  const [ingredients, setIngredients] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, veggies: [] });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/ingredients').then(res => setIngredients(res.data.ingredients));
  }, []);

  const step = STEPS[stepIndex];
  const options = ingredients.filter(i => i.type === step.key);

  function isSelected(item) {
    if (step.key === 'veggie') return selection.veggies.some(v => v._id === item._id);
    return selection[step.key]?._id === item._id;
  }

  function toggleOption(item) {
    if (item.stock < 1) return;
    if (step.key === 'veggie') {
      setSelection(sel => ({
        ...sel,
        veggies: sel.veggies.some(v => v._id === item._id)
          ? sel.veggies.filter(v => v._id !== item._id)
          : [...sel.veggies, item],
      }));
    } else {
      setSelection(sel => ({ ...sel, [step.key]: item }));
    }
  }

  const canGoNext = step.key === 'veggie' ? true : Boolean(selection[step.key]);

  function goNext() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      localStorage.setItem('pizza_draft', JSON.stringify(selection));
      navigate('/summary');
    }
  }

  function goBack() {
    setStepIndex(i => Math.max(0, i - 1));
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>{step.title}</h1>
        </div>

        <div className="stepper">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`stepper__step ${i === stepIndex ? 'is-active' : ''} ${i < stepIndex ? 'is-done' : ''}`}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="option-grid">
          {options.map(item => (
            <button
              key={item._id}
              type="button"
              className={`option-card ${isSelected(item) ? 'is-selected' : ''}`}
              onClick={() => toggleOption(item)}
              disabled={item.stock < 1}
            >
              <div className="option-card__name">{item.name}</div>
              <div className="option-card__meta">{item.stock < 1 ? 'Rupture de stock' : 'Disponible'}</div>
            </button>
          ))}
          {options.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Chargement des options...</p>}
        </div>

        <div className="builder-actions">
          <button type="button" className="btn btn--ghost" onClick={goBack} disabled={stepIndex === 0}>
            ← Précédent
          </button>
          <button type="button" className="btn btn--primary" onClick={goNext} disabled={!canGoNext}>
            {stepIndex < STEPS.length - 1 ? 'Suivant →' : 'Voir le récapitulatif →'}
          </button>
        </div>
      </div>
    </div>
  );
}
