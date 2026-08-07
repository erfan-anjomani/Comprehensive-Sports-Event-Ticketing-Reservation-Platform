import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import api from '../services/api';

export default function Home() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ sport: '', city: '', home_team: '' });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const res = await api.get(`/tickets/search?${queryParams}`);
            setTickets(res.data);
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTickets();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Find Your Next Game</h1>
                
                {/* Search Filters */}
                <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md flex gap-4 mb-8 flex-wrap justify-center">
                    <select 
                        className="border p-3 rounded flex-1 min-w-[200px]"
                        value={filters.sport} 
                        onChange={(e) => setFilters({...filters, sport: e.target.value})}
                    >
                        <option value="">All Sports</option>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="volleyball">Volleyball</option>
                    </select>

                    <input 
                        type="text" 
                        placeholder="City (e.g. Tehran, Madrid)" 
                        className="border p-3 rounded flex-1 min-w-[200px]"
                        value={filters.city}
                        onChange={(e) => setFilters({...filters, city: e.target.value})}
                    />
                    
                    <input 
                        type="text" 
                        placeholder="Team Name" 
                        className="border p-3 rounded flex-1 min-w-[200px]"
                        value={filters.home_team}
                        onChange={(e) => setFilters({...filters, home_team: e.target.value})}
                    />

                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 flex items-center gap-2">
                        <Search size={20} /> Search
                    </button>
                </form>

                {/* Tickets Grid */}
                {loading ? (
                    <p className="text-center text-xl text-gray-500">Loading tickets...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                                <div className="bg-blue-900 p-4 text-white text-center">
                                    <span className="uppercase text-xs font-bold tracking-widest bg-blue-700 px-2 py-1 rounded">{ticket.sport}</span>
                                    <h3 className="text-xl font-bold mt-2">{ticket.host_team} <br/><span className="text-gray-400 text-sm">VS</span><br/> {ticket.guest_team}</h3>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-3 text-gray-600 mb-3">
                                        <Calendar size={18} />
                                        <span>{new Date(ticket.match_date).toLocaleString('en-US')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 mb-3">
                                        <MapPin size={18} />
                                        <span>{ticket.venue || 'TBA'} - {ticket.match_location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 mb-6">
                                        <Users size={18} />
                                        <span>Capacity: {ticket.remaining_capacity} left</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t pt-4">
                                        <span className="text-2xl font-bold text-gray-900">${ticket.ticket_price}</span>
                                        <button className="bg-green-500 text-white px-4 py-2 rounded font-medium hover:bg-green-600 transition">
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}