import { Route, Routes, Navigate } from 'react-router-dom';
import { useContext } from 'react'
import AuthContext from '../context/AuthContext';


const PrivateRoute = ({ children }) => {
    let {user} = useContext(AuthContext)
    return (
        <Routes>
            <Route path="/" element={user ? children : <Navigate to="/login" replace />} />
        </Routes>
    );
};

export default PrivateRoute;