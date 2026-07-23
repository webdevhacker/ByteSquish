import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNotRobot, setIsNotRobot] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

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
    if (!isNotRobot) {
      addToast('Please confirm you are not a robot', 'error');
      return;
    }
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
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
    <div className="max-w-md mx-auto bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(56,189,248,0.1)] border border-sky-900/50 relative overflow-hidden font-tech mt-10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500"></div>
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 tracking-widest uppercase mb-2">NEW_OPERATOR</h1>
        <p className="text-sky-500/80 font-mono text-xs tracking-widest">INITIALIZE CLEARANCE PROTOCOLS</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-sky-500 mb-2 font-mono tracking-widest">OPERATOR_ID (NAME)</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-sky-100 font-mono"
              placeholder="ALEX_WALKER"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-sky-500 mb-2 font-mono tracking-widest">COMMUNICATION_LINK (EMAIL)</label>
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
          <label className="block text-xs font-bold text-sky-500 mb-2 font-mono tracking-widest">ACCESS_KEY</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-sky-100 font-mono tracking-widest"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-sky-500 mb-2 font-mono tracking-widest">VERIFY_ACCESS_KEY</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-sky-100 font-mono tracking-widest"
              placeholder="••••••••"
              minLength={6}
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
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'ESTABLISH_OPERATOR'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs font-mono text-zinc-500 tracking-widest relative z-10">
        CREDENTIALS_KNOWN?{' '}
        <Link to="/login" className="text-sky-400 hover:text-sky-300 hover:shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">
          LOGIN_NOW
        </Link>
      </p>
    </div>
  );
}
