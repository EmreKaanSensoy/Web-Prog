import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border-color bg-card-light/95 backdrop-blur supports-[backdrop-filter]:bg-card-light/80">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <span className="material-symbols-outlined filled-icon">explore</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-text-main">TourGuide</span>
                    </Link>
                </div>
                
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/blog" className="text-sm font-semibold text-text-main hover:text-primary transition-colors">Blog</Link>
                    <Link to="/announcements" className="text-sm font-semibold text-text-main hover:text-primary transition-colors">Duyurular</Link>
                    <Link to="/route" className="text-sm font-semibold text-text-main hover:text-primary transition-colors">Rota Planla</Link>
                    <Link to="/gallery" className="text-sm font-semibold text-text-main hover:text-primary transition-colors">Galeri</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin/dashboard" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Dashboard</Link>
                    )}
                </nav>
                
                <div className="flex items-center gap-4">
                    {user ? (
                         <Link to="/profile" className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-text-main transition-all hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <span className="material-symbols-outlined rounded-full bg-primary/10 p-1 text-primary">person</span>
                            {user.username}
                        </Link>
                    ) : (
                        <Link to="/login" className="hidden sm:inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            Giriş Yap
                        </Link>
                    )}
                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-text-main"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border-color bg-white px-4 py-4 space-y-4">
                     <Link to="/blog" className="block text-sm font-semibold text-text-main hover:text-primary">Blog</Link>
                     <Link to="/announcements" className="block text-sm font-semibold text-text-main hover:text-primary">Duyurular</Link>
                     <Link to="/route" className="block text-sm font-semibold text-text-main hover:text-primary">Rota Planla</Link>
                     <Link to="/gallery" className="block text-sm font-semibold text-text-main hover:text-primary">Galeri</Link>
                     
                     {user ? (
                        <>
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <Link to="/profile" className="block text-sm font-bold text-text-main hover:text-primary mb-2">
                                    Profilim ({user.username})
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin/dashboard" className="block text-sm font-bold text-primary hover:text-primary-dark mb-2">Dashboard</Link>
                                )}
                                <Link to="/settings" className="block text-sm font-semibold text-text-sub hover:text-primary mb-2">Ayarlar</Link>
                                <button 
                                    onClick={async () => {
                                        await fetch('/auth/logout');
                                        window.location.href = '/';
                                    }}
                                    className="block w-full text-left text-sm font-semibold text-red-500 hover:text-red-600"
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        </>
                     ) : (
                        <div className="border-t border-gray-100 pt-2 mt-2">
                            <Link to="/login" className="block text-sm font-bold text-primary hover:text-primary-dark">Giriş Yap</Link>
                        </div>
                     )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
