import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="glass-panel mx-4 mt-4 px-6 py-4 flex justify-between items-center sticky top-4 z-50">
            <Link
                to="/"
                className="text-2xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
                ServiceFinder
            </Link>

            <div className="flex gap-6 items-center">
                <Link to="/" className="text-slate-400 hover:text-white transition-colors font-medium">Find Services</Link>
                {user ? (
                    <div className="flex items-center gap-6">
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-slate-400 hover:text-white transition-colors font-medium text-xs uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Admin</Link>
                        )}
                        {user.role === 'provider' && (
                            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors font-medium text-xs uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">My Dashboard</Link>
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
            </div>
        </nav>
    );
};

export default Navbar;
