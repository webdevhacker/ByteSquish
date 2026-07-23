import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle, Mail, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Submit OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isNotRobot, setIsNotRobot] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!isNotRobot) {
      setError('Please confirm you are not a robot');
      return;
    }
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isNotRobot) {
      setError('Please confirm you are not a robot');
      return;
    }
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword: password
      });
      setMessage(res.data.message);
      setStep(3); // Success step
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.1)] border border-purple-900/50 relative overflow-hidden font-tech mt-10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-sky-500 to-purple-500"></div>
      <div className="text-center mb-10 relative z-10">
        <div className="w-16 h-16 bg-purple-950/30 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Lock className="text-purple-400" size={32} />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400 tracking-widest uppercase mb-2">RECOVER_ACCESS</h1>
        <p className="text-zinc-400 font-mono text-xs mt-2">
          {step === 1 ? 'INPUT OPERATOR ID FOR RECOVERY' : step === 2 ? 'INPUT OVERRIDE CODE & NEW KEY' : 'ACCESS_KEY UPDATED SECURELY'}
        </p>
      </div>

      {message && step !== 3 && (
        <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-900 text-emerald-400 rounded-lg text-xs font-mono text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-lg text-xs font-mono text-center">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-purple-500 mb-2 font-mono tracking-widest">COMMUNICATION_LINK (EMAIL)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-purple-100 font-mono"
                placeholder="operator@system.net"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setIsNotRobot(!isNotRobot)}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors border-2 ${isNotRobot ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-zinc-600 hover:border-purple-500/50'}`}
            >
              {isNotRobot && (
                <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-xs font-mono tracking-widest text-zinc-400">HUMAN_VERIFICATION</span>
            <div className="ml-auto flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin opacity-40"></div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? 'TRANSMITTING...' : 'REQUEST_RECOVERY_CODE'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-purple-500 mb-2 font-mono tracking-widest">6-DIGIT_RECOVERY_CODE</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600" size={18} />
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-purple-400 tracking-[0.5em] font-mono shadow-inner"
                placeholder="000000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-500 mb-2 font-mono tracking-widest">NEW_ACCESS_KEY</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-purple-100 tracking-widest font-mono"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setIsNotRobot(!isNotRobot)}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors border-2 ${isNotRobot ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-zinc-600 hover:border-purple-500/50'}`}
            >
              {isNotRobot && (
                <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-xs font-mono tracking-widest text-zinc-400">HUMAN_VERIFICATION</span>
            <div className="ml-auto flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin opacity-40"></div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-4 px-4 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? 'RESETTING...' : 'UPDATE_ACCESS_KEY'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center relative z-10">
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-6 rounded-xl flex flex-col items-center justify-center gap-4 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <CheckCircle className="text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full" size={48} />
            <p className="text-emerald-400 font-bold font-mono tracking-widest">{message}</p>
          </div>
          <Link to="/login" className="block w-full py-4 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
            RETURN_TO_AUTH
          </Link>
        </div>
      )}

      {step !== 3 && (
        <div className="mt-8 text-center relative z-10">
          <Link to="/login" className="text-xs text-purple-400 hover:text-purple-300 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all font-mono tracking-widest">
            ABORT_RECOVERY
          </Link>
        </div>
      )}
    </div>
  );
}
