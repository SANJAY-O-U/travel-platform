import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Hotel, Plane, Package,
  Users, BookOpen, Settings, LogOut,
  TrendingUp, IndianRupee, Activity, Star,
  ArrowUp, ArrowDown, Eye, Edit, Trash2,
  Plus, Search, ChevronDown, Globe,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { logout, selectUser } from '../store/slices/authSlice';
import { formatPrice, formatDate, getBookingStatusColor, getBookingStatusLabel } from '../utils/helpers';
import api from '../utils/api';

const SIDEBAR_NAV = [
  { id: 'overview',  label: 'Overview',   icon: LayoutDashboard, to: '/admin' },
  { id: 'hotels',    label: 'Hotels',     icon: Hotel,           to: '/admin/hotels' },
  { id: 'bookings',  label: 'Bookings',   icon: BookOpen,        to: '/admin/bookings' },
  { id: 'users',     label: 'Users',      icon: Users,           to: '/admin/users' },
  { id: 'flights',   label: 'Flights',    icon: Plane,           to: '/admin/flights' },
  { id: 'packages',  label: 'Packages',   icon: Package,         to: '/admin/packages' },
];

const CHART_COLORS = ['#0ea5e9', '#6366f1', '#ec4899', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name === 'Revenue' ? formatPrice(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Admin Sidebar ──────────────────────────────────────────────
function AdminSidebar({ active }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-card border-r border-dark-border flex flex-col z-40">
      <div className="p-5 border-b border-dark-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean to-blue-600 flex items-center justify-center">
            <Globe size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Travel<span className="gradient-text">Admin</span></span>
        </Link>
      </div>

      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=0ea5e9&color=fff&size=64`}
            alt=""
            className="w-9 h-9 rounded-lg"
          />
          <div>
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <span className="badge-gold text-xs">⚡ Admin</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {SIDEBAR_NAV.map(({ id, label, icon: Icon, to }) => (
          <Link
            key={id}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
              active === id
                ? 'bg-ocean/15 text-ocean border border-ocean/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-dark-border">
        <button
          onClick={() => { dispatch(logout()); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ title, value, change, icon: Icon, color = 'ocean', prefix = '' }) {
  const isPositive = change >= 0;
  const colorMap = {
    ocean:   'bg-ocean/15 text-ocean border-ocean/20',
    sand:    'bg-sand/15 text-sand border-sand/20',
    coral:   'bg-coral/15 text-coral border-coral/20',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">{title}</p>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(change)}% from last month
        </div>
      )}
    </motion.div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────
function OverviewTab() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      setDashboard(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
    </div>
  );

  if (!dashboard) return null;

  const { stats, revenueStats, recentBookings, topHotels, bookingsByStatus } = dashboard;

  const revenueChartData = revenueStats?.slice(-12).map(r => ({
    month: `${r._id?.month}/${r._id?.year?.toString().slice(-2)}`,
    Revenue: r.revenue,
    Bookings: r.bookings,
  }));

  const statusPieData = bookingsByStatus?.map(s => ({
    name: getBookingStatusLabel(s._id),
    value: s.count,
  }));

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"  value={formatPrice(stats?.totalRevenue)}   icon={IndianRupee} color="emerald" change={12} />
        <StatCard title="Total Bookings" value={stats?.totalBookings}               icon={BookOpen}   color="ocean"   change={8} />
        <StatCard title="Registered Users" value={stats?.totalUsers}               icon={Users}      color="coral"   change={15} />
        <StatCard title="Active Hotels"  value={stats?.totalHotels}                icon={Hotel}      color="sand"    change={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Revenue & Bookings (12 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueChartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Revenue" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="Bookings" stroke="#6366f1" strokeWidth={2} dot={false} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusPieData || []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {(statusPieData || []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {(statusPieData || []).map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-slate-400">{s.name}</span>
                </div>
                <span className="text-white font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings + Top hotels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-ocean text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(recentBookings || []).map((b) => (
              <div key={b._id} className="flex items-center gap-3 py-2 border-b border-dark-border last:border-0">
                <div className="w-8 h-8 rounded-lg bg-ocean/15 flex-center shrink-0">
                  <BookOpen size={14} className="text-ocean" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {b.hotel?.name || 'Booking'}
                  </p>
                  <p className="text-slate-500 text-xs">{b.user?.name} · {formatDate(b.createdAt, 'dd MMM')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-semibold">{formatPrice(b.pricing?.totalAmount)}</p>
                  <span className={`badge text-xs ${getBookingStatusColor(b.status)}`}>
                    {getBookingStatusLabel(b.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Top Hotels</h3>
            <Link to="/admin/hotels" className="text-ocean text-xs hover:underline">Manage</Link>
          </div>
          <div className="space-y-3">
            {(topHotels || []).map((hotel, i) => (
              <div key={hotel._id} className="flex items-center gap-3 py-2 border-b border-dark-border last:border-0">
                <div className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex-center text-slate-400 text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <img
                  src={hotel.coverImage?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80'}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{hotel.name}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <Star size={10} className="text-sand" fill="currentColor" />
                    {hotel.ratings?.overall?.toFixed(1)} · {hotel.totalBookings} bookings
                  </p>
                </div>
                <p className="text-ocean text-sm font-semibold shrink-0">{formatPrice(hotel.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hotels Management Tab ──────────────────────────────────────
function HotelsTab() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadHotels = (p = 1, q = '') => {
    setLoading(true);
    api.get('/hotels', { params: { city: q, page: p, limit: 10 } })
      .then(({ data }) => {
        setHotels(data.hotels || []);
        setTotal(data.total || 0);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { loadHotels(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this hotel?')) return;
    await api.delete(`/hotels/${id}`);
    loadHotels(page, search);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Hotels</h2>
          <p className="text-slate-400 text-sm">{total} total properties</p>
        </div>
        <Link to="/admin/hotels/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Hotel
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search hotels..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); loadHotels(1, e.target.value); }}
            className="input pl-10 py-2.5"
          />
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Hotel', 'Location', 'Type', 'Rating', 'Price/Night', 'Bookings', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-dark-border">
                    {Array.from({ length: 8 }, (_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : hotels.map((hotel) => (
                <tr key={hotel._id} className="border-b border-dark-border hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={hotel.coverImage?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=60'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-1 max-w-[160px]">{hotel.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {Array.from({ length: hotel.starRating }, (_, i) => (
                            <Star key={i} size={9} className="text-sand" fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{hotel.location?.city}</td>
                  <td className="px-4 py-3"><span className="badge-ocean text-xs">{hotel.propertyType}</span></td>
                  <td className="px-4 py-3 text-white text-sm">{hotel.ratings?.overall?.toFixed(1)} ★</td>
                  <td className="px-4 py-3 text-white text-sm font-semibold">{formatPrice(hotel.priceRange?.min)}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{hotel.totalBookings || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${hotel.isActive ? 'badge-success' : 'badge-error'}`}>
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link to={`/hotels/${hotel.slug || hotel._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-ocean hover:bg-ocean/10 transition-all" title="View">
                        <Eye size={14} />
                      </Link>
                      <Link to={`/admin/hotels/edit/${hotel._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-sand hover:bg-sand/10 transition-all" title="Edit">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(hotel._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Users Management Tab ───────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const loadUsers = (q = '') => {
    setLoading(true);
    api.get('/admin/users', { params: { search: q, limit: 20 } })
      .then(({ data }) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleActive = async (userId, current) => {
    await api.patch(`/admin/users/${userId}`, { isActive: !current });
    loadUsers(search);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Users</h2>
          <p className="text-slate-400 text-sm">{total} registered users</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); loadUsers(e.target.value); }}
            className="input pl-10 py-2.5"
          />
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['User', 'Email', 'Role', 'Joined', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-dark-border">
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map((u) => (
                <tr key={u._id} className="border-b border-dark-border hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0ea5e9&color=fff&size=40`}
                        alt=""
                        className="w-9 h-9 rounded-full"
                      />
                      <p className="text-white text-sm font-medium">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${u.role === 'admin' ? 'badge-gold' : 'badge-ocean'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.createdAt, 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.lastLogin ? formatDate(u.lastLogin, 'dd MMM yyyy') : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${u.isActive ? 'badge-success' : 'badge-error'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u._id, u.isActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        u.isActive
                          ? 'border-red-500/25 text-red-400 hover:bg-red-500/10'
                          : 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── All Bookings Tab ───────────────────────────────────────────
function AllBookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const load = (status = '') => {
    setLoading(true);
    const params = { limit: 20 };
    if (status) params.status = status;
    api.get('/bookings/all', { params })
      .then(({ data }) => {
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">All Bookings</h2>
          <p className="text-slate-400 text-sm">{total} total bookings</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { val: '',          label: 'All' },
          { val: 'confirmed', label: 'Confirmed' },
          { val: 'pending',   label: 'Pending' },
          { val: 'cancelled', label: 'Cancelled' },
          { val: 'completed', label: 'Completed' },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val); load(val); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all ${
              statusFilter === val ? 'bg-ocean/15 text-ocean border-ocean/30' : 'bg-dark-card border-dark-border text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Booking Ref', 'Guest', 'Property', 'Dates', 'Amount', 'Type', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-dark-border">
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : bookings.map((b) => (
                <tr key={b._id} className="border-b border-dark-border hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-ocean text-xs font-mono">{b.bookingRef}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{b.user?.name}</p>
                    <p className="text-slate-500 text-xs">{b.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm line-clamp-1 max-w-[150px]">
                    {b.hotel?.name || b.flight?.flightNumber || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {b.checkIn ? formatDate(b.checkIn, 'dd MMM') : '—'}
                    {b.checkOut ? ` – ${formatDate(b.checkOut, 'dd MMM')}` : ''}
                  </td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">{formatPrice(b.pricing?.totalAmount)}</td>
                  <td className="px-4 py-3"><span className="badge-ocean text-xs capitalize">{b.bookingType}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${getBookingStatusColor(b.status)}`}>
                      {getBookingStatusLabel(b.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ───────────────────────────────────────
export default function AdminDashboard() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const active = pathSegments[2] || 'overview';

  return (
    <div className="min-h-screen bg-dark-bg">
      <AdminSidebar active={active} />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <Routes>
            <Route path="/"          element={<OverviewTab />} />
            <Route path="/hotels"    element={<HotelsTab />} />
            <Route path="/bookings"  element={<AllBookingsTab />} />
            <Route path="/users"     element={<UsersTab />} />
            <Route path="/flights"   element={<div className="text-white text-xl font-semibold">Flight Management — Coming Soon</div>} />
            <Route path="/packages"  element={<div className="text-white text-xl font-semibold">Package Management — Coming Soon</div>} />
            <Route path="*"          element={<OverviewTab />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}