import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [csrfToken, setCsrfToken] = useState('');

    const getCsrfToken = async () => {
        try {
            const response = await fetch('/csrf-token');
            const data = await response.json();
            setCsrfToken(data.csrfToken);
        } catch (err) {
            console.error('CSRF Token error:', err);
        }
    };

    const checkAuth = async () => {
        try {
            // CSRF protection might block this if not configured for GET? No, usually GET is safe.
            const response = await fetch('/auth/me');
            if (response.status === 403) {
                 // Token invalid or missing cookie?
            }
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error(err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCsrfToken();
        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await fetch('/auth/logout');
            setUser(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, csrfToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
