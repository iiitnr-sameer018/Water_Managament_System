import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import RegisterComplaint from './pages/RegisterComplaint';
import TrackComplaint from './pages/TrackComplaint';
import UserDash from './pages/UserDash';
import StaffDash from './pages/StaffDash';
import AdminDash from './pages/AdminDash';
import { Login, RegisterUser } from './pages/AuthPages';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterComplaint />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-user" element={<RegisterUser />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']} element={<UserDash />} />} />
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']} element={<StaffDash />} />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} element={<AdminDash />} />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
