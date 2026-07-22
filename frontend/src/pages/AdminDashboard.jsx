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
        const res = await axios.get('http://127.0.0.1:5000/api/admin/users', config);
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
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="text-sky-500" size={32} />
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-sky-400 animate-gradient tracking-tight drop-shadow-sm uppercase">
              Admin Control Center
            </h1>
          </div>
          <p className="text-gray-500 font-tech">Monitor user activity, sessions, and access logs.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm font-tech text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-zinc-800/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-tech">
              <thead className="bg-gray-50 dark:bg-zinc-950/50 text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-xs border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Images</th>
                  <th className="px-6 py-4 font-bold">Last Known IP</th>
                  <th className="px-6 py-4 font-bold">User Agent</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const lastSession = u.sessions && u.sessions.length > 0 ? u.sessions[0] : null;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                          <div className="text-gray-500 text-xs">{u.email}</div>
                          {u.isAdmin && <span className="inline-block mt-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded font-bold tracking-widest uppercase">Admin</span>}
                        </td>
                        <td className="px-6 py-4">
                          {u.isVerified ? (
                            <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Verified</span>
                          ) : (
                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300 font-bold">
                            <ImageIcon size={14} className="text-sky-500" />
                            {u.totalImages}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {lastSession ? (
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="font-mono text-xs">{lastSession.ipAddress}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {lastSession ? (
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 max-w-[200px]" title={lastSession.userAgent}>
                              <Monitor size={14} className="text-gray-400 shrink-0" />
                              <span className="text-xs truncate">{lastSession.userAgent}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
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
