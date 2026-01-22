import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Shield, Users, Clock, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const resp = await axios.get('/api/admin/providers');
            setProviders(resp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await axios.patch(`/api/admin/providers/${id}/status`, { status });
            fetchProviders();
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
            <header className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-black mb-2">Admin Control</h2>
                <p className="text-slate-400">Manage platform growth and verify service providers</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-panel p-6 flex items-center gap-5 group hover:bg-white/[0.07] transition-colors">
                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Entities</div>
                        <div className="text-3xl font-black">{providers.length}</div>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-5 group hover:bg-white/[0.07] transition-colors">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                        <Clock size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Pending Verification</div>
                        <div className="text-3xl font-black">{providers.filter(p => p.status === 'pending').length}</div>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-center gap-5 group hover:bg-white/[0.07] transition-colors">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                        <Shield size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Approved Partners</div>
                        <div className="text-3xl font-black">{providers.filter(p => p.status === 'approved').length}</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Provider details</th>
                                <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Service specialty</th>
                                <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest text-center">Current Status</th>
                                <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest text-right">Verification Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {providers.length > 0 ? providers.map(p => (
                                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold border border-white/10">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</div>
                                                <div className="text-xs text-slate-500 font-medium">{p.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-slate-300 border border-white/10 uppercase tracking-widest">
                                            {p.service_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                      ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                p.status === 'blocked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
                    `}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 border-l border-white/5">
                                        <div className="flex justify-end gap-2">
                                            {p.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleStatusChange(p.id, 'approved')}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                                    title="Approve Provider"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {p.status !== 'blocked' && (
                                                <button
                                                    onClick={() => handleStatusChange(p.id, 'blocked')}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                                    title="Block Provider"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-30">
                                            <AlertTriangle size={48} />
                                            <p className="font-bold text-xl uppercase tracking-widest">No providers found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
