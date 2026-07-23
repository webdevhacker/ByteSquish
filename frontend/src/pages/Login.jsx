import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNotRobot, setIsNotRobot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isNotRobot) {
      setError('Please confirm you are not a robot');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.requires2FA) {
        setRequires2FA(true);
        setTempToken(res.data.tempToken);
        return;
      }

      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.error === 'ACCOUNT_NOT_VERIFIED') {
        navigate('/verify?email=' + encodeURIComponent(email));
        return;
      }
      setError(err.response?.data?.error || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/verify-2fa', { tempToken, code: twoFactorCode });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(56,189,248,0.1)] border border-sky-900/50 relative overflow-hidden font-tech mt-10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500"></div>
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 tracking-widest uppercase mb-2">AUTH_PORTAL</h1>
        <p className="text-sky-500/80 font-mono text-xs tracking-widest">ESTABLISH SECURE CONNECTION</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-900 text-red-400 rounded-lg text-xs font-mono text-center">
          {error}
        </div>
      )}

      {requires2FA ? (
        <form onSubmit={handleVerify2FA} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-emerald-500 mb-2 font-mono tracking-widest">2FA_OVERRIDE_CODE</label>
            <input
              type="text"
              required
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-4 rounded-xl border border-emerald-900/50 bg-zinc-900/80 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-emerald-400 tracking-[1em] font-mono text-center text-2xl shadow-inner"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading || twoFactorCode.length !== 6}
            className="w-full flex items-center justify-center py-4 px-4 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'VERIFY_IDENTITY'}
          </button>
          <button 
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setTwoFactorCode('');
              setError('');
            }}
            className="w-full text-xs text-zinc-500 hover:text-zinc-300 text-center font-mono tracking-widest"
          >
            ABORT_SEQUENCE
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-sky-500 mb-2 font-mono tracking-widest">USER_IDENTIFIER</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-sky-100 font-mono"
              placeholder="operator@system.net"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-sky-500 font-mono tracking-widest">ACCESS_KEY</label>
            <Link to="/reset-password" className="text-xs text-purple-400 hover:text-purple-300 font-mono tracking-widest">RECOVER_KEY?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-sky-100 font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setIsNotRobot(!isNotRobot)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors border-2 ${isNotRobot ? 'bg-sky-500 border-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'border-zinc-600 hover:border-sky-500/50'}`}
          >
            {isNotRobot && (
              <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <span className="text-xs font-mono tracking-widest text-zinc-400">HUMAN_VERIFICATION</span>
          <div className="ml-auto flex items-center justify-center">
             <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin opacity-40"></div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-4 px-4 bg-sky-600/20 hover:bg-sky-600/40 border border-sky-500/50 text-sky-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'INITIALIZE_LOGIN'}
        </button>
      </form>
      )}

      {!requires2FA && (
        <p className="mt-8 text-center text-xs font-mono text-zinc-500 tracking-widest relative z-10">
          NO_ACCESS_KEY?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 hover:shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">
            REGISTER_NOW
          </Link>
        </p>
      )}
    </div>
  );
}
