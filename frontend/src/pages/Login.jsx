import { useState } from 'react';
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
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isNotRobot) {
      setError('Please confirm you are not a robot');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
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

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Log in to unlock unlimited uploads</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <Link to="/reset-password" className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium">Forgot Password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
          <button
            type="button"
            onClick={() => setIsNotRobot(!isNotRobot)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors border-2 ${isNotRobot ? 'bg-sky-500 border-sky-500' : 'border-gray-400 dark:border-zinc-500 hover:border-sky-500'}`}
          >
            {isNotRobot && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">I am not a robot</span>
          <div className="ml-auto flex items-center justify-center">
             <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin opacity-20"></div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium shadow-lg shadow-sky-500/30 transition-all disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Log in'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
