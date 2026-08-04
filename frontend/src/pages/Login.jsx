import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/login-otp', { contact });
      setStep(2);
      alert('OTP sent! (check the backend console)');
    } catch (error) {
      alert(error.response?.data?.detail || 'Error sending OTP');
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/verify-otp', { contact, otp });
      login(res.data.token, { id: res.data.user_id, role: res.data.role });
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.detail || 'Invalid OTP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" dir="rtl">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Login
        </h2>
        {step === 1 ? (
          <form onSubmit={requestOtp}>
            <input
              type="text"
              placeholder="Email or phone number"
              className="w-full p-2 mb-4 border rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
            <button className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition">
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <input
              type="text"
              placeholder="6‑digit verification code"
              className="w-full p-2 mb-4 text-center border rounded outline-none focus:ring-2 focus:ring-green-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700 transition">
              Verify & Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}