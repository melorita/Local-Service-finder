import React, { useState } from 'react';
import axios from 'axios';
import { Key, Save, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CustomerChangePassword = ({ user }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordMessage({ type: 'error', text: 'New password must be different from current password' });
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/change-password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Optionally redirect back after successful change
            setTimeout(() => {
                navigate('/customer/settings');
            }, 1500);
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <header className="mb-10">
                <Link to="/customer/settings" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-xs font-black uppercase tracking-widest mb-6">
                    <ArrowLeft size={16} /> Back to Settings
                </Link>
                <h2 className="text-4xl font-black mb-2 tracking-tight">Security <span className="text-blue-400">Settings</span></h2>
                <p className="text-slate-400 font-medium italic">Update your account password</p>
            </header>

            <div className="glass-panel p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10 shadow-inner">
                        <Key size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-white">Change Password</h3>
                        <p className="text-sm text-slate-400 font-medium">Protect your {user?.role === 'provider' ? 'Provider' : 'Customer'} account</p>
                    </div>
                </div>

                {passwordMessage && (
                    <div className={`p-4 rounded-xl mb-8 text-sm font-bold text-center animate-in fade-in duration-300 ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {passwordMessage.text}
                    </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                className="input-field w-full pl-12 pr-12"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" size={18} />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                className="input-field w-full pl-12 pr-12 border-blue-500/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" size={18} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                className="input-field w-full pl-12 pr-12 border-blue-500/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="btn-primary flex items-center justify-center gap-2 mt-8 w-full py-3.5"
                    >
                        {passwordLoading ? 'Updating...' : <><Save size={18} /> Confirm Password Change</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomerChangePassword;
