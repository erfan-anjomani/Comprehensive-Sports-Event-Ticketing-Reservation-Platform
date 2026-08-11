import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { Ticket, User, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import Login from './pages/Login';
import Home from './pages/Home';
import TicketDetails from './pages/TicketDetails';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
            <Ticket className="text-white transform -rotate-12" size={22} />
          </div>
          <span className="text-2xl font-black tracking-tight">Sports<span className="text-blue-500">Tix</span></span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition">
                <User size={18} className="text-blue-400" /> Dashboard
              </Link>
              {user.role === 'support' && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition">
                  <ShieldAlert size={18} /> Admin
                </Link>
              )}
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/30">
              <Sparkles size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}