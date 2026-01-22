import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Phone, Mail, User, Send, Clock, ShieldCheck } from 'lucide-react';

const ProviderProfile = ({ user }) => {
    const { id } = useParams();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProvider();
    }, [id]);

    const fetchProvider = async () => {
        try {
            const resp = await axios.get(`/api/providers/${id}`);
            setProvider(resp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setMessage('Please login to leave a review');
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/reviews',
                { provider_id: id, ...review },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Review submitted successfully!');
            setReview({ rating: 5, comment: '' });
            fetchProvider(); // Refresh details and reviews
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div></div>;
    if (!provider) return <div className="text-center p-20 text-slate-400">Provider not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info Card */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-8 sticky top-24">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-4xl mb-6 shadow-xl shadow-blue-500/20">
                                {provider.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-black mb-1">{provider.name}</h2>
                            <p className="text-blue-400 font-black text-sm uppercase tracking-widest mb-4">{provider.service_type}</p>

                            <div className="flex items-center gap-1.5 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 text-amber-400 font-black">
                                <Star size={18} fill="currentColor" />
                                <span>{parseFloat(provider.rating).toFixed(1)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="p-2 bg-white/5 rounded-lg"><MapPin size={18} /></div>
                                <span className="text-sm font-medium">{provider.location}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="p-2 bg-white/5 rounded-lg"><Phone size={18} /></div>
                                <span className="text-sm font-medium">{provider.contact_number}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="p-2 bg-white/5 rounded-lg"><Mail size={18} /></div>
                                <span className="text-sm font-medium">{provider.email}</span>
                            </div>
                            <div className="flex items-center gap-4 text-emerald-400">
                                <div className="p-2 bg-emerald-500/10 rounded-lg"><ShieldCheck size={18} /></div>
                                <span className="text-xs font-black uppercase tracking-widest">Verified Pro</span>
                            </div>
                        </div>

                        <button className="btn-primary w-full mt-8 py-4 uppercase tracking-widest text-sm">Contact Business</button>
                    </div>
                </div>

                {/* Right Column: Description & Reviews */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About Section */}
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <User className="text-blue-500" /> Professional Overview
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            {provider.description}
                        </p>
                    </div>

                    {/* Review Submission */}
                    {user?.role === 'customer' && (
                        <div className="glass-panel p-8 overflow-hidden relative">
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full"></div>
                            <h3 className="text-xl font-black mb-6 relative">Rate this Service</h3>
                            {message && <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${message.includes('successfully') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{message}</div>}

                            <form onSubmit={handleReviewSubmit} className="space-y-6 relative">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setReview({ ...review, rating: num })}
                                                className={`p-3 rounded-xl border transition-all ${review.rating >= num ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-white/5 border-white/10 text-slate-600'}`}
                                            >
                                                <Star size={24} fill={review.rating >= num ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Comment</label>
                                    <textarea
                                        className="input-field min-h-[120px] resize-none"
                                        placeholder="Tell others about your experience..."
                                        value={review.comment}
                                        onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={submitting} className="btn-primary px-10 flex items-center gap-2">
                                    {submitting ? 'Posting...' : 'Post Review'} <Send size={18} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-xl font-black uppercase tracking-widest">Customer Feedback</h3>
                            <span className="text-slate-500 font-bold text-sm bg-white/5 px-3 py-1 rounded-lg">{provider.reviews?.length || 0} reviews</span>
                        </div>

                        {provider.reviews && provider.reviews.length > 0 ? provider.reviews.map(r => (
                            <div key={r.id} className="glass-panel p-6 border-l-4 border-l-blue-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-white/10">
                                            {r.reviewer.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white leading-tight">{r.reviewer}</div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                                <Clock size={12} /> {new Date(r.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500 px-2 py-1 bg-amber-500/10 rounded-lg text-xs font-black">
                                        <Star size={12} fill="currentColor" /> {r.rating}
                                    </div>
                                </div>
                                <p className="text-slate-400 font-medium italic mt-2">"{r.comment}"</p>
                            </div>
                        )) : (
                            <div className="glass-panel p-12 text-center text-slate-500">
                                <Star size={40} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-sm">No reviews yet. Be the first to rate!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderProfile;
