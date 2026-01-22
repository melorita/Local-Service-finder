import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, MapPin, Phone, Wrench, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        service_type: '',
        location: '',
        contact_number: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('/api/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center py-12 px-4">
            <div className="glass-panel p-8 w-full max-w-2xl relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/10 blur-[80px] rounded-full"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2 text-center">Join ServiceFinder</h2>
                    <p className="text-slate-400 text-center mb-10">Connect with the best local professionals</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-8 text-center text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input name="name" className="input-field w-full pl-11" placeholder="John Doe" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input name="email" type="email" className="input-field w-full pl-11" placeholder="john@example.com" onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input name="password" type="password" className="input-field w-full pl-11" placeholder="••••••••" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">I am a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.role === 'customer' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                >
                                    <User size={24} />
                                    <span className="font-bold text-sm">Customer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'provider' })}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.role === 'provider' ? 'bg-violet-600/20 border-violet-500 text-violet-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                >
                                    <Wrench size={24} />
                                    <span className="font-bold text-sm">Provider</span>
                                </button>
                            </div>
                        </div>

                        {formData.role === 'provider' && (
                            <div className="flex flex-col gap-6 pt-4 border-t border-white/5 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-400 ml-1">Service Type</label>
                                        <div className="relative">
                                            <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input name="service_type" className="input-field w-full pl-11" placeholder="e.g. Plumber" onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-400 ml-1">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input name="location" className="input-field w-full pl-11" placeholder="e.g. New York" onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1">Contact Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input name="contact_number" className="input-field w-full pl-11" placeholder="+1..." onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1">Description</label>
                                    <textarea
                                        name="description"
                                        className="input-field w-full min-h-[120px] resize-none"
                                        placeholder="Tell users about your expertise, experience, and why they should hire you..."
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary py-4 mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating Account...' : (
                                <>
                                    <span>Create Account</span>
                                    <CheckCircle2 size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
