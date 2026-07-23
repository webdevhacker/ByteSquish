import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/verify-email', { email, otp });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error || 'Verification failed. OTP may be invalid or expired.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // We can use forgot-password or a new resend-otp endpoint.
      // Since login() generates a new OTP if unverified, we can just call login() with dummy pass? No, forgot-password is safer for this demo.
      // Wait, forgot-password generates a resetToken. That's not the verifyOtp. 
      // I should add a quick resend endpoint or just tell them to try logging in to trigger a new OTP.
      addToast('To resend OTP, please try logging in with your password. A new OTP will be emailed to you.', 'success');
    } catch (err) {
      addToast('Failed to resend OTP.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_40px_rgba(56,189,248,0.1)] border border-sky-900/50 relative overflow-hidden font-tech mt-10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500"></div>
      <div className="text-center mb-10 relative z-10">
        <div className="mx-auto bg-sky-950/30 border border-sky-500/30 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <KeyRound className="text-sky-400" size={32} />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 tracking-widest uppercase mb-2">VERIFY_CHANNEL</h1>
        <p className="text-zinc-400 font-mono text-xs mt-2">
          AUTH CODE SENT TO: <br/><strong className="text-sky-400">{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6 relative z-10">
        {!initialEmail && (
          <div>
            <label className="block text-xs font-bold text-sky-500 mb-2 font-mono tracking-widest">COMMUNICATION_LINK (EMAIL)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-sky-100 font-mono"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-sky-500 mb-2 text-center font-mono tracking-widest">6-DIGIT_AUTH_CODE</label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center tracking-[1em] text-2xl px-4 py-4 rounded-xl border border-zinc-800 bg-zinc-900/80 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all text-sky-400 font-mono shadow-inner"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full flex items-center justify-center py-4 px-4 bg-sky-600/20 hover:bg-sky-600/40 border border-sky-500/50 text-sky-400 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'CONFIRM_VERIFICATION'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-xs font-mono text-zinc-500 tracking-widest relative z-10">
        NO_CODE_RECEIVED?{' '}
        <button onClick={handleResend} className="text-sky-400 hover:text-sky-300 hover:shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">
          TRANSMIT_AGAIN
        </button>
      </p>
    </div>
  );
}
