import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Shield, Users, Clock, AlertTriangle, UserCircle } from 'lucide-react';

const AdminDashboard = ({ onProviderApproved }) => {
    const [providers, setProviders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('providers');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [providersResp, usersResp] = await Promise.all([
                axios.get('/api/admin/providers', config),
                axios.get('/api/admin/users', config)
            ]);

            setProviders(providersResp.data);
            setUsers(usersResp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
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
                </div>
            </header>

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
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

