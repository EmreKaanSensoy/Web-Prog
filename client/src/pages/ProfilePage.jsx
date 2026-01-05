import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [savedRoutes, setSavedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/auth/me');
                const data = await response.json();

                if (data.success) {
                    setUser(data.user);
                    // Fetch saved routes
                    const routesRes = await fetch('/api/route/my-routes');
                    const routesData = await routesRes.json();
                    if (Array.isArray(routesData)) {
                        setSavedRoutes(routesData);
                    }
                } else {
                    // Not logged in or error
                    navigate('/login');
                }
            } catch (err) {
                console.error('Failed to fetch user data', err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading) return <div className="text-center py-20">Yükleniyor...</div>;
    if (!user) return null;

    return (
        <div className="flex-grow w-full px-4 md:px-10 lg:px-40 py-12 bg-background-light">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Sidebar / User Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                         <div className="size-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary text-4xl font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-text-main mb-1">{user.username}</h2>
                        <p className="text-sm text-text-sub mb-6">{user.email}</p>
                        
                        <div className="flex flex-col gap-2">
                             <button className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors text-left flex items-center gap-3">
                                <span className="material-symbols-outlined">map</span>
                                Kayıtlı Rotalarım
                            </button>
                             <button 
                                onClick={() => navigate('/settings')}
                                className="w-full py-2 px-4 rounded-lg hover:bg-gray-50 text-text-sub transition-colors text-left flex items-center gap-3"
                             >
                                <span className="material-symbols-outlined">settings</span>
                                Ayarlar
                            </button>
                            <button 
                                onClick={async () => {
                                    await fetch('/auth/logout');
                                    window.location.href = '/';
                                }}
                                className="w-full py-2 px-4 rounded-lg hover:bg-red-50 text-red-500 transition-colors text-left flex items-center gap-3 mt-4"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content / Saved Routes */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm p-8">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-text-main">Kayıtlı Rotalarım</h3>
                            <button 
                                onClick={() => navigate('/route')}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Yeni Rota Oluştur
                            </button>
                        </div>

                        {savedRoutes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {savedRoutes.map((route, index) => (
                                    <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        {/* Route details placeholder - depends on Route model */}
                                        <h4 className="font-bold text-text-main mb-2">Rota #{index + 1}</h4>
                                        <div className="text-sm text-text-sub mb-3">
                                            {route.waypoints?.length || 0} Durak • {route.distance || '0'} km
                                        </div>
                                         <button className="text-sm font-bold text-primary hover:underline">Detayları Gör</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">no_backpack</span>
                                <p className="text-text-sub mb-4">Henüz kayıtlı bir rotanız yok.</p>
                                <button 
                                    onClick={() => navigate('/route')}
                                    className="text-primary font-bold hover:underline"
                                >
                                    Hemen bir rota planla
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
