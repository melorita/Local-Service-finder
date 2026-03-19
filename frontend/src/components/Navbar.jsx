import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
    const [langOpen, setLangOpen] = React.useState(false);
    const [lang, setLang] = React.useState('EN');

    return (
        <nav className="glass-panel mx-4 mt-4 px-6 py-4 flex justify-between items-center sticky top-4 z-50">
            <Link
                to={(user?.role === 'admin' || user?.role === 'super_admin') ? "/admin" : "/"}
                className="text-2xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
                ServiceFinder
            </Link>

            <div className="flex gap-6 items-center">
                {(user?.role !== 'admin' && user?.role !== 'super_admin') && (
                    <Link to="/" className="text-slate-400 hover:text-white transition-colors font-medium">Find Services</Link>
                )}
                {user ? (
                    <div className="flex items-center gap-6">
                        {(user.role === 'admin' || user.role === 'super_admin') && (
                            <div className="flex gap-2">
                                <Link to="/admin" className="text-slate-400 hover:text-white transition-colors font-medium text-xs uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Dashboard</Link>
                                <Link to="/admin/settings" className="text-slate-400 hover:text-white transition-colors font-medium text-xs uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Settings</Link>
                            </div>
                        )}
                        {user.role === 'provider' && (
                            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors font-medium text-xs uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">My Dashboard</Link>
                        )}
                        {user.role === 'customer' && (
                            <Link to="/customer-dashboard" className="text-slate-400 hover:text-white transition-colors font-medium text-xs uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">My Activity</Link>
                        )}
                        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                            <div className="flex items-center gap-2 text-white">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                    <User size={16} className="text-blue-400" />
                                </div>
                                <span className="font-semibold text-sm">{user.name}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Link to="/login" className="btn-secondary py-1.5 px-4 text-sm">Login</Link>
                        <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">Register</Link>
                    </div>
                )}

                {/* Language Switcher (UI Only) */}
                <div className="relative ml-2">
                    <button 
                        onClick={() => setLangOpen(!langOpen)}
                        className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-bold rounded-lg focus:ring-2 focus:ring-blue-500/50 py-1.5 pl-3 pr-2 outline-none transition-colors"
                    >
                        {lang}
                        <svg className="fill-current h-3 w-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </button>
                    {langOpen && (
                        <div className="absolute right-0 mt-2 w-16 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                            <button 
                                onClick={() => { setLang('EN'); setLangOpen(false); }}
                                className="block w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => { setLang('አማ'); setLangOpen(false); }}
                                className="block w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                አማ
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
