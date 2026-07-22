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
      const res = await axios.post('https://bytesquish.isharankumar.com/api/auth/forgot-password', { email });
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
      const res = await axios.post('https://bytesquish.isharankumar.com/api/auth/reset-password', {
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
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 font-tech">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-sky-500" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {step === 1 ? 'Enter your email to receive a reset code' : step === 2 ? 'Enter the 6-digit code and your new password' : 'Password reset successful'}
        </p>
      </div>

      {message && step !== 3 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="you@example.com"
                required
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
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Request Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">6-Digit Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white tracking-widest font-mono"
                placeholder="000000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="••••••••"
                required
                minLength={6}
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
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-xl flex flex-col items-center justify-center gap-3 mb-6">
            <CheckCircle className="text-green-500" size={48} />
            <p className="text-green-600 dark:text-green-400 font-bold">{message}</p>
          </div>
          <Link to="/login" className="block w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all">
            Return to Login
          </Link>
        </div>
      )}

      {step !== 3 && (
        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-sky-600 dark:text-sky-400 hover:underline">
            Back to login
          </Link>
        </div>
      )}
    </div>
  );
}
