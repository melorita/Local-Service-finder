import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Shield, Users, Clock, AlertTriangle, UserCircle } from 'lucide-react';

const AdminDashboard = ({ user, onProviderApproved }) => {
    const [providers, setProviders] = useState([]);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('providers');
    const [createAdminData, setCreateAdminData] = useState({ name: '', email: '', password: '', region: '' });
    const [submittingAdmin, setSubmittingAdmin] = useState(false);
    const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
    const [showCustomRegion, setShowCustomRegion] = useState(false);
    const [filterRegion, setFilterRegion] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [regions, setRegions] = useState([]);

    const COMMON_REGIONS = ['Bole', 'Piazza', 'Kazanchis', 'Megenagna', 'Mexiko', 'Sarbet', '4 Kilo'];

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const { data } = await axios.get('/api/auth/regions');
                if (data && data.length > 0) {
                    setRegions(data);
                } else {
                    setRegions(COMMON_REGIONS);
                }
            } catch (err) {
                console.error(err);
                setRegions(COMMON_REGIONS);
            }
        };
        fetchRegions();
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [filterRegion, filterRole]);

    const fetchAllData = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [providersResp, usersResp, requestsResp] = await Promise.all([
                axios.get(`/api/admin/providers?region=${filterRegion}`, config),
                axios.get(`/api/admin/users?region=${filterRegion}&role=${filterRole}`, config),
                axios.get(`/api/admin/service-change-requests?region=${filterRegion}`, config)
            ]);

            setProviders(providersResp.data);
            setUsers(usersResp.data);
            setRequests(requestsResp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.patch(`/api/admin/providers/${id}/status`, { status }, config);
            fetchAllData();
            if (onProviderApproved) onProviderApproved();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.patch(`/api/admin/service-change-requests/${requestId}`, { status }, config);
            fetchAllData();
            if (onProviderApproved) onProviderApproved();
        } catch (err) {
            console.error(err);
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
            setCreateAdminData({ name: '', email: '', password: '', region: '' });
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
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        REQUESTS {requests.length > 0 && <span className="ml-2 bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
                    </button>
                    {user?.role === 'super_admin' && (
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'admins' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            CREATE ADMIN
                        </button>
                    )}
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
                {user?.role === 'super_admin' && activeTab !== 'admins' && (
                    <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-wrap gap-4 items-center">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Filters:</span>
                        <select
                            value={filterRegion}
                            onChange={(e) => setFilterRegion(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm outline-none w-40"
                        >
                            <option value="">All Regions</option>
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
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
                                    <th className="px-6 py-5">Service specialty</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                    <th className="px-6 py-5 text-right">Verification Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {providers.length > 0 ? providers.map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center font-black text-blue-400 border border-white/10">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{p.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{p.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-black text-slate-300 border border-white/10 uppercase tracking-widest">
                                                {p.service_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`
                                                inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                                ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    p.status === 'blocked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
                                            `}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex justify-end gap-3">
                                                {p.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(p.id, 'approved')}
                                                            className="px-4 py-2 flex items-center gap-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-xs font-black uppercase tracking-widest"
                                                            title="Accept this provider"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(p.id, 'blocked')}
                                                            className="px-4 py-2 flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 text-xs font-black uppercase tracking-widest"
                                                            title="Reject this provider"
                                                        >
                                                            <X size={14} /> Decline
                                                        </button>
                                                    </>
                                                )}
                                                {p.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusChange(p.id, 'blocked')}
                                                        className="px-4 py-2 flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 text-xs font-black uppercase tracking-widest"
                                                        title="Suspend this provider"
                                                    >
                                                        <X size={14} /> Block
                                                    </button>
                                                )}
                                                {p.status === 'blocked' && (
                                                    <button
                                                        onClick={() => handleStatusChange(p.id, 'approved')}
                                                        className="px-4 py-2 flex items-center gap-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 text-xs font-black uppercase tracking-widest"
                                                        title="Re-approve this provider"
                                                    >
                                                        <Check size={14} /> Restore
                                                    </button>
                                                )}
                                            </div>
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
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-white/10">
                                                    <UserCircle size={24} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white uppercase tracking-tight">{u.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`
                                                px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                                                ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                                    u.role === 'provider' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-white/5 text-slate-400 border-white/10'}
                                            `}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-slate-400 text-sm font-medium">
                                            {new Date(u.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-6 text-right text-xs font-mono text-slate-600">
                                            ID_{u.id.toString().padStart(4, '0')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'requests' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 uppercase tracking-[0.2em] text-[10px] text-slate-500 font-black">
                                    <th className="px-6 py-5">Provider Name</th>
                                    <th className="px-6 py-5">Current → Requested</th>
                                    <th className="px-6 py-5">Date Requested</th>
                                    <th className="px-6 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {requests.length > 0 ? requests.map(r => (
                                    <tr key={r.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-6 font-bold text-white uppercase tracking-tight">
                                            {r.provider_name}
                                        </td>
                                        <td className="px-6 py-6 italic text-slate-400 text-sm">
                                            <span className="text-slate-500 line-through">{r.old_service}</span>
                                            <span className="mx-2 text-blue-400 font-black">→</span>
                                            <span className="text-emerald-400 font-black">{r.requested_service}</span>
                                        </td>
                                        <td className="px-6 py-6 text-slate-400 text-sm font-medium">
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleRequestAction(r.id, 'APPROVED')}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRequestAction(r.id, 'REJECTED')}
                                                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Clock size={64} className="text-slate-500" />
                                                <p className="font-black text-2xl uppercase tracking-[0.2em] text-slate-500">No pending requests</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Region</label>
                                    <select
                                        className="input-field w-full bg-slate-900 border-white/10 text-white"
                                        value={showCustomRegion ? 'other' : createAdminData.region}
                                        onChange={(e) => {
                                            if (e.target.value === 'other') {
                                                setShowCustomRegion(true);
                                                setCreateAdminData({ ...createAdminData, region: '' });
                                            } else {
                                                setShowCustomRegion(false);
                                                setCreateAdminData({ ...createAdminData, region: e.target.value });
                                            }
                                        }}
                                    >
                                        <option value="">Select a region...</option>
                                        {regions.map(reg => (
                                            <option key={reg} value={reg}>{reg}</option>
                                        ))}
                                        <option value="other">Other (Type manually...)</option>
                                    </select>
                                </div>
                                {showCustomRegion && (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Enter Custom Region</label>
                                        <input
                                            required
                                            className="input-field w-full border-blue-500/30"
                                            placeholder="Type new region name..."
                                            value={createAdminData.region}
                                            onChange={(e) => setCreateAdminData({ ...createAdminData, region: e.target.value })}
                                        />
                                    </div>
                                )}
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

export default AdminDashboard;
