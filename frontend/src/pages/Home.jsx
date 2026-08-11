import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Home() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ sport: '', city: '', home_team: '' });
    const navigate = useNavigate();

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const res = await api.get(`/tickets/search?${queryParams}`);
            setTickets(res.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 text-center">
                <h1 className="text-5xl font-black text-white mb-6">Experience The Game <span className="text-blue-500">Live</span></h1>
                <p className="text-slate-400 mb-10">Real-time availability and verified seat pricing.</p>
                
                <form onSubmit={(e) => { e.preventDefault(); fetchTickets(); }} className="bg-slate-900 border border-slate-800 p-2 rounded-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-2">
                    <select className="bg-slate-950 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl flex-1 outline-none focus:border-blue-500" value={filters.sport} onChange={e => setFilters({...filters, sport: e.target.value})}>
                        <option value="">All Sports</option>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="volleyball">Volleyball</option>
                    </select>
                    <input type="text" placeholder="City..." className="bg-slate-950 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl flex-1 outline-none focus:border-blue-500" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
                    <input type="text" placeholder="Team..." className="bg-slate-950 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl flex-1 outline-none focus:border-blue-500" value={filters.home_team} onChange={e => setFilters({...filters, home_team: e.target.value})} />
                    <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 flex items-center justify-center gap-2"><Search size={18}/> Search</button>
                </form>
            </section>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                {loading ? (
                    <div className="text-center text-slate-500 py-20">Loading matches...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition group">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase">{ticket.sport}</span>
                                    <span className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={14}/> {ticket.match_location}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white text-center">{ticket.host_team} <span className="text-slate-600 text-sm mx-1">VS</span> {ticket.guest_team}</h3>
                                <div className="space-y-3 mt-6 text-sm text-slate-400">
                                    <div className="flex items-center gap-3"><Calendar size={16}/> {new Date(ticket.match_date).toLocaleString()}</div>
                                    <div className="flex items-center gap-3"><Users size={16}/> {ticket.remaining_capacity} seats left</div>
                                </div>
                                <div className="mt-8 flex justify-between items-center border-t border-slate-800 pt-4">
                                    <span className="text-2xl font-black text-white">${ticket.ticket_price}</span>
                                    <button onClick={() => navigate(`/tickets/${ticket.id}`)} className="bg-slate-800 text-white px-5 py-2 rounded-xl group-hover:bg-blue-600 transition flex items-center gap-2">Book <ArrowRight size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}