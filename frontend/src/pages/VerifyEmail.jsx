import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Loader2, CheckCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('https://bytesquish.isharankumar.com/api/auth/verify-email', { email, otp });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. OTP may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    try {
      // We can use forgot-password or a new resend-otp endpoint.
      // Since login() generates a new OTP if unverified, we can just call login() with dummy pass? No, forgot-password is safer for this demo.
      // Wait, forgot-password generates a resetToken. That's not the verifyOtp. 
      // I should add a quick resend endpoint or just tell them to try logging in to trigger a new OTP.
      setSuccess('To resend OTP, please try logging in with your password. A new OTP will be emailed to you.');
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 font-tech">
      <div className="text-center mb-8">
        <div className="mx-auto bg-sky-100 dark:bg-sky-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="text-sky-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          We sent a 6-digit code to <strong className="text-sky-500">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm text-center flex flex-col items-center gap-2">
          <CheckCircle size={24} />
          {success}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {!initialEmail && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">6-Digit Code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center tracking-[0.5em] text-2xl px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white font-mono"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full flex items-center justify-center py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium shadow-lg shadow-sky-500/30 transition-all disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Continue'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Didn't receive the code?{' '}
        <button onClick={handleResend} className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
          Click for help
        </button>
      </p>
    </div>
  );
}
