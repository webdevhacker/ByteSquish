import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, HardDrive, Shield, Download, XCircle, Clock, Smartphone, AlertTriangle } from 'lucide-react';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' or 'security'

  const [images, setImages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (user && token) {
      fetchData();
    }
  }, [user, token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'vault') {
        const res = await axios.get('http://localhost:5000/api/images/history');
        setImages(res.data);
      } else {
        const res = await axios.get('http://localhost:5000/api/auth/sessions');
        setSessions(res.data);
      }
    } catch (err) {
      console.error('Error fetching profile data', err);
    }
    setLoading(false);
  };

  const handleRevokeSession = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke session');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: resetEmail });
      setResetMessage(res.data.message + (res.data.previewUrl ? ` (Preview URL: ${res.data.previewUrl})` : ''));
    } catch (err) {
      setResetError('Failed to process reset request.');
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
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up font-tech">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">
          WELCOME, {user?.name || 'USER'}
        </h1>
        <p className="text-zinc-400 text-sm flex items-center gap-2">
          <span>Manage data vault and security protocols.</span>
          {user?.email && (
            <>
              <span className="text-zinc-600">|</span>
              <span className="text-sky-400 font-bold">{user.email}</span>
            </>
          )}
        </p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold tracking-widest transition-all ${activeTab === 'vault' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <HardDrive size={16} /> DATA_VAULT
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold tracking-widest transition-all ${activeTab === 'security' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Shield size={16} /> SECURITY
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 animate-pulse">FETCHING_DATA...</div>
      ) : activeTab === 'vault' ? (
        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-start gap-3 mb-6">
            <Clock className="text-sky-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-zinc-400">
              Files are securely stored for <strong className="text-sky-400">7 days</strong> before permanent deletion.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
              NO_STORED_DATA_FOUND
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map(img => {
                const expires = new Date(img.expiresAt);
                const isExpired = expires < new Date();
                
                return (
                  <div key={img.id} className={`bg-zinc-950 border p-5 rounded-xl transition-all ${isExpired ? 'border-red-900/50 opacity-50' : 'border-zinc-800 hover:border-sky-500/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-zinc-200 font-bold truncate pr-4">{img.originalName}</h4>
                      {isExpired ? (
                        <span className="text-xs bg-red-950 text-red-500 px-2 py-1 rounded">EXPIRED</span>
                      ) : (
                        <a 
                          href={`http://localhost:5000/api/images/download/${img.id}`} 
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 p-2 rounded-lg transition-colors shrink-0"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-zinc-500">
                      <div className="flex justify-between">
                        <span>Original:</span> <span className="text-zinc-400">{formatBytes(img.originalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compressed:</span> <span className="text-sky-400">{formatBytes(img.compressedSize)}</span>
                      </div>
                      <div className="flex justify-between pt-2 mt-2 border-t border-zinc-900">
                        <span>Expires:</span> <span>{expires.toLocaleDateString()} {expires.toLocaleTimeString()}</span>
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
          
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Lock size={18} className="text-purple-500" /> RESET_PASSWORD
            </h3>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">EMAIL_ADDRESS</label>
                <input 
                  type="email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter email to receive reset link"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 font-bold py-2 rounded-lg transition-colors text-sm"
              >
                REQUEST_RESET_LINK
              </button>
            </form>
            {resetMessage && (
              <div className="mt-4 p-3 bg-green-950/50 border border-green-900 text-green-400 text-xs rounded break-all">
                {resetMessage}
              </div>
            )}
            {resetError && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-xs rounded">
                {resetError}
              </div>
            )}
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Smartphone size={18} className="text-sky-500" /> ACTIVE_SESSIONS
            </h3>
            <div className="space-y-4">
              {sessions.map(s => (
                <div key={s.id} className={`p-4 rounded-xl border flex items-center justify-between ${s.isCurrent ? 'bg-sky-950/20 border-sky-900/50' : 'bg-zinc-900/30 border-zinc-800'}`}>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-200">
                      {s.ipAddress} {s.isCurrent && <span className="ml-2 text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded uppercase">Current_Device</span>}
                    </p>
                    <p className="text-xs text-zinc-500 truncate max-w-[200px] sm:max-w-[250px]" title={s.userAgent}>
                      {s.userAgent}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      Started: {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!s.isCurrent && (
                    <button 
                      onClick={() => handleRevokeSession(s.id)}
                      className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors shrink-0"
                      title="Revoke Access"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 bg-yellow-950/20 border border-yellow-900/50 p-3 rounded-lg text-yellow-500 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>Revoking a session will immediately sign out the device associated with it.</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
