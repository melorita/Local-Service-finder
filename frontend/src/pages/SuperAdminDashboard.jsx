import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Shield, Users, Clock, AlertTriangle, UserCircle } from 'lucide-react';

const SuperAdminDashboard = ({ user, onProviderApproved }) => {
    const [providers, setProviders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('providers');
    const [createAdminData, setCreateAdminData] = useState({ name: '', email: '', password: '', location: '' });
    const [submittingAdmin, setSubmittingAdmin] = useState(false);
    const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
    const [showCustomLocation, setShowCustomLocation] = useState(false);
    const [filterLocation, setFilterLocation] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [locations, setLocations] = useState([]);

    const COMMON_LOCATIONS = ['Bole', 'Piassa', '4 Kilo', '5 Kilo', '6 Kilo', 'Ferensay', 'Kazanchis', 'Mexico', 'Megenagna', 'CMC', 'Summit', 'Sarbet', 'Gerji', 'Ayat', 'Lebu', 'Bole Bulbula', 'Tafo', 'Akaki Kality', 'Tor Hailoch', 'Jemo'];

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { data } = await axios.get('/api/auth/locations');
                if (data && data.length > 0) {
                    setLocations(data);
                } else {
                    setLocations(COMMON_LOCATIONS);
                }
            } catch (err) {
                console.error(err);
                setLocations(COMMON_LOCATIONS);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [filterLocation, filterRole]);

    const fetchAllData = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [providersResp, usersResp] = await Promise.all([
                axios.get(`/api/admin/providers?location=${filterLocation}`, config),
                axios.get(`/api/admin/users?location=${filterLocation}&role=${filterRole}`, config)
            ]);

            setProviders(providersResp.data);
            setUsers(usersResp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setSubmittingAdmin(true);
        setError(null);
        setAdminSuccessMsg('');
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post('/api/admin/create-admin', createAdminData, config);
            setAdminSuccessMsg('Admin account created successfully!');
            setCreateAdminData({ name: '', email: '', password: '', location: '' });
            setShowCustomLocation(false);
            fetchAllData(); // Refresh users list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setSubmittingAdmin(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Loading dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black mb-2 tracking-tight">Admin <span className="text-blue-400">Control</span></h2>
                    <p className="text-slate-400 font-medium italic">High-level management of platform entities and verifications</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('providers')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'providers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        PROVIDERS
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        ALL USERS
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'admins' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        CREATE ADMIN
                    </button>
                </div>
            </header>

            {error && (
                <div className="mb-10 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <span className="font-bold">{error}</span>
                    <button onClick={fetchAllData} className="ml-auto bg-red-500 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-panel p-6 flex items-center gap-5 group hover:bg-white/[0.07] transition-colors border-l-4 border-l-blue-500">
                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mb-1">Total Users</div>
                        <div className="text-3xl font-black tracking-tighter">{users.length}</div>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-5 group hover:bg-white/[0.07] transition-colors border-l-4 border-l-amber-500">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                        <Clock size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mb-1">Pending Providers</div>
                        <div className="text-3xl font-black tracking-tighter">{providers.filter(p => p.status === 'pending').length}</div>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-5 group hover:bg-white/[0.07] transition-colors border-l-4 border-l-emerald-500">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                        <Shield size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mb-1">Approved Partners</div>
                        <div className="text-3xl font-black tracking-tighter">{providers.filter(p => p.status === 'approved').length}</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden border-white/5 shadow-2xl">
                {activeTab !== 'admins' && (
                    <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-wrap gap-4 items-center">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Filters:</span>
                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm outline-none w-40"
                        >
                            <option value="">All Locations</option>
                            {locations.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {activeTab === 'users' && (
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm outline-none w-40"
                            >
                                <option value="">All Roles</option>
                                <option value="customer">Customer</option>
                                <option value="provider">Provider</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        )}
                    </div>
                )}
                {activeTab === 'providers' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 uppercase tracking-[0.2em] text-[10px] text-slate-500 font-black">
                                    <th className="px-6 py-5">Provider details</th>
                                    <th className="px-6 py-5">Location</th>
                                    <th className="px-6 py-5">Service specialty</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {providers.length > 0 ? providers.map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center font-black text-blue-400 border border-white/10">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{p.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{p.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-slate-300">
                                            {p.location || 'N/A'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-black text-slate-300 border border-white/10 uppercase tracking-widest">
                                                {p.service_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`
                                                inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                                ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    p.status === 'blocked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
                                            `}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 grayscale opacity-30">
                                                <AlertTriangle size={64} className="text-slate-500" />
                                                <p className="font-black text-2xl uppercase tracking-[0.2em] text-slate-500">No providers active</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'users' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 uppercase tracking-[0.2em] text-[10px] text-slate-500 font-black">
                                    <th className="px-6 py-5">User Profile</th>
                                    <th className="px-6 py-5">Role / Permission</th>
                                    <th className="px-6 py-5">Registration Date</th>
                                    <th className="px-6 py-5 text-right">Identifier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-white/10">
                                                    <UserCircle size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white uppercase tracking-tight">{u.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`
                                                px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                                                ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                                    u.role === 'provider' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-white/5 text-slate-400 border-white/10'}
                                            `}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-400 text-sm font-medium">
                                            {new Date(u.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-3 text-right text-xs font-mono text-slate-600">
                                            ID_{u.id.toString().padStart(4, '0')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-black mb-6 uppercase tracking-widest">Create New Administrative Account</h3>
                        {adminSuccessMsg && (
                            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold text-center">
                                {adminSuccessMsg}
                            </div>
                        )}
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        required
                                        className="input-field w-full"
                                        placeholder="Enter name"
                                        value={createAdminData.name}
                                        onChange={(e) => setCreateAdminData({ ...createAdminData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="input-field w-full"
                                        placeholder="admin@example.com"
                                        value={createAdminData.email}
                                        onChange={(e) => setCreateAdminData({ ...createAdminData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        required
                                        type="password"
                                        className="input-field w-full"
                                        placeholder="••••••••"
                                        value={createAdminData.password}
                                        onChange={(e) => setCreateAdminData({ ...createAdminData, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Location</label>
                                    {showCustomLocation ? (
                                        <div className="relative animate-in fade-in zoom-in-95 duration-200">
                                            <input
                                                required
                                                autoFocus
                                                className="input-field w-full border-blue-500/50 pr-10 focus:ring-blue-500/50"
                                                placeholder="Type new location name..."
                                                value={createAdminData.location}
                                                onChange={(e) => setCreateAdminData({ ...createAdminData, location: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCustomLocation(false);
                                                    setCreateAdminData({ ...createAdminData, location: '' });
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-full transition-colors"
                                                title="Cancel custom location"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <select
                                            className="input-field w-full bg-slate-900 border-white/10 text-white"
                                            value={createAdminData.location}
                                            onChange={(e) => {
                                                if (e.target.value === 'other') {
                                                    setShowCustomLocation(true);
                                                    setCreateAdminData({ ...createAdminData, location: '' });
                                                } else {
                                                    setCreateAdminData({ ...createAdminData, location: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="">Select a location...</option>
                                            {locations.map(reg => (
                                                <option key={reg} value={reg}>{reg}</option>
                                            ))}
                                            <option value="other">Other (Type manually...)</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submittingAdmin}
                                className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
                            >
                                <Shield size={18} />
                                {submittingAdmin ? 'Creating Account...' : 'Initialize Admin Access'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
