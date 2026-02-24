import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, MapPin, Star, Sparkles, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderProfile from './pages/ProviderProfile';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProfile from './pages/CustomerProfile';

const App = () => {
    const [user, setUser] = useState(null);
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
        fetchProviders();
    }, []);

    const fetchProviders = async (service = '', location = '') => {
        try {
            const resp = await axios.get(`/api/providers?service=${service}&location=${location}`);
            setProviders(resp.data);
        } catch (err) {
            console.error('Error fetching providers:', err);
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
            }
        }
    };


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router future={{ v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
                <Navbar user={user} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={user?.role === 'admin' ? <AdminDashboard onProviderApproved={fetchProviders} /> : <Home providers={providers} onSearch={fetchProviders} />} />
                    <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/provider/:id" element={<ProviderProfile user={user} onReviewSubmitted={fetchProviders} />} />
                    <Route path="/dashboard" element={user?.role === 'provider' ? <ProviderDashboard user={user} /> : <Link to="/login" />} />
                    <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard onProviderApproved={fetchProviders} /> : <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                        <div className="text-red-400 font-black text-4xl">403</div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Access Denied</p>
                        <Link to="/" className="btn-secondary mt-4">Return Home</Link>
                    </div>} />
                    <Route path="/admin/settings" element={user?.role === 'admin' ? <AdminProfile user={user} onUpdate={setUser} /> : <Link to="/login" />} />
                    <Route path="/customer-dashboard" element={user?.role === 'customer' ? <CustomerDashboard user={user} /> : <Link to="/login" />} />
                    <Route path="/customer/settings" element={user?.role === 'customer' ? <CustomerProfile user={user} onUpdate={setUser} /> : <Link to="/login" />} />
                </Routes>

            </div>
        </Router>
    );
};

export default App;
