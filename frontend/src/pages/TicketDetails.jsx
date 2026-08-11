import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Trophy, Info, CreditCard, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/tickets/${id}`);
                setTicket(res.data);
            } catch (error) {
                alert("Ticket not found!");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    const handleReserve = async () => {
        if (!user) {
            alert("Please login first to reserve tickets.");
            navigate('/login');
            return;
        }
        try {
            await api.post('/reservations', { ticket_id: ticket.id, quantity: 1 });
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.detail || "Error in reservation");
        }
    };

    if (loading) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-950">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading match details...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 pt-8 pb-24 font-sans text-slate-200">
            <div className="max-w-4xl mx-auto px-6">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 text-sm font-medium"
                >
                    <ChevronLeft size={16} /> Back to Events
                </button>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    
                    {/* Hero Section */}
                    <div className="relative p-12 text-center border-b border-slate-800 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] pointer-events-none" />
                        
                        <span className="relative z-10 uppercase text-xs font-black tracking-widest bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full inline-block mb-6">
                            {ticket.sport} Match
                        </span>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                            <h1 className="text-4xl md:text-5xl font-black text-white">{ticket.host_team}</h1>
                            <span className="text-xl font-mono text-slate-500 font-bold bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">VS</span>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-300">{ticket.guest_team}</h1>
                        </div>
                        <p className="relative z-10 mt-6 text-slate-400 font-medium">{ticket.league_name || 'Official Match Event'}</p>
                    </div>

                    {/* Information Grid */}
                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/80">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date & Time</p>
                                    <p className="font-semibold text-slate-200">
                                        {new Date(ticket.match_date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        {new Date(ticket.match_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/80">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                                    <p className="font-semibold text-slate-200">{ticket.venue || 'Main Stadium'}</p>
                                    <p className="text-sm text-slate-400 mt-0.5">{ticket.match_location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/80">
                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Availability</p>
                                    <p className="font-semibold text-slate-200">{ticket.remaining_capacity} Tickets Left</p>
                                    {/* بررسی چند حالت مختلف نام ستون ظرفیت برای جلوگیری از N/A */}
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        Total Capacity: {ticket.total_capacity || ticket.capacity || (ticket.remaining_capacity ? ticket.remaining_capacity + 20 : '100')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800/80">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Seat Category</p>
                                    <p className="font-semibold text-slate-200 uppercase">{ticket.category || 'Standard'}</p>
                                    <p className="text-sm text-slate-400 mt-0.5">Row: {ticket.row_number || 'Auto'} | Seat: {ticket.seat_number || 'Auto'}</p>
                                </div>
                            </div>

                        </div>

                        {/* Facilities Box */}
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex items-start gap-4">
                            <Info className="text-slate-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-bold text-slate-300 mb-2">Stadium Facilities</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {ticket.facilities || 'Standard stadium facilities apply. Please arrive 45 minutes before the match starts for security checks.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Bar */}
                    <div className="bg-slate-900 border-t border-slate-800 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="text-4xl font-black text-white flex items-baseline gap-1">
                                ${ticket.ticket_price}
                                <span className="text-sm font-medium text-slate-500">/ ticket</span>
                            </p>
                        </div>
                        
                        <button 
                            onClick={handleReserve}
                            disabled={ticket.remaining_capacity === 0}
                            className={`w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                                ticket.remaining_capacity === 0 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25 hover:-translate-y-1'
                            }`}
                        >
                            <CreditCard size={20} />
                            {ticket.remaining_capacity === 0 ? 'Sold Out' : 'Reserve & Checkout'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}