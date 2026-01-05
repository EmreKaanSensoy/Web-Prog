import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { csrfToken } = useAuth();

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        username: '',
        email: '',
        avatar: ''
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/auth/me');
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                    setProfileForm({
                        username: data.user.username,
                        email: data.user.email,
                        avatar: data.user.avatar || 'https://placehold.co/150x150?text=Avatar'
                    });
                } else {
                    navigate('/login');
                }
            } catch (err) {
                console.error(err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/auth/update-profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                 },
                body: JSON.stringify(profileForm)
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi!' });
                setUser(data.user);
            } else {
                setMessage({ type: 'error', text: data.error || 'Bir hata oluştu.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Sunucu hatası.' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' });
            return;
        }

        try {
            const res = await fetch('/auth/change-password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                 },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Şifreniz değiştirildi.' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Hata oluştu.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Sunucu hatası.' });
        }
    };

    if (loading) return <div className="text-center py-20">Yükleniyor...</div>;

    return (
        <div className="bg-background-light min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-text-main mb-8">Hesap Ayarları</h1>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Update Card */}
                    <div className="bg-white p-6 rounded-xl shadow-soft">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person</span>
                            Profil Bilgileri
                        </h2>
                        
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {/* Avatar Preview & URL Input */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="size-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-2 border-primary">
                                    <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" 
                                         onError={(e) => e.target.src = 'https://placehold.co/150x150?text=?'} 
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.avatar}
                                        onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Görsel adresi yapıştırın.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                                <input 
                                    type="text" 
                                    required
                                    value={profileForm.username}
                                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
                                <input 
                                    type="email" 
                                    required
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary-dark transition-colors">
                                Değişiklikleri Kaydet
                            </button>
                        </form>
                    </div>

                    {/* Password Change Card */}
                    <div className="bg-white p-6 rounded-xl shadow-soft">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">lock</span>
                            Şifre Değiştir
                        </h2>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                <input 
                                    type="password" 
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                <input 
                                    type="password" 
                                    required
                                    minLength="6"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                <input 
                                    type="password" 
                                    required
                                    minLength="6"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <button type="submit" className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-bold hover:bg-gray-900 transition-colors">
                                Şifreyi Güncelle
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
