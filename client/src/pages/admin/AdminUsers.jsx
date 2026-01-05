import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { csrfToken } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/admin/users');
                const data = await res.json();
                if (data.users) {
                    setUsers(data.users);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        
        try {
            const res = await fetch(`/admin/users/delete/${id}`, { 
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken
                }
             });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u._id !== id));
            } else {
                alert('Silme işlemi başarısız: ' + data.error);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Bir hata oluştu.');
        }
    };
    
    const handleRoleChange = async (id, newRole) => {
        try {
            const res = await fetch(`/admin/users/role/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            } else {
                alert('Rol güncelleme başarısız: ' + data.error);
            }
        } catch (err) {
            console.error('Role update error:', err);
            alert('Bir hata oluştu.');
        }
    };
    
    // Simple filter
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-white">Yükleniyor...</div>;

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#111822] h-full">
            <style>{`
                /* Custom scrollbar for table container */
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #334155;
                    border-radius: 4px;
                }
            `}</style>
            
            {/* Header Area */}
            <header className="px-8 py-6 flex flex-col gap-6 border-b border-slate-800 bg-[#111822]">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Kullanıcı Yönetimi</h2>
                        <p className="text-slate-400 text-sm">Sistemdeki tüm kayıtlı kullanıcıları yönetin.</p>
                    </div>
                </div>
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search & Filter */}
                    <div className="flex flex-1 w-full md:max-w-3xl gap-3">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400" style={{fontSize: "20px"}}>search</span>
                            </div>
                            <input 
                                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-[#1e293b] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#136dec] sm:text-sm" 
                                placeholder="İsim veya e-posta ara..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Actions - Removed "New User" as typically users register themselves, but button kept visual only or we can implement create later */}
                </div>
            </header>

            {/* Table Section */}
            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                <div className="rounded-xl border border-slate-800 bg-[#1e293b] overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700/50 bg-slate-800/50">
                                    <th className="p-4 w-12 text-center">
                                        <input className="w-4 h-4 rounded border-slate-600 bg-transparent text-[#136dec] focus:ring-offset-0 focus:ring-[#136dec]/50" type="checkbox" />
                                    </th>
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kullanıcı</th>
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kayıt Tarihi</th>
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol</th>
                                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-4 text-center text-slate-400">Kullanıcı bulunamadı.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="group hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 text-center">
                                                <input className="w-4 h-4 rounded border-slate-600 bg-transparent text-[#136dec] focus:ring-offset-0 focus:ring-[#136dec]/50" type="checkbox" />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {user.avatar ? (
                                                            <img 
                                                                src={user.avatar} 
                                                                alt={user.username}
                                                                className="size-10 rounded-full object-cover border border-slate-600"
                                                                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + user.username}
                                                            />
                                                        ) : (
                                                            <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-white border border-slate-600">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        {/* Online indicator placeholder - logic separate */}
                                                        {/* <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-green-500 rounded-full border-2 border-[#1e293b]"></div> */}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">{user.username}</span>
                                                        <span className="text-xs text-slate-400">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-300">
                                                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(user.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={user.role || 'user'}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className="bg-[#111822] border border-slate-700 text-slate-300 text-xs rounded-lg p-2 focus:ring-[#136dec] focus:border-[#136dec] block w-full max-w-[120px]"
                                                >
                                                    <option value="user">Kullanıcı</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Block functionality not yet in backend, keeping UI simple */}
                                                    <button 
                                                        onClick={() => handleDelete(user._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-600/10 rounded-lg transition-colors" 
                                                        title="Sil"
                                                    >
                                                        <span className="material-symbols-outlined" style={{fontSize: "20px"}}>delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination - removed static for now or can implement local pagination if list is long. Keeping clear for now. */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-700/50 gap-4 bg-[#1e293b]">
                        <span className="text-sm text-slate-400">Toplam <span className="text-white font-medium">{users.length}</span> kullanıcı</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
