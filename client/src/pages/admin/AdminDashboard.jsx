import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        blogCount: 0,
        galleryCount: 0,
        routeCount: 0,
        announcementCount: 0,
        recentBlogs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/admin/dashboard');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f6f7f8] font-['Plus_Jakarta_Sans']">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .material-symbols-outlined.fill {
                    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                /* Custom scrollbar for webkit */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            
            {/* Top Header */}
            <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8 shrink-0">
                {/* Search */}
                <div className="flex w-96 items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 border border-slate-100 focus-within:border-[#136dec]/50 focus-within:ring-2 focus-within:ring-[#136dec]/10 transition-all">
                    <span className="material-symbols-outlined text-slate-400">search</span>
                    <input className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 border-none focus:ring-0 p-0" placeholder="Panelde ara..." type="text" />
                </div>
                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="relative flex items-center justify-center size-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#136dec] transition-colors">
                        <span className="material-symbols-outlined" style={{fontSize: "20px"}}>notifications</span>
                        <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-red-500 border border-white"></span>
                    </button>
                    <button className="flex items-center justify-center size-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#136dec] transition-colors">
                        <span className="material-symbols-outlined" style={{fontSize: "20px"}}>settings</span>
                    </button>
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900 leading-none">Admin User</p>
                            <p className="text-xs text-slate-500 mt-1">Süper Yönetici</p>
                        </div>
                        <div className="size-10 rounded-full bg-slate-200 bg-cover bg-center border-2 border-white shadow-sm" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdAXldePa9sHDP2ntjYMTlz3pT6y56nC_V32HqiPOEbvm7DdORHQUzYJRUmhriReQto4zr3R3Y9v2SyMrWpZ1faFWb5WiQ88qKWlIjDimprAW6S8eKyB4SX2eVy0bhFsBbvVrlMHGVZBnonPOESlitsUr-EWhPoJK-ptphereXHM5wT8YM5O8Vh9AMgotDc9WGXcOU5rKfixQwAocSCr5yF-pca-KfSmFEBCwvlXUdSTukpEYxruX3gak6id7xAVIJ7DqpU0RZRzDV')"}}></div>
                    </div>
                </div>
            </header>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="mx-auto max-w-7xl flex flex-col gap-8">
                    {/* Welcome Text */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Genel Bakış</h2>
                        <p className="text-slate-500 mt-1">Site istatistikleri ve içerik yönetim özeti.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Card 1 */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-[#136dec]/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Toplam Blog</p>
                                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.blogCount}</h3>
                                </div>
                                <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 text-blue-600">
                                    <span className="material-symbols-outlined">article</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <span className="material-symbols-outlined" style={{fontSize: "14px"}}>trending_up</span>
                                    +12%
                                </span>
                                <span className="text-xs text-slate-400">geçen aya göre</span>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-[#136dec]/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Toplam Galeri</p>
                                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.galleryCount}</h3>
                                </div>
                                <div className="flex items-center justify-center size-10 rounded-lg bg-indigo-50 text-indigo-600">
                                    <span className="material-symbols-outlined">collections</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <span className="material-symbols-outlined" style={{fontSize: "14px"}}>trending_up</span>
                                    +5%
                                </span>
                                <span className="text-xs text-slate-400">geçen aya göre</span>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-[#136dec]/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Toplam Rota</p>
                                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.routeCount}</h3>
                                </div>
                                <div className="flex items-center justify-center size-10 rounded-lg bg-amber-50 text-amber-600">
                                    <span className="material-symbols-outlined">map</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <span className="material-symbols-outlined" style={{fontSize: "14px"}}>trending_up</span>
                                    +2%
                                </span>
                                <span className="text-xs text-slate-400">geçen aya göre</span>
                            </div>
                        </div>
                        {/* Card 4 */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-[#136dec]/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Toplam Duyuru</p>
                                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.announcementCount}</h3>
                                </div>
                                <div className="flex items-center justify-center size-10 rounded-lg bg-rose-50 text-rose-600">
                                    <span className="material-symbols-outlined">campaign</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                    <span className="material-symbols-outlined" style={{fontSize: "14px"}}>remove</span>
                                    0%
                                </span>
                                <span className="text-xs text-slate-400">geçen aya göre</span>
                            </div>
                        </div>
                    </div>

                    {/* Traffic Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Online Users Card */}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Anlık Online Kullanıcı</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.onlineUsersCount || 0}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-xs text-emerald-600 font-medium">Şu an aktif</span>
                                </div>
                            </div>
                            <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">group</span>
                            </div>
                        </div>

                        {/* Total Visitors Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Toplam Ziyaretçi</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.visitorCount || 0}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                     <span className="text-xs text-slate-400">Genel toplam</span>
                                </div>
                            </div>
                            <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">visibility</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Blogs Table */}
                    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Son Eklenen Blog Yazıları</h3>
                            <Link to="/admin/blog" className="flex items-center gap-2 text-sm font-bold text-[#136dec] hover:text-blue-700 transition-colors">
                                Tümünü Gör
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                                        <th className="px-6 py-4">Blog Başlığı</th>
                                        <th className="px-6 py-4">Kategori</th>
                                        <th className="px-6 py-4">Yazar</th>
                                        <th className="px-6 py-4">Tarih</th>
                                        <th className="px-6 py-4 text-center">Durum</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                                    {stats.recentBlogs.length > 0 ? (
                                        stats.recentBlogs.map((blog) => (
                                            <tr key={blog._id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                                                    <div className="size-10 rounded-lg bg-slate-200 bg-cover bg-center shrink-0" 
                                                         style={{backgroundImage: `url('${blog.images?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80'}')`}}></div>
                                                    {blog.title}
                                                </td>
                                                <td className="px-6 py-4">{blog.category || '-'}</td>
                                                <td className="px-6 py-4 flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-slate-200 bg-cover bg-center">
                                                         <span className="material-symbols-outlined text-sm flex items-center justify-center h-full w-full text-slate-500">person</span>
                                                    </div>
                                                    Admin
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                        Yayında
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/blog/${blog.slug}`} target="_blank" className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Görüntüle">
                                                            <span className="material-symbols-outlined" style={{fontSize: "20px"}}>visibility</span>
                                                        </Link>
                                                        <Link to={`/admin/blog/edit/${blog._id}`} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Düzenle">
                                                            <span className="material-symbols-outlined" style={{fontSize: "20px"}}>edit</span>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                                Henüz blog yazısı bulunmamaktadır.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-sm text-slate-500">Toplam 142 kayıttan 1-5 arası gösteriliyor</p>
                            <div className="flex gap-1">
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-50">
                                    <span className="material-symbols-outlined" style={{fontSize: "16px"}}>chevron_left</span>
                                </button>
                                <button className="size-8 flex items-center justify-center rounded-lg bg-[#136dec] text-white text-xs font-bold shadow-sm shadow-[#136dec]/30">1</button>
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium">2</button>
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium">3</button>
                                <span className="size-8 flex items-center justify-center text-slate-400">...</span>
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium">10</button>
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                                    <span className="material-symbols-outlined" style={{fontSize: "16px"}}>chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
