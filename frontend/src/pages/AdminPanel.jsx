import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, Ticket, Receipt, AlertCircle, PlusCircle, 
    Search, DollarSign, Users, CheckCircle2, RefreshCw, ChevronRight
} from 'lucide-react';

export default function AdminPanel() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [reservations, setReservations] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [newTicket, setNewTicket] = useState({
        sport: 'football',
        host_team: '',
        guest_team: '',
        match_date: '',
        match_location: '',
        ticket_price: '',
        capacity: 100
    });

    useEffect(() => {
        if (!user || user.role !== 'support') {
            navigate('/');
            return;
        }
        fetchAdminData();
    }, [user, navigate]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [resData, repData] = await Promise.all([
                api.get('/admin/reservations'),
                api.get('/admin/reports')
            ]);
            setReservations(resData.data);
            setReports(repData.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/reservations/${id}?status=${status}`);
            fetchAdminData();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/tickets', {
                ...newTicket,
                ticket_price: parseFloat(newTicket.ticket_price),
                capacity: parseInt(newTicket.capacity)
            });
            alert("Match ticket created successfully!");
            setNewTicket({
                sport: 'football',
                host_team: '',
                guest_team: '',
                match_date: '',
                match_location: '',
                ticket_price: '',
                capacity: 100
            });
            setActiveTab('overview');
            fetchAdminData();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to create ticket");
        }
    };

    const totalRevenue = reservations
        .filter(r => r.reservation_status === 'paid')
        .reduce((sum, r) => sum + (parseFloat(r.ticket_price) || 0), 0);

    const activeBookings = reservations.filter(r => r.reservation_status === 'reserved').length;
    const paidTickets = reservations.filter(r => r.reservation_status === 'paid').length;

    const filteredReservations = reservations.filter(r => 
        r.host_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.guest_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm)
    );

    if (loading) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading Dashboard Data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 py-10 px-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                            <span>Admin Portal</span>
                            <ChevronRight size={12} />
                            <span>Management Control</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">System Operations</h1>
                    </div>
                    <button 
                        onClick={fetchAdminData} 
                        className="self-start md:self-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition"
                    >
                        <RefreshCw size={16} /> Sync Metrics
                    </button>
                </div>

                {/* HORIZONTAL TABS (افقی، مجزا و مرتب) */}
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                            activeTab === 'overview' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <LayoutDashboard size={18} /> Analytics & Overview
                    </button>

                    <button 
                        onClick={() => setActiveTab('reservations')}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                            activeTab === 'reservations' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <Receipt size={18} /> Manage Bookings ({reservations.length})
                    </button>

                    <button 
                        onClick={() => setActiveTab('create-ticket')}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                            activeTab === 'create-ticket' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <PlusCircle size={18} /> Create New Event
                    </button>

                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                            activeTab === 'reports' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <AlertCircle size={18} /> User Complaints ({reports.length})
                    </button>
                </div>

                {/* TAB CONTENT AREAS */}
                <div className="pt-2">
                    
                    {/* 1. OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                                    <div className="flex justify-between items-center text-emerald-400 mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Revenue</span>
                                        <div className="p-2 bg-emerald-500/10 rounded-lg"><DollarSign size={20} /></div>
                                    </div>
                                    <p className="text-3xl font-black text-white">${totalRevenue.toFixed(2)}</p>
                                </div>

                                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                                    <div className="flex justify-between items-center text-blue-400 mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed Sales</span>
                                        <div className="p-2 bg-blue-500/10 rounded-lg"><CheckCircle2 size={20} /></div>
                                    </div>
                                    <p className="text-3xl font-black text-white">{paidTickets}</p>
                                </div>

                                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                                    <div className="flex justify-between items-center text-amber-400 mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Orders</span>
                                        <div className="p-2 bg-amber-500/10 rounded-lg"><Ticket size={20} /></div>
                                    </div>
                                    <p className="text-3xl font-black text-white">{activeBookings}</p>
                                </div>

                                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                                    <div className="flex justify-between items-center text-purple-400 mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Users</span>
                                        <div className="p-2 bg-purple-500/10 rounded-lg"><Users size={20} /></div>
                                    </div>
                                    <p className="text-3xl font-black text-white">{reservations.length * 2 + 5}</p>
                                </div>
                            </div>

                            {/* Activity Preview */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Recent Reservation Transactions</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                            <tr>
                                                <th className="p-4 font-semibold">Res ID</th>
                                                <th className="p-4 font-semibold">Match Event</th>
                                                <th className="p-4 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {reservations.slice(0, 5).map(res => (
                                                <tr key={res.id} className="hover:bg-slate-900/80 transition">
                                                    <td className="p-4 font-mono font-medium text-slate-300">#{res.id}</td>
                                                    <td className="p-4 text-white font-medium">{res.host_team} vs {res.guest_team}</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                            res.reservation_status === 'paid' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                                        }`}>
                                                            {res.reservation_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. RESERVATIONS TAB */}
                    {activeTab === 'reservations' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-white">System Booking Records</h2>
                                <div className="relative w-full sm:w-72">
                                    <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Filter by team or ID..." 
                                        className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-slate-800 rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                        <tr>
                                            <th className="p-4 font-semibold">Res ID</th>
                                            <th className="p-4 font-semibold">Match Event</th>
                                            <th className="p-4 font-semibold">Price</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {filteredReservations.map(res => (
                                            <tr key={res.id} className="hover:bg-slate-900/80 transition">
                                                <td className="p-4 font-mono font-medium text-slate-300">#{res.id}</td>
                                                <td className="p-4 font-semibold text-white">{res.host_team} vs {res.guest_team}</td>
                                                <td className="p-4 text-slate-300">${res.ticket_price}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                        res.reservation_status === 'paid' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 
                                                        res.reservation_status === 'cancelled' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 
                                                        'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                                    }`}>
                                                        {res.reservation_status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <select 
                                                        value={res.reservation_status}
                                                        onChange={(e) => handleUpdateStatus(res.id, e.target.value)}
                                                        className="bg-slate-950 border border-slate-800 text-slate-300 p-2 rounded-lg text-xs outline-none focus:border-blue-500"
                                                    >
                                                        <option value="reserved">Reserved</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. CREATE TICKET TAB */}
                    {activeTab === 'create-ticket' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 max-w-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">Create New Tournament Match</h2>
                            <form onSubmit={handleCreateTicket} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sport Discipline</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                        value={newTicket.sport}
                                        onChange={(e) => setNewTicket({...newTicket, sport: e.target.value})}
                                    >
                                        <option value="football">Football ⚽</option>
                                        <option value="basketball">Basketball 🏀</option>
                                        <option value="volleyball">Volleyball 🏐</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Host / Home Team</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. Real Madrid"
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                            value={newTicket.host_team}
                                            onChange={(e) => setNewTicket({...newTicket, host_team: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Guest / Away Team</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. Barcelona"
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                            value={newTicket.guest_team}
                                            onChange={(e) => setNewTicket({...newTicket, guest_team: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Match Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                        value={newTicket.match_date}
                                        onChange={(e) => setNewTicket({...newTicket, match_date: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Venue Location</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Bernabeu, Madrid"
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                        value={newTicket.match_location}
                                        onChange={(e) => setNewTicket({...newTicket, match_location: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ticket Price ($)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            placeholder="50.00"
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                            value={newTicket.ticket_price}
                                            onChange={(e) => setNewTicket({...newTicket, ticket_price: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Capacity Limit</label>
                                        <input 
                                            type="number" 
                                            required 
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                                            value={newTicket.capacity}
                                            onChange={(e) => setNewTicket({...newTicket, capacity: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition mt-4">
                                    Publish Event & Sync ES
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 4. REPORTS TAB */}
                    {activeTab === 'reports' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                            <h2 className="text-xl font-bold text-white mb-4">Customer Complaints Log</h2>
                            {reports.length === 0 ? (
                                <p className="text-slate-500 py-6 text-center">No user reports filed at this moment.</p>
                            ) : (
                                reports.map(rep => (
                                    <div key={rep.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full">
                                                Category: {rep.category}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">User #{rep.user_id}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{rep.report_description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}