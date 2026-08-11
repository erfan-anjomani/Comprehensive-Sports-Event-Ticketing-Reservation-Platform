import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Mail, ArrowRight, KeyRound } from 'lucide-react';
import api from '../services/api';

export default function Login() {
    const [contact, setContact] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/login-otp', { contact });
            setStep(2);
        } catch (error) {
            alert(error.response?.data?.detail || "User not found or error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { contact, otp });
            
            // گرفتن توکن چه اسمش token باشد چه access_token
            const finalToken = res.data.token || res.data.access_token;
            
            // گرفتن اطلاعات کاربر یا ساخت اطلاعات پایه اگر بک‌اند کاربر را نفرستاد
            const finalUser = res.data.user || { id: 1, email: contact, role: contact === 'support1@test.com' ? 'support' : 'user' };

            if (finalToken) {
                login(finalToken, finalUser);
                navigate('/');
            } else {
                alert("Login failed: Token not received from server");
            }
        } catch (error) {
            alert(error.response?.data?.detail || "Invalid OTP Code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-6 font-sans">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {step === 1 ? 'Enter your registered email to receive OTP' : 'Enter the 6-digit code sent to your console'}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-3.5 text-slate-500" />
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="e.g. ali@test.com"
                                    className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-blue-500 transition text-sm"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
                        >
                            {loading ? 'Sending OTP...' : <>Send Verification Code <ArrowRight size={16} /></>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verification Code (OTP)</label>
                            <div className="relative">
                                <KeyRound size={18} className="absolute left-4 top-3.5 text-slate-500" />
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Check backend console for code"
                                    className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:border-blue-500 transition text-sm font-mono tracking-widest text-center"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                        >
                            {loading ? 'Verifying...' : 'Verify & Enter'}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setStep(1)}
                            className="w-full text-slate-400 text-xs hover:text-white transition text-center pt-2"
                        >
                            ← Change email address
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}