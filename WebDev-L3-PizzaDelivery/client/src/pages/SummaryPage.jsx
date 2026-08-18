import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SummaryPage() {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null); // { simulated, amount, razorpayOrderId, keyId, currency }
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('pizza_draft');
    if (!raw) {
      navigate('/build');
      return;
    }
    setDraft(JSON.parse(raw));
  }, [navigate]);

  if (!draft) return null;

  const estimatedTotal = (8.99 + draft.veggies.length * 0.75).toFixed(2);

  function selectionPayload() {
    return {
      baseId: draft.base._id,
      sauceId: draft.sauce._id,
      cheeseId: draft.cheese._id,
      veggieIds: draft.veggies.map(v => v._id),
    };
  }

  async function startPayment() {
    setError('');
    setPaying(true);
    try {
      const res = await api.post('/payment/create-order', selectionPayload());
      setPendingPayment(res.data);
      if (!res.data.simulated) {
        await triggerRazorpayCheckout(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la préparation du paiement.');
    } finally {
      setPaying(false);
    }
  }

  async function triggerRazorpayCheckout(payment) {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Impossible de charger Razorpay. Réessaie plus tard.');
      return;
    }
    const rzp = new window.Razorpay({
      key: payment.keyId,
      amount: Math.round(payment.amount * 100),
      currency: payment.currency,
      order_id: payment.razorpayOrderId,
      name: 'Pizza Delivery',
      description: 'Commande de pizza personnalisée',
      handler: async response => {
        await confirmOrder({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      theme: { color: '#e2431e' },
    });
    rzp.open();
  }

  async function confirmOrder(paymentFields) {
    setError('');
    setPaying(true);
    try {
      const res = await api.post('/orders', { ...selectionPayload(), ...paymentFields });
      localStorage.removeItem('pizza_draft');
      navigate(`/orders/${res.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la confirmation de la commande.');
    } finally {
      setPaying(false);
    }
  }

  function simulateSuccess() {
    confirmOrder({ simulated: true });
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Récapitulatif de ta commande</h1>
          <p>Vérifie ta pizza avant de passer au paiement.</p>
        </div>

        <div className="summary-card">
          <div className="summary-row">
            <span className="summary-row__label">Pâte</span>
            <span>{draft.base.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Sauce</span>
            <span>{draft.sauce.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Fromage</span>
            <span>{draft.cheese.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__label">Légumes</span>
            <span>{draft.veggies.length ? draft.veggies.map(v => v.name).join(', ') : 'Aucun'}</span>
          </div>
          <div className="summary-total">
            <span>Total estimé</span>
            <span>{estimatedTotal} €</span>
          </div>

          {error && <div className="alert alert--error" style={{ marginTop: 20 }}>{error}</div>}

          {!pendingPayment && (
            <button type="button" className="btn btn--primary" style={{ width: '100%', marginTop: 24 }} onClick={startPayment} disabled={paying}>
              {paying ? 'Préparation...' : 'Passer au paiement'}
            </button>
          )}

          {pendingPayment?.simulated && (
            <div style={{ marginTop: 24 }}>
              <div className="alert alert--success">
                Mode simulation (aucune clé Razorpay configurée) : {pendingPayment.amount} {pendingPayment.currency}
              </div>
              <button type="button" className="btn btn--primary" style={{ width: '100%' }} onClick={simulateSuccess} disabled={paying}>
                {paying ? 'Confirmation...' : '✅ Simuler le paiement réussi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
