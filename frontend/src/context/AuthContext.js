import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
    let baseURL = import.meta.env.DJANGO_BASE_URL;
    let [authTokens, setAuthTokens] = useState(() => {
        const token = localStorage.getItem('authTokens');
        return token ? JSON.parse(token) : null;
    });
    let [user, setUser] = useState(() => {
        const token = localStorage.getItem('authTokens');
        return token ? jwtDecode(token) : null;
    });
    let [admin, setAdmin] = useState(() => {
        const token = localStorage.getItem('authTokens');
        return token ? jwtDecode(token).is_staff : false;
    });
    let [loading, setLoading] = useState(true); // Added loading state

    const navigate = useNavigate();

    const loginUser = async (e) => {
        e.preventDefault();
        const response = await fetch(`${baseURL}/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': e.target.username.value,
                'password': e.target.password.value
            })
        });
        const data = await response.json();

        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            setAdmin(jwtDecode(data.access).is_staff);
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/');
        } else if (response.status === 401) {
            alert('Invalid credentials');
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        setAdmin(false);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    const updateToken = async () => {
        const response = await fetch(`${baseURL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'refresh': authTokens?.refresh})
        });

        const data = await response.json();

        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            setAdmin(jwtDecode(data.access).is_staff);
            localStorage.setItem('authTokens', JSON.stringify(data));
        } else {
            logoutUser();
        }
    };

    useEffect(() => {
        if (authTokens) {
            const tokenData = jwtDecode(authTokens.access);
            const expirationTime = (tokenData.exp * 1000) - 60000; // 1 minute before token expiration
            const now = Date.now();

            if (expirationTime < now) {
                logoutUser();
            } else {
                const timeLeft = expirationTime - now;
                const interval = setInterval(updateToken, timeLeft);
                setLoading(false); // Set loading to false once tokens are checked
                return () => clearInterval(interval);
            }
        } else {
            setLoading(false); // Set loading to false if no tokens
        }
    }, [authTokens]);

    const contextData = {
        authTokens: authTokens,
        user: user,
        loginUser: loginUser,
        logoutUser: logoutUser,
        admin: admin,
        loading: loading // Pass loading state in context
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
