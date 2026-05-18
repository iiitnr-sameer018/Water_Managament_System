import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AppContext';
import type { Role } from '../context/mockData';

interface ProtectedRouteProps {
    element: React.ReactElement;
    allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to their appropriate dashboard or home
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'staff') return <Navigate to="/staff" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return element;
};

export default ProtectedRoute;
