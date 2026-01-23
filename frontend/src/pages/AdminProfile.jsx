import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Save, Key, AlertCircle } from 'lucide-react';

const AdminProfile = ({ user, onUpdate }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.put('/api/admin/profile',
                { name, email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedUser = { ...user, name, email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onUpdate(updatedUser);

            setMessage({ type: 'success', text: 'Admin profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <header className="mb-10">
                <h2 className="text-4xl font-black mb-2 tracking-tight">Admin <span className="text-blue-400">Settings</span></h2>
                <p className="text-slate-400 font-medium italic">Manage your administrative credentials and security</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="glass-panel p-8 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>

                        <h3 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                            <User className="text-blue-500" /> Account Identity
                        </h3>

                        {message && (
                            <div className={`p-4 rounded-xl mb-8 text-sm font-bold text-center animate-in fade-in duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        className="input-field w-full pl-12"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Administrator Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="email"
                                        className="input-field w-full pl-12"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center gap-2 mt-4 px-8"
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-panel p-6 border-l-4 border-l-violet-500">
                        <div className="flex gap-4">
                            <Shield className="text-violet-400 shrink-0" size={24} />
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-white">System Role</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Super Administrator</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                            <Key size={24} />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-300">Password Security</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">To change your password, please contact the system owner or use the recovery portal.</p>
                        <button className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors tracking-widest">Request Reset</button>
                    </div>

                    <div className="flex gap-4 items-start p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                        <AlertCircle className="text-red-500 shrink-0" size={18} />
                        <p className="text-[10px] text-slate-500 font-medium">Changes to your email will require a new login session for security verification.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
