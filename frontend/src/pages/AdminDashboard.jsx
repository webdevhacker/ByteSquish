import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, Monitor, Clock, Image as ImageIcon, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/users', config);
        setUsers(res.data);
      } catch (err) {
        setError('Failed to fetch user data. Make sure you have admin privileges.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, token, navigate]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20 font-tech relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] pointer-events-none -z-10 rounded-full mix-blend-screen"></div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-500" size={32} />
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-500 to-purple-400 animate-gradient tracking-widest drop-shadow-sm uppercase">
              ROOT_CONTROL_CENTER
            </h1>
          </div>
          <p className="text-purple-500/80 font-mono text-xs tracking-widest uppercase">MONITOR USER ACTIVITY, SESSIONS, AND ACCESS LOGS.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH_USERS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono tracking-widest text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all uppercase placeholder:text-zinc-600"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-start gap-3 relative z-10 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="shrink-0 mt-0.5" size={18} />
          <p className="text-xs font-mono tracking-widest">{error}</p>
        </div>
      ) : (
        <div className="bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-purple-900/50 shadow-[0_0_30px_rgba(168,85,247,0.05)] overflow-hidden relative z-10 font-mono">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-purple-950/20 text-purple-400/80 tracking-widest text-[10px] border-b border-purple-900/30 uppercase">
                <tr>
                  <th className="px-6 py-4 font-bold">USER_ID</th>
                  <th className="px-6 py-4 font-bold">STATUS</th>
                  <th className="px-6 py-4 font-bold text-center">DATA_COUNT</th>
                  <th className="px-6 py-4 font-bold">NODE_IP</th>
                  <th className="px-6 py-4 font-bold">CLIENT_AGENT</th>
                  <th className="px-6 py-4 font-bold">INIT_TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-zinc-600 tracking-widest text-[10px] uppercase">NO_RECORDS_FOUND.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const lastSession = u.sessions && u.sessions.length > 0 ? u.sessions[0] : null;
                    return (
                      <tr key={u.id} className="hover:bg-purple-900/10 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-purple-100 group-hover:text-white transition-colors">{u.name}</div>
                          <div className="text-zinc-500 text-[10px] mt-0.5">{u.email}</div>
                          {u.isAdmin && <span className="inline-block mt-1.5 bg-purple-950/50 text-purple-400 border border-purple-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold tracking-widest uppercase shadow-[0_0_5px_rgba(168,85,247,0.2)]">ROOT</span>}
                        </td>
                        <td className="px-6 py-4">
                          {u.isVerified ? (
                            <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">VERIFIED</span>
                          ) : (
                            <span className="bg-yellow-950/30 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">PENDING</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-sky-400 font-bold">
                            <ImageIcon size={12} className="text-sky-500/50" />
                            {u.totalImages}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {lastSession ? (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <MapPin size={12} className="text-zinc-600" />
                              <span className="font-mono text-[10px] tracking-wider">{lastSession.ipAddress}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {lastSession ? (
                            <div className="flex items-center gap-2 text-zinc-400 max-w-[200px]" title={lastSession.userAgent}>
                              <Monitor size={12} className="text-zinc-600 shrink-0" />
                              <span className="text-[10px] truncate tracking-wider">{lastSession.userAgent}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 text-[10px] tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-zinc-600" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
