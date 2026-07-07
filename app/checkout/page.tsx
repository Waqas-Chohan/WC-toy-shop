'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, getSubtotal, getTotal } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = getTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success('Order placed successfully!');
      router.push('/');
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-tertiary text-lg mb-4">Your cart is empty</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6 text-cyan-400" />
        </Link>
        <h1 className="text-4xl font-bold gradient-text-glow">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div className="glass-card p-8 rounded-2xl border-cyan-500/10 hover:border-cyan-500/20 transition-all">
              <h2 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  placeholder="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="col-span-2"
                />
                <Input
                  placeholder="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="col-span-2"
                />
                <Input
                  placeholder="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="col-span-2"
                />
                <Input
                  placeholder="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <Input
                  placeholder="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
                <Input
                  placeholder="ZIP Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Payment */}
            <div className="glass-card p-8 rounded-2xl border-cyan-500/10 hover:border-cyan-500/20 transition-all">
              <h2 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Payment Method
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="Card Number"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  maxLength="16"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="MM/YY"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    placeholder="CVC"
                    name="cardCvc"
                    value={formData.cardCvc}
                    onChange={handleChange}
                    maxLength="3"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-futuristic w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 rounded-2xl border-cyan-500/10 sticky top-20 h-fit">
            <h2 className="font-bold text-xl text-primary mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-cyan-500/20">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-secondary">
                  <span className="text-primary">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-cyan-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b border-cyan-500/20">
              <div className="flex justify-between text-sm text-secondary">
                <span className="text-primary">Subtotal</span>
                <span className="text-cyan-400">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary">
                <span className="text-primary">Tax (10%)</span>
                <span className="text-cyan-400">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary">
                <span className="text-primary">Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-400 font-semibold' : 'text-cyan-400'}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-xl border border-cyan-500/20">
              <span className="text-primary">Total</span>
              <span className="gradient-text-glow">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
