import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, HardDrive, Shield, Download, XCircle, Clock, Smartphone, AlertTriangle, Trash, QrCode, Power } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' or 'security'

  const [images, setImages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [resetStep, setResetStep] = useState(1);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQr, setTwoFactorQr] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorStep, setTwoFactorStep] = useState(() => user?.isTwoFactorEnabled ? 2 : 0);
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');

  const [deleteAccStep, setDeleteAccStep] = useState(1);
  const [deleteAccOtp, setDeleteAccOtp] = useState('');
  const [deleteAccLoading, setDeleteAccLoading] = useState(false);
  const [deleteAccError, setDeleteAccError] = useState('');

  useEffect(() => {
    if (user && token) {
      fetchData();
    }
  }, [user, token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'vault') {
        const res = await axios.get('/api/images/history');
        setImages(res.data);
      } else {
        const res = await axios.get('/api/auth/sessions');
        setSessions(res.data);
      }
    } catch (err) {
      console.error('Error fetching profile data', err);
    }
    setLoading(false);
  };

  const handleRevokeSession = async (id) => {
    try {
      await axios.delete(`/api/auth/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to revoke session', 'error');
    }
  };

  const handleRequestOtp = async () => {
    setResetMessage('');
    setResetError('');
    setResetLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: user.email });
      setResetMessage(res.data.message);
      setResetStep(2);
    } catch (err) {
      addToast('Failed to request reset code.', 'error');
    }
    setResetLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');
    setResetLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        email: user.email,
        otp: resetOtp,
        newPassword: newPassword
      });
      setResetMessage(res.data.message);
      setResetStep(1);
      setResetOtp('');
      setNewPassword('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to reset password', 'error');
    }
    setResetLoading(false);
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this file?")) return;
    try {
      await axios.delete(`/api/images/delete/${id}`);
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      addToast('Failed to delete image', 'error');
    }
  };

  const handleGenerate2FA = async () => {
    setTwoFactorMessage(''); setTwoFactorError('');
    try {
      const res = await axios.get('/api/auth/2fa/generate');
      setTwoFactorSecret(res.data.secret);
      setTwoFactorQr(res.data.qrCode);
      setTwoFactorStep(1);
    } catch (err) {
      if (err.response?.data?.error === '2FA is already enabled') {
        setTwoFactorStep(2);
      } else {
        addToast('Failed to generate 2FA', 'error');
      }
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorMessage(''); setTwoFactorError('');
    try {
      await axios.post('/api/auth/2fa/enable', { secret: twoFactorSecret, token: twoFactorCode });
      setTwoFactorMessage('2FA enabled successfully!');
      setTwoFactorStep(2);
      setTwoFactorCode('');
      login(token, { ...user, isTwoFactorEnabled: true });
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid code', 'error');
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorMessage(''); setTwoFactorError('');
    try {
      await axios.post('/api/auth/2fa/disable', { token: twoFactorCode });
      setTwoFactorMessage('2FA disabled successfully!');
      setTwoFactorStep(0);
      setTwoFactorCode('');
      login(token, { ...user, isTwoFactorEnabled: false });
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid code', 'error');
    }
  };

  const handleRequestDeleteAcc = async () => {
    if (!window.confirm("WARNING: This will send a deletion code to your email. Proceed?")) return;
    setDeleteAccLoading(true); setDeleteAccError('');
    try {
      await axios.post('/api/auth/request-delete-account');
      setDeleteAccStep(2);
    } catch (err) {
      addToast('Failed to request deletion code.', 'error');
    }
    setDeleteAccLoading(false);
  };

  const handleConfirmDeleteAcc = async (e) => {
    e.preventDefault();
    setDeleteAccLoading(true); setDeleteAccError('');
    try {
      await axios.post('/api/auth/delete-account', { otp: deleteAccOtp });
      logout();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to delete account', 'error');
      setDeleteAccLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = 2, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up font-tech relative">
      {/* Subtle background tech glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-600/10 blur-[120px] pointer-events-none -z-10 rounded-full mix-blend-screen"></div>
      
      <div className="mb-10 relative">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-purple-600 to-sky-600 dark:from-sky-400 dark:via-purple-400 dark:to-sky-400 tracking-widest uppercase mb-3 drop-shadow-sm transition-colors">
          SYSTEM_ACCESS: {user?.name || 'USER'}
        </h1>
        <div className="inline-flex items-center gap-3 bg-sky-100 dark:bg-sky-950/30 border border-sky-300 dark:border-sky-900/50 p-3 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.05)] text-sky-800 dark:text-sky-500/80 font-mono text-sm transition-colors flex-wrap">
          <Shield size={16} className="animate-pulse text-sky-600 dark:text-sky-400 transition-colors shrink-0" />
          <span>SECURITY & VAULT CLEARANCE LEVEL 4</span>
          {user?.email && (
            <>
              <span className="text-sky-400 dark:text-sky-500/50 transition-colors hidden sm:inline">|</span>
              <span className="text-sky-700 dark:text-sky-300 font-bold tracking-wider transition-colors">{user.email}</span>
            </>
          )}
          {user?.isTwoFactorEnabled && (
            <>
              <span className="text-sky-400 dark:text-sky-500/50 transition-colors hidden sm:inline">|</span>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/50 text-[10px] tracking-widest font-bold">2FA ENABLED</span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-zinc-300 dark:border-zinc-800/80 pb-0 transition-colors">
        <button 
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-widest transition-all rounded-t-lg relative overflow-hidden ${activeTab === 'vault' ? 'text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/40 border-t-2 border-t-sky-500 dark:border-t-sky-400 border-x border-x-sky-300 dark:border-x-sky-900/30 shadow-[0_-10px_20px_-10px_rgba(56,189,248,0.1)] dark:shadow-[0_-10px_20px_-10px_rgba(56,189,248,0.2)]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'}`}
        >
          {activeTab === 'vault' && <div className="absolute inset-0 bg-gradient-to-t from-sky-500/10 to-transparent pointer-events-none"></div>}
          <HardDrive size={16} /> DATA_VAULT
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-widest transition-all rounded-t-lg relative overflow-hidden ${activeTab === 'security' ? 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/40 border-t-2 border-t-purple-500 dark:border-t-purple-400 border-x border-x-purple-300 dark:border-x-purple-900/30 shadow-[0_-10px_20px_-10px_rgba(168,85,247,0.1)] dark:shadow-[0_-10px_20px_-10px_rgba(168,85,247,0.2)]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'}`}
        >
          {activeTab === 'security' && <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none"></div>}
          <Shield size={16} /> SECURITY
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 animate-pulse">FETCHING_DATA...</div>
      ) : activeTab === 'vault' ? (
        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 p-4 rounded-xl flex items-start gap-3 mb-6 transition-colors">
            <Clock className="text-sky-600 dark:text-sky-500 shrink-0 mt-0.5 transition-colors" size={18} />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 transition-colors">
              Files are securely stored for <strong className="text-sky-600 dark:text-sky-400 transition-colors">7 days</strong> before permanent deletion.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-600 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl transition-colors">
              NO_STORED_DATA_FOUND
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map(img => {
                const expires = new Date(img.expiresAt);
                const isExpired = expires < new Date();
                
                return (
                  <div key={img.id} className={`bg-white/80 dark:bg-zinc-950/60 backdrop-blur-md border p-5 rounded-xl transition-all relative overflow-hidden group ${isExpired ? 'border-red-300 dark:border-red-900/30 opacity-50' : 'border-sky-300 dark:border-sky-900/30 hover:border-sky-400 dark:hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] dark:hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] hover:-translate-y-1'}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-500 to-transparent opacity-50"></div>
                    <div className="flex justify-between items-start mb-4 pl-3">
                      <h4 className="text-zinc-800 dark:text-zinc-200 font-bold truncate pr-4 font-mono text-sm tracking-wide transition-colors">{img.originalName}</h4>
                      {isExpired ? (
                        <span className="text-[10px] bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-500 border border-red-300 dark:border-red-900 px-2 py-1 rounded font-mono tracking-widest transition-colors">EXPIRED</span>
                      ) : (
                        <div className="flex gap-2 shrink-0">
                          <a 
                            href={`/api/images/download/${img.id}`} 
                            className="bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/20 hover:bg-sky-200 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 p-2 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(56,189,248,0.2)] dark:hover:shadow-[0_0_10px_rgba(56,189,248,0.3)] hover:-translate-y-0.5"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          <button 
                            onClick={() => handleDeleteImage(img.id)}
                            className="bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] dark:hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-xs text-zinc-500 font-mono pl-3">
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded border border-zinc-200 dark:border-zinc-800/50 transition-colors">
                        <span className="text-zinc-600 dark:text-zinc-600 transition-colors">ORIGINAL</span> <span className="text-zinc-800 dark:text-zinc-300 transition-colors">{formatBytes(img.originalSize)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 p-2 rounded shadow-inner transition-colors">
                        <span className="text-sky-700 dark:text-sky-600 transition-colors">COMPRESSED</span> <span className="text-sky-600 dark:text-sky-400 font-bold drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(56,189,248,0.5)] transition-colors">{formatBytes(img.compressedSize)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-2 border-t border-zinc-300 dark:border-zinc-900/80 transition-colors">
                        <span>EXPIRES</span> <span className="text-zinc-600 dark:text-zinc-400 transition-colors">{expires.toLocaleDateString()} {expires.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl border border-purple-200 dark:border-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500/50 p-6 rounded-2xl shadow-lg relative overflow-hidden transition-all group duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity pointer-events-none">
              <Lock size={64} className="text-purple-600 dark:text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-6 flex items-center gap-2 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-colors">
              <Lock size={18} className="text-purple-600 dark:text-purple-400 transition-colors" /> CHANGE_PASSWORD
            </h3>
            
            {resetStep === 1 ? (
              <div className="space-y-4 relative z-10">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono transition-colors">
                  Identity verification required. A 6-digit access code will be transmitted to <strong className="text-purple-600 dark:text-purple-400 transition-colors">{user.email}</strong>.
                </p>
                <button 
                  onClick={handleRequestOtp}
                  disabled={resetLoading}
                  className="w-full bg-purple-100 dark:bg-purple-600/10 hover:bg-purple-200 dark:hover:bg-purple-600/30 border border-purple-300 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/70 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] text-purple-700 dark:text-purple-400 font-bold py-3 rounded-lg transition-all text-sm disabled:opacity-50 tracking-widest"
                >
                  {resetLoading ? 'TRANSMITTING...' : 'REQUEST_ACCESS_CODE'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-500 mb-1 transition-colors">6-DIGIT_CODE</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors tracking-widest font-mono"
                    placeholder="000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-500 mb-1 transition-colors">NEW_PASSWORD</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setResetError('');
                      setResetMessage('');
                    }}
                    className="w-1/3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-2 rounded-lg transition-colors text-sm"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    disabled={resetLoading || resetOtp.length !== 6}
                    className="w-2/3 bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/40 border border-purple-300 dark:border-purple-500/50 text-purple-700 dark:text-purple-400 font-bold py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {resetLoading ? 'UPDATING...' : 'CONFIRM_PASSWORD_CHANGE'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl border border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500/50 p-6 rounded-2xl shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity pointer-events-none">
              <QrCode size={64} className="text-emerald-600 dark:text-emerald-500" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-6 flex items-center gap-2 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-colors">
                <QrCode size={18} className="text-emerald-600 dark:text-emerald-400 transition-colors" /> TWO-FACTOR AUTH
              </h3>
              
              {twoFactorStep === 0 && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono transition-colors">
                    Enhance system security using a time-based authenticator (Google Authenticator, Authy).
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerate2FA}
                      className="w-full bg-emerald-100 dark:bg-emerald-600/10 hover:bg-emerald-200 dark:hover:bg-emerald-600/30 border border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/70 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] text-emerald-700 dark:text-emerald-400 font-bold py-3 rounded-lg transition-all text-sm tracking-widest"
                    >
                      INITIALIZE_2FA_SETUP
                    </button>
                  </div>
                </div>
              )}

              {twoFactorStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-white p-2 w-fit mx-auto rounded-lg shadow-sm">
                    <img src={twoFactorQr} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-xs text-center text-zinc-600 dark:text-zinc-400 transition-colors">Scan this QR code with your Authenticator app, then enter the 6-digit code below.</p>
                  <form onSubmit={handleEnable2FA} className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 tracking-widest font-mono text-center transition-colors"
                      placeholder="000000"
                      required
                    />
                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm">
                      VERIFY
                    </button>
                  </form>
                  <button onClick={() => setTwoFactorStep(0)} className="w-full text-zinc-500 text-xs hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">CANCEL</button>
                </div>
              )}

              {twoFactorStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded border border-emerald-300 dark:border-emerald-900/50 transition-colors">
                    2FA is currently ENABLED on your account.
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 transition-colors">To disable it, enter a code from your authenticator app.</p>
                  <form onSubmit={handleDisable2FA} className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 tracking-widest font-mono text-center transition-colors"
                      placeholder="000000"
                      required
                    />
                    <button type="submit" className="bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-500 font-bold px-4 py-2 rounded-lg transition-colors text-sm hover:bg-red-200 dark:hover:bg-red-600/40">
                      DISABLE
                    </button>
                  </form>
                  <button onClick={() => setTwoFactorStep(0)} className="w-full text-zinc-500 text-xs hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">CANCEL</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl border border-red-200 dark:border-red-900/40 p-6 rounded-2xl md:col-span-2 shadow-[0_0_30px_rgba(220,38,38,0.05)] transition-colors duration-300">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-6 flex items-center gap-2 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-colors">
              <Power size={18} /> CRITICAL_OPERATIONS
            </h3>
            
            <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center justify-between group">
              <div className="space-y-2 max-w-lg">
                <h4 className="text-red-700 dark:text-red-400 font-bold tracking-widest transition-colors">DATA_ANNIHILATION_PROTOCOL</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono transition-colors">
                  Irreversible deletion of account, active sessions, and cryptographic data vault. A verification sequence will be transmitted to confirm authorization.
                </p>
              </div>
              
              <div className="shrink-0 w-full md:w-auto">
                {deleteAccStep === 1 ? (
                  <button 
                    onClick={handleRequestDeleteAcc}
                    disabled={deleteAccLoading}
                    className="w-full bg-red-100 dark:bg-red-600/20 hover:bg-red-200 dark:hover:bg-red-600/40 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-400 font-bold px-6 py-3 rounded-lg transition-colors text-sm"
                  >
                    {deleteAccLoading ? 'PROCESSING...' : 'REQUEST DELETION'}
                  </button>
                ) : (
                  <form onSubmit={handleConfirmDeleteAcc} className="flex gap-2 flex-col sm:flex-row">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={deleteAccOtp}
                      onChange={(e) => setDeleteAccOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full sm:w-32 bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-900 text-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 tracking-widest font-mono text-center transition-colors"
                      placeholder="000000"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={deleteAccLoading || deleteAccOtp.length !== 6}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      {deleteAccLoading ? 'DELETING...' : 'CONFIRM'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteAccStep(1)}
                      className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs px-2 transition-colors"
                    >
                      CANCEL
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl border border-sky-200 dark:border-sky-900/30 hover:border-sky-400 dark:hover:border-sky-500/50 p-6 rounded-2xl shadow-lg relative overflow-hidden transition-all group duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity pointer-events-none">
              <Smartphone size={64} className="text-sky-600 dark:text-sky-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-6 flex items-center gap-2 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-colors">
              <Smartphone size={18} className="text-sky-600 dark:text-sky-400 transition-colors" /> ACTIVE_SESSIONS
            </h3>
            <div className="space-y-4 relative z-10">
              {sessions.map(s => (
                <div key={s.id} className={`p-4 rounded-xl border flex items-center justify-between font-mono transition-colors ${s.isCurrent ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.05)] dark:shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 hover:border-sky-300 dark:hover:border-sky-900/50'}`}>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center transition-colors">
                      {s.ipAddress} {s.isCurrent && <span className="ml-3 text-[10px] bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/50 px-2 py-0.5 rounded tracking-widest shadow-[0_0_10px_rgba(56,189,248,0.1)] dark:shadow-[0_0_10px_rgba(56,189,248,0.3)] animate-pulse transition-colors">CURRENT</span>}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500 truncate max-w-[200px] sm:max-w-[250px] transition-colors" title={s.userAgent}>
                      {s.userAgent}
                    </p>
                    <p className="text-[10px] text-zinc-600 dark:text-zinc-600 transition-colors">
                      INIT: {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {s.location && (
                      <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 mb-2 truncate max-w-[150px] transition-colors" title={s.location}>
                        {s.location}
                      </p>
                    )}
                    {!s.isCurrent && (
                      <button 
                        onClick={() => handleRevokeSession(s.id)}
                        className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 p-2 rounded-lg transition-colors shrink-0"
                        title="Revoke Access"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-lg text-yellow-700 dark:text-yellow-500 text-xs transition-colors">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>Revoking a session will immediately sign out the device associated with it.</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
