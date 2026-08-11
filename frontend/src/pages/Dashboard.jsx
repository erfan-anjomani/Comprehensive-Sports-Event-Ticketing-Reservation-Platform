import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Clock, CreditCard, XCircle, History, Ticket, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeReservations, setActiveReservations] = useState([]);
    const [history, setHistory] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date().getTime());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
        const timer = setInterval(() => setCurrentTime(new Date().getTime()), 1000);
        return () => clearInterval(timer);
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [activeRes, histRes] = await Promise.all([
                api.get('/reservations/active'),
                api.get('/reservations/history')
            ]);
            setActiveReservations(activeRes.data);
            setHistory(histRes.data);
        } catch (error) {
            console.error("Error fetching dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (reservation) => {
        try {
            await api.post('/payments', {
                reservation_id: reservation.id,
                amount: parseFloat(reservation.ticket_price || 100),
                method: 'card'
            });
            fetchDashboardData(); 
        } catch (error) {
            alert(error.response?.data?.detail || "Payment failed");
        }
    };

    const handleCancel = async (reservationId) => {
        if (!window.confirm("Are you sure you want to cancel this ticket? Penalty rules may apply.")) return;
        try {
            await api.post(`/reservations/${reservationId}/cancel`);
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.detail || "Cancel failed");
        }
    };

    const formatTimeLeft = (expirationTime) => {
        if (!expirationTime) return "10:00";
        
        // اضافه کردن Z برای رفع مشکل منطقه زمانی (تبدیل به UTC)
        const timeString = expirationTime.endsWith('Z') ? expirationTime : `${expirationTime}Z`;
        const targetTime = new Date(timeString).getTime();
        const diff = targetTime - currentTime;

        if (diff <= 0) return "Expired";
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (loading) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-950">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading your dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 pt-10 pb-20 px-6 font-sans text-slate-200">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">My Ticket Center</h1>
                    <p className="text-slate-400 text-sm">Manage your upcoming matches, payments, and booking history.</p>
                </div>

                {/* Section 1: Pending Payments */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="text-amber-500" size={24} />
                        <h2 className="text-xl font-bold text-white">Pending Checkout</h2>
                    </div>
                    
                    <div className="grid gap-6">
                        {activeReservations.length === 0 ? (
                            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500">
                                <Ticket size={48} className="mb-4 opacity-20" />
                                <p>You have no pending reservations.</p>
                            </div>
                        ) : (
                            activeReservations.map(res => {
                                const timeLeft = formatTimeLeft(res.expiration_time);
                                const isExpired = timeLeft === "Expired";
                                
                                return (
                                    <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isExpired ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                        
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-mono">
                                                    ID: #{res.id}
                                                </span>
                                                {isExpired && (
                                                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                                                        <AlertTriangle size={14} /> Time limit exceeded
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{res.host_team} <span className="text-slate-500 mx-2">vs</span> {res.guest_team}</h3>
                                            <p className="text-sm text-slate-400">Reserved on: {new Date(res.reservation_time).toLocaleString('en-US')}</p>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
                                            <div className="text-center sm:text-left">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Time Remaining</p>
                                                <div className={`text-2xl font-mono font-bold tracking-wider ${isExpired ? 'text-rose-500' : 'text-amber-500 animate-pulse'}`}>
                                                    {timeLeft}
                                                </div>
                                            </div>
                                            <div className="w-px h-10 bg-slate-800 hidden sm:block" />
                                            <div className="text-center sm:text-left">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
                                                <p className="text-2xl font-bold text-white">${res.ticket_price}</p>
                                            </div>
                                            {!isExpired && (
                                                <button 
                                                    onClick={() => handlePayment(res)}
                                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ml-0 sm:ml-4"
                                                >
                                                    <CreditCard size={18} /> Pay Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Section 2: Reservation History */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <History className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold text-white">Booking History</h2>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="p-5 font-semibold">Res ID</th>
                                        <th className="p-5 font-semibold">Match Event</th>
                                        <th className="p-5 font-semibold">Transaction Date</th>
                                        <th className="p-5 font-semibold">Status</th>
                                        <th className="p-5 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-10 text-center text-slate-500">No booking history available.</td>
                                        </tr>
                                    ) : (
                                        history.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-900/50 transition">
                                                <td className="p-5 font-mono font-medium text-slate-400">#{item.id}</td>
                                                <td className="p-5 font-bold text-white">{item.host_team} vs {item.guest_team}</td>
                                                <td className="p-5 text-slate-400">{new Date(item.reservation_time).toLocaleString('en-US')}</td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                                        item.reservation_status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                                                        item.reservation_status === 'cancelled' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 
                                                        'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                    }`}>
                                                        {item.reservation_status}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    {item.reservation_status === 'paid' && (
                                                        <button 
                                                            onClick={() => handleCancel(item.id)} 
                                                            className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                                                        >
                                                            <XCircle size={16} /> Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}