import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Phone, Mail, Edit3, Save, Star, Clock, AlertCircle } from 'lucide-react';

const ProviderDashboard = ({ user }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.get(`/api/providers/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(resp.data);
            setEditData(resp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.put(`/api/providers/me`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(resp.data.message || 'Profile updated successfully!');
            fetchProfile(); // Re-fetch to get potential pending status
            setIsEditing(false);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div></div>;
    if (!profile) return <div className="text-center p-20 text-slate-400">Profile not found. Please ensure you are registered as a provider.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black mb-2 tracking-tight">Provider Dashboard</h2>
                    <p className="text-slate-400 font-medium">Manage your professional presence and track performance</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${profile.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    Status: {profile.status}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-8 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>

                        <div className="flex justify-between items-center mb-10 relative">
                            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <User className="text-blue-500" /> Professional Profile
                            </h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl hover:bg-blue-500/10 transition-all"
                                >
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            )}
                        </div>

                        {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-8 text-sm font-bold text-center animate-in fade-in duration-300">{message}</div>}

                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Service Type</label>
                                    <input
                                        disabled={!isEditing}
                                        value={editData.service_type}
                                        onChange={(e) => setEditData({ ...editData, service_type: e.target.value })}
                                        className={`input-field w-full ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                    />
                                    {profile.pending_request && (
                                        <div className="flex items-center gap-2 mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-bold">
                                            <AlertCircle size={14} />
                                            Pending change to: "{profile.pending_request.requested_service}"
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                                    <input
                                        disabled={!isEditing}
                                        value={editData.location}
                                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                        className={`input-field w-full ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                                    <input
                                        disabled={!isEditing}
                                        value={editData.contact_number}
                                        onChange={(e) => setEditData({ ...editData, contact_number: e.target.value })}
                                        className={`input-field w-full ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Business Description</label>
                                <textarea
                                    disabled={!isEditing}
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className={`input-field w-full min-h-[160px] resize-none ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                />
                            </div>

                            {isEditing && (
                                <div className="flex gap-4 pt-4 relative z-10">
                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <Save size={18} /> Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(false); setEditData(profile); }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Performance Section */}
                <div className="space-y-8">
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-black mb-8 uppercase tracking-widest">Analytics</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Star fill="currentColor" /></div>
                                    <span className="font-bold text-slate-400">Avg Rating</span>
                                </div>
                                <span className="text-2xl font-black">{parseFloat(profile.rating).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Clock /></div>
                                    <span className="font-bold text-slate-400">Total Reviews</span>
                                </div>
                                <span className="text-2xl font-black">{profile.reviews?.length || 0}</span>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
