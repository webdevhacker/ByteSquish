import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, Loader2, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (!turnstileToken) {
      addToast('Please complete the security check', 'error');
      return;
    }
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, turnstileToken });
      addToast(res.data.message, 'success');
      setTimeout(() => {
        navigate('/verify?email=' + encodeURIComponent(res.data.email));
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(56,189,248,0.05)] dark:shadow-[0_0_40px_rgba(56,189,248,0.1)] border border-sky-200 dark:border-sky-900/50 relative overflow-hidden font-tech mt-10 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500"></div>
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600 dark:from-sky-400 dark:to-purple-400 tracking-widest uppercase mb-2 transition-colors">NEW_OPERATOR</h1>
        <p className="text-sky-700/80 dark:text-sky-500/80 font-mono text-xs tracking-widest transition-colors">INITIALIZE CLEARANCE PROTOCOLS</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-sky-700 dark:text-sky-500 mb-2 font-mono tracking-widest transition-colors">OPERATOR_ID (NAME)</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 transition-colors" size={18} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-zinc-800 dark:text-sky-100 font-mono"
              placeholder="ALEX_WALKER"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-sky-700 dark:text-sky-500 mb-2 font-mono tracking-widest transition-colors">COMMUNICATION_LINK (EMAIL)</label>
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
          <label className="block text-xs font-bold text-sky-700 dark:text-sky-500 mb-2 font-mono tracking-widest transition-colors">ACCESS_KEY</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 transition-colors" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-zinc-800 dark:text-sky-100 font-mono tracking-widest"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-sky-700 dark:text-sky-500 mb-2 font-mono tracking-widest transition-colors">VERIFY_ACCESS_KEY</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600 transition-colors" size={18} />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-zinc-800 dark:text-sky-100 font-mono tracking-widest"
              placeholder="••••••••"
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
          disabled={loading}
          className="w-full flex items-center justify-center py-4 px-4 bg-sky-100 dark:bg-sky-600/20 hover:bg-sky-200 dark:hover:bg-sky-600/40 border border-sky-300 dark:border-sky-500/50 text-sky-700 dark:text-sky-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.1)] dark:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'ESTABLISH_OPERATOR'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs font-mono text-zinc-500 dark:text-zinc-500 tracking-widest relative z-10 transition-colors">
        CREDENTIALS_KNOWN?{' '}
        <Link to="/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 hover:shadow-[0_0_10px_rgba(56,189,248,0.3)] dark:hover:shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">
          LOGIN_NOW
        </Link>
      </p>
    </div>
  );
}
