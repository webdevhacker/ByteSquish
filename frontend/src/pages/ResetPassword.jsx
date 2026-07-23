import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle, Mail, KeyRound } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Turnstile } from '@marsidev/react-turnstile';

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Submit OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { theme } = useTheme();
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      addToast('Please complete the security check', 'error');
      return;
    }
    setMessage('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/forgot-password', { email, turnstileToken });
      setMessage(res.data.message);
      addToast(res.data.message, 'success');
      setStep(2);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to request password reset', 'error');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      addToast('Please complete the security check', 'error');
      return;
    }
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword: password,
        turnstileToken
      });
      setMessage(res.data.message);
      addToast(res.data.message, 'success');
      setStep(3); // Success step
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to reset password', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.05)] dark:shadow-[0_0_40px_rgba(168,85,247,0.1)] border border-purple-200 dark:border-purple-900/50 relative overflow-hidden font-tech mt-10 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-sky-500 to-purple-500"></div>
      <div className="text-center mb-10 relative z-10">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-colors">
          <Lock className="text-purple-600 dark:text-purple-400 transition-colors" size={32} />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-sky-500 dark:from-purple-400 dark:to-sky-400 tracking-widest uppercase mb-2">RECOVER_ACCESS</h1>
        <p className="text-zinc-600 dark:text-zinc-400 font-mono text-xs mt-2 transition-colors">
          {step === 1 ? 'INPUT OPERATOR ID FOR RECOVERY' : step === 2 ? 'INPUT OVERRIDE CODE & NEW KEY' : 'ACCESS_KEY UPDATED SECURELY'}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-purple-600 dark:text-purple-500 mb-2 font-mono tracking-widest transition-colors">COMMUNICATION_LINK (EMAIL)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-zinc-800 dark:text-purple-100 font-mono"
                placeholder="operator@system.net"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center py-2 transition-colors">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setTurnstileToken(token)}
              options={{
                theme: theme === 'dark' ? 'dark' : 'light',
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/40 border border-purple-300 dark:border-purple-500/50 text-purple-600 dark:text-purple-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? 'TRANSMITTING...' : 'REQUEST_RECOVERY_CODE'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-purple-600 dark:text-purple-500 mb-2 font-mono tracking-widest transition-colors">6-DIGIT_RECOVERY_CODE</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 transition-colors" size={18} />
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-purple-600 dark:text-purple-400 tracking-[0.5em] font-mono shadow-inner"
                placeholder="000000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-600 dark:text-purple-500 mb-2 font-mono tracking-widest transition-colors">NEW_ACCESS_KEY</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-zinc-800 dark:text-purple-100 tracking-widest font-mono"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex items-center justify-center py-2 transition-colors">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setTurnstileToken(token)}
              options={{
                theme: theme === 'dark' ? 'dark' : 'light',
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-4 px-4 bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/40 border border-purple-300 dark:border-purple-500/50 text-purple-600 dark:text-purple-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? 'RESETTING...' : 'UPDATE_ACCESS_KEY'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center relative z-10">
          <div className="bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 p-6 rounded-xl flex flex-col items-center justify-center gap-4 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.05)] dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-colors">
            <CheckCircle className="text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full transition-colors" size={48} />
            <p className="text-emerald-700 dark:text-emerald-400 font-bold font-mono tracking-widest transition-colors">{message}</p>
          </div>
          <Link to="/login" className="block w-full py-4 bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/40 border border-purple-300 dark:border-purple-500/50 text-purple-600 dark:text-purple-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.1)] dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
            RETURN_TO_AUTH
          </Link>
        </div>
      )}

      {step !== 3 && (
        <div className="mt-8 text-center relative z-10">
          <Link to="/login" className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all font-mono tracking-widest">
            ABORT_RECOVERY
          </Link>
        </div>
      )}
    </div>
  );
}
