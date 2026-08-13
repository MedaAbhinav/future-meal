import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, CreditCard, Smartphone, Banknote, Info } from 'lucide-react';
import { Address, PaymentMethod } from '../types';
import { useCart } from '../context/CartContext';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { extractError } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { PLACEHOLDER_FOOD } from '../utils/images';
import toast from 'react-hot-toast';

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode; note?: string }[] = [
  { value: 'UPI',             label: 'UPI',               icon: <Smartphone className="w-4 h-4" />,   note: 'Payment gateway integration required' },
  { value: 'CARD',            label: 'Credit / Debit Card',icon: <CreditCard className="w-4 h-4" />,   note: 'Payment gateway integration required' },
  { value: 'CASH_ON_DELIVERY',label: 'Cash on Delivery',  icon: <Banknote className="w-4 h-4" /> },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, restaurantName } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + delivery + tax;

  useEffect(() => {
    if (items.length === 0) { navigate('/restaurants'); return; }
    addressService.getAddresses()
      .then(data => {
        setAddresses(data);
        const def = data.find(a => a.isDefault);
        if (def) setSelectedAddress(def.id);
      })
      .catch(() => {});
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress && addresses.length > 0) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const order = await orderService.placeOrder({
        addressId: selectedAddress,
        paymentMethod,
        specialInstructions: instructions || undefined,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="subtle" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 pb-16">
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>CHECKOUT</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', color: '#f3ede0', fontWeight: 700 }}>
            Complete your order.
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="p-6 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-label mb-4 flex items-center gap-2" style={{ color: '#625a50' }}>
                <MapPin className="w-3.5 h-3.5" /> DELIVERY ADDRESS
              </h2>
              {addresses.length === 0 ? (
                <p style={{ color: '#625a50', fontSize: '0.9rem' }}>No addresses saved. Please add one from your profile.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className="w-full text-left p-4 rounded-xl transition-all"
                      style={{
                        background: selectedAddress === addr.id ? 'rgba(232,137,42,0.06)' : 'rgba(255,255,255,0.02)',
                        border: selectedAddress === addr.id ? '1px solid rgba(232,137,42,0.2)' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm" style={{ color: '#f3ede0' }}>{addr.label}</span>
                        {addr.isDefault && <span className="chip chip-ember text-xs">Default</span>}
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#625a50' }}>
                        {addr.street}, {addr.area}, {addr.city} – {addr.pincode}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="p-6 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-label mb-4" style={{ color: '#625a50' }}>ORDER SUMMARY</h2>
              {restaurantName && <p className="text-sm mb-3" style={{ color: '#e8892a' }}>{restaurantName}</p>}
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.foodItemId} className="flex items-center gap-3">
                    <img
                      src={item.foodItemImage || PLACEHOLDER_FOOD}
                      alt={item.foodItemName}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_FOOD; }}
                    />
                    <span className="flex-1 text-sm" style={{ color: '#b3ac9f' }}>{item.foodItemName}</span>
                    <span className="text-xs" style={{ color: '#625a50' }}>×{item.quantity}</span>
                    <span className="text-sm font-medium" style={{ color: '#e8892a' }}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special instructions */}
            <div className="p-6 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-label mb-3" style={{ color: '#625a50' }}>SPECIAL INSTRUCTIONS</h2>
              <textarea
                className="input-dark resize-none"
                rows={3}
                placeholder="Any special requests for the restaurant or delivery partner…"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>

            {/* Payment */}
            <div className="p-6 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-label mb-4 flex items-center gap-2" style={{ color: '#625a50' }}>
                <CreditCard className="w-3.5 h-3.5" /> PAYMENT METHOD
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.value}
                    onClick={() => setPaymentMethod(pm.value)}
                    className="w-full text-left p-4 rounded-xl transition-all"
                    style={{
                      background: paymentMethod === pm.value ? 'rgba(232,137,42,0.06)' : 'rgba(255,255,255,0.02)',
                      border: paymentMethod === pm.value ? '1px solid rgba(232,137,42,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: paymentMethod === pm.value ? '#e8892a' : '#625a50' }}>{pm.icon}</span>
                      <span style={{ color: paymentMethod === pm.value ? '#f3ede0' : '#b3ac9f', fontWeight: 500, fontSize: '0.9375rem' }}>
                        {pm.label}
                      </span>
                    </div>
                    {pm.note && paymentMethod === pm.value && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Info className="w-3 h-3" style={{ color: '#625a50' }} />
                        <p className="text-xs" style={{ color: '#625a50' }}>{pm.note}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Bill + CTA */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 p-6 rounded-2xl space-y-4"
              style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h2 className="text-label" style={{ color: '#625a50' }}>BILL SUMMARY</h2>
              {[
                { label: 'Subtotal',  value: formatCurrency(subtotal) },
                { label: 'Delivery',  value: formatCurrency(delivery) },
                { label: 'Taxes (5%)',value: formatCurrency(tax)      },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span style={{ color: '#625a50', fontSize: '0.875rem' }}>{row.label}</span>
                  <span style={{ color: '#b3ac9f', fontSize: '0.875rem' }}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#f3ede0', fontWeight: 700 }}>Total</span>
                <span style={{ color: '#e8892a', fontWeight: 700, fontSize: '1.25rem' }}>{formatCurrency(total)}</span>
              </div>

              <button onClick={handlePlaceOrder} disabled={placing} className="btn-ember w-full justify-center mt-2">
                {placing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Placing Order…
                  </span>
                ) : 'Place Order'}
              </button>

              <p style={{ color: '#3c3630', fontSize: '0.75rem', fontFamily: '"DM Sans",sans-serif', textAlign: 'center', lineHeight: 1.5 }}>
                By placing your order you agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
