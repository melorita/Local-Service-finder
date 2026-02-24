import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Sparkles, TrendingUp } from 'lucide-react';

const Home = ({ providers, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchTerm, location);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <main>
                {/* Hero Section */}
                <section className="relative text-center py-24 md:py-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-[120px] -z-10 rounded-full"></div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
                        <Sparkles size={14} />
                        <span>Your trusted neighborhood network</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                        Find Expert Help <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">In Seconds.</span>
                    </h2>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                        Connecting you with the highest-rated plumbers, electricians, and local professionals. Verified reviews. Guaranteed service.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="glass-panel p-2 md:p-3 max-w-4xl mx-auto flex flex-col md:flex-row gap-2 shadow-2xl shadow-blue-500/10">
                        <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0">
                            <Search className="text-blue-400" size={22} />
                            <input
                                type="text"
                                placeholder="What service do you need?"
                                className="bg-transparent border-none text-white w-full py-3 focus:outline-none placeholder:text-slate-500 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0">
                            <MapPin className="text-slate-500" size={22} />
                            <input
                                type="text"
                                placeholder="Location"
                                className="bg-transparent border-none text-white w-full py-3 focus:outline-none placeholder:text-slate-500 font-medium"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary md:px-10 py-3 md:py-0 text-sm">Find Pros</button>
                    </form>

                    <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12 text-slate-500 font-bold text-sm uppercase tracking-widest">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> No Hidden Fees</div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Verified Licenses</div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div> 24/7 Support</div>
                    </div>
                </section>

                {/* Providers Grid */}
                <section className="pb-24">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black mb-1">Top Rated Professionals</h3>
                            <p className="text-slate-400 text-sm">Most trusted providers in your area currently</p>
                        </div>
                        <button onClick={() => onSearch('', '')} className="text-blue-400 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all underline underline-offset-8">
                            View All <TrendingUp size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {providers.length > 0 ? providers.filter(p => p.status === 'approved').map(p => (
                            <Link to={`/provider/${p.id}`} key={p.id} className="glass-panel p-6 group hover:bg-white/[0.07] transition-all hover:-translate-y-2 duration-300 block">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px]">
                                        <div className="w-full h-full bg-dark flex items-center justify-center rounded-[15px] font-black text-xl text-white">
                                            {p.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 text-amber-400">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-xs font-black">{parseFloat(p.rating).toFixed(1) || '0.0'}</span>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{p.name}</h4>
                                <div className="text-blue-400/80 text-xs font-black mb-4 uppercase tracking-[0.2em]">{p.service_type}</div>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 min-h-[4.5rem] font-medium italic">
                                    "{p.description || "No description available yet."}"
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                        <MapPin size={14} className="text-blue-500" />
                                        <span>{p.location}</span>
                                    </div>
                                    <div className="text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-black transition-colors border border-white/10 uppercase tracking-widest">
                                        View Detail
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="inline-flex flex-col items-center gap-4 opacity-50 grayscale">
                                    <Search size={48} />
                                    <p className="font-black text-xl tracking-widest uppercase">No professionals found</p>
                                    <button onClick={() => onSearch('', '')} className="text-blue-400 font-bold underline">Reset search</button>
                                </div>
                            </div>
                        )}
                        {providers.length > 0 && providers.filter(p => p.status === 'approved').length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <div className="inline-flex flex-col items-center gap-4 opacity-50 grayscale">
                                    <Search size={48} />
                                    <p className="font-black text-xl tracking-widest uppercase">No verified professionals found</p>
                                    <button onClick={() => onSearch('', '')} className="text-blue-400 font-bold underline">Reset search</button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
