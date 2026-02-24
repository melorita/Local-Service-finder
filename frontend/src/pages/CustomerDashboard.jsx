import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, MessageSquare, Calendar, ChevronRight, Search, Settings, LogOut } from 'lucide-react';
import axios from 'axios';

const CustomerDashboard = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const resp = await axios.get('/api/reviews/my-reviews', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReviews(resp.data);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchMyReviews();
    }, [user]);

    const stats = [
        { label: 'Total Reviews', value: reviews.length, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Avg Rating Given', value: reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : '0.0', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header Section */}
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
                        {user?.name?.charAt(0) || <User />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Welcome, {user?.name}!</h1>
                        <p className="text-slate-400 font-medium">Manage your activity and find quality help.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-panel p-6 flex items-center gap-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black">{stat.value}</p>
                            </div>
                        </div>
                    ))}

                    {/* Quick Search CTA */}
                    <Link to="/" className="lg:col-span-2 glass-panel p-6 bg-gradient-to-r from-blue-600/10 to-transparent border-blue-500/20 hover:border-blue-500/40 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-500/30">
                                <Search size={24} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Need a professional?</p>
                                <p className="text-blue-400/80 text-sm font-medium">Find the best services in your area</p>
                            </div>
                        </div>
                        <ChevronRight className="text-blue-500 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Reviews Table/List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                            <Star className="text-amber-400" size={20} />
                            Your Recent Reviews
                        </h2>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="glass-panel p-6 hover:bg-white/[0.04] transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                                {review.provider_name.charAt(0)}
                                            </div>
                                            <div>
                                                <Link to={`/provider/${review.provider_id}`} className="font-bold text-lg hover:text-blue-400 transition-colors">
                                                    {review.provider_name}
                                                </Link>
                                                <p className="text-blue-400/80 text-xs font-black uppercase tracking-widest">{review.service_type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md text-amber-400 border border-amber-500/20">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-xs font-black">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 italic mb-4">"{review.comment}"</p>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                        <Calendar size={14} />
                                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel py-16 text-center">
                            <div className="opacity-20 flex flex-col items-center gap-4 mb-4">
                                <MessageSquare size={64} />
                                <p className="text-2xl font-black uppercase tracking-tighter italic font-serif">Empty Handed</p>
                            </div>
                            <p className="text-slate-400 font-medium mb-6">You haven't left any reviews yet.</p>
                            <Link to="/" className="btn-primary inline-flex items-center gap-2">
                                <Search size={18} />
                                Explore Services
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-wider mb-2">My Settings</h2>
                    <div className="glass-panel p-6 space-y-4">
                        <Link to="/customer/settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                                    <User size={20} />
                                </div>
                                <span className="font-bold">Profile Details</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                        </Link>

                        <Link to="/account-security" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                                    <Settings size={20} />
                                </div>
                                <span className="font-bold">Security</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                        </Link>

                        <div className="h-[1px] bg-white/5 my-2"></div>

                        <button onClick={() => {
                            localStorage.clear();
                            window.location.href = '/login';
                        }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all font-bold">
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>

                    {/* Fun Card */}
                    <div className="glass-panel p-6 bg-amber-500/5 border-amber-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-amber-400 font-black text-sm uppercase tracking-widest mb-2">Did you know?</p>
                            <p className="text-slate-300 text-sm italic font-medium">
                                Reviews help other customers find reliable professionals and help pros improve their craft!
                            </p>
                        </div>
                        <Star className="absolute -right-4 -bottom-4 text-amber-500/10" size={100} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
