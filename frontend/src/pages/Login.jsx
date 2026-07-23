import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { theme } = useTheme();
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [fallbackSent, setFallbackSent] = useState(false);
  
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      addToast('Please complete the security check', 'error');
      return;
    }
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/login', { email, password, turnstileToken });
      
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
      addToast(err.response?.data?.error || 'Failed to login. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-2fa', { tempToken, code: twoFactorCode });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid 2FA code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFallback = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/2fa/fallback', { tempToken });
      addToast(res.data.message || 'Fallback code sent', 'success');
      setFallbackSent(true);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to request fallback code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(56,189,248,0.05)] dark:shadow-[0_0_40px_rgba(56,189,248,0.1)] border border-sky-200 dark:border-sky-900/50 relative overflow-hidden font-tech mt-10 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500"></div>
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600 dark:from-sky-400 dark:to-purple-400 tracking-widest uppercase mb-2 transition-colors">AUTH_PORTAL</h1>
        <p className="text-sky-700/80 dark:text-sky-500/80 font-mono text-xs tracking-widest transition-colors">ESTABLISH SECURE CONNECTION</p>
      </div>

      {requires2FA ? (
        <form onSubmit={handleVerify2FA} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-2 font-mono tracking-widest transition-colors">2FA_OVERRIDE_CODE</label>
            <input
              type="text"
              required
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-4 rounded-xl border border-emerald-300 dark:border-emerald-900/50 bg-white dark:bg-zinc-900/80 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-emerald-700 dark:text-emerald-400 tracking-[1em] font-mono text-center text-2xl shadow-inner"
              placeholder="000000"
            />
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full flex items-center justify-center py-4 px-4 bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/40 border border-emerald-400 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'VERIFY_IDENTITY'}
            </button>
            <button
              type="button"
              onClick={handleRequestFallback}
              disabled={loading || fallbackSent}
              className="w-full text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-center font-mono tracking-widest transition-colors py-2 disabled:opacity-50"
            >
              {fallbackSent ? 'FALLBACK_CODE_SENT' : 'LOST_AUTHENTICATOR?_REQUEST_FALLBACK'}
            </button>
            <button 
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setTwoFactorCode('');
                setFallbackSent(false);
              }}
              className="w-full text-xs text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-center font-mono tracking-widest transition-colors py-2"
            >
              ABORT_SEQUENCE
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-sky-700 dark:text-sky-500 mb-2 font-mono tracking-widest transition-colors">USER_IDENTIFIER</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 transition-colors" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-zinc-800 dark:text-sky-100 font-mono"
              placeholder="operator@system.net"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-sky-700 dark:text-sky-500 font-mono tracking-widest transition-colors">ACCESS_KEY</label>
            <Link to="/reset-password" className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-mono tracking-widest transition-colors">RECOVER_KEY?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 transition-colors" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-zinc-800 dark:text-sky-100 font-mono tracking-widest"
              placeholder="••••••••"
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
          className="w-full flex items-center justify-center py-4 px-4 bg-sky-100 dark:bg-sky-600/20 hover:bg-sky-200 dark:hover:bg-sky-600/40 border border-sky-300 dark:border-sky-500/50 text-sky-700 dark:text-sky-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.1)] dark:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'INITIALIZE_LOGIN'}
        </button>
      </form>
      )}

      {!requires2FA && (
        <p className="mt-8 text-center text-xs font-mono text-zinc-500 dark:text-zinc-500 tracking-widest relative z-10 transition-colors">
          NO_ACCESS_KEY?{' '}
          <Link to="/register" className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 hover:shadow-[0_0_10px_rgba(56,189,248,0.3)] dark:hover:shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">
            REGISTER_NOW
          </Link>
        </p>
      )}
    </div>
  );
}
