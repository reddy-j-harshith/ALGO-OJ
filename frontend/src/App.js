import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import ProblemPage from './pages/ProblemPage';
import RegistrationPage from './pages/RegistrationPage';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/" element={
              <PrivateRoute>
                <Homepage />
              </PrivateRoute>
            } />
            <Route path="/get_problem/:id" element={
              <PrivateRoute>
                <ProblemPage />
              </PrivateRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;