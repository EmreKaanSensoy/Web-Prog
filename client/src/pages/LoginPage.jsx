import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, csrfToken } = useAuth();
    // Debug
    // console.log('CSRF Token in Login:', csrfToken);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ username, password })
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                console.log('Login Response:', data);

                if (data.success || response.ok) {
                    // Update Context
                    login(data.user);
                    
                    console.log('Role:', data.role);
                    // Redirect based on role
                    if (data.role === 'admin') {
                        console.log('Redirecting to Admin Dashboard...');
                        window.location.href = '/admin/dashboard';
                    } else {
                        console.log('Redirecting to Profile...');
                        navigate('/profile');
                    }
                } else {
                    console.error('Login Failed:', data.error);
                    setError(data.error || 'Giriş yapılamadı.');
                }
            } else {
                 console.log('Non-JSON response received');
                 if (response.ok) {
                     navigate('/');
                 } else {
                     setError('Bir hata oluştu.');
                 }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Sunucu ile iletişim kurulamadı: ' + err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-soft rounded-2xl border border-border-color">
                <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="material-symbols-outlined text-2xl text-primary">lock</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-main">
                        Giriş Yap
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-sub">
                        Hesabınız yok mu?{' '}
                        <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
                            Kayıt Ol
                        </Link>
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="mb-4">
                            <label htmlFor="username" className="sr-only">Kullanıcı Adı</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="relative block w-full rounded-lg border border-border-color px-4 py-3 text-text-main placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Şifre</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-lg border border-border-color px-4 py-3 text-text-main placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="material-symbols-outlined h-5 w-5 text-primary-dark group-hover:text-white transition-colors">lock_open</span>
                            </span>
                            Giriş Yap
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
