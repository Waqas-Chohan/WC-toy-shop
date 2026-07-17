'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Building2, Search, Heart, ShoppingCart, Box, UserPlus, Trash2, X, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}
interface CartItem   { id: string; quantity: number; user: UserProfile; product: { id: string; name: string; price: number; slug: string }; }
interface WishlistItem { id: string; user: UserProfile; product: { id: string; name: string; price: number; slug: string }; }
interface AdminOrder  { id: string; user_id: string; total_amount: number; status: string; created_at: string; user?: UserProfile; }

const tierColors: Record<string, string> = {
  admin:    'bg-accent/20 text-accent border-accent/30',
  customer: 'bg-muted text-muted-foreground border-border',
};

export function CustomersSection() {
  const user = useAuthStore((s) => s.user);
  const [users, setUsers]               = useState<UserProfile[]>([]);
  const [cartItems, setCartItems]       = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [orders, setOrders]             = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  // Register modal state
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm]           = useState({ name: '', email: '', password: '', role: 'customer' });
  const [regLoading, setRegLoading]     = useState(false);
  const [showPass, setShowPass]         = useState(false);

  const headers = useMemo(
    () => ({ 'x-user-id': user?.id ?? '', 'x-user-email': user?.email ?? '' }),
    [user?.id, user?.email]
  );

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [usersRes, cartRes, wishlistRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/cart',        { headers }),
        fetch('/api/wishlist',    { headers }),
        fetch('/api/orders',      { headers }),
      ]);
      const [ud, cd, wd, od] = await Promise.all([
        usersRes.json(), cartRes.json(), wishlistRes.json(), ordersRes.json(),
      ]);
      if (usersRes.ok)    setUsers(ud.users || []);
      if (cartRes.ok)     setCartItems(cd.items || []);
      if (wishlistRes.ok) setWishlistItems(wd.items || []);
      if (ordersRes.ok)   setOrders(od.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user?.id, user?.email]);

  const handleDelete = async (uid: string) => {
    if (!confirm('Delete this user and all their data? This cannot be undone.')) return;
    setDeletingId(uid);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== uid));
        toast.success('User removed successfully');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [data.user, ...prev]);
        setShowRegister(false);
        setRegForm({ name: '', email: '', password: '', role: 'customer' });
        toast.success('User registered successfully');
      } else {
        toast.error(data.error || 'Failed to register user');
      }
    } catch {
      toast.error('Failed to register user');
    } finally {
      setRegLoading(false);
    }
  };

  const userSummaries = useMemo(
    () => users.map((profile) => ({
      profile,
      cartCount:     cartItems.filter((i) => i.user?.id === profile.id).length,
      wishlistCount: wishlistItems.filter((i) => i.user?.id === profile.id).length,
      orderCount:    orders.filter((o) => o.user_id === profile.id).length,
      totalSpent:    orders.filter((o) => o.user_id === profile.id)
                          .reduce((s, o) => s + Number(o.total_amount || 0), 0),
      cartItems:     cartItems.filter((i) => i.user?.id === profile.id),
      wishlistItems: wishlistItems.filter((i) => i.user?.id === profile.id),
      orders:        orders.filter((o) => o.user_id === profile.id),
    })),
    [cartItems, orders, users, wishlistItems]
  );

  const filtered = useMemo(
    () => userSummaries.filter(({ profile }) => {
      const q = searchQuery.toLowerCase();
      return (
        (profile.name.toLowerCase().includes(q) || profile.email.toLowerCase().includes(q)) &&
        (!selectedRole || profile.role === selectedRole)
      );
    }),
    [searchQuery, selectedRole, userSummaries]
  );

  return (
    <div className="space-y-6">
      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Register New User</h3>
              <button onClick={() => setShowRegister(false)} className="text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email address"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                required
              />
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <select
                value={regForm.role}
                onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRegister(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={regLoading}>
                  {regLoading ? 'Registering…' : 'Register'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr,0.9fr] gap-6">
        <div className="border border-border bg-card p-6 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Customers &amp; User Activity</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review every registered user, their cart, wishlist and order history.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={selectedRole === null ? 'default' : 'outline'} onClick={() => setSelectedRole(null)}>All</Button>
              <Button size="sm" variant={selectedRole === 'admin' ? 'default' : 'outline'} onClick={() => setSelectedRole('admin')}>Admins</Button>
              <Button size="sm" variant={selectedRole === 'customer' ? 'default' : 'outline'} onClick={() => setSelectedRole('customer')}>Customers</Button>
              <Button
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-500 text-white gap-1"
                onClick={() => setShowRegister(true)}
              >
                <UserPlus className="w-4 h-4" /> Register User
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[320px] bg-secondary border-border"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading users…' : `${filtered.length} users found`}
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No users found.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map(({ profile, cartCount, wishlistCount, orderCount, totalSpent, cartItems: uc, wishlistItems: uw, orders: uo }) => (
                <Card key={profile.id} className="border-border bg-slate-950/80">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 bg-secondary">
                          <AvatarFallback className="text-foreground">
                            {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-lg font-semibold text-white">{profile.name}</p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Joined {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={tierColors[profile.role] || 'bg-muted text-muted-foreground border-border'}>
                          {profile.role}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(profile.id)}
                          disabled={deletingId === profile.id || profile.id === user?.id}
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deletingId === profile.id ? 'Removing…' : 'Remove'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      {[
                        { label: 'Cart items',  value: cartCount },
                        { label: 'Wishlist',    value: wishlistCount },
                        { label: 'Orders',      value: orderCount },
                        { label: 'Revenue',     value: `$${totalSpent.toFixed(2)}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-3xl bg-secondary/70 p-4 border border-border">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveUserId(activeUserId === profile.id ? null : profile.id)}
                      >
                        {activeUserId === profile.id ? 'Hide details' : 'View details'}
                      </Button>

                      {activeUserId === profile.id && (
                        <div className="rounded-3xl bg-slate-950/70 p-5 border border-border mt-4">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="rounded-3xl bg-secondary/80 p-4">
                              <p className="text-sm text-muted-foreground mb-2">Cart products</p>
                              {uc.length ? (
                                <ul className="space-y-2 text-sm text-white">
                                  {uc.map((item) => (
                                    <li key={item.id} className="flex justify-between gap-3">
                                      <span>{item.product.name}</span>
                                      <span className="text-cyan-400">×{item.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-sm text-muted-foreground">No cart items</p>}
                            </div>
                            <div className="rounded-3xl bg-secondary/80 p-4">
                              <p className="text-sm text-muted-foreground mb-2">Wishlist</p>
                              {uw.length ? (
                                <ul className="space-y-2 text-sm text-white">
                                  {uw.map((item) => (
                                    <li key={item.id} className="flex justify-between gap-3">
                                      <span>{item.product.name}</span>
                                      <span className="text-emerald-300">${item.product.price?.toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-sm text-muted-foreground">No wishlist items</p>}
                            </div>
                            <div className="rounded-3xl bg-secondary/80 p-4">
                              <p className="text-sm text-muted-foreground mb-2">Recent orders</p>
                              {uo.length ? (
                                <ul className="space-y-2 text-sm text-white">
                                  {uo.map((o) => (
                                    <li key={o.id} className="flex justify-between gap-3">
                                      <span>#{o.id.slice(0, 8)}</span>
                                      <span className="text-cyan-400">{o.status}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-sm text-muted-foreground">No orders yet</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border bg-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold">Live user insights</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All registered users, their cart items, wishlist and full order history.
          </p>
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist activity is real-time.</p>
            <p className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Cart contents shown per user.</p>
            <p className="flex items-center gap-2"><Box className="w-4 h-4" /> Order status updates live.</p>
          </div>
          <div className="mt-6 p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-sm text-cyan-300">
            <p className="font-semibold mb-1">Register new users</p>
            <p className="text-cyan-400/70">Use the "Register User" button to create customer or admin accounts directly from this panel.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
