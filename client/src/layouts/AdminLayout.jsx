import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleLogout = async () => {
        try {
            await fetch('/auth/logout');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login'); // Redirect anyway
        }
    };

    return (
        <div className="flex h-screen w-full font-display bg-background-light text-slate-900 antialiased overflow-hidden">
            {/* Sidebar: Dark Theme */}
            <aside className="flex w-72 flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300">
                <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-800/50">
                    <div className="flex items-center justify-center size-10 rounded-xl bg-primary/20 text-primary">
                        <span className="material-symbols-outlined">travel_explore</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-none tracking-tight">Travel Guide</h1>
                        <span className="text-xs text-slate-400 mt-1">Yönetici Paneli</span>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {/* Dashboard */}
                    <Link 
                        to="/admin/dashboard" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${isActive('/admin/dashboard') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm font-semibold">Dashboard</span>
                    </Link>

                    {/* Blog */}
                    <Link 
                        to="/admin/blogs/new" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${isActive('/admin/blogs') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">article</span>
                        <span className="text-sm font-medium">Blog Yönetimi</span>
                    </Link>

                    {/* Gallery (Placeholder for now, redirecting to blog form or separate) */}
                    <Link 
                        to="/admin/gallery" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${isActive('/admin/gallery') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">collections</span>
                        <span className="text-sm font-medium">Galeri</span>
                    </Link>

                    {/* Announcements */}
                    <Link 
                        to="/admin/announcements" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${isActive('/admin/announcements') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">campaign</span>
                        <span className="text-sm font-medium">Duyurular</span>
                        <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
                    </Link>

                    {/* Routes */}
                    <Link 
                        to="/admin/routes" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${isActive('/admin/routes') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">map</span>
                        <span className="text-sm font-medium">Rota Yönetimi</span>
                    </Link>

                    {/* Users */}
                    <Link 
                        to="/admin/users" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-colors ${isActive('/admin/users') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors">group</span>
                        <span className="text-sm font-medium">Kullanıcı Yönetimi</span>
                    </Link>


                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex h-full flex-1 flex-col overflow-hidden bg-background-light">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
